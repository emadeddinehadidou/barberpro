import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { api } from "../api/axios";
import ServiceForm from "../components/ui/ServiceForm";
import type { Service } from "../types";

interface ServiceLocationState {
  service?: Service;
}

export default function ServiceFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isEdit = Boolean(id);
  const preloadedService = (location.state as ServiceLocationState | null)?.service ?? null;

  const [service, setService] = useState<Service | null>(preloadedService);
  const [pageLoading, setPageLoading] = useState(isEdit && !preloadedService);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isEdit) {
      setService(null);
      setPageLoading(false);
      return;
    }

    if (preloadedService && String(preloadedService.id) === id) {
      setService(preloadedService);
      setPageLoading(false);
      return;
    }

    setPageLoading(true);

    api
      .get<Service>(`/services/${id}`)
      .then((res) => {
        setService(res.data);
        setError("");
      })
      .catch(() => setError("Impossible de charger le service."))
      .finally(() => setPageLoading(false));
  }, [id, isEdit, preloadedService]);

  const handleSubmit = async (data: Record<string, unknown>) => {
    setLoading(true);
    setError("");

    try {
      if (isEdit) {
        await api.put(`/services/${id}`, data);
      } else {
        await api.post("/services", data);
      }

      navigate("/services");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Impossible d'enregistrer le service.");
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return <div className="text-white">Chargement du service...</div>;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">
          {isEdit ? "Modifier le service" : "Creer un service"}
        </h1>
        <p className="mt-2 text-white/60">
          {isEdit
            ? "Les champs sont pre-remplis avec les donnees actuelles."
            : "Ajoutez un nouveau service au catalogue."}
        </p>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <ServiceForm
          service={service}
          onSubmit={handleSubmit}
          onCancel={() => navigate("/services")}
          loading={loading}
        />
        {error ? <p className="mt-4 text-sm text-red-400">{error}</p> : null}
      </div>
    </div>
  );
}
