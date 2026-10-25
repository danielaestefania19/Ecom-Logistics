import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import type { SupabaseClient } from "jsr:@supabase/supabase-js@2";
import { adminClient, json } from "../_shared/http.ts";
import { escapeHtml, layout, plainText, PORTAL_URL, SALES_EMAIL, sendEmail } from "../_shared/email.ts";

// Called only by database triggers through pg_net (verify_jwt = false), authenticated by the
// shared secret in portal_config.notify_hook_secret.
type Lang = "en" | "es";
type Built = { to: string; subject: string; replyTo?: string; content: Parameters<typeof layout>[0] };

const NOTE_CODES = new Set(["order_submitted", "carrier_delivered"]);

const FOOTER: Record<Lang, string> = {
  en: "You're receiving this because you have an account in the Ecom Logistics client portal. Reply to this email to reach our team.",
  es: "Recibes este correo porque tienes una cuenta en el portal de clientes de Ecom Logistics. Responde a este correo para hablar con nuestro equipo.",
};

const ORDER_COPY: Record<Lang, Record<string, (n: number, threePl: boolean) => [string, string]>> = {
  en: {
    submitted_quote: (n) => [`We received your order #${n}`, "Our team will review it and send you a quote shortly."],
    submitted: (n, t) => [
      `We received your order #${n}`,
      t ? "We'll let you know as soon as your inventory arrives at our warehouse." : "We'll let you know as soon as your shipment arrives at our warehouse.",
    ],
    received: (n) => [`Your shipment for order #${n} arrived`, "It's at our warehouse in Hayward. We're counting and inspecting the units now."],
    discrepancy: (n) => [`Order #${n}: the count doesn't match`, "What we received differs from what the order expected. Please review the details in the portal so we can continue."],
    prepped: (n) => [`Order #${n} is prepped`, "Your units are labeled and ready to ship."],
    in_storage: (n, t) =>
      t
        ? [`Inventory from order #${n} is available`, "Your units are now in stock at our warehouse and ready for fulfillment."]
        : [`Order #${n} is in storage`, "Your prepped units are stored at our warehouse until you're ready to send them."],
    shipped: (n) => [`Order #${n} shipped to Amazon`, "Your shipment left our warehouse on its way to the fulfillment center."],
    cancelled: (n) => [`Order #${n} was cancelled`, "If this wasn't expected, just reply to this email."],
  },
  es: {
    submitted_quote: (n) => [`Recibimos tu orden #${n}`, "Nuestro equipo la revisará y te enviará una cotización pronto."],
    submitted: (n, t) => [
      `Recibimos tu orden #${n}`,
      t ? "Te avisaremos en cuanto tu inventario llegue a nuestro almacén." : "Te avisaremos en cuanto tu envío llegue a nuestro almacén.",
    ],
    received: (n) => [`Llegó tu envío de la orden #${n}`, "Ya está en nuestro almacén en Hayward. Estamos contando e inspeccionando las unidades."],
    discrepancy: (n) => [`Orden #${n}: el conteo no coincide`, "Lo que recibimos es distinto de lo esperado en la orden. Revisa los detalles en el portal para que podamos continuar."],
    prepped: (n) => [`La orden #${n} está preparada`, "Tus unidades están etiquetadas y listas para enviar."],
    in_storage: (n, t) =>
      t
        ? [`El inventario de la orden #${n} está disponible`, "Tus unidades ya están en stock en nuestro almacén, listas para fulfillment."]
        : [`La orden #${n} está en storage`, "Tus unidades preparadas quedan almacenadas hasta que estés listo para enviarlas."],
    shipped: (n) => [`La orden #${n} salió hacia Amazon`, "Tu envío salió de nuestro almacén rumbo al centro de Amazon."],
    cancelled: (n) => [`La orden #${n} fue cancelada`, "Si no lo esperabas, responde a este correo."],
  },
};

const UI: Record<Lang, Record<string, string>> = {
  en: { view: "View order", note: "Note from our team", hi: "Hi", carrier: "Carrier", tracking: "Tracking number", recipient: "Recipient" },
  es: { view: "Ver orden", note: "Nota de nuestro equipo", hi: "Hola", carrier: "Carrier", tracking: "Número de tracking", recipient: "Destinatario" },
};

const lang = (v: unknown): Lang => (v === "es" ? "es" : "en");
const greeting = (l: Lang, name?: string | null) => `${UI[l].hi}${name ? ` ${escapeHtml(name.split(" ")[0])}` : ""},`;

async function buildOrderStage(admin: SupabaseClient, id: string): Promise<Built | null> {
  const { data: ev } = await admin
    .from("order_events")
    .select("note, to_stage, orders(id, order_number, type, stage, clients(email, full_name, language, notify_orders))")
    .eq("id", id)
    .single();
  const order = ev?.orders as any;
  const client = order?.clients;
  if (!ev || !client?.email || client.notify_orders === false) return null;

  const l = lang(client.language);
  const threePl = order.type === "3pl";
  const key = ev.note === "order_submitted" ? (ev.to_stage === "quote" ? "submitted_quote" : "submitted") : ev.to_stage;
  const copy = ORDER_COPY[l][key];
  if (!copy) return null;
  const [heading, body] = copy(order.order_number, threePl);
  const note = ev.note && !NOTE_CODES.has(ev.note) ? ev.note : null;

  return {
    to: client.email,
    subject: heading,
    content: {
      heading,
      paragraphs: [greeting(l, client.full_name), escapeHtml(body)],
      rows: note ? [[UI[l].note, note]] : undefined,
      cta: { label: UI[l].view, url: `${PORTAL_URL}/orders/${order.id}` },
      footer: FOOTER[l],
    },
  };
}

async function buildFulfillment(admin: SupabaseClient, id: string): Promise<Built | null> {
  const { data: ev } = await admin
    .from("fulfillment_events")
    .select("note, to_status, fulfillment_orders(id, number, recipient_name, carrier, tracking_number, clients(email, full_name, language, notify_orders))")
    .eq("id", id)
    .single();
  const f = ev?.fulfillment_orders as any;
  const client = f?.clients;
  if (!ev || !client?.email || client.notify_orders === false) return null;

  const l = lang(client.language);
  const es = l === "es";
  const shipped = ev.to_status === "shipped";
  const heading = shipped
    ? (es ? `El pedido #${f.number} fue enviado` : `Order #${f.number} shipped`)
    : (es ? `El pedido #${f.number} está en espera` : `Order #${f.number} is on hold`);
  const body = shipped
    ? (es ? "Empacamos y enviamos el pedido de tu cliente." : "We packed and shipped your customer's order.")
    : (es ? "Pausamos este pedido. Revisa la nota y responde a este correo si necesitas cambiar algo." : "We paused this order. Check the note and reply to this email if anything needs to change.");
  const rows: [string, string][] = [[UI[l].recipient, f.recipient_name]];
  if (shipped && f.carrier) rows.push([UI[l].carrier, f.carrier]);
  if (shipped && f.tracking_number) rows.push([UI[l].tracking, f.tracking_number]);
  if (ev.note) rows.push([UI[l].note, ev.note]);

  return {
    to: client.email,
    subject: heading,
    content: {
      heading,
      paragraphs: [greeting(l, client.full_name), escapeHtml(body)],
      rows,
      cta: { label: UI[l].view, url: `${PORTAL_URL}/fulfillment/${f.id}` },
      footer: FOOTER[l],
    },
  };
}

const SERVICE_NAMES: Record<string, string> = { prep: "FBA Prep", "3pl": "3PL", ltl: "LTL" };

// Internal alert, in Spanish; replying goes straight to the lead.
async function buildLead(admin: SupabaseClient, id: string): Promise<Built | null> {
  const { data: lead } = await admin.from("leads").select("*").eq("id", id).single();
  if (!lead) return null;
  const name = [lead.first_name, lead.last_name].filter(Boolean).join(" ");
  const who = lead.company || name || lead.email;
  const fields: [string, string | null | undefined][] = [
    ["Nombre", name],
    ["Empresa", lead.company],
    ["Email", lead.email],
    ["Teléfono", lead.phone],
    ["WhatsApp", lead.whatsapp],
    ["Contacto preferido", lead.preferred_contact],
    ["Servicio", (lead.services ?? []).map((s: string) => SERVICE_NAMES[s] ?? s).join(", ")],
    ["Canales", (lead.sales_channels ?? []).join(", ")],
    ["Unidades / mes", lead.units_per_month?.toString()],
    ["Envíos / mes", lead.shipments_per_month?.toString()],
    ["Categoría", lead.product_category],
    ["Sitio web", lead.website],
    ["Ubicación", [lead.city, lead.state].filter(Boolean).join(", ")],
    ["Idioma", lead.language === "es" ? "Español" : lead.language === "en" ? "Inglés" : null],
    ["Nos conoció por", lead.heard_from],
  ];
  const rows = fields.filter((r): r is [string, string] => !!r[1]);

  return {
    to: SALES_EMAIL,
    replyTo: lead.email ?? undefined,
    subject: `Nuevo lead #${lead.number}: ${who}`,
    content: {
      heading: `Nuevo lead #${lead.number}`,
      paragraphs: [
        `${escapeHtml(who)} llenó el formulario de la web. Responde a este correo para escribirle directamente.`,
        ...(lead.message ? [`<em>“${escapeHtml(lead.message)}”</em>`] : []),
      ],
      rows,
      cta: { label: "Abrir lead en el portal", url: `${PORTAL_URL}/leads/${lead.id}` },
      footer: "Aviso automático del portal de Ecom Logistics.",
    },
  };
}

const BUILDERS: Record<string, (admin: SupabaseClient, id: string) => Promise<Built | null>> = {
  order_stage: buildOrderStage,
  fulfillment_status: buildFulfillment,
  lead_new: buildLead,
};

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  const admin = adminClient();

  const { data: cfg } = await admin.from("portal_config").select("value").eq("key", "notify_hook_secret").single();
  const secret = req.headers.get("x-notify-secret") ?? "";
  if (!cfg?.value || secret !== cfg.value) return json({ error: "Unauthorized" }, 401);

  const { kind, id } = await req.json().catch(() => ({}));
  const build = BUILDERS[kind];
  if (!build || !id) return json({ error: "bad request" }, 400);

  // Claim the message first: a second call for the same event stops here, unless the earlier
  // attempt failed, in which case this call retries it.
  let { data: row, error: claimErr } = await admin
    .from("notifications")
    .insert({ kind, ref_id: String(id) })
    .select("id")
    .single();
  if (claimErr) {
    const { data: retry } = await admin
      .from("notifications")
      .update({ status: "pending", error: null })
      .eq("kind", kind)
      .eq("ref_id", String(id))
      .eq("status", "failed")
      .select("id")
      .maybeSingle();
    if (!retry) return json({ ok: true, duplicate: true });
    row = retry;
  }

  try {
    const email = await build(admin, String(id));
    if (!email) {
      await admin.from("notifications").update({ status: "skipped" }).eq("id", row.id);
      return json({ ok: true, skipped: true });
    }
    const providerId = await sendEmail({
      to: email.to,
      subject: email.subject,
      replyTo: email.replyTo,
      html: layout(email.content),
      text: plainText(email.content),
    });
    await admin
      .from("notifications")
      .update({ status: "sent", to_email: email.to, subject: email.subject, provider_id: providerId })
      .eq("id", row.id);
    return json({ ok: true });
  } catch (err) {
    const message = (err as Error).message;
    console.error("notify error:", message);
    await admin.from("notifications").update({ status: "failed", error: message.slice(0, 500) }).eq("id", row.id);
    return json({ error: "send failed" }, 500);
  }
});
