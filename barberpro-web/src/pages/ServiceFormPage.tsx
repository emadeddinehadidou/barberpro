import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../api/axios";
import type { Service } from "../types";

const salonId = 1;

const emptyForm = {
  salon_id: salonId,
  name: "",
  description: "",
  category: "haircut",
  duration_minutes: 30,
  price: 0,
  is_active: true,
};

export default function ServiceFormPage() {
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
      .get<Service>(`/services/${id}`)
      .then((res) => {
        const service = res.data;
        setForm({
          salon_id: service.salon_id,
          name: service.name,
          description: service.description || "",
          category: service.category,
          duration_minutes: service.duration_minutes,
          price: Number(service.price),
          is_active: service.is_active,
        });
      })
      .catch(() => setError("Échec du chargement du service."))
      .finally(() => setPageLoading(false));
  }, [id, isEdit]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : name === "duration_minutes" || name === "price" || name === "salon_id"
          ? Number(value)
          : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isEdit) {
        await api.put(`/services/${id}`, form);
      } else {
        await api.post("/services", form);
      }

      navigate("/services");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Échec de l’enregistrement du service.");
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return <div className="text-white">Chargement du service…</div>;
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{isEdit ? "Modifier le service" : "Créer un service"}</h1>
        <p className="mt-2 text-white/60">Gérer les services du salon de coiffure</p>
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

        <div>
          <label className="mb-2 block text-sm">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            className="min-h-[120px] w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 outline-none"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="mb-2 block text-sm">Categorie</label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 outline-none"
            >
              <option value="haircut">Coupe de cheveux</option>
              <option value="beard">Barbe</option>
              <option value="combo">Combo</option>
              <option value="care">Soin</option>
              <option value="vip">VIP</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm">Durée (min)</label>
            <input
              name="duration_minutes"
              type="number"
              min={5}
              value={form.duration_minutes}
              onChange={handleChange}
              className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 outline-none"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm">Prix</label>
            <input
              name="price"
              type="number"
              min={0}
              step="0.01"
              value={form.price}
              onChange={handleChange}
              className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 outline-none"
              required
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
          <span>Service actif</span>
        </label>

        {error ? <p className="text-red-400">{error}</p> : null}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-[#c8a96b] px-5 py-3 font-semibold text-black"
          >
            {loading ? "Enregistrement…" : isEdit ? "Modifier le service" : "Créer un service"}
          </button>

          <button
            type="button"
            onClick={() => navigate("/services")}
            className="rounded-xl border border-white/10 bg-white/5 px-5 py-3"
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
}