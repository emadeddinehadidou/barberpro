import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/axios";
import type { Service } from "../types";

const salonId = 1;

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const loadServices = () => {
    setLoading(true);
    api
      .get<Service[]>(`/services?salon_id=${salonId}`)
      .then((res) => setServices(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadServices();
  }, []);

  const handleDelete = async (id: number) => {
    const ok = window.confirm("Delete this service?");
    if (!ok) return;

    try {
      await api.delete(`/services/${id}`);
      loadServices();
    } catch {
      alert("Failed to delete service.");
    }
  };

  const filteredServices = services.filter((service) => {
    const q = search.toLowerCase();

    return (
      service.name.toLowerCase().includes(q) ||
      service.category.toLowerCase().includes(q) ||
      (service.description || "").toLowerCase().includes(q)
    );
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Services</h1>
          <p className="mt-2 text-white/60">Gérer tous les services du salon de coiffure</p>
        </div>

        <Link
          to="/services/create"
          className="rounded-xl bg-[#c8a96b] px-4 py-3 font-semibold text-black"
        >
         Nouveau service
        </Link>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Rechercher des services…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/35 outline-none transition focus:border-[#c8a96b]/50"
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
        <table className="w-full text-left">
          <thead className="bg-white/10 text-sm text-white/70">
            <tr>
              <th className="px-4 py-3">Nom</th>
              <th className="px-4 py-3">Categorie</th>
              <th className="px-4 py-3">Durée</th>
              <th className="px-4 py-3">Prix</th>
              <th className="px-4 py-3">Statut</th>
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
            ) : filteredServices.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-white/60">
                  Aucun service trouvé.
                </td>
              </tr>
            ) : (
              filteredServices.map((service) => (
                <tr key={service.id} className="border-t border-white/10">
                  <td className="px-4 py-3">{service.name}</td>
                  <td className="px-4 py-3">{service.category}</td>
                  <td className="px-4 py-3">{service.duration_minutes} min</td>
                  <td className="px-4 py-3">
                    {Number(service.price).toLocaleString("fr-FR", {
                      style: "currency",
                      currency: "EUR",
                    })}
                  </td>
                  <td className="px-4 py-3">
                    {service.is_active ? "Active" : "Inactive"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Link
                        to={`/services/${service.id}/edit`}
                        className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm"
                      >
                        Modifier
                      </Link>
                      <button
                        onClick={() => handleDelete(service.id)}
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