import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../../lib/supabaseClient";
import { useT } from "../../i18n";
import { leadName, needsAttention, OPEN_LEAD } from "../../lib/leads";
import { subscribeToChanges } from "../../lib/orders";
import { btnPrimary, btnSecondary, Card, ErrorBanner, Field, inputCls, PageHeader, Spinner } from "../../components/ui";

function LeadCard({ lead }) {
  const { t, fmtDate } = useT();
  const attention = needsAttention(lead);
  return (
    <Link
      to={`/portal/leads/${lead.id}`}
      className={`block bg-white border rounded-xl p-3 hover:border-third/50 transition ${attention ? "border-red-300 ring-1 ring-red-200" : "border-gray-200"}`}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-bold text-primary truncate">{lead.company || leadName(lead)}</p>
        <span className="text-[11px] text-gray-400 whitespace-nowrap">#{lead.number}</span>
      </div>
      <p className="text-xs text-gray-600 truncate">{leadName(lead)}</p>
      <div className="flex flex-wrap gap-1.5 mt-2">
        {(lead.services ?? []).map((s) => (
          <span key={s} className="text-[10px] font-bold uppercase text-third bg-third/10 px-1.5 py-0.5 rounded">{t(`leads.service.${s}`)}</span>
        ))}
        {lead.units_per_month != null && (
          <span className="text-[11px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{t("leads.unitsMonth", { n: lead.units_per_month })}</span>
        )}
      </div>
      <p className={`text-[11px] mt-2 ${attention ? "text-red-600 font-semibold" : "text-gray-400"}`}>
        {attention
          ? lead.next_follow_up_at && lead.last_contacted_at
            ? t("leads.followUpOverdue")
            : t("leads.noContact48")
          : lead.next_follow_up_at
            ? t("leads.followUpOn", { date: fmtDate(lead.next_follow_up_at, { month: "short", day: "numeric" }) })
            : t("leads.arrived", { date: fmtDate(lead.created_at, { month: "short", day: "numeric" }) })}
      </p>
    </Link>
  );
}

function NewLeadForm({ onCancel }) {
  const { t } = useT();
  const navigate = useNavigate();
  const [form, setForm] = useState({ first_name: "", last_name: "", company: "", email: "", phone: "", services: ["prep"], message: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.email.trim() && !form.phone.trim()) return setError(t("leads.needContact"));
    setBusy(true);
    setError(null);
    const payload = Object.fromEntries(Object.entries(form).map(([k, v]) => [k, typeof v === "string" ? v.trim() || null : v]));
    const { data, error: err } = await supabase
      .from("leads")
      .insert({ ...payload, email: payload.email?.toLowerCase() ?? null, source: "manual" })
      .select("id")
      .single();
    setBusy(false);
    if (err) return setError(err.message);
    navigate(`/portal/leads/${data.id}`);
  };

  return (
    <Card title={t("leads.newTitle")} className="mb-6">
      <form onSubmit={submit} className="grid sm:grid-cols-3 gap-3 items-end">
        <Field label={t("leads.firstName")}><input className={inputCls} value={form.first_name} onChange={(e) => set("first_name", e.target.value)} /></Field>
        <Field label={t("leads.lastName")}><input className={inputCls} value={form.last_name} onChange={(e) => set("last_name", e.target.value)} /></Field>
        <Field label={t("leads.company")}><input className={inputCls} value={form.company} onChange={(e) => set("company", e.target.value)} /></Field>
        <Field label="Email"><input type="email" className={inputCls} value={form.email} onChange={(e) => set("email", e.target.value)} /></Field>
        <Field label={t("leads.phone")}><input className={inputCls} value={form.phone} onChange={(e) => set("phone", e.target.value)} /></Field>
        <fieldset className="flex gap-4 py-2.5">
          {["prep", "3pl"].map((s) => (
            <label key={s} className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                className="accent-third"
                checked={form.services.includes(s)}
                onChange={(e) => set("services", e.target.checked ? [...form.services, s] : form.services.filter((x) => x !== s))}
              />
              {t(`leads.service.${s}`)}
            </label>
          ))}
        </fieldset>
        <div className="sm:col-span-3">
          <Field label={t("leads.notes")}><textarea className={inputCls} rows={2} value={form.message} onChange={(e) => set("message", e.target.value)} /></Field>
        </div>
        <div className="sm:col-span-3 flex gap-2">
          <button type="submit" disabled={busy} className={btnPrimary}>{busy ? t("common.saving") : t("leads.create")}</button>
          <button type="button" onClick={onCancel} className={btnSecondary}>{t("common.cancel")}</button>
        </div>
        {error && <div className="sm:col-span-3"><ErrorBanner message={error} /></div>}
      </form>
    </Card>
  );
}

const Leads = () => {
  const { t } = useT();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState("open");
  const [query, setQuery] = useState("");
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    const { data, error: err } = await supabase
      .from("leads")
      .select("id, number, status, first_name, last_name, company, email, phone, services, units_per_month, created_at, last_contacted_at, next_follow_up_at")
      .order("created_at", { ascending: false })
      .limit(500);
    if (err) setError(err.message);
    else setLeads(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    return subscribeToChanges("leads-board", [{ table: "leads" }], load);
  }, [load]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return leads;
    return leads.filter((l) =>
      [String(l.number), l.company, l.first_name, l.last_name, l.email, l.phone].some((v) => (v ?? "").toLowerCase().includes(q))
    );
  }, [leads, query]);

  const attention = filtered.filter((l) => needsAttention(l)).length;
  const counts = { open: filtered.filter((l) => OPEN_LEAD.includes(l.status)).length, won: 0, lost: 0 };
  for (const l of filtered) if (l.status === "won" || l.status === "lost") counts[l.status]++;

  return (
    <div>
      <PageHeader
        title={t("leads.title")}
        subtitle={t("leads.subtitle")}
        action={!creating && <button onClick={() => setCreating(true)} className={btnPrimary}>+ {t("leads.new")}</button>}
      />
      {creating && <NewLeadForm onCancel={() => setCreating(false)} />}

      <div className="flex flex-wrap items-center gap-2 mb-4">
        {["open", "won", "lost"].map((k) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            className={`text-sm font-semibold px-4 py-1.5 rounded-full transition ${tab === k ? "bg-primary text-white" : "bg-white border border-gray-200 text-gray-600"}`}
          >
            {t(`leads.tab.${k}`)} ({counts[k]})
          </button>
        ))}
        {attention > 0 && (
          <span className="text-xs font-semibold text-red-700 bg-red-50 border border-red-200 px-3 py-1 rounded-full">
            {t("leads.attentionCount", { n: attention })}
          </span>
        )}
        <div className="flex-1" />
        <input className={`${inputCls} max-w-xs`} value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t("leads.search")} />
      </div>

      {loading && <Spinner />}
      {error && <ErrorBanner message={error} onRetry={load} />}

      {!loading && !error && tab === "open" && (
        <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 sm:-mx-6 sm:px-6">
          {OPEN_LEAD.map((status) => {
            const col = filtered
              .filter((l) => l.status === status)
              .sort((a, b) => Number(needsAttention(b)) - Number(needsAttention(a)));
            return (
              <section key={status} className="w-72 flex-shrink-0">
                <div className="flex items-center justify-between mb-2 px-1">
                  <h2 className="text-xs font-bold uppercase tracking-wide text-gray-500">{t(`leads.status.${status}`)}</h2>
                  <span className="text-xs font-semibold text-gray-400">{col.length}</span>
                </div>
                <div className="space-y-2 bg-gray-100/70 rounded-2xl p-2 min-h-[120px]">
                  {col.map((l) => <LeadCard key={l.id} lead={l} />)}
                </div>
              </section>
            );
          })}
        </div>
      )}

      {!loading && !error && tab !== "open" && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 max-w-5xl">
          {filtered.filter((l) => l.status === tab).map((l) => <LeadCard key={l.id} lead={l} />)}
        </div>
      )}
    </div>
  );
};

export default Leads;
