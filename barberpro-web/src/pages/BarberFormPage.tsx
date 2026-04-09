import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../api/axios";
import type { User } from "../types";

const emptyForm = {
  name: "",
  email: "",
  phone: "",
  password: "",
  password_confirmation: "",
  is_active: true,
};

export default function BarberFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(isEdit);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isEdit) return;

    api
      .get<User>(`/barbers/${id}`)
      .then((res) => {
        const barber = res.data;

        setForm({
          name: barber.name || "",
          email: barber.email || "",
          phone: barber.phone || "",
          password: "",
          password_confirmation: "",
          is_active: barber.is_active,
        });
      })
      .catch(() => setError("Échec du chargement du barbier."))
      .finally(() => setPageLoading(false));
  }, [id, isEdit]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const payload = {
      name: form.name,
      email: form.email,
      phone: form.phone || null,
      password: form.password || undefined,
      password_confirmation: form.password_confirmation || undefined,
      is_active: form.is_active,
    };

    try {
      if (isEdit) {
        await api.put(`/barbers/${id}`, payload);
      } else {
        await api.post("/barbers", payload);
      }

      navigate("/barbers");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Échec de l’enregistrement du barbier.");
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return <div className="text-white">Chargement du barbier…</div>;
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          {isEdit ? "Modifier le barbier" : "Créer un barbier"}
        </h1>
        <p className="mt-2 text-white/60">Gérer les barbiers du salon</p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-3xl border border-white/10 bg-white/5 p-6"
      >
        <div>
          <label className="mb-2 block text-sm">Nom</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 outline-none"
            required
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm">Email</label>
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
            <label className="mb-2 block text-sm">Téléphone</label>
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 outline-none"
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm">
              Mot de passe {isEdit ? "(leave empty to keep current one)" : ""}
            </label>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 outline-none"
              required={!isEdit}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm">Confirmer le Mot de passe</label>
            <input
              name="password_confirmation"
              type="password"
              value={form.password_confirmation}
              onChange={handleChange}
              className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 outline-none"
              required={!isEdit}
            />
          </div>
        </div>

        <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/20 px-4 py-3">
          <input
            name="is_active"
            type="checkbox"
            checked={form.is_active}
            onChange={handleChange}
          />
          <span>Barbier actif</span>
        </label>

        {error ? <p className="text-red-400">{error}</p> : null}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-[#c8a96b] px-5 py-3 font-semibold text-black"
          >
            {loading ? "Enregistrement…" : isEdit ? "Mettre à jour le barbier" : "Créer un barbier"}
          </button>

          <button
            type="button"
            onClick={() => navigate("/barbers")}
            className="rounded-xl border border-white/10 bg-white/5 px-5 py-3"
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
}