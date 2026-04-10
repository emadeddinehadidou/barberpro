import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import type { Service } from "../../types";

interface ServiceFormProps {
  service?: Service | null;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  loading: boolean;
}

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

export default function ServiceForm({ service, onSubmit, onCancel, loading }: ServiceFormProps) {
  const [form, setForm] = useState(emptyForm);
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});

  useEffect(() => {
    if (service) {
      setForm({
        salon_id: service.salon_id,
        name: service.name,
        description: service.description || "",
        category: service.category,
        duration_minutes: service.duration_minutes,
        price: Number(service.price),
        is_active: service.is_active,
      });
    } else {
      setForm(emptyForm);
    }
    setValidationErrors({});
  }, [service]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
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

    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: [] }));
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string[]> = {};

    if (!form.name.trim()) {
      errors.name = ["Le nom est requis"];
    }

    if (form.duration_minutes < 5) {
      errors.duration_minutes = ["La durée doit être d'au moins 5 minutes"];
    }

    if (form.price < 0) {
      errors.price = ["Le prix ne peut pas être négatif"];
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-white">Nom *</label>
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          className="mt-1 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/35 outline-none transition focus:border-[#c8a96b]/50"
          placeholder="Entrez le nom du service"
        />
        {validationErrors.name && (
          <p className="mt-1 text-sm text-red-400">{validationErrors.name[0]}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-white">Description</label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          rows={3}
          className="mt-1 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/35 outline-none transition focus:border-[#c8a96b]/50"
          placeholder="Description du service"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div>
          <label className="block text-sm font-medium text-white">Catégorie</label>
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            className="mt-1 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-[#c8a96b]/50"
          >
            <option value="haircut">Coupe de cheveux</option>
            <option value="beard">Barbe</option>
            <option value="combo">Combo</option>
            <option value="care">Soin</option>
            <option value="vip">VIP</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-white">Durée (min) *</label>
          <input
            name="duration_minutes"
            type="number"
            min={5}
            value={form.duration_minutes}
            onChange={handleChange}
            className="mt-1 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-[#c8a96b]/50"
          />
          {validationErrors.duration_minutes && (
            <p className="mt-1 text-sm text-red-400">{validationErrors.duration_minutes[0]}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-white">Prix *</label>
          <input
            name="price"
            type="number"
            min={0}
            step="0.01"
            value={form.price}
            onChange={handleChange}
            className="mt-1 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-[#c8a96b]/50"
          />
          {validationErrors.price && (
            <p className="mt-1 text-sm text-red-400">{validationErrors.price[0]}</p>
          )}
        </div>
      </div>

      <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
        <input
          name="is_active"
          type="checkbox"
          checked={form.is_active}
          onChange={handleChange}
        />
        <span className="text-white">Service actif</span>
      </label>

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 rounded-2xl bg-[#c8a96b] px-4 py-3 font-semibold text-black transition hover:bg-[#b8955a] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Sauvegarde…" : service ? "Mettre à jour" : "Créer"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 font-semibold text-white transition hover:bg-white/10"
        >
          Annuler
        </button>
      </div>
    </form>
  );
}