import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../AuthContext";
import { useT } from "../i18n";

// Read before supabase-js consumes the hash, e.g. #error=access_denied&error_code=otp_expired
const hashError = (() => {
  const params = new URLSearchParams(window.location.hash.slice(1));
  return params.get("error_description") || params.get("error");
})();

const LINK_TIMEOUT_MS = 8000;

const SetPassword = () => {
  const navigate = useNavigate();
  const { session } = useAuth();
  const { t } = useT();
  const [password, setPassword]       = useState("");
  const [confirm, setConfirm]         = useState("");
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState(null);
  const [timedOut, setTimedOut]       = useState(false);

  const sessionReady = !!session;
  const linkInvalid = !sessionReady && (hashError || timedOut);

  useEffect(() => {
    if (sessionReady) return;
    const t = setTimeout(() => setTimedOut(true), LINK_TIMEOUT_MS);
    return () => clearTimeout(t);
  }, [sessionReady]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError(t("setPassword.errors.tooShort"));
      return;
    }
    if (password !== confirm) {
      setError(t("setPassword.errors.mismatch"));
      return;
    }

    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    navigate("/portal", { replace: true });
  };

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <span className="text-third text-xs font-bold uppercase tracking-widest block mb-1">
            {t("nav.clientPortal")}
          </span>
          <h1 className="text-white text-2xl font-bold">Ecom Logistics</h1>
        </div>

        <div className="bg-white rounded-2xl shadow-xl px-8 py-8">
          <h2 className="text-primary font-bold text-xl mb-1">{t("setPassword.title")}</h2>
          <p className="text-gray-500 text-sm mb-6">{t("setPassword.subtitle")}</p>

          {linkInvalid ? (
            <div className="text-center py-4">
              <p className="text-red-600 text-sm font-medium mb-2">{t("setPassword.invalidLink")}</p>
              <p className="text-gray-500 text-sm mb-5">{t("setPassword.invalidHint")}</p>
              <Link
                to="/portal/login?reset=1"
                className="inline-block bg-primary hover:bg-third text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition"
              >
                {t("setPassword.newLink")}
              </Link>
            </div>
          ) : !sessionReady ? (
            <div className="text-center py-6">
              <div className="inline-block w-6 h-6 border-2 border-third border-t-transparent rounded-full animate-spin mb-3" />
              <p className="text-gray-400 text-sm">{t("setPassword.verifying")}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">{t("setPassword.newPassword")}</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t("setPassword.newPasswordHint")}
                  required
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-primary focus:outline-none focus:ring-2 focus:ring-third/30 focus:border-third transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">{t("setPassword.confirm")}</label>
                <input
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder={t("setPassword.confirmHint")}
                  required
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-primary focus:outline-none focus:ring-2 focus:ring-third/30 focus:border-third transition"
                />
              </div>

              {error && (
                <p className="text-red-500 text-sm">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading || !password || !confirm}
                className="w-full bg-primary hover:bg-third text-white font-semibold text-sm py-3 rounded-xl transition duration-200 disabled:opacity-50"
              >
                {loading ? t("common.saving") : t("setPassword.submit")}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default SetPassword;
