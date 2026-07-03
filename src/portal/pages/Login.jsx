import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";

const Login = () => {
  const { signIn } = useAuth();
  const navigate   = useNavigate();

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error } = await signIn(email, password);

    if (error) {
      setError("Incorrect email or password. Please try again.");
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
          <h2 className="text-primary font-bold text-xl mb-6">Sign In</h2>

          {error && (
            <div className="mb-5 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
              {error}
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-third/40 focus:border-third transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-third hover:bg-third-dark disabled:opacity-60 text-white font-semibold py-2.5 rounded-xl transition duration-200 text-sm"
            >
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-6">
            No account yet?{" "}
            <a href="/#contact" className="text-third hover:underline font-medium">
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
