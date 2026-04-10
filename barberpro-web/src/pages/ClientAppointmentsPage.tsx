import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api/axios";
import StatusBadge from "../components/ui/StatusBadge";
import { useToast } from "../hooks/useToast";
import type { Appointment } from "../types";

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("fr-FR");
}

function formatTime(time: string) {
  return time.slice(0, 5);
}

export default function ClientAppointmentsPage() {
  const navigate = useNavigate();
  const { success, error } = useToast();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAppointments = () => {
    setLoading(true);

    api
      .get<Appointment[]>("/client/appointments")
      .then((res) => setAppointments(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  const handleCancel = async (appointmentId: number) => {
    if (!window.confirm("Annuler ce rendez-vous ?")) {
      return;
    }

    try {
      const response = await api.patch<Appointment>(
        `/client/appointments/${appointmentId}/status`,
        { status: "cancelled" }
      );

      setAppointments((prev) =>
        prev.map((appointment) =>
          appointment.id === appointmentId ? response.data : appointment
        )
      );
      success("Rendez-vous annule.");
    } catch (err: any) {
      error(err?.response?.data?.message || "Impossible d'annuler ce rendez-vous.");
    }
  };

  if (loading) {
    return <div className="text-white">Chargement des rendez-vous...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Mes rendez-vous</h1>
            <p className="mt-2 text-white/60">
              Consultez uniquement vos rendez-vous et gerer ceux qui sont modifiables.
            </p>
          </div>
          <Link
            to="/client/book"
            className="rounded-xl bg-[#c8a96b] px-4 py-3 font-semibold text-black"
          >
            Nouveau rendez-vous
          </Link>
        </div>
      </div>

      <div className="space-y-4">
        {appointments.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-white/50">
            Aucun rendez-vous trouve.
          </div>
        ) : (
          appointments.map((appointment) => {
            const canManage =
              ["pending", "confirmed"].includes(appointment.status) &&
              new Date(appointment.appointment_date) >= new Date(new Date().toDateString());

            return (
              <div
                key={appointment.id}
                className="rounded-3xl border border-white/10 bg-white/5 p-6"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-white">
                      {appointment.service?.name || "Service"}
                    </h3>
                    <p className="mt-2 text-white/60">
                      {formatDate(appointment.appointment_date)} •{" "}
                      {formatTime(appointment.start_time)} - {formatTime(appointment.end_time)}
                    </p>
                    <p className="mt-2 text-sm text-[#c8a96b]">
                      Barbier : {appointment.barber?.name || "-"}
                    </p>
                  </div>

                  <div className="text-right">
                    <StatusBadge status={appointment.status} className="justify-center" />
                    <p className="mt-3 text-lg font-semibold text-[#c8a96b]">
                      {Number(appointment.total_price).toLocaleString("fr-FR", {
                        style: "currency",
                        currency: "EUR",
                      })}
                    </p>
                  </div>
                </div>

                {appointment.notes ? (
                  <div className="mt-4 rounded-2xl bg-black/20 p-4 text-white/60">
                    {appointment.notes}
                  </div>
                ) : null}

                {canManage ? (
                  <div className="mt-4 flex gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        navigate(`/client/appointments/${appointment.id}/edit`, {
                          state: { appointment },
                        })
                      }
                      className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-white"
                    >
                      Modifier
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCancel(appointment.id)}
                      className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2 text-red-300"
                    >
                      Annuler
                    </button>
                  </div>
                ) : null}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
