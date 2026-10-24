import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "./AuthContext";
import { STRINGS } from "./strings";

const I18nContext = createContext(null);
const STORAGE_KEY = "portal-lang";

const readStored = () => {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
};

const lookup = (dict, key) =>
  key.split(".").reduce((obj, k) => (obj && typeof obj === "object" ? obj[k] : undefined), dict);

export const PortalI18nProvider = ({ children }) => {
  const { clientProfile } = useAuth();
  const [stored] = useState(readStored);
  const [lang, setLangState] = useState(
    () => stored || (navigator.language?.toLowerCase().startsWith("es") ? "es" : "en")
  );

  useEffect(() => {
    if (!stored && clientProfile?.language) setLangState(clientProfile.language);
  }, [stored, clientProfile?.language]);

  const setLang = useCallback((next) => {
    setLangState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Private mode: the choice just won't persist.
    }
  }, []);

  const value = useMemo(() => {
    const locale = lang === "es" ? "es-US" : "en-US";
    const t = (key, vars) => {
      const s = lookup(STRINGS[lang], key) ?? lookup(STRINGS.en, key) ?? key;
      return vars ? String(s).replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? "") : s;
    };
    const fmtDate = (value, opts = { month: "short", day: "numeric", year: "numeric" }) =>
      value ? new Date(value).toLocaleDateString(locale, opts) : "—";
    const fmtDateTime = (value) =>
      value ? new Date(value).toLocaleString(locale, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }) : "—";
    const fmtMoney = (n) =>
      n == null ? "—" : new Intl.NumberFormat(locale, { style: "currency", currency: "USD" }).format(n);
    return { lang, setLang, t, locale, fmtDate, fmtDateTime, fmtMoney };
  }, [lang, setLang]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export const useT = () => {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useT must be used inside <PortalI18nProvider>");
  return ctx;
};
