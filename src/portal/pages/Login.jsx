import { useState } from "react";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { useT } from "../i18n";

const signInErrorKey = (error) => {
  if (error.code === "email_not_confirmed") return "login.errors.unconfirmed";
  if (error.status === 429) return "login.errors.rateLimited";
  if (error.code === "invalid_credentials" || error.status === 400) return "login.errors.invalid";
  return "login.errors.generic";
};

const inputCls =
  "w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-third/40 focus:border-third transition";

const Login = () => {
  const { user, loading: authLoading, signIn, sendPasswordReset } = useAuth();
  const { t, lang, setLang } = useT();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [mode, setMode] = useState(searchParams.get("reset") ? "reset" : "login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);

  if (!authLoading && user && mode === "login") return <Navigate to="/portal" replace />;

  const switchMode = (next) => {
    setMode(next);
    setError("");
    setNotice("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setNotice("");
    setLoading(true);

    if (mode === "reset") {
      const { error } = await sendPasswordReset(email);
      setLoading(false);
      if (error && error.status === 429) setError(t("login.errors.rateLimited"));
      // Same message whether or not the email exists, so accounts can't be enumerated.
      else setNotice(t("login.resetSent"));
      return;
    }

    const { error } = await signIn(email, password);
    if (error) {
      setError(t(signInErrorKey(error)));
      setLoading(false);
    } else {
      navigate("/portal");
    }
  };

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <span className="inline-block text-third font-bold tracking-widest text-xs uppercase mb-3">{t("nav.clientPortal")}</span>
          <h1 className="text-white text-2xl sm:text-3xl font-bold">Ecom Logistics</h1>
          <p className="text-white/50 text-sm mt-2">{t("login.tagline")}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="flex items-center justify-between mb-6 gap-3">
            <h2 className="text-primary font-bold text-xl">{mode === "reset" ? t("login.resetTitle") : t("login.title")}</h2>
            <button
              type="button"
              onClick={() => setLang(lang === "en" ? "es" : "en")}
              className="text-xs font-bold text-gray-400 hover:text-third"
            >
              {lang === "en" ? "ES" : "EN"}
            </button>
          </div>

          {error && <div className="mb-5 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">{error}</div>}
          {notice && <div className="mb-5 bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-xl">{notice}</div>}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{t("login.email")}</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" className={inputCls} />
            </div>

            {mode === "login" && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-medium text-gray-700">{t("login.password")}</label>
                  <button type="button" onClick={() => switchMode("reset")} className="text-xs text-third hover:underline font-medium">
                    {t("login.forgot")}
                  </button>
                </div>
                <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className={inputCls} />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-third hover:bg-third-dark disabled:opacity-60 text-white font-semibold py-2.5 rounded-xl transition duration-200 text-sm"
            >
              {mode === "reset"
                ? loading ? t("login.sending") : t("login.sendReset")
                : loading ? t("login.signingIn") : t("login.submit")}
            </button>

            {mode === "reset" && (
              <button type="button" onClick={() => switchMode("login")} className="w-full text-sm text-gray-500 hover:text-primary transition">
                ← {t("login.backToSignIn")}
              </button>
            )}
          </form>

          <p className="text-center text-xs text-gray-400 mt-6">
            {t("login.noAccount")}{" "}
            <a href="/home#contact" className="text-third hover:underline font-medium">{t("login.contactUs")}</a>
          </p>
        </div>

        <p className="text-center text-white/30 text-xs mt-8">© {new Date().getFullYear()} Ecom Logistics · Hayward, CA</p>
      </div>
    </div>
  );
};

export default Login;
