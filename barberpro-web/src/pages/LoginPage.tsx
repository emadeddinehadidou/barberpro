import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
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
    if (user.role === "client") {
      return <Navigate to="/client/profile" replace />;
    }

    return <Navigate to="/dashboard" replace />;
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

      const { data } = await api.post<{ message: string; user: User }>(
        "/auth/login",
        form
      );

      setUser(data.user);

      if (data.user.role === "client") {
        navigate("/client/profile");
      } else {
        navigate("/dashboard");
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "La connexion a échoué.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0b0b0d] px-4 text-white">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur">
        <h1 className="mb-2 text-3xl font-bold text-[#c8a96b]">Barber 23</h1>
        <p className="mb-6 text-sm text-white/60">Connectez-vous à votre compte</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm">Adresse Email</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 outline-none"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm">Mot de passe</label>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 outline-none"
              required
            />
          </div>

          {error ? <p className="text-sm text-red-400">{error}</p> : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[#c8a96b] px-4 py-3 font-semibold text-black transition hover:opacity-90"
          >
            {loading ? "Connexion en cours…" : "Se connecter"}
          </button>
        </form>
      </div>
    </div>
  );
}