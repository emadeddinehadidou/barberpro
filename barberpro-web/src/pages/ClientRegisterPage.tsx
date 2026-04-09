import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { api, getCsrfCookie } from "../api/axios";
import { useAuthStore } from "../app/store";
import type { User } from "../types";

const salonId = 1;

export default function ClientRegisterPage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const authChecked = useAuthStore((state) => state.authChecked);
  const setUser = useAuthStore((state) => state.setUser);

  const [form, setForm] = useState({
    salon_id: salonId,
    full_name: "",
    phone: "",
    email: "",
    password: "",
    password_confirmation: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (authChecked && user) {
    return <Navigate to="/client/profile" replace />;
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
      const { data } = await api.post<{ user: User }>("/auth/client-register", form);
      setUser(data.user);
      navigate("/client/profile");
    } catch (err: any) {
      setError(err?.response?.data?.message || "L’inscription a échoué.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0b0b0d] px-4 text-white">
      <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur">
        <h1 className="mb-2 text-3xl font-bold text-[#c8a96b]">Inscription client</h1>
        <p className="mb-6 text-sm text-white/60">Créez votre compte client</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="full_name"
            placeholder="Nom complet"
            value={form.full_name}
            onChange={handleChange}
            className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 outline-none"
          />
          <input
            name="phone"
            placeholder="Téléphone"
            value={form.phone}
            onChange={handleChange}
            className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 outline-none"
          />
          <input
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 outline-none"
          />
          <input
            name="password"
            type="password"
            placeholder="Mot de passe"
            value={form.password}
            onChange={handleChange}
            className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 outline-none"
          />
          <input
            name="password_confirmation"
            type="password"
            placeholder="Confirmer le mot de passe"
            value={form.password_confirmation}
            onChange={handleChange}
            className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 outline-none"
          />

          {error ? <p className="text-sm text-red-400">{error}</p> : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[#c8a96b] px-4 py-3 font-semibold text-black"
          >
            {loading ? "Création du compte…" : "S’inscrire"}
          </button>
        </form>
      </div>
    </div>
  );
}