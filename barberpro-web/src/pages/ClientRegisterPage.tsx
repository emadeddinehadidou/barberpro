import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
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
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  if (authChecked && user) {
    return <Navigate to="/client/dashboard" replace />;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setFieldErrors((prev) => ({ ...prev, [e.target.name]: "" }));
  };

  const validateForm = () => {
    const nextErrors: Record<string, string> = {};

    if (!form.full_name.trim()) nextErrors.full_name = "Le nom est requis.";
    if (!form.phone.trim()) nextErrors.phone = "Le telephone est requis.";
    if (!form.email.trim()) {
      nextErrors.email = "L'email est requis.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      nextErrors.email = "L'email n'est pas valide.";
    }
    if (!form.password) {
      nextErrors.password = "Le mot de passe est requis.";
    } else if (form.password.length < 6) {
      nextErrors.password = "Minimum 6 caracteres.";
    }
    if (form.password !== form.password_confirmation) {
      nextErrors.password_confirmation = "Les mots de passe ne correspondent pas.";
    }

    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError("");

    try {
      await getCsrfCookie();
      const { data } = await api.post<{ user: User }>("/auth/client-register", form);
      setUser(data.user);
      navigate("/client/dashboard");
    } catch (err: any) {
      const serverErrors = err?.response?.data?.errors as Record<string, string[]> | undefined;
      if (serverErrors) {
        setFieldErrors(
          Object.fromEntries(Object.entries(serverErrors).map(([key, value]) => [key, value[0]]))
        );
      }
      setError(err?.response?.data?.message || "L'inscription a echoue.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_left,rgba(201,168,115,0.2),transparent_28%),linear-gradient(180deg,#fffdf9_0%,#f4ebde_100%)] px-4 text-[#2b2116]">
      <div className="w-full max-w-xl rounded-[32px] border border-[#decdb0] bg-white/90 p-8 shadow-[0_24px_80px_rgba(113,83,48,0.14)] backdrop-blur">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-[#9c7a49]">Client Membership</p>
        <h1 className="mb-2 text-4xl font-bold text-[#8a6a3c]">Inscription client</h1>
        <p className="mb-6 text-sm text-[#6f5d47]">Creez votre compte et accedez a votre espace client.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <input
                name="full_name"
                placeholder="Nom complet"
                value={form.full_name}
                onChange={handleChange}
                className="w-full rounded-2xl border border-[#ddceb6] bg-[#fffaf2] px-4 py-3 text-[#2b2116] outline-none transition focus:border-[#b78e56] focus:bg-white"
              />
              {fieldErrors.full_name ? <p className="mt-1 text-sm text-red-500">{fieldErrors.full_name}</p> : null}
            </div>
            <div>
              <input
                name="phone"
                placeholder="Telephone"
                value={form.phone}
                onChange={handleChange}
                className="w-full rounded-2xl border border-[#ddceb6] bg-[#fffaf2] px-4 py-3 text-[#2b2116] outline-none transition focus:border-[#b78e56] focus:bg-white"
              />
              {fieldErrors.phone ? <p className="mt-1 text-sm text-red-500">{fieldErrors.phone}</p> : null}
            </div>
          </div>

          <div>
            <input
              name="email"
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              className="w-full rounded-2xl border border-[#ddceb6] bg-[#fffaf2] px-4 py-3 text-[#2b2116] outline-none transition focus:border-[#b78e56] focus:bg-white"
            />
            {fieldErrors.email ? <p className="mt-1 text-sm text-red-500">{fieldErrors.email}</p> : null}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <input
                name="password"
                type="password"
                placeholder="Mot de passe"
                value={form.password}
                onChange={handleChange}
                className="w-full rounded-2xl border border-[#ddceb6] bg-[#fffaf2] px-4 py-3 text-[#2b2116] outline-none transition focus:border-[#b78e56] focus:bg-white"
              />
              {fieldErrors.password ? <p className="mt-1 text-sm text-red-500">{fieldErrors.password}</p> : null}
            </div>
            <div>
              <input
                name="password_confirmation"
                type="password"
                placeholder="Confirmer le mot de passe"
                value={form.password_confirmation}
                onChange={handleChange}
                className="w-full rounded-2xl border border-[#ddceb6] bg-[#fffaf2] px-4 py-3 text-[#2b2116] outline-none transition focus:border-[#b78e56] focus:bg-white"
              />
              {fieldErrors.password_confirmation ? <p className="mt-1 text-sm text-red-500">{fieldErrors.password_confirmation}</p> : null}
            </div>
          </div>

          {error ? <p className="text-sm text-red-500">{error}</p> : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-[#8a6a3c] px-4 py-3 font-semibold text-[#fffaf2] transition hover:bg-[#755732]"
          >
            {loading ? "Creation du compte..." : "S'inscrire"}
          </button>

          <p className="text-center text-sm text-[#6f5d47]">
            Vous avez deja un compte ?{" "}
            <Link to="/login" className="font-medium text-[#8a6a3c] hover:text-[#6f522e]">
              Se connecter
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
