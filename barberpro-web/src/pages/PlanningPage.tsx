import { useEffect, useMemo, useState } from "react";
import { api } from "../api/axios";
import type { Appointment, User } from "../types";

const salonId = 1;

function formatHour(time: string) {
  return time.slice(0, 5);
}

function formatDateLabel(date: string) {
  return new Date(date).toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export default function PlanningPage() {
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [barbers, setBarbers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    Promise.all([
      api.get<Appointment[]>(
        `/appointments?salon_id=${salonId}&appointment_date=${date}`
      ),
      api.get<User[]>("/barbers"),
    ])
      .then(([appointmentsRes, barbersRes]) => {
        setAppointments(appointmentsRes.data);
        setBarbers(barbersRes.data);
      })
      .finally(() => setLoading(false));
  }, [date]);

  const groupedAppointments = useMemo(() => {
    return barbers.map((barber) => ({
      barber,
      appointments: appointments.filter(
        (appointment) => appointment.barber_id === barber.id
      ),
    }));
  }, [appointments, barbers]);

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Planning</h1>
            <p className="mt-2 text-white/60">
              Calendrier quotidien des rendez-vous par barbier
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm text-white/70">Choisir une date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
            />
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-xl font-semibold text-[#c8a96b]">
          {formatDateLabel(date)}
        </h2>
      </div>

      {loading ? (
        <div className="text-white">Chargement du planning…</div>
      ) : groupedAppointments.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-white/60">
          Aucun barbier trouvé.
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {groupedAppointments.map(({ barber, appointments }) => (
            <div
              key={barber.id}
              className="rounded-3xl border border-white/10 bg-white/5 p-6"
            >
              <div className="mb-5">
                <h3 className="text-xl font-semibold text-white">{barber.name}</h3>
                <p className="text-sm text-white/50">{barber.email}</p>
              </div>

              <div className="space-y-3">
                {appointments.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-white/10 bg-black/10 p-4 text-white/50">
                   Aucun rendez-vous pour ce barbier.
                  </div>
                ) : (
                  appointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="rounded-2xl border border-white/10 bg-black/20 p-4"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h4 className="font-semibold text-white">
                            {appointment.client?.full_name || "Client"}
                          </h4>
                          <p className="mt-1 text-sm text-[#c8a96b]">
                            {appointment.service?.name || "Service"}
                          </p>
                          <p className="mt-1 text-sm text-white/60">
                            {formatHour(appointment.start_time)} -{" "}
                            {formatHour(appointment.end_time)}
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
}