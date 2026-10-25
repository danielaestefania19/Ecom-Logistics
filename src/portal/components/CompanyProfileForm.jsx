import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../AuthContext";
import { useT } from "../i18n";
import { btnPrimary, Card, ErrorBanner, Field, inputCls } from "./ui";

const CHANNELS = ["amazon", "shopify", "tiktok", "walmart", "other"];
const CATEGORIES = ["health_beauty", "supplements", "apparel", "home_kitchen", "electronics", "toys", "sports", "pet", "other"];

const fromProfile = (p) => ({
  full_name: p?.full_name ?? "",
  company: p?.company ?? "",
  legal_name: p?.legal_name ?? p?.company ?? "",
  website: p?.website ?? "",
  phone: p?.phone ?? "",
  language: p?.language ?? "en",
  address_line1: p?.address_line1 ?? "",
  address_line2: p?.address_line2 ?? "",
  address_city: p?.address_city ?? "",
  address_state: p?.address_state ?? "",
  address_zip: p?.address_zip ?? "",
  address_country: p?.address_country ?? "US",
  sales_channels: p?.sales_channels ?? [],
  seller_id_or_store: p?.seller_id_or_store ?? "",
  product_category: p?.product_category ?? "",
  job_title: p?.job_title ?? "",
  whatsapp: p?.whatsapp ?? "",
  preferred_contact: p?.preferred_contact ?? "",
});

// Clients fill this once before their first order; values captured on the website form arrive prefilled.
const CompanyProfileForm = ({ onSaved, intro }) => {
  const { t } = useT();
  const { clientProfile, refreshProfile } = useAuth();
  const [form, setForm] = useState(() => fromProfile(clientProfile));
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);

  const set = (k, v) => {
    setSaved(false);
    setForm((f) => ({ ...f, [k]: v }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const { error: err } = await supabase.rpc("update_my_profile", { p: form });
    setBusy(false);
    if (err) return setError(err.message === "company name and full address are required" ? t("profile.required") : err.message);
    setSaved(true);
    refreshProfile();
    onSaved?.();
  };

  const input = (k, extra = {}) => <input className={inputCls} value={form[k]} onChange={(e) => set(k, e.target.value)} {...extra} />;

  return (
    <form onSubmit={submit} className="space-y-6 max-w-4xl">
      {intro && <div className="bg-third/5 border border-third/20 text-primary text-sm px-4 py-3 rounded-xl">{intro}</div>}

      <Card title={t("profile.company")}>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label={t("profile.legalName")} required>{input("legal_name", { required: true })}</Field>
          <Field label={t("profile.tradeName")}>{input("company")}</Field>
          <Field label={t("profile.website")}>{input("website", { placeholder: "https://" })}</Field>
          <Field label={t("profile.category")}>
            <select className={inputCls} value={form.product_category} onChange={(e) => set("product_category", e.target.value)}>
              <option value="">—</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{t(`leads.categoryName.${c}`)}</option>)}
            </select>
          </Field>
          <div className="sm:col-span-2">
            <span className="block text-xs font-semibold text-gray-500 mb-2">{t("profile.channels")}</span>
            <div className="flex flex-wrap gap-4">
              {CHANNELS.map((c) => (
                <label key={c} className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    className="accent-third"
                    checked={form.sales_channels.includes(c)}
                    onChange={(e) => set("sales_channels", e.target.checked ? [...form.sales_channels, c] : form.sales_channels.filter((x) => x !== c))}
                  />
                  {t(`leads.channel.${c}`)}
                </label>
              ))}
            </div>
          </div>
          <div className="sm:col-span-2">
            <Field label={t("profile.sellerId")}>{input("seller_id_or_store")}</Field>
          </div>
        </div>
      </Card>

      <Card title={t("profile.address")}>
        <div className="grid sm:grid-cols-6 gap-4">
          <div className="sm:col-span-4"><Field label={t("profile.line1")} required>{input("address_line1", { required: true })}</Field></div>
          <div className="sm:col-span-2"><Field label={t("profile.line2")}>{input("address_line2")}</Field></div>
          <div className="sm:col-span-2"><Field label={t("profile.city")} required>{input("address_city", { required: true })}</Field></div>
          <div className="sm:col-span-2"><Field label={t("profile.state")} required>{input("address_state", { required: true })}</Field></div>
          <div className="sm:col-span-1"><Field label={t("profile.zip")} required>{input("address_zip", { required: true })}</Field></div>
          <div className="sm:col-span-1"><Field label={t("profile.country")}>{input("address_country")}</Field></div>
        </div>
      </Card>

      <Card title={t("profile.contact")}>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label={t("profile.fullName")}>{input("full_name")}</Field>
          <Field label={t("profile.jobTitle")}>{input("job_title")}</Field>
          <Field label={t("profile.phone")}>{input("phone")}</Field>
          <Field label="WhatsApp">{input("whatsapp")}</Field>
          <Field label={t("profile.preferredContact")}>
            <select className={inputCls} value={form.preferred_contact} onChange={(e) => set("preferred_contact", e.target.value)}>
              <option value="">—</option>
              <option value="email">Email</option>
              <option value="phone">{t("leads.kind.call")}</option>
              <option value="whatsapp">WhatsApp</option>
            </select>
          </Field>
          <Field label={t("profile.language")}>
            <select className={inputCls} value={form.language} onChange={(e) => set("language", e.target.value)}>
              <option value="en">English</option>
              <option value="es">Español</option>
            </select>
          </Field>
        </div>
      </Card>

      {error && <ErrorBanner message={error} />}
      <div className="flex items-center gap-3">
        <button type="submit" disabled={busy} className={btnPrimary}>{busy ? t("common.saving") : t("profile.save")}</button>
        {saved && <span className="text-sm text-green-600">{t("common.saved")}</span>}
      </div>
    </form>
  );
};

export default CompanyProfileForm;
