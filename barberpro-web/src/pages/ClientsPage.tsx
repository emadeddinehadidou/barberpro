import { useEffect, useState } from "react";
import { api } from "../api/axios";
import ClientModal from "../components/ui/ClientModal";
import { DEFAULT_SALON_ID } from "../constants/app";
import type { Client, ClientFormData } from "../types";
import { buildClientFormData } from "../utils/clientForm";

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [modalLoading, setModalLoading] = useState(false);

  const loadClients = () => {
    setLoading(true);

    api
      .get<Client[]>(`/clients?salon_id=${DEFAULT_SALON_ID}`)
      .then((res) => setClients(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadClients();
  }, []);

  const handleDelete = async (id: number) => {
    if (!window.confirm("Supprimer ce client ?")) {
      return;
    }

    try {
      await api.delete(`/clients/${id}`);
      setClients((prev) => prev.filter((client) => client.id !== id));
    } catch (error: any) {
      alert(error?.response?.data?.message || "Impossible de supprimer le client.");
    }
  };

  const handleModalSubmit = async (data: ClientFormData) => {
    setModalLoading(true);

    try {
      const payload = selectedClient
        ? buildClientFormData(data, "PUT")
        : buildClientFormData(data);

      const response = selectedClient
        ? await api.post<Client>(`/clients/${selectedClient.id}`, payload, {
            headers: { "Content-Type": "multipart/form-data" },
            withCredentials: true,
          })
        : await api.post<Client>("/clients", payload, {
            headers: { "Content-Type": "multipart/form-data" },
            withCredentials: true,
          });

      const savedClient = response.data;

      setClients((prev) => {
        if (selectedClient) {
          return prev.map((client) =>
            client.id === savedClient.id ? savedClient : client
          );
        }

        return [savedClient, ...prev];
      });

      setModalOpen(false);
      setSelectedClient(null);
    } catch (error: any) {
      console.error("Failed to save client:", error);
      alert(error?.response?.data?.message || "Impossible de sauvegarder le client.");
    } finally {
      setModalLoading(false);
    }
  };

  const filteredClients = clients.filter((client) => {
    const query = search.toLowerCase();

    return (
      client.full_name.toLowerCase().includes(query) ||
      client.phone.toLowerCase().includes(query) ||
      (client.email || "").toLowerCase().includes(query) ||
      (client.preferred_style || "").toLowerCase().includes(query)
    );
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Clients</h1>
          <p className="mt-2 text-white/60">Gerer les clients du salon.</p>
        </div>

        <button
          onClick={() => {
            setSelectedClient(null);
            setModalOpen(true);
          }}
          className="rounded-xl bg-[#c8a96b] px-4 py-3 font-semibold text-black"
        >
          Nouveau client
        </button>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Rechercher des clients..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="w-full rounded-2xl border border-white/10 bg-gradient-to-r from-white/5 to-white/[0.03] px-4 py-3 text-white placeholder:text-white/35 outline-none transition focus:border-[#c8a96b]/50"
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
        <table className="w-full text-left">
          <thead className="bg-white/10 text-sm text-white/70">
            <tr>
              <th className="px-4 py-3">Nom</th>
              <th className="px-4 py-3">Telephone</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Style prefere</th>
              <th className="px-4 py-3">Points</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-white/60">
                  Chargement...
                </td>
              </tr>
            ) : filteredClients.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-white/60">
                  Aucun client trouve.
                </td>
              </tr>
            ) : (
              filteredClients.map((client) => (
                <tr key={client.id} className="border-t border-white/10">
                  <td className="px-4 py-3">{client.full_name}</td>
                  <td className="px-4 py-3">{client.phone}</td>
                  <td className="px-4 py-3">{client.email || "-"}</td>
                  <td className="px-4 py-3">{client.preferred_style || "-"}</td>
                  <td className="px-4 py-3">{client.loyalty_points ?? 0}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedClient(client);
                          setModalOpen(true);
                        }}
                        className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm"
                      >
                        Modifier
                      </button>

                      <button
                        onClick={() => handleDelete(client.id)}
                        className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-300"
                      >
                        Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <ClientModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedClient(null);
        }}
        client={selectedClient}
        onSubmit={handleModalSubmit}
        loading={modalLoading}
      />
    </div>
  );
}
