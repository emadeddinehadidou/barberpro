import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/axios";
import type { Appointment } from "../types";

const salonId = 1;

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("fr-FR");
}

function formatTime(time: string) {
  return time.slice(0, 5);
}

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const loadAppointments = () => {
    setLoading(true);

    api
      .get<Appointment[]>(`/appointments?salon_id=${salonId}`)
      .then((res) => setAppointments(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  const handleDelete = async (id: number) => {
    const ok = window.confirm("Supprimer ce rendez-vous ?");
    if (!ok) return;

    try {
      await api.delete(`/appointments/${id}`);
      loadAppointments();
    } catch {
      alert("Échec de la suppression du rendez-vous.");
    }
  };

  const filteredAppointments = appointments.filter((appointment) => {
    const q = search.toLowerCase();

    return (
      (appointment.client?.full_name || "").toLowerCase().includes(q) ||
      (appointment.service?.name || "").toLowerCase().includes(q) ||
      (appointment.barber?.name || "").toLowerCase().includes(q) ||
      appointment.status.toLowerCase().includes(q)
    );
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Rendez-vous</h1>
          <p className="mt-2 text-white/60">Gérer les réservations du salon de coiffure</p>
        </div>

        <Link
          to="/appointments/create"
          className="rounded-xl bg-[#c8a96b] px-4 py-3 font-semibold text-black"
        >
          Nouveau rendez-vous
        </Link>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Rechercher des rendez-vous, clients, services, barbiers…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-2xl border border-white/10 bg-gradient-to-r from-white/5 to-white/[0.03] px-4 py-3 text-white placeholder:text-white/35 outline-none transition focus:border-[#c8a96b]/50"
        />
      </div>

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
                  Chargement…
                </td>
              </tr>
            ) : filteredAppointments.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-6 text-white/60">
                    Aucun rendez-vous trouvé.
                </td>
              </tr>
            ) : (
              filteredAppointments.map((appointment) => (
                <tr key={appointment.id} className="border-t border-white/10">
                  <td className="px-4 py-3">
                    {appointment.client?.full_name || "—"}
                  </td>
                  <td className="px-4 py-3">
                    {appointment.barber?.name || "—"}
                  </td>
                  <td className="px-4 py-3">
                    {appointment.service?.name || "—"}
                  </td>
                  <td className="px-4 py-3">
                    {formatDate(appointment.appointment_date)}
                  </td>
                  <td className="px-4 py-3">
                    {formatTime(appointment.start_time)} -{" "}
                    {formatTime(appointment.end_time)}
                  </td>
                  <td className="px-4 py-3">{appointment.status}</td>
                  <td className="px-4 py-3">
                    {Number(appointment.total_price).toLocaleString("fr-FR", {
                      style: "currency",
                      currency: "EUR",
                    })}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Link
                        to={`/appointments/${appointment.id}/edit`}
                        className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm"
                      >
                        Modifier
                      </Link>

                      <button
                        onClick={() => handleDelete(appointment.id)}
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