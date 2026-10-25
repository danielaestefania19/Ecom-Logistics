export const LEAD_STATUSES = ["new", "contacted", "qualified", "quoted", "won", "lost"];
export const OPEN_LEAD = ["new", "contacted", "qualified", "quoted"];

export const NEXT_LEAD = {
  new: ["contacted", "qualified", "lost"],
  contacted: ["qualified", "quoted", "lost"],
  qualified: ["quoted", "lost"],
  quoted: ["lost"],
  won: [],
  lost: ["new"],
};

export const LEAD_STYLE = {
  new: "bg-blue-50 text-blue-700 border border-blue-200",
  contacted: "bg-indigo-50 text-indigo-700 border border-indigo-200",
  qualified: "bg-purple-50 text-purple-700 border border-purple-200",
  quoted: "bg-amber-50 text-amber-800 border border-amber-200",
  won: "bg-green-50 text-green-700 border border-green-200",
  lost: "bg-gray-100 text-gray-400 border border-gray-200",
};

export const CONTACT_KINDS = ["call", "email", "whatsapp", "meeting", "note"];

const FIRST_CONTACT_SLA_MS = 48 * 3600 * 1000;

// "Needs attention": never contacted within 48h of arriving, or a scheduled follow-up is overdue.
export function needsAttention(lead, now = Date.now()) {
  if (!OPEN_LEAD.includes(lead.status)) return false;
  if (!lead.last_contacted_at && now - new Date(lead.created_at).getTime() > FIRST_CONTACT_SLA_MS) return true;
  return !!lead.next_follow_up_at && new Date(lead.next_follow_up_at).getTime() < now;
}

export const leadName = (l) => [l.first_name, l.last_name].filter(Boolean).join(" ") || l.email || l.phone || "—";

export const whatsappLink = (number) => {
  const digits = (number ?? "").replace(/\D/g, "");
  return digits ? `https://wa.me/${digits.length === 10 ? `1${digits}` : digits}` : null;
};
