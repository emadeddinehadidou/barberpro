import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { api } from "../api/axios";
import AppointmentForm from "../components/ui/AppointmentForm";
import type { Appointment } from "../types";
import {
  buildAppointmentPayload,
  type AppointmentFormData,
} from "../utils/appointmentForm";

interface AppointmentLocationState {
  appointment?: Appointment;
}

export default function AppointmentFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isEdit = Boolean(id);
  const preloadedAppointment =
    (location.state as AppointmentLocationState | null)?.appointment ?? null;

  const [appointment, setAppointment] = useState<Appointment | null>(preloadedAppointment);
  const [pageLoading, setPageLoading] = useState(isEdit && !preloadedAppointment);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isEdit) {
      setAppointment(null);
      setPageLoading(false);
      return;
    }

    if (preloadedAppointment && String(preloadedAppointment.id) === id) {
      setAppointment(preloadedAppointment);
      setPageLoading(false);
      return;
    }

    setPageLoading(true);

    api
      .get<Appointment>(`/appointments/${id}`)
      .then((res) => {
        setAppointment(res.data);
        setError("");
      })
      .catch(() => setError("Impossible de charger le rendez-vous."))
      .finally(() => setPageLoading(false));
  }, [id, isEdit, preloadedAppointment]);

  const handleSubmit = async (data: AppointmentFormData) => {
    setLoading(true);
    setError("");

    try {
      const payload = buildAppointmentPayload(data);

      if (isEdit) {
        await api.put(`/appointments/${id}`, payload);
      } else {
        await api.post("/appointments", payload);
      }

      navigate("/appointments");
    } catch (err: any) {
      setError(
        err?.response?.data?.message || "Impossible d'enregistrer le rendez-vous."
      );
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return <div className="text-white">Chargement du rendez-vous...</div>;
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">
          {isEdit ? "Modifier le rendez-vous" : "Creer un rendez-vous"}
        </h1>
        <p className="mt-2 text-white/60">
          {isEdit
            ? "Le rendez-vous selectionne alimente directement le formulaire."
            : "Planifiez un nouveau rendez-vous pour le salon."}
        </p>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <AppointmentForm
          appointment={appointment}
          onSubmit={handleSubmit}
          onCancel={() => navigate("/appointments")}
          loading={loading}
        />
        {error ? <p className="mt-4 text-sm text-red-400">{error}</p> : null}
      </div>
    </div>
  );
}
