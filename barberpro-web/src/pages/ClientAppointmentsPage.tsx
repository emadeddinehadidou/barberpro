import { useEffect, useState } from "react";
import { api } from "../api/axios";
import { useAuthStore } from "../app/store";
import type { Appointment, Client } from "../types";

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("fr-FR");
}

function formatTime(time: string) {
  return time.slice(0, 5);
}

export default function ClientAppointmentsPage() {
  const user = useAuthStore((state) => state.user);

  const [client, setClient] = useState<Client | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    api
      .get<Client[]>("/clients?salon_id=1")
      .then((res) => {
        const foundClient =
          res.data.find((item) => item.user_id === user.id) || null;

        setClient(foundClient);

        if (foundClient) {
          return api.get<Appointment[]>(`/appointments?salon_id=1`);
        }

        return { data: [] as Appointment[] };
      })
      .then((res) => {
        const items = res.data.filter((appointment) => {
          return appointment.client_id === client?.id;
        });
        setAppointments(items);
      })
      .finally(() => setLoading(false));
  }, [user, client?.id]);

  if (loading) {
    return <div className="text-white">Chargement des rendez-vous…</div>;
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <h1 className="text-3xl font-bold text-white">Mes rendez-vous</h1>
        <p className="mt-2 text-white/60">
          Voir tous vos rendez-vous programmés et passés
        </p>
      </div>

      <div className="space-y-4">
        {appointments.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-white/50">
            Aucun rendez-vous trouvé.
          </div>
        ) : (
          appointments.map((appointment) => (
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
                    {formatTime(appointment.start_time)} -{" "}
                    {formatTime(appointment.end_time)}
                  </p>
                  <p className="mt-2 text-sm text-[#c8a96b]">
                    Barbier: {appointment.barber?.name || "—"}
                  </p>
                </div>

                <div className="text-right">
                  <p className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-white/70">
                    {appointment.status}
                  </p>
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
            </div>
          ))
        )}
      </div>
    </div>
  );
}