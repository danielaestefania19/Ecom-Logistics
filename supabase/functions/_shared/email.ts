// Transactional email through Resend. Replies always land in the sales inbox.
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") ?? "";

export const FROM = "Ecom Logistics <notificaciones@ecomlogisticsus.com>";
export const SALES_EMAIL = "sales@ecomlogisticsus.com";
export const PORTAL_URL = "https://ecomlogisticsus.com/portal";

export type Email = {
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
};

export async function sendEmail(email: Email): Promise<string> {
  if (!RESEND_API_KEY) throw new Error("RESEND_API_KEY is not set");
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: FROM,
      to: [email.to],
      reply_to: email.replyTo ?? SALES_EMAIL,
      subject: email.subject,
      html: email.html,
      text: email.text,
    }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`Resend ${res.status}: ${body?.message ?? "send failed"}`);
  return body.id ?? "";
}

export const escapeHtml = (s: unknown) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

type Layout = {
  heading: string;
  paragraphs: string[]; // already-escaped HTML
  rows?: [string, string][]; // label, value (plain text)
  cta?: { label: string; url: string };
  footer: string;
};

// Inline styles only: most mail clients drop <style> blocks.
export function layout({ heading, paragraphs, rows, cta, footer }: Layout): string {
  const table = rows?.length
    ? `<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;margin:16px 0">${rows
        .map(
          ([k, v]) =>
            `<tr><td style="padding:8px 12px 8px 0;color:#6b7280;font-size:13px;vertical-align:top;white-space:nowrap">${escapeHtml(k)}</td><td style="padding:8px 0;color:#070A0F;font-size:14px;font-weight:600">${escapeHtml(v)}</td></tr>`,
        )
        .join("")}</table>`
    : "";
  const button = cta
    ? `<p style="margin:24px 0"><a href="${escapeHtml(cta.url)}" style="display:inline-block;background:#2D596D;color:#ffffff;text-decoration:none;font-weight:700;font-size:14px;padding:12px 22px;border-radius:10px">${escapeHtml(cta.label)}</a></p>`
    : "";
  return `<!doctype html><html><body style="margin:0;background:#f3f4f6;font-family:Montserrat,Helvetica,Arial,sans-serif">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:24px 12px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden">
<tr><td style="background:#070A0F;padding:18px 28px;color:#ffffff;font-size:16px;font-weight:700;letter-spacing:.3px">Ecom Logistics</td></tr>
<tr><td style="padding:28px">
<h1 style="margin:0 0 12px;font-size:20px;color:#070A0F">${escapeHtml(heading)}</h1>
${paragraphs.map((p) => `<p style="margin:0 0 12px;font-size:14px;line-height:1.6;color:#374151">${p}</p>`).join("")}
${table}${button}
</td></tr>
<tr><td style="padding:16px 28px;background:#f9fafb;color:#9ca3af;font-size:12px;line-height:1.5">${footer}<br>Ecom Logistics · 26250 Industrial Blvd, Hayward, CA 94545</td></tr>
</table></td></tr></table></body></html>`;
}

// Plain-text twin for clients that block HTML (and better spam scores).
export function plainText({ heading, paragraphs, rows, cta }: Layout): string {
  const strip = (s: string) => s.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'");
  return [
    heading,
    "",
    ...paragraphs.map(strip),
    ...(rows?.length ? ["", ...rows.map(([k, v]) => `${k}: ${v}`)] : []),
    ...(cta ? ["", `${cta.label}: ${cta.url}`] : []),
    "",
    "Ecom Logistics · 26250 Industrial Blvd, Hayward, CA 94545",
  ].join("\n");
}
