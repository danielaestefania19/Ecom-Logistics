import { useState } from "react";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../AuthContext";

const signInErrorMessage = (error) => {
  if (error.code === "email_not_confirmed") return "Please accept your invitation email before signing in.";
  if (error.status === 429) return "Too many attempts. Please wait a minute and try again.";
  if (error.code === "invalid_credentials" || error.status === 400) return "Incorrect email or password. Please try again.";
  return "We couldn't sign you in right now. Please try again in a moment.";
};

const Login = () => {
  const { user, loading: authLoading, signIn, sendPasswordReset } = useAuth();
  const navigate   = useNavigate();
  const [searchParams] = useSearchParams();

  const [mode, setMode]         = useState(searchParams.get("reset") ? "reset" : "login");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [notice, setNotice]     = useState("");
  const [loading, setLoading]   = useState(false);

  if (!authLoading && user && mode === "login") return <Navigate to="/portal/services" replace />;

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
      if (error && error.status === 429) setError("Too many requests. Please wait a minute and try again.");
      // Same message whether or not the email exists, so accounts can't be enumerated.
      else setNotice("If that email has an account, you'll receive a link to reset your password.");
      return;
    }

    const { error } = await signIn(email, password);

    if (error) {
      setError(signInErrorMessage(error));
      setLoading(false);
    } else {
      navigate("/portal/services");
    }
  };

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        {/* Logo / brand */}
        <div className="text-center mb-8">
          <span className="inline-block text-third font-bold tracking-widest text-xs uppercase mb-3">
            Client Portal
          </span>
          <h1 className="text-white text-2xl sm:text-3xl font-bold">
            Ecom Logistics
          </h1>
          <p className="text-white/50 text-sm mt-2">
            Sign in to manage your orders and services
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-primary font-bold text-xl mb-6">
            {mode === "reset" ? "Reset your password" : "Sign In"}
          </h2>

          {error && (
            <div className="mb-5 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
              {error}
            </div>
          )}
          {notice && (
            <div className="mb-5 bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-xl">
              {notice}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Email address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-third/40 focus:border-third transition"
              />
            </div>

            {mode === "login" && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => switchMode("reset")}
                    className="text-xs text-third hover:underline font-medium"
                  >
                    Forgot password?
                  </button>
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-third/40 focus:border-third transition"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-third hover:bg-third-dark disabled:opacity-60 text-white font-semibold py-2.5 rounded-xl transition duration-200 text-sm"
            >
              {mode === "reset"
                ? (loading ? "Sending…" : "Send reset link")
                : (loading ? "Signing in…" : "Sign In")}
            </button>

            {mode === "reset" && (
              <button
                type="button"
                onClick={() => switchMode("login")}
                className="w-full text-sm text-gray-500 hover:text-primary transition"
              >
                ← Back to sign in
              </button>
            )}
          </form>

          <p className="text-center text-xs text-gray-400 mt-6">
            No account yet?{" "}
            <a href="/home#contact" className="text-third hover:underline font-medium">
              Contact us to get access
            </a>
          </p>
        </div>

        <p className="text-center text-white/30 text-xs mt-8">
          © {new Date().getFullYear()} Ecom Logistics · Hayward, CA
        </p>
      </div>
    </div>
  );
};

export default Login;
