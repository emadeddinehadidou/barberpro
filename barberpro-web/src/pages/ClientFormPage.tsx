import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../api/axios";
import type { Client } from "../types";

const salonId = 1;

const emptyForm = {
  salon_id: salonId,
  full_name: "",
  phone: "",
  email: "",
  birth_date: "",
  preferred_barber_id: "",
  preferred_style: "",
  notes: "",
  avatar: null as File | null,
};

export default function ClientFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState(emptyForm);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(isEdit);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isEdit) return;

    api
      .get<Client>(`/clients/${id}`)
      .then((res) => {
        const client = res.data;

        setForm((prev) => ({
          ...prev,
          salon_id: client.salon_id,
          full_name: client.full_name || "",
          phone: client.phone || "",
          email: client.email || "",
          birth_date: client.birth_date || "",
          preferred_barber_id: client.preferred_barber_id
            ? String(client.preferred_barber_id)
            : "",
          preferred_style: client.preferred_style || "",
          notes: client.notes || "",
        }));

        if (client.avatar) {
          setPreview(`http://localhost:8000/storage/${client.avatar}`);
        }
      })
      .catch(() => setError("Failed to load client."))
      .finally(() => setPageLoading(false));
  }, [id, isEdit]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type, files } = e.target as HTMLInputElement;

    if (type === "file" && files?.[0]) {
      setForm((prev) => ({ ...prev, avatar: files[0] }));
      setPreview(URL.createObjectURL(files[0]));
      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: name === "salon_id" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("salon_id", String(form.salon_id));
    formData.append("full_name", form.full_name);
    formData.append("phone", form.phone);
    formData.append("email", form.email);
    formData.append("birth_date", form.birth_date);
    formData.append("preferred_style", form.preferred_style);
    formData.append("notes", form.notes);

    if (form.preferred_barber_id) {
      formData.append("preferred_barber_id", form.preferred_barber_id);
    }

    if (form.avatar) {
      formData.append("avatar", form.avatar);
    }

    try {
      if (isEdit) {
        formData.append("_method", "PUT");
        await api.post(`/clients/${id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await api.post("/clients", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      navigate("/clients");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Échec de l’enregistrement du client.");
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return <div className="text-white">Chargement du client…</div>;
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          {isEdit ? "Edit Client" : "Create Client"}
        </h1>
        <p className="mt-2 text-white/60">Gérer les clients du salon de coiffure</p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-3xl border border-white/10 bg-white/5 p-6"
      >
        <div>
          <label className="mb-2 block text-sm">Avatar</label>
          <input
            name="avatar"
            type="file"
            accept="image/*"
            onChange={handleChange}
            className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 outline-none"
          />
          {preview ? (
            <img
              src={preview}
              alt="Preview"
              className="mt-4 h-24 w-24 rounded-full object-cover border border-white/10"
            />
          ) : null}
        </div>

        <div>
          <label className="mb-2 block text-sm">Nom complet</label>
          <input
            name="full_name"
            value={form.full_name}
            onChange={handleChange}
            className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 outline-none"
            required
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm">Téléphone</label>
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 outline-none"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm">Email</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 outline-none"
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm">Date de naissance</label>
          <input
            name="birth_date"
            type="date"
            value={form.birth_date}
            onChange={handleChange}
            className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 outline-none"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm">Style préféré</label>
          <input
            name="preferred_style"
            value={form.preferred_style}
            onChange={handleChange}
            placeholder="Ex: Skin Fade"
            className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 outline-none"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm">Notes</label>
          <textarea
            name="notes"
            value={form.notes}
            onChange={handleChange}
            className="min-h-[120px] w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 outline-none"
            placeholder="Client preferences, habits, details..."
          />
        </div>

        {error ? <p className="text-red-400">{error}</p> : null}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-[#c8a96b] px-5 py-3 font-semibold text-black"
          >
            {loading ? "Enregistrement…" : isEdit ? "Mettre à jour le client" : "Créer un client"}
          </button>

          <button
            type="button"
            onClick={() => navigate("/clients")}
            className="rounded-xl border border-white/10 bg-white/5 px-5 py-3"
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
}