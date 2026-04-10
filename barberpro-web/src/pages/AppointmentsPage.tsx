import { useEffect, useState } from "react";
import { api, getCsrfCookie } from "../api/axios";
import { useAuthStore } from "../app/store";
import AppointmentModal from "../components/ui/AppointmentModal";
import CancelStatusModal from "../components/ui/CancelStatusModal";
import StatusBadge from "../components/ui/StatusBadge";
import { DEFAULT_SALON_ID } from "../constants/app";
import { useToast } from "../hooks/useToast";
import type { Appointment } from "../types";
import {
  buildAppointmentPayload,
  type AppointmentFormData,
} from "../utils/appointmentForm";

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("fr-FR");
}

function formatTime(time: string) {
  return time.slice(0, 5);
}

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [statusLoading, setStatusLoading] = useState<Record<number, boolean>>({});
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelModalAppointmentId, setCancelModalAppointmentId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [appointmentModalOpen, setAppointmentModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [appointmentModalLoading, setAppointmentModalLoading] = useState(false);
  const { success, error } = useToast();
  const user = useAuthStore((state) => state.user);
  const isBarber = user?.role === "barber";

  const loadAppointments = () => {
    setLoading(true);
    setLoadError("");

    const endpoint =
      isBarber
        ? "/barber/appointments"
        : `/appointments?salon_id=${DEFAULT_SALON_ID}`;

    api
      .get<Appointment[]>(endpoint)
      .then((res) => setAppointments(res.data))
      .catch((err: any) => {
        setAppointments([]);
        setLoadError(
          err?.response?.data?.message || "Impossible de charger les rendez-vous."
        );
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadAppointments();
  }, [isBarber]);

  const replaceAppointment = (updatedAppointment: Appointment) => {
    setAppointments((prev) =>
      prev.map((appointment) =>
        appointment.id === updatedAppointment.id
          ? { ...appointment, ...updatedAppointment }
          : appointment
      )
    );
  };

  const handleStatusChange = async (
    id: number,
    newStatus: Appointment["status"]
  ) => {
    setStatusLoading((prev) => ({ ...prev, [id]: true }));

    try {
      await getCsrfCookie();

      const response = await api.patch<Appointment>(`/appointments/${id}/status`, {
        status: newStatus,
      });

      replaceAppointment(response.data);
      success(`Statut mis a jour : ${newStatus}`);
    } catch (err: any) {
      error(
        err?.response?.data?.message || err?.message || "Impossible de mettre a jour le statut."
      );
    } finally {
      setStatusLoading((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handleAppointmentModalSubmit = async (data: AppointmentFormData) => {
    setAppointmentModalLoading(true);

    try {
      const payload = buildAppointmentPayload(data);
      const response = selectedAppointment
        ? await api.put<Appointment>(`/appointments/${selectedAppointment.id}`, payload)
        : await api.post<Appointment>("/appointments", payload);
      const savedAppointment = response.data;

      setAppointments((prev) => {
        if (selectedAppointment) {
          return prev.map((appointment) =>
            appointment.id === savedAppointment.id ? savedAppointment : appointment
          );
        }

        return [savedAppointment, ...prev];
      });

      setAppointmentModalOpen(false);
      setSelectedAppointment(null);
      success(selectedAppointment ? "Rendez-vous mis a jour" : "Rendez-vous cree");
    } catch (err: any) {
      error(err?.response?.data?.message || "Impossible de sauvegarder le rendez-vous.");
    } finally {
      setAppointmentModalLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Supprimer ce rendez-vous ?")) {
      return;
    }

    try {
      await api.delete(`/appointments/${id}`);
      setAppointments((prev) => prev.filter((appointment) => appointment.id !== id));
      success("Rendez-vous supprime avec succes");
    } catch (err: any) {
      error(err?.response?.data?.message || "Impossible de supprimer le rendez-vous.");
    }
  };

  const filteredAppointments = appointments.filter((appointment) => {
    const query = search.toLowerCase();

    return (
      (appointment.client?.full_name || "").toLowerCase().includes(query) ||
      (appointment.service?.name || "").toLowerCase().includes(query) ||
      (appointment.barber?.name || "").toLowerCase().includes(query) ||
      appointment.status.toLowerCase().includes(query)
    );
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Rendez-vous</h1>
          <p className="mt-2 text-white/60">Gerer les reservations du salon.</p>
        </div>

        {!isBarber ? (
          <button
            onClick={() => {
              setSelectedAppointment(null);
              setAppointmentModalOpen(true);
            }}
            className="rounded-xl bg-[#c8a96b] px-4 py-3 font-semibold text-black"
          >
            Nouveau rendez-vous
          </button>
        ) : null}
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Rechercher un client, un service ou un barbier..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="w-full rounded-2xl border border-white/10 bg-gradient-to-r from-white/5 to-white/[0.03] px-4 py-3 text-white placeholder:text-white/35 outline-none transition focus:border-[#c8a96b]/50"
        />
      </div>

      {loadError ? <p className="mb-4 text-red-400">{loadError}</p> : null}

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
        <table className="w-full text-left">
          <thead className="bg-white/10 text-sm text-white/70">
            <tr>
              <th className="px-4 py-3">Client</th>
              <th className="px-4 py-3">Barbier</th>
              <th className="px-4 py-3">Service</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Heure</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3">Prix</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="px-4 py-6 text-white/60">
                  Chargement...
                </td>
              </tr>
            ) : loadError ? null : filteredAppointments.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-6 text-white/60">
                  Aucun rendez-vous trouve.
                </td>
              </tr>
            ) : (
              filteredAppointments.map((appointment) => (
                <tr key={appointment.id} className="border-t border-white/10">
                  <td className="px-4 py-3">{appointment.client?.full_name || "-"}</td>
                  <td className="px-4 py-3">{appointment.barber?.name || "-"}</td>
                  <td className="px-4 py-3">{appointment.service?.name || "-"}</td>
                  <td className="px-4 py-3">{formatDate(appointment.appointment_date)}</td>
                  <td className="px-4 py-3">
                    {formatTime(appointment.start_time)} - {formatTime(appointment.end_time)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1">
                      <StatusBadge status={appointment.status} />
                      <div className="flex gap-1">
                        {appointment.status === "pending" && (
                          <>
                            <button
                              type="button"
                              disabled={Boolean(statusLoading[appointment.id])}
                              onClick={() => handleStatusChange(appointment.id, "confirmed")}
                              className="rounded border border-blue-500/20 bg-blue-500/10 px-2 py-1 text-xs text-blue-300 transition hover:bg-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {statusLoading[appointment.id] ? "..." : "Confirmer"}
                            </button>
                            <button
                              type="button"
                              disabled={Boolean(statusLoading[appointment.id])}
                              onClick={() => {
                                setCancelModalAppointmentId(appointment.id);
                                setCancelModalOpen(true);
                              }}
                              className="rounded border border-red-500/20 bg-red-500/10 px-2 py-1 text-xs text-red-300 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              Annuler
                            </button>
                          </>
                        )}

                        {appointment.status === "confirmed" && (
                          <button
                            type="button"
                            disabled={Boolean(statusLoading[appointment.id])}
                            onClick={() => handleStatusChange(appointment.id, "completed")}
                            className="rounded border border-green-500/20 bg-green-500/10 px-2 py-1 text-xs text-green-300 transition hover:bg-green-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {statusLoading[appointment.id] ? "..." : "Terminer"}
                          </button>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {Number(appointment.total_price).toLocaleString("fr-FR", {
                      style: "currency",
                      currency: "EUR",
                    })}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {isBarber ? null : (
                        <>
                          <button
                            onClick={() => {
                              setSelectedAppointment(appointment);
                              setAppointmentModalOpen(true);
                            }}
                            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm"
                          >
                            Modifier
                          </button>

                          <button
                            onClick={() => handleDelete(appointment.id)}
                            className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-300"
                          >
                            Supprimer
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <CancelStatusModal
        open={cancelModalOpen}
        loading={
          Boolean(
            cancelModalAppointmentId ? statusLoading[cancelModalAppointmentId] : false
          )
        }
        onClose={() => {
          setCancelModalOpen(false);
          setCancelModalAppointmentId(null);
        }}
        onSelect={async (status) => {
          if (cancelModalAppointmentId) {
            await handleStatusChange(cancelModalAppointmentId, status);
          }
          setCancelModalOpen(false);
          setCancelModalAppointmentId(null);
        }}
      />

      <AppointmentModal
        open={appointmentModalOpen}
        onClose={() => {
          setAppointmentModalOpen(false);
          setSelectedAppointment(null);
        }}
        appointment={selectedAppointment}
        onSubmit={handleAppointmentModalSubmit}
        loading={appointmentModalLoading}
      />
    </div>
  );
}
