import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/axios";
import type { Client } from "../types";

const salonId = 1;

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const loadClients = () => {
    setLoading(true);

    api
      .get<Client[]>(`/clients?salon_id=${salonId}`)
      .then((res) => setClients(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadClients();
  }, []);

  const handleDelete = async (id: number) => {
    const ok = window.confirm("Supprimer ce client ?");
    if (!ok) return;

    try {
      await api.delete(`/clients/${id}`);
      loadClients();
    } catch {
      alert("Échec de la suppression du client.");
    }
  };

  const filteredClients = clients.filter((client) => {
    const q = search.toLowerCase();

    return (
      client.full_name.toLowerCase().includes(q) ||
      client.phone.toLowerCase().includes(q) ||
      (client.email || "").toLowerCase().includes(q) ||
      (client.preferred_style || "").toLowerCase().includes(q)
    );
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Clients</h1>
          <p className="mt-2 text-white/60">Gérer les clients du salon de coiffure</p>
        </div>

        <Link
          to="/clients/create"
          className="rounded-xl bg-[#c8a96b] px-4 py-3 font-semibold text-black"
        >
          Nouveau client
        </Link>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Rechercher des clients…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-2xl border border-white/10 bg-gradient-to-r from-white/5 to-white/[0.03] px-4 py-3 text-white placeholder:text-white/35 outline-none transition focus:border-[#c8a96b]/50"
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
        <table className="w-full text-left">
          <thead className="bg-white/10 text-sm text-white/70">
            <tr>
              <th className="px-4 py-3">Nom</th>
              <th className="px-4 py-3">Téléphone</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Style préféré</th>
              <th className="px-4 py-3">Points</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-white/60">
                  Chargement…
                </td>
              </tr>
            ) : filteredClients.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-white/60">
                  Aucun client trouvé.
                </td>
              </tr>
            ) : (
              filteredClients.map((client) => (
                <tr key={client.id} className="border-t border-white/10">
                  <td className="px-4 py-3">{client.full_name}</td>
                  <td className="px-4 py-3">{client.phone}</td>
                  <td className="px-4 py-3">{client.email || "—"}</td>
                  <td className="px-4 py-3">{client.preferred_style || "—"}</td>
                  <td className="px-4 py-3">{client.loyalty_points}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Link
                        to={`/clients/${client.id}/edit`}
                        className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm"
                      >
                        Modifier
                      </Link>

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
    </div>
  );
}