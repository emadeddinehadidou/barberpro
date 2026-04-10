import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/axios";
import ClientForm from "../components/ui/ClientForm";
import type { ClientFormData } from "../types";
import { buildClientFormData } from "../utils/clientForm";

export default function ClientFormPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (data: ClientFormData) => {
    setLoading(true);
    setError("");

    try {
      await api.post("/clients", buildClientFormData(data), {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });

      navigate("/clients");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Impossible de creer le client.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Creer un client</h1>
        <p className="mt-2 text-white/60">
          Le meme formulaire est reutilise partout pour garder les donnees synchronisees.
        </p>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <ClientForm onSubmit={handleSubmit} onCancel={() => navigate("/clients")} loading={loading} />
        {error ? <p className="mt-4 text-sm text-red-400">{error}</p> : null}
      </div>
    </div>
  );
}
