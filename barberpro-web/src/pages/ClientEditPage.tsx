import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { api } from "../api/axios";
import ClientForm from "../components/ui/ClientForm";
import type { Client, ClientFormData } from "../types";
import { buildClientFormData } from "../utils/clientForm";

interface ClientLocationState {
  client?: Client;
}

export default function ClientEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const preloadedClient = (location.state as ClientLocationState | null)?.client ?? null;

  const [client, setClient] = useState<Client | null>(preloadedClient);
  const [pageLoading, setPageLoading] = useState(!preloadedClient);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) {
      setPageLoading(false);
      return;
    }

    if (preloadedClient && String(preloadedClient.id) === id) {
      setClient(preloadedClient);
      setPageLoading(false);
      return;
    }

    setPageLoading(true);

    api
      .get<Client>(`/clients/${id}`)
      .then((res) => {
        setClient(res.data);
        setError("");
      })
      .catch(() => setError("Impossible de charger le client."))
      .finally(() => setPageLoading(false));
  }, [id, preloadedClient]);

  const handleSubmit = async (data: ClientFormData) => {
    setLoading(true);
    setError("");

    try {
      await api.post(`/clients/${id}`, buildClientFormData(data, "PUT"), {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });

      navigate("/clients");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Impossible de mettre a jour le client.");
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return <div className="text-white">Chargement du client...</div>;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Modifier le client</h1>
        <p className="mt-2 text-white/60">
          Les champs sont charges automatiquement a partir de l'element selectionne.
        </p>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <ClientForm
          client={client}
          onSubmit={handleSubmit}
          onCancel={() => navigate("/clients")}
          loading={loading}
        />
        {error ? <p className="mt-4 text-sm text-red-400">{error}</p> : null}
      </div>
    </div>
  );
}
