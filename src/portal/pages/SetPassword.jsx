import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";

const SetPassword = () => {
  const navigate = useNavigate();
  const [password, setPassword]       = useState("");
  const [confirm, setConfirm]         = useState("");
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState(null);
  const [sessionReady, setSessionReady] = useState(false);

  // Supabase automatically parses the #access_token from the URL hash.
  // Wait for the auth listener to confirm the session is set.
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSessionReady(true);
      } else {
        // Listen for the token exchange triggered by the URL hash
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
          if (session) {
            setSessionReady(true);
            subscription.unsubscribe();
          }
        });
        return () => subscription.unsubscribe();
      }
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }

    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    // Password set — go to portal
    navigate("/portal/services", { replace: true });
  };

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <span className="text-third text-xs font-bold uppercase tracking-widest block mb-1">
            Client Portal
          </span>
          <h1 className="text-white text-2xl font-bold">Ecom Logistics</h1>
        </div>

        <div className="bg-white rounded-2xl shadow-xl px-8 py-8">
          <h2 className="text-primary font-bold text-xl mb-1">Set your password</h2>
          <p className="text-gray-500 text-sm mb-6">
            Choose a secure password to access your client portal.
          </p>

          {!sessionReady ? (
            <div className="text-center py-6">
              <div className="inline-block w-6 h-6 border-2 border-third border-t-transparent rounded-full animate-spin mb-3" />
              <p className="text-gray-400 text-sm">Verifying your invitation…</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  required
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-primary focus:outline-none focus:ring-2 focus:ring-third/30 focus:border-third transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Repeat your password"
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
                {loading ? "Saving…" : "Set Password & Enter Portal"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default SetPassword;
