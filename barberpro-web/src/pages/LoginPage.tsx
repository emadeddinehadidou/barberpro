import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { api, getCsrfCookie } from "../api/axios";
import { useAuthStore } from "../app/store";
import type { User } from "../types";

export default function LoginPage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const authChecked = useAuthStore((state) => state.authChecked);
  const setUser = useAuthStore((state) => state.setUser);

  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (authChecked && user) {
    return <Navigate to={user.role === "client" ? "/client/dashboard" : "/dashboard"} replace />;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await getCsrfCookie();
      const { data } = await api.post<{ message: string; user: User }>("/auth/login", form);
      setUser(data.user);
      navigate(data.user.role === "client" ? "/client/dashboard" : "/dashboard");
    } catch (err: any) {
      setError(err?.response?.data?.message || "La connexion a echoue.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_left,rgba(201,168,115,0.18),transparent_28%),linear-gradient(180deg,#fffdf9_0%,#f4ebde_100%)] px-4 text-[#2b2116]">
      <div className="w-full max-w-md rounded-[32px] border border-[#decdb0] bg-white/90 p-8 shadow-[0_24px_80px_rgba(113,83,48,0.14)] backdrop-blur">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-[#9c7a49]">Luxury Barber Suite</p>
        <h1 className="mb-2 text-4xl font-bold text-[#8a6a3c]">Barber 23</h1>
        <p className="mb-6 text-sm text-[#6f5d47]">Connectez-vous a votre compte</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-[#4b3824]">Adresse email</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              className="w-full rounded-2xl border border-[#ddceb6] bg-[#fffaf2] px-4 py-3 text-[#2b2116] outline-none transition focus:border-[#b78e56] focus:bg-white"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[#4b3824]">Mot de passe</label>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              className="w-full rounded-2xl border border-[#ddceb6] bg-[#fffaf2] px-4 py-3 text-[#2b2116] outline-none transition focus:border-[#b78e56] focus:bg-white"
              required
            />
          </div>

          {error ? <p className="text-sm text-red-500">{error}</p> : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-[#8a6a3c] px-4 py-3 font-semibold text-[#fffaf2] transition hover:bg-[#755732]"
          >
            {loading ? "Connexion en cours..." : "Se connecter"}
          </button>

          <p className="text-center text-sm text-[#6f5d47]">
            Nouveau client ?{" "}
            <Link to="/client/register" className="font-medium text-[#8a6a3c] hover:text-[#6f522e]">
              Creer un compte
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
