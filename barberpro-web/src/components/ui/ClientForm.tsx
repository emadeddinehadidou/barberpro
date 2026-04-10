import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { api } from "../../api/axios";
import type { Client, ClientFormData, User } from "../../types";
import {
  createEmptyClientForm,
  mapClientToForm,
} from "../../utils/clientForm";

interface ClientFormProps {
  client?: Client | null;
  onSubmit: (data: ClientFormData) => void;
  onCancel: () => void;
  loading: boolean;
}

export default function ClientForm({
  client,
  onSubmit,
  onCancel,
  loading,
}: ClientFormProps) {
  const [form, setForm] = useState<ClientFormData>(() => createEmptyClientForm());
  const [preview, setPreview] = useState("");
  const [barbers, setBarbers] = useState<User[]>([]);
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});

  useEffect(() => {
    api
      .get<User[]>("/barbers")
      .then((res) => setBarbers(res.data))
      .catch(() => setBarbers([]));
  }, []);

  useEffect(() => {
    if (client) {
      const nextForm = mapClientToForm(client);
      setForm(nextForm);
      setPreview(nextForm.avatar_url || "");
    } else {
      setForm(createEmptyClientForm());
      setPreview("");
    }

    setValidationErrors({});
  }, [client]);

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type, files } = event.target as HTMLInputElement;

    if (type === "file" && files?.[0]) {
      setForm((prev) => ({ ...prev, avatar: files[0] }));
      setPreview(URL.createObjectURL(files[0]));
      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: name === "salon_id" ? Number(value) : value,
    }));

    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: [] }));
    }
  };

  const validateForm = () => {
    const errors: Record<string, string[]> = {};

    if (!form.full_name.trim()) {
      errors.full_name = ["Le nom complet est requis"];
    }

    if (!form.phone.trim()) {
      errors.phone = ["Le telephone est requis"];
    }

    if (!form.email.trim()) {
      errors.email = ["L'email est requis"];
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errors.email = ["L'email n'est pas valide"];
    }

    if (!client) {
      if (!form.password) {
        errors.password = ["Le mot de passe est requis"];
      } else if (form.password.length < 6) {
        errors.password = ["Le mot de passe doit contenir au moins 6 caracteres"];
      }
    } else if (form.password && form.password.length < 6) {
      errors.password = ["Le mot de passe doit contenir au moins 6 caracteres"];
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-white">Nom complet *</label>
          <input
            type="text"
            name="full_name"
            value={form.full_name}
            onChange={handleChange}
            className="mt-1 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/35 outline-none transition focus:border-[#c8a96b]/50"
            placeholder="Entrez le nom complet"
          />
          {validationErrors.full_name && (
            <p className="mt-1 text-sm text-red-400">{validationErrors.full_name[0]}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-white">Telephone *</label>
          <input
            type="tel"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            className="mt-1 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/35 outline-none transition focus:border-[#c8a96b]/50"
            placeholder="Entrez le numero de telephone"
          />
          {validationErrors.phone && (
            <p className="mt-1 text-sm text-red-400">{validationErrors.phone[0]}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-white">Email *</label>
          <input
            type="email"
            name="email"
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
          <label className="block text-sm font-medium text-white">
            {client ? "Mot de passe (laisser vide pour conserver l'actuel)" : "Mot de passe *"}
          </label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            className="mt-1 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/35 outline-none transition focus:border-[#c8a96b]/50"
            placeholder="Entrez le mot de passe"
          />
          {validationErrors.password && (
            <p className="mt-1 text-sm text-red-400">{validationErrors.password[0]}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-white">Date de naissance</label>
          <input
            type="date"
            name="birth_date"
            value={form.birth_date}
            onChange={handleChange}
            className="mt-1 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-[#c8a96b]/50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white">Style prefere</label>
          <input
            type="text"
            name="preferred_style"
            value={form.preferred_style}
            onChange={handleChange}
            className="mt-1 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/35 outline-none transition focus:border-[#c8a96b]/50"
            placeholder="Entrez le style prefere"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white">Coiffeur prefere</label>
          <select
            name="preferred_barber_id"
            value={form.preferred_barber_id}
            onChange={handleChange}
            className="mt-1 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-[#c8a96b]/50"
          >
            <option value="">Selectionnez un coiffeur</option>
            {barbers.map((barber) => (
              <option key={barber.id} value={barber.id}>
                {barber.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-white">Notes</label>
        <textarea
          name="notes"
          value={form.notes}
          onChange={handleChange}
          rows={3}
          className="mt-1 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/35 outline-none transition focus:border-[#c8a96b]/50"
          placeholder="Notes supplementaires"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-white">Avatar</label>
        <input
          type="file"
          name="avatar"
          accept="image/*"
          onChange={handleChange}
          className="mt-1 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white file:mr-4 file:rounded-xl file:border-0 file:bg-[#c8a96b] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-black"
        />
        {preview && (
          <img
            src={preview}
            alt="Preview"
            className="mt-2 h-20 w-20 rounded-full object-cover"
          />
        )}
      </div>

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 rounded-2xl bg-[#c8a96b] px-4 py-3 font-semibold text-black transition hover:bg-[#b8955a] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Sauvegarde..." : client ? "Mettre a jour" : "Creer"}
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
