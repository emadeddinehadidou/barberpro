import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/axios";
import type { User } from "../types";

export default function BarbersPage() {
  const [barbers, setBarbers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

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
    const ok = window.confirm("Supprimer ce barbier ?");
    if (!ok) return;

    try {
      await api.delete(`/barbers/${id}`);
      loadBarbers();
    } catch {
      alert("Échec de la suppression du barbier.");
    }
  };

  const filteredBarbers = barbers.filter((barber) => {
    const q = search.toLowerCase();

    return (
      barber.name.toLowerCase().includes(q) ||
      (barber.email || "").toLowerCase().includes(q) ||
      (barber.phone || "").toLowerCase().includes(q)
    );
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Barbiers</h1>
          <p className="mt-2 text-white/60">Gérer les barbiers du salon</p>
        </div>

        <Link
          to="/barbers/create"
          className="rounded-xl bg-[#c8a96b] px-4 py-3 font-semibold text-black"
        >
          Nouveau Barbiers
        </Link>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Rechercher des barbiers…"
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
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Téléphone</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-white/60">
                  Chargement…
                </td>
              </tr>
            ) : filteredBarbers.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-white/60">
                  Aucun barbier trouvé.
                </td>
              </tr>
            ) : (
              filteredBarbers.map((barber) => (
                <tr key={barber.id} className="border-t border-white/10">
                  <td className="px-4 py-3">{barber.name}</td>
                  <td className="px-4 py-3">{barber.email}</td>
                  <td className="px-4 py-3">{barber.phone || "—"}</td>
                  <td className="px-4 py-3">
                    {barber.is_active ? "Active" : "Inactive"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Link
                        to={`/barbers/${barber.id}/edit`}
                        className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm"
                      >
                        Modifier
                      </Link>

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
    </div>
  );
}