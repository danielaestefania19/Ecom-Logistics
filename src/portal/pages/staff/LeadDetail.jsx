import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { supabase } from "../../../lib/supabaseClient";
import { useAuth } from "../../AuthContext";
import { useT } from "../../i18n";
import { CONTACT_KINDS, LEAD_STYLE, leadName, needsAttention, NEXT_LEAD, whatsappLink } from "../../lib/leads";
import { callFunction, isoDay, subscribeToChanges } from "../../lib/orders";
import { btnPrimary, btnSecondary, Card, ErrorBanner, Field, inputCls, PageHeader, Spinner } from "../../components/ui";

const SYSTEM_NOTES = new Set(["lead_created_website", "lead_created_manual", "lead_created_asana_import", "converted_invited", "converted_linked"]);

const LeadBadge = ({ status }) => {
  const { t } = useT();
  return <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full ${LEAD_STYLE[status]}`}>{t(`leads.status.${status}`)}</span>;
};

function StatusActions({ lead, onChanged }) {
  const { t } = useT();
  const [lostReason, setLostReason] = useState("");
  const [askLost, setAskLost] = useState(false);
  const [error, setError] = useState(null);
  const next = NEXT_LEAD[lead.status] ?? [];

  const move = async (status) => {
    if (status === "lost" && !askLost) return setAskLost(true);
    if (status === "lost" && !lostReason.trim()) return setError(t("leads.lostReasonRequired"));
    setError(null);
    const { error: err } = await supabase
      .from("leads")
      .update({ status, lost_reason: status === "lost" ? lostReason.trim() : lead.lost_reason })
      .eq("id", lead.id);
    if (err) return setError(err.message);
    setAskLost(false);
    onChanged();
  };

  if (!next.length) return null;
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {next.map((s) => (
          <button key={s} type="button" onClick={() => move(s)} className={s === "lost" ? btnSecondary : btnPrimary}>
            → {t(`leads.status.${s}`)}
          </button>
        ))}
      </div>
      {askLost && (
        <div className="flex gap-2">
          <input className={inputCls} value={lostReason} onChange={(e) => setLostReason(e.target.value)} placeholder={t("leads.lostReason")} />
          <button type="button" onClick={() => move("lost")} className={btnSecondary}>{t("common.save")}</button>
        </div>
      )}
      {error && <ErrorBanner message={error} />}
    </div>
  );
}

function Planning({ lead, staff, onChanged }) {
  const { t } = useT();
  const [error, setError] = useState(null);
  const update = async (patch) => {
    setError(null);
    const { error: err } = await supabase.from("leads").update(patch).eq("id", lead.id);
    if (err) setError(err.message);
    else onChanged();
  };
  return (
    <div className="space-y-4">
      <Field label={t("leads.owner")}>
        <select className={inputCls} value={lead.owner_id ?? ""} onChange={(e) => update({ owner_id: e.target.value || null })}>
          <option value="">{t("leads.unassigned")}</option>
          {staff.map((s) => <option key={s.id} value={s.id}>{s.full_name || s.email}</option>)}
        </select>
      </Field>
      <Field label={t("leads.nextFollowUp")}>
        <input
          type="date"
          className={inputCls}
          value={lead.next_follow_up_at ? isoDay(lead.next_follow_up_at) : ""}
          onChange={(e) => update({ next_follow_up_at: e.target.value ? new Date(`${e.target.value}T09:00:00`).toISOString() : null })}
        />
      </Field>
      {error && <ErrorBanner message={error} />}
    </div>
  );
}

function ActivityLog({ lead, activities, names, onChanged }) {
  const { t, fmtDateTime } = useT();
  const { user } = useAuth();
  const [kind, setKind] = useState("call");
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const add = async (e) => {
    e.preventDefault();
    if (kind === "note" && !body.trim()) return;
    setBusy(true);
    setError(null);
    const { error: err } = await supabase.from("lead_activities").insert({ lead_id: lead.id, kind, body: body.trim() || null });
    setBusy(false);
    if (err) return setError(err.message);
    setBody("");
    onChanged();
  };

  const who = (id) => (!id ? t("timeline.system") : id === user?.id ? t("timeline.you") : names[id] || t("timeline.team"));

  return (
    <div className="space-y-5">
      <form onSubmit={add} className="space-y-2">
        <div className="flex flex-wrap gap-2">
          {CONTACT_KINDS.map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setKind(k)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${kind === k ? "bg-primary text-white border-primary" : "border-gray-200 text-gray-600"}`}
            >
              {t(`leads.kind.${k}`)}
            </button>
          ))}
        </div>
        <textarea className={inputCls} rows={2} value={body} onChange={(e) => setBody(e.target.value)} placeholder={t("leads.activityPlaceholder")} />
        <button type="submit" disabled={busy} className={btnSecondary}>{busy ? t("common.saving") : t("leads.logActivity")}</button>
        {error && <ErrorBanner message={error} />}
      </form>

      <ol className="relative border-l border-gray-200 ml-2 space-y-4">
        {[...activities].reverse().map((a) => (
          <li key={a.id} className="ml-5">
            <span className={`absolute -left-[5px] mt-1.5 w-2.5 h-2.5 rounded-full ${a.kind === "status_change" || a.kind === "system" ? "bg-gray-300" : "bg-third"}`} />
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-primary">
                {a.kind === "status_change" ? `${t(`leads.status.${a.from_status}`)} → ${t(`leads.status.${a.to_status}`)}` : t(`leads.kind.${a.kind}`)}
              </span>
              <span className="text-xs text-gray-400">{fmtDateTime(a.created_at)} · {who(a.actor_id)}</span>
            </div>
            {a.body && <p className="text-sm text-gray-700 mt-1 whitespace-pre-line">{SYSTEM_NOTES.has(a.body) ? t(`leads.systemNote.${a.body}`) : a.body}</p>}
          </li>
        ))}
      </ol>
    </div>
  );
}

function ConvertCard({ lead, onChanged }) {
  const { t } = useT();
  const [services, setServices] = useState((lead.services ?? []).filter((s) => s !== "ltl").length ? lead.services.filter((s) => s !== "ltl") : ["prep"]);
  const [language, setLanguage] = useState(lead.language ?? "en");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const convert = async () => {
    setBusy(true);
    setError(null);
    try {
      const data = await callFunction("convert-lead", { lead_id: lead.id, services, language });
      setResult(data);
      onChanged();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  if (lead.converted_client_id || result) {
    return (
      <p className="text-sm text-green-700">
        {result?.invited === false ? t("leads.convertedLinked") : t("leads.converted")}{" "}
        <Link to="/portal/admin" className="font-semibold underline">{t("nav.clients")}</Link>
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-500">{t("leads.convertHelp")}</p>
      {!lead.email && <p className="text-sm text-red-600">{t("leads.convertNeedsEmail")}</p>}
      <div className="flex gap-4">
        {["prep", "3pl"].map((s) => (
          <label key={s} className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              className="accent-third"
              checked={services.includes(s)}
              onChange={(e) => setServices(e.target.checked ? [...services, s] : services.filter((x) => x !== s))}
            />
            {t(`leads.service.${s}`)}
          </label>
        ))}
      </div>
      <Field label={t("leads.portalLanguage")}>
        <select className={inputCls} value={language} onChange={(e) => setLanguage(e.target.value)}>
          <option value="en">English</option>
          <option value="es">Español</option>
        </select>
      </Field>
      <button type="button" onClick={convert} disabled={busy || !services.length || !lead.email} className={`${btnPrimary} w-full`}>
        {busy ? t("common.saving") : t("leads.convert")}
      </button>
      {error && <ErrorBanner message={error} />}
    </div>
  );
}

// Admin only, and not for converted leads (RLS enforces both).
function DeleteCard({ lead }) {
  const { t } = useT();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const remove = async () => {
    if (!window.confirm(t("leads.deleteConfirm", { n: lead.number }))) return;
    setBusy(true);
    setError(null);
    const { data, error: err } = await supabase.from("leads").delete().eq("id", lead.id).select("id");
    setBusy(false);
    if (err) return setError(err.message);
    // RLS-blocked deletes return no error and zero rows.
    if (!data?.length) return setError(t("leads.deleteHelp"));
    navigate("/portal/leads", { replace: true });
  };

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-500">{t("leads.deleteHelp")}</p>
      <button
        type="button"
        onClick={remove}
        disabled={busy}
        className="w-full border border-red-200 text-red-700 font-semibold text-sm py-2.5 rounded-xl hover:bg-red-50 transition disabled:opacity-50"
      >
        {busy ? t("common.saving") : t("leads.delete")}
      </button>
      {error && <ErrorBanner message={error} />}
    </div>
  );
}

const LeadDetail = () => {
  const { id } = useParams();
  const { t, fmtDate } = useT();
  const { role } = useAuth();
  const [lead, setLead] = useState(null);
  const [activities, setActivities] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setError(null);
    const [l, a] = await Promise.all([
      supabase.from("leads").select("*").eq("id", id).maybeSingle(),
      supabase.from("lead_activities").select("*").eq("lead_id", id).order("created_at"),
    ]);
    if (l.error) setError(l.error.message);
    else if (!l.data) setError(t("orderDetail.notFound"));
    else setLead(l.data);
    setActivities(a.data ?? []);
    setLoading(false);
  }, [id, t]);

  useEffect(() => {
    load();
    return subscribeToChanges(`lead-${id}`, [{ table: "leads", filter: `id=eq.${id}` }], load);
  }, [id, load]);

  useEffect(() => {
    supabase.from("clients").select("id, full_name, email").in("role", ["staff", "admin"]).then(({ data }) => setStaff(data ?? []));
  }, []);

  if (loading) return <Spinner />;
  if (error) return <ErrorBanner message={error} onRetry={load} />;

  const names = Object.fromEntries(staff.map((s) => [s.id, s.full_name || s.email]));
  const wa = whatsappLink(lead.whatsapp || lead.phone);
  const yes = (v) => (v ? t("leads.yes") : t("leads.no"));
  const info = [
    [t("leads.services"), (lead.services ?? []).map((s) => t(`leads.service.${s}`)).join(", ") || "—"],
    [t("leads.volume"), `${lead.units_per_month ?? "—"} ${t("leads.unitsShort")} · ${lead.shipments_per_month ?? "—"} ${t("leads.shipmentsShort")}`],
    [t("leads.channels"), (lead.sales_channels ?? []).map((c) => t(`leads.channel.${c}`)).join(", ") || "—"],
    [t("leads.sellerId"), lead.seller_id_or_store || "—"],
    [t("leads.category"), lead.product_category ? t(`leads.categoryName.${lead.product_category}`) : "—"],
    [t("leads.hazmatFragile"), `${yes(lead.hazmat)} / ${yes(lead.fragile)}`],
    [t("leads.location"), [lead.city, lead.state].filter(Boolean).join(", ") || "—"],
    [t("leads.heardFrom"), lead.heard_from || "—"],
    [t("leads.language"), lead.language === "es" ? "Español" : lead.language === "en" ? "English" : "—"],
    [t("leads.website"), lead.website || "—"],
  ];

  return (
    <div className="max-w-6xl">
      <Link to="/portal/leads" className="text-sm text-gray-400 hover:text-third">← {t("common.back")}</Link>
      <div className="mt-2">
        <PageHeader
          title={lead.company || leadName(lead)}
          subtitle={`#${lead.number} · ${t(`leads.source.${lead.source}`)} · ${fmtDate(lead.created_at)}`}
          action={<LeadBadge status={lead.status} />}
        />
      </div>
      {needsAttention(lead) && (
        <div className="mb-5 bg-red-50 border border-red-200 text-red-800 text-sm px-4 py-3 rounded-xl">{t("leads.attentionBanner")}</div>
      )}
      {lead.status === "lost" && lead.lost_reason && (
        <div className="mb-5 bg-gray-50 border border-gray-200 text-gray-700 text-sm px-4 py-3 rounded-xl">{t("leads.lostReason")}: {lead.lost_reason}</div>
      )}

      <div className="grid lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 space-y-6">
          <Card title={t("leads.contact")}>
            <p className="text-base font-semibold text-primary">{leadName(lead)}{lead.job_title && <span className="font-normal text-gray-500"> · {lead.job_title}</span>}</p>
            <div className="flex flex-wrap gap-2 mt-3">
              {lead.email && <a href={`mailto:${lead.email}`} className={btnSecondary}>✉ {lead.email}</a>}
              {lead.phone && <a href={`tel:${lead.phone}`} className={btnSecondary}>☎ {lead.phone}</a>}
              {wa && <a href={wa} target="_blank" rel="noopener noreferrer" className={btnSecondary}>WhatsApp</a>}
            </div>
            {lead.preferred_contact && <p className="text-xs text-gray-500 mt-2">{t("leads.prefers", { how: t(`leads.kind.${lead.preferred_contact === "phone" ? "call" : lead.preferred_contact}`) })}</p>}
            {lead.message && <p className="mt-4 text-sm text-gray-700 whitespace-pre-line border-t border-gray-100 pt-3">{lead.message}</p>}
          </Card>
          <Card title={t("leads.moveTitle")}>
            <StatusActions lead={lead} onChanged={load} />
            {!NEXT_LEAD[lead.status]?.length && <p className="text-sm text-gray-400">{t("staff.noNextStage")}</p>}
          </Card>
          <Card title={t("orderDetail.timeline")}>
            <ActivityLog lead={lead} activities={activities} names={names} onChanged={load} />
          </Card>
        </div>

        <div className="space-y-6">
          <Card title={t("leads.details")}>
            <dl className="space-y-3">
              {info.map(([k, v]) => (
                <div key={k}>
                  <dt className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">{k}</dt>
                  <dd className="text-sm text-primary mt-0.5 break-words">{v}</dd>
                </div>
              ))}
            </dl>
          </Card>
          <Card title={t("leads.planning")}>
            <Planning lead={lead} staff={staff} onChanged={load} />
          </Card>
          {lead.status !== "lost" && (
            <Card title={t("leads.convertTitle")}>
              <ConvertCard lead={lead} onChanged={load} />
            </Card>
          )}
          {role === "admin" && !lead.converted_client_id && (
            <Card title={t("leads.deleteTitle")}>
              <DeleteCard lead={lead} />
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeadDetail;
