import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/axios";
import type { Appointment, Client } from "../types";
import { useAuthStore } from "../app/store";

const storageBaseUrl = "http://localhost:8000/storage";

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("fr-FR");
}

function formatTime(time: string) {
  return time.slice(0, 5);
}

export default function ClientProfilePage() {
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

  const stats = useMemo(() => {
    const upcoming = appointments.filter(
      (appointment) =>
        new Date(appointment.appointment_date) >= new Date() &&
        appointment.status !== "cancelled"
    ).length;

    const completed = appointments.filter(
      (appointment) => appointment.status === "completed"
    ).length;

    return {
      upcoming,
      completed,
      loyalty: client?.loyalty_points ?? 0,
    };
  }, [appointments, client]);

  if (loading) {
    return <div className="text-white">Chargement du profil…</div>;
  }

  return (
    <div className="space-y-8">
      <section className="rounded-[32px] border border-white/10 bg-gradient-to-r from-[#17171c] via-[#111114] to-[#0d0d10] p-7 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-5">
            {client?.avatar ? (
              <img
                src={`${storageBaseUrl}/${client.avatar}`}
                alt="Avatar"
                className="h-24 w-24 rounded-full border border-white/10 object-cover"
              />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-full border border-white/10 bg-white/10 text-3xl font-bold text-white">
                {client?.full_name?.[0] || user?.name?.[0] || "C"}
              </div>
            )}

            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-[#c8a96b]/80">
                Espace client
              </p>
              <h1 className="mt-2 text-4xl font-bold tracking-tight text-white">
                {client?.full_name || user?.name}
              </h1>
              <p className="mt-2 text-white/55">
                Gérez vos rendez-vous, vos préférences et vos points de fidélité.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <Link
              to="/client/book"
              className="rounded-2xl bg-[#c8a96b] px-5 py-3 font-semibold text-black transition hover:opacity-90"
            >
              Prendre rendez-vous
            </Link>
            <Link
              to="/client/appointments"
              className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 font-semibold text-white transition hover:bg-white/10"
            >
              Consulter les rendez-vous
            </Link>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-white/55">Upcoming Appointments</p>
          <h2 className="mt-3 text-3xl font-bold text-[#c8a96b]">
            {stats.upcoming}
          </h2>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-white/55">Completed Visits</p>
          <h2 className="mt-3 text-3xl font-bold text-[#c8a96b]">
            {stats.completed}
          </h2>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-white/55">Loyalty Points</p>
          <h2 className="mt-3 text-3xl font-bold text-[#c8a96b]">
            {stats.loyalty}
          </h2>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <h3 className="text-xl font-semibold text-white">Profile Details</h3>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl bg-black/20 p-4">
              <p className="text-sm text-white/50">Email</p>
              <p className="mt-2 text-white">{client?.email || user?.email}</p>
            </div>

            <div className="rounded-2xl bg-black/20 p-4">
              <p className="text-sm text-white/50">Phone</p>
              <p className="mt-2 text-white">{client?.phone || user?.phone || "—"}</p>
            </div>

            <div className="rounded-2xl bg-black/20 p-4">
              <p className="text-sm text-white/50">Preferred Style</p>
              <p className="mt-2 text-white">{client?.preferred_style || "—"}</p>
            </div>

            <div className="rounded-2xl bg-black/20 p-4">
              <p className="text-sm text-white/50">Birth Date</p>
              <p className="mt-2 text-white">
                {client?.birth_date ? formatDate(client.birth_date) : "—"}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <h3 className="text-xl font-semibold text-white">Quick Notes</h3>
          <div className="mt-5 rounded-2xl bg-black/20 p-4">
            <p className="text-white/60">
              {client?.notes || "No note saved yet."}
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-xl font-semibold text-white">Recent Appointments</h3>
          <Link to="/client/appointments" className="text-sm text-[#c8a96b]">
            See all
          </Link>
        </div>

        <div className="space-y-3">
          {appointments.length === 0 ? (
            <p className="text-white/50">No appointments yet.</p>
          ) : (
            appointments.slice(0, 3).map((appointment) => (
              <div
                key={appointment.id}
                className="rounded-2xl border border-white/10 bg-black/20 p-4"
              >
                <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h4 className="font-semibold text-white">
                      {appointment.service?.name || "Service"}
                    </h4>
                    <p className="mt-1 text-sm text-white/60">
                      {formatDate(appointment.appointment_date)} •{" "}
                      {formatTime(appointment.start_time)} -{" "}
                      {formatTime(appointment.end_time)}
                    </p>
                  </div>

                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-white/70">
                    {appointment.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}