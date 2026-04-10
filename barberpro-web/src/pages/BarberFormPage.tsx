import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { api } from "../api/axios";
import BarberForm from "../components/ui/BarberForm";
import type { User } from "../types";

interface BarberLocationState {
  barber?: User;
}

export default function BarberFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isEdit = Boolean(id);
  const preloadedBarber = (location.state as BarberLocationState | null)?.barber ?? null;

  const [barber, setBarber] = useState<User | null>(preloadedBarber);
  const [pageLoading, setPageLoading] = useState(isEdit && !preloadedBarber);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isEdit) {
      setBarber(null);
      setPageLoading(false);
      return;
    }

    if (preloadedBarber && String(preloadedBarber.id) === id) {
      setBarber(preloadedBarber);
      setPageLoading(false);
      return;
    }

    setPageLoading(true);

    api
      .get<User>(`/barbers/${id}`)
      .then((res) => {
        setBarber(res.data);
        setError("");
      })
      .catch(() => setError("Impossible de charger le barbier."))
      .finally(() => setPageLoading(false));
  }, [id, isEdit, preloadedBarber]);

  const handleSubmit = async (data: Record<string, unknown>) => {
    setLoading(true);
    setError("");

    try {
      if (isEdit) {
        await api.put(`/barbers/${id}`, data);
      } else {
        await api.post("/barbers", data);
      }

      navigate("/barbers");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Impossible d'enregistrer le barbier.");
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return <div className="text-white">Chargement du barbier...</div>;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">
          {isEdit ? "Modifier le barbier" : "Creer un barbier"}
        </h1>
        <p className="mt-2 text-white/60">
          {isEdit
            ? "Le formulaire reprend automatiquement les donnees selectionnees."
            : "Ajoutez un nouveau barbier au salon."}
        </p>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <BarberForm
          barber={barber}
          onSubmit={handleSubmit}
          onCancel={() => navigate("/barbers")}
          loading={loading}
        />
        {error ? <p className="mt-4 text-sm text-red-400">{error}</p> : null}
      </div>
    </div>
  );
}
