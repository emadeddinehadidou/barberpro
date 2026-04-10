import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import type { User } from "../../types";

interface BarberFormProps {
  barber?: User | null;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  loading: boolean;
}

const emptyForm = {
  name: "",
  email: "",
  phone: "",
  password: "",
  password_confirmation: "",
  is_active: true,
};

export default function BarberForm({ barber, onSubmit, onCancel, loading }: BarberFormProps) {
  const [form, setForm] = useState(emptyForm);
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});

  useEffect(() => {
    if (barber) {
      setForm({
        name: barber.name || "",
        email: barber.email || "",
        phone: barber.phone || "",
        password: "",
        password_confirmation: "",
        is_active: barber.is_active,
      });
    } else {
      setForm(emptyForm);
    }
    setValidationErrors({});
  }, [barber]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
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

    if (!form.email.trim()) {
      errors.email = ["L'email est requis"];
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errors.email = ["L'email n'est pas valide"];
    }

    if (!barber && !form.password) {
      errors.password = ["Le mot de passe est requis"];
    }

    if (!barber && form.password !== form.password_confirmation) {
      errors.password_confirmation = ["Les mots de passe ne correspondent pas"];
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const payload = {
      name: form.name,
      email: form.email,
      phone: form.phone || null,
      password: form.password || undefined,
      password_confirmation: form.password_confirmation || undefined,
      is_active: form.is_active,
    };

    onSubmit(payload);
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
          placeholder="Entrez le nom du barbier"
        />
        {validationErrors.name && (
          <p className="mt-1 text-sm text-red-400">{validationErrors.name[0]}</p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-white">Email *</label>
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            className="mt-1 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/35 outline-none transition focus:border-[#c8a96b]/50"
            placeholder="Entrez l'email"
          />
          {validationErrors.email && (
            <p className="mt-1 text-sm text-red-400">{validationErrors.email[0]}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-white">Téléphone</label>
          <input
            name="phone"
            value={form.phone}
            onChange={handleChange}
            className="mt-1 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/35 outline-none transition focus:border-[#c8a96b]/50"
            placeholder="Entrez le numéro de téléphone"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-white">
            Mot de passe {barber ? "(laisser vide pour garder l'actuel)" : "*"}
          </label>
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            className="mt-1 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/35 outline-none transition focus:border-[#c8a96b]/50"
            placeholder="Entrez le mot de passe"
            required={!barber}
          />
          {validationErrors.password && (
            <p className="mt-1 text-sm text-red-400">{validationErrors.password[0]}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-white">
            Confirmer le mot de passe {barber ? "" : "*"}
          </label>
          <input
            name="password_confirmation"
            type="password"
            value={form.password_confirmation}
            onChange={handleChange}
            className="mt-1 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/35 outline-none transition focus:border-[#c8a96b]/50"
            placeholder="Confirmez le mot de passe"
            required={!barber}
          />
          {validationErrors.password_confirmation && (
            <p className="mt-1 text-sm text-red-400">{validationErrors.password_confirmation[0]}</p>
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
        <span className="text-white">Barbier actif</span>
      </label>

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 rounded-2xl bg-[#c8a96b] px-4 py-3 font-semibold text-black transition hover:bg-[#b8955a] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Sauvegarde…" : barber ? "Mettre à jour" : "Créer"}
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