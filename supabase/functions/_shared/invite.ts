import type { SupabaseClient } from "jsr:@supabase/supabase-js@2";
import { escapeHtml, layout, plainText, sendEmail } from "./email.ts";

const PORTAL_SET_PASSWORD_URL = "https://ecomlogisticsus.com/portal/set-password";

const COPY = {
  en: {
    subject: "Your access to the Ecom Logistics client portal",
    heading: "Welcome to Ecom Logistics",
    hi: "Hi",
    body: "We created your account in our client portal. From there you can create FBA prep and 3PL orders, follow your shipments live, and see your inventory and invoices.",
    action: "Click the button to set your password and sign in. The link can only be used once.",
    cta: "Set my password",
    footer: "If you weren't expecting this email you can ignore it. Questions? Just reply to this email.",
  },
  es: {
    subject: "Tu acceso al portal de clientes de Ecom Logistics",
    heading: "Bienvenido a Ecom Logistics",
    hi: "Hola",
    body: "Creamos tu cuenta en nuestro portal de clientes. Desde ahí puedes crear órdenes de FBA prep y 3PL, seguir tus envíos en vivo y ver tu inventario y tus facturas.",
    action: "Pulsa el botón para crear tu contraseña y entrar. El enlace solo se puede usar una vez.",
    cta: "Crear mi contraseña",
    footer: "Si no esperabas este correo, puedes ignorarlo. ¿Dudas? Responde a este correo.",
  },
};

type Invite = { email: string; fullName?: string | null; company?: string | null; language?: string | null };

function inviteEmail(invite: Invite, link: string) {
  const c = COPY[invite.language === "es" ? "es" : "en"];
  const first = invite.fullName?.trim().split(" ")[0];
  const content = {
    heading: c.heading,
    paragraphs: [`${c.hi}${first ? ` ${escapeHtml(first)}` : ""},`, escapeHtml(c.body), escapeHtml(c.action)],
    cta: { label: c.cta, url: link },
    footer: escapeHtml(c.footer),
  };
  return { to: invite.email, subject: c.subject, html: layout(content), text: plainText(content) };
}

// Creates the auth user and emails our own branded invitation (instead of Supabase's generic one).
export async function sendPortalInvite(admin: SupabaseClient, invite: Invite): Promise<{ userId: string }> {
  const { data, error } = await admin.auth.admin.generateLink({
    type: "invite",
    email: invite.email,
    options: { redirectTo: PORTAL_SET_PASSWORD_URL, data: { full_name: invite.fullName, company: invite.company } },
  });
  if (error || !data?.properties?.action_link) throw new Error(error?.message ?? "could not create the invitation");

  try {
    await sendEmail(inviteEmail(invite, data.properties.action_link));
  } catch (err) {
    // Undo the half-made account so staff can simply retry the invitation.
    await admin.auth.admin.deleteUser(data.user.id);
    throw err;
  }
  return { userId: data.user.id };
}

// For an existing account (lost or expired invitation): a fresh one-time link to set the password,
// in the same welcome email.
export async function resendPortalInvite(admin: SupabaseClient, invite: Invite) {
  const { data, error } = await admin.auth.admin.generateLink({
    type: "recovery",
    email: invite.email,
    options: { redirectTo: PORTAL_SET_PASSWORD_URL },
  });
  if (error || !data?.properties?.action_link) throw new Error(error?.message ?? "could not create the invitation");
  await sendEmail(inviteEmail(invite, data.properties.action_link));
}
