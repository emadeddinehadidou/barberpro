import { useEffect, useState } from "react";
import { api } from "../api/axios";
import ServiceModal from "../components/ui/ServiceModal";
import { DEFAULT_SALON_ID } from "../constants/app";
import type { Service } from "../types";

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [modalLoading, setModalLoading] = useState(false);

  const loadServices = () => {
    setLoading(true);

    api
      .get<Service[]>(`/services?salon_id=${DEFAULT_SALON_ID}`)
      .then((res) => setServices(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadServices();
  }, []);

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this service?")) {
      return;
    }

    try {
      await api.delete(`/services/${id}`);
      setServices((prev) => prev.filter((service) => service.id !== id));
    } catch (error: any) {
      alert(error?.response?.data?.message || "Failed to delete service.");
    }
  };

  const handleModalSubmit = async (data: Record<string, unknown>) => {
    setModalLoading(true);

    try {
      const response = selectedService
        ? await api.put<Service>(`/services/${selectedService.id}`, data)
        : await api.post<Service>("/services", data);
      const savedService = response.data;

      setServices((prev) => {
        if (selectedService) {
          return prev.map((service) =>
            service.id === savedService.id ? savedService : service
          );
        }

        return [savedService, ...prev];
      });

      setModalOpen(false);
      setSelectedService(null);
    } catch (error: any) {
      console.error("Failed to save service:", error);
      alert(error?.response?.data?.message || "Failed to save service.");
    } finally {
      setModalLoading(false);
    }
  };

  const filteredServices = services.filter((service) => {
    const query = search.toLowerCase();

    return (
      service.name.toLowerCase().includes(query) ||
      service.category.toLowerCase().includes(query) ||
      (service.description || "").toLowerCase().includes(query)
    );
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Services</h1>
          <p className="mt-2 text-white/60">Gerer tous les services du salon.</p>
        </div>

        <button
          onClick={() => {
            setSelectedService(null);
            setModalOpen(true);
          }}
          className="rounded-xl bg-[#c8a96b] px-4 py-3 font-semibold text-black"
        >
          Nouveau service
        </button>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Rechercher des services..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/35 outline-none transition focus:border-[#c8a96b]/50"
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
        <table className="w-full text-left">
          <thead className="bg-white/10 text-sm text-white/70">
            <tr>
              <th className="px-4 py-3">Nom</th>
              <th className="px-4 py-3">Categorie</th>
              <th className="px-4 py-3">Duree</th>
              <th className="px-4 py-3">Prix</th>
              <th className="px-4 py-3">Statut</th>
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
            ) : filteredServices.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-white/60">
                  Aucun service trouve.
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
                  <td className="px-4 py-3">{service.is_active ? "Active" : "Inactive"}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedService(service);
                          setModalOpen(true);
                        }}
                        className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm"
                      >
                        Modifier
                      </button>
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

      <ServiceModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedService(null);
        }}
        service={selectedService}
        onSubmit={handleModalSubmit}
        loading={modalLoading}
      />
    </div>
  );
}
