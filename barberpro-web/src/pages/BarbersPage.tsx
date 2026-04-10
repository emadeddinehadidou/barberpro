import { useEffect, useState } from "react";
import { api } from "../api/axios";
import BarberModal from "../components/ui/BarberModal";
import type { User } from "../types";

export default function BarbersPage() {
  const [barbers, setBarbers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedBarber, setSelectedBarber] = useState<User | null>(null);
  const [modalLoading, setModalLoading] = useState(false);

  const loadBarbers = () => {
    setLoading(true);

    api
      .get<User[]>("/barbers")
      .then((res) => setBarbers(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadBarbers();
  }, []);

  const handleDelete = async (id: number) => {
    if (!window.confirm("Supprimer ce barbier ?")) {
      return;
    }

    try {
      await api.delete(`/barbers/${id}`);
      setBarbers((prev) => prev.filter((barber) => barber.id !== id));
    } catch {
      alert("Impossible de supprimer le barbier.");
    }
  };

  const handleModalSubmit = async (data: Record<string, unknown>) => {
    setModalLoading(true);

    try {
      const response = selectedBarber
        ? await api.put<User>(`/barbers/${selectedBarber.id}`, data)
        : await api.post<User>("/barbers", data);
      const savedBarber = response.data;

      setBarbers((prev) => {
        if (selectedBarber) {
          return prev.map((barber) =>
            barber.id === savedBarber.id ? savedBarber : barber
          );
        }

        return [savedBarber, ...prev];
      });

      setModalOpen(false);
      setSelectedBarber(null);
    } catch (error) {
      console.error("Failed to save barber:", error);
      alert("Impossible de sauvegarder le barbier.");
    } finally {
      setModalLoading(false);
    }
  };

  const filteredBarbers = barbers.filter((barber) => {
    const query = search.toLowerCase();

    return (
      barber.name.toLowerCase().includes(query) ||
      (barber.email || "").toLowerCase().includes(query) ||
      (barber.phone || "").toLowerCase().includes(query)
    );
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Barbiers</h1>
          <p className="mt-2 text-white/60">Gerer les barbiers du salon.</p>
        </div>

        <button
          onClick={() => {
            setSelectedBarber(null);
            setModalOpen(true);
          }}
          className="rounded-xl bg-[#c8a96b] px-4 py-3 font-semibold text-black"
        >
          Nouveau barbier
        </button>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Rechercher des barbiers..."
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
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Telephone</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-white/60">
                  Chargement...
                </td>
              </tr>
            ) : filteredBarbers.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-white/60">
                  Aucun barbier trouve.
                </td>
              </tr>
            ) : (
              filteredBarbers.map((barber) => (
                <tr key={barber.id} className="border-t border-white/10">
                  <td className="px-4 py-3">{barber.name}</td>
                  <td className="px-4 py-3">{barber.email}</td>
                  <td className="px-4 py-3">{barber.phone || "-"}</td>
                  <td className="px-4 py-3">{barber.is_active ? "Actif" : "Inactif"}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedBarber(barber);
                          setModalOpen(true);
                        }}
                        className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm"
                      >
                        Modifier
                      </button>

                      <button
                        onClick={() => handleDelete(barber.id)}
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

      <BarberModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedBarber(null);
        }}
        barber={selectedBarber}
        onSubmit={handleModalSubmit}
        loading={modalLoading}
      />
    </div>
  );
}
