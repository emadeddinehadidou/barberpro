import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/axios";
import StatusBadge from "../components/ui/StatusBadge";
import { useToast } from "../hooks/useToast";
import type { Appointment, Client } from "../types";

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("fr-FR");
}

function formatTime(time: string) {
  return time.slice(0, 5);
}

export default function ClientProfilePage() {
  const { success, error } = useToast();
  const [client, setClient] = useState<Client | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const loadProfile = async () => {
    setLoading(true);

    try {
      const [clientRes, appointmentsRes] = await Promise.all([
        api.get<Client>("/client/profile"),
        api.get<Appointment[]>("/client/appointments"),
      ]);

      setClient(clientRes.data);
      setAppointments(appointmentsRes.data);
    } catch {
      error("Impossible de charger le profil client.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("avatar", file);

      const response = await api.post<Client>("/client/profile/avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setClient(response.data);
      success("Avatar mis a jour.");
    } catch {
      error("Impossible de mettre a jour l'avatar.");
    } finally {
      setUploading(false);
    }
  };

  const handleCancelAppointment = async (appointmentId: number) => {
    if (!window.confirm("Annuler ce rendez-vous ?")) {
      return;
    }

    try {
      const response = await api.patch<Appointment>(
        `/client/appointments/${appointmentId}/status`,
        {
          status: "cancelled",
        }
      );

      setAppointments((prev) =>
        prev.map((appointment) =>
          appointment.id === appointmentId ? response.data : appointment
        )
      );
      success("Rendez-vous annule.");
    } catch {
      error("Impossible d'annuler ce rendez-vous.");
    }
  };

  const stats = useMemo(() => {
    const upcoming = appointments.filter(
      (appointment) =>
        new Date(appointment.appointment_date) >= new Date() &&
        !["cancelled", "completed", "absent", "no_show"].includes(appointment.status)
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
    return <div className="text-[#4b3824]">Chargement du profil...</div>;
  }

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-[32px] border border-[#dfcfb5] bg-[linear-gradient(135deg,rgba(255,251,245,0.96)_0%,rgba(245,233,214,0.96)_100%)] p-7 shadow-[0_24px_70px_rgba(117,86,49,0.12)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(201,168,115,0.18),transparent_30%),linear-gradient(90deg,rgba(255,255,255,0.72),rgba(255,255,255,0.18))]" />
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative flex items-center gap-5">
            {client?.avatar ? (
              <img
                src={client.avatar}
                alt="Avatar"
                className="h-24 w-24 rounded-full border border-white/70 object-cover shadow-[0_12px_26px_rgba(117,86,49,0.12)]"
              />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-full border border-white/70 bg-white/70 text-3xl font-bold text-[#7f6035] shadow-[0_12px_26px_rgba(117,86,49,0.12)]">
                {client?.full_name?.[0] || "C"}
              </div>
            )}

            <div className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                disabled={uploading}
                className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
              />
              <button
                disabled={uploading}
                className="rounded-xl border border-[#c8a96b]/30 bg-white/70 px-4 py-2 text-sm font-medium text-[#8a6a3c] shadow-sm hover:bg-white disabled:opacity-50"
              >
                {uploading ? "Chargement..." : "Changer l'avatar"}
              </button>
            </div>

            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#a47a43]">
                Espace client
              </p>
              <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-[#2b2116] drop-shadow-[0_1px_0_rgba(255,255,255,0.45)] sm:text-5xl">
                {client?.full_name}
              </h1>
              <p className="mt-3 max-w-2xl text-base font-medium text-[#6f5d47]">
                Gere vos rendez-vous et vos preferences.
              </p>
            </div>
          </div>

          <div className="relative flex gap-3">
            <Link
              to="/client/book"
              className="rounded-2xl bg-[#8a6a3c] px-5 py-3 font-semibold text-[#fffaf2] shadow-[0_14px_30px_rgba(138,106,60,0.22)] transition hover:bg-[#755732]"
            >
              Prendre rendez-vous
            </Link>
            <Link
              to="/client/appointments"
              className="rounded-2xl border border-[#dbc9ae] bg-white/80 px-5 py-3 font-semibold text-[#4b3824] transition hover:bg-white"
            >
              Voir mes rendez-vous
            </Link>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-[#e2d5c2] bg-white/80 p-5">
          <p className="text-sm text-[#7b6b58]">Rendez-vous a venir</p>
          <h2 className="mt-3 text-3xl font-bold text-[#8a6a3c]">{stats.upcoming}</h2>
        </div>

        <div className="rounded-3xl border border-[#e2d5c2] bg-white/80 p-5">
          <p className="text-sm text-[#7b6b58]">Visites terminees</p>
          <h2 className="mt-3 text-3xl font-bold text-[#8a6a3c]">{stats.completed}</h2>
        </div>

        <div className="rounded-3xl border border-[#e2d5c2] bg-white/80 p-5">
          <p className="text-sm text-[#7b6b58]">Points fidelite</p>
          <h2 className="mt-3 text-3xl font-bold text-[#8a6a3c]">{stats.loyalty}</h2>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-3xl border border-[#e2d5c2] bg-white/80 p-6 shadow-[0_18px_50px_rgba(114,84,48,0.08)]">
          <h3 className="text-xl font-semibold text-[#2b2116]">Profil</h3>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-[#ece1d0] bg-[linear-gradient(180deg,#fffdfa_0%,#f8f0e5_100%)] p-4">
              <p className="text-sm text-[#6f5d47]">Email</p>
              <p className="mt-2 text-[#2b2116]">{client?.email || "-"}</p>
            </div>

            <div className="rounded-2xl border border-[#ece1d0] bg-[linear-gradient(180deg,#fffdfa_0%,#f8f0e5_100%)] p-4">
              <p className="text-sm text-[#6f5d47]">Telephone</p>
              <p className="mt-2 text-[#2b2116]">{client?.phone || "-"}</p>
            </div>

            <div className="rounded-2xl border border-[#ece1d0] bg-[linear-gradient(180deg,#fffdfa_0%,#f8f0e5_100%)] p-4">
              <p className="text-sm text-[#6f5d47]">Style prefere</p>
              <p className="mt-2 text-[#2b2116]">{client?.preferred_style || "-"}</p>
            </div>

            <div className="rounded-2xl border border-[#ece1d0] bg-[linear-gradient(180deg,#fffdfa_0%,#f8f0e5_100%)] p-4">
              <p className="text-sm text-[#6f5d47]">Date de naissance</p>
              <p className="mt-2 text-[#2b2116]">
                {client?.birth_date ? formatDate(client.birth_date) : "-"}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-[#e2d5c2] bg-white/80 p-6 shadow-[0_18px_50px_rgba(114,84,48,0.08)]">
          <h3 className="text-xl font-semibold text-[#2b2116]">Notes</h3>
          <div className="mt-5 rounded-2xl border border-[#ece1d0] bg-[linear-gradient(180deg,#fffdfa_0%,#f8f0e5_100%)] p-4">
            <p className="text-[#6f5d47]">{client?.notes || "Aucune note enregistree."}</p>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-[#e2d5c2] bg-white/80 p-6 shadow-[0_18px_50px_rgba(114,84,48,0.08)]">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-xl font-semibold text-[#2b2116]">Derniers rendez-vous</h3>
          <Link to="/client/appointments" className="text-sm font-medium text-[#8a6a3c]">
            Voir tout
          </Link>
        </div>

        <div className="space-y-3">
          {appointments.length === 0 ? (
            <p className="text-[#6f5d47]">Aucun rendez-vous pour le moment.</p>
          ) : (
            appointments.slice(0, 3).map((appointment) => (
              <div
                key={appointment.id}
                className="rounded-2xl border border-[#ece1d0] bg-[linear-gradient(180deg,#fffdfa_0%,#f8f0e5_100%)] p-4"
              >
                <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h4 className="font-semibold text-[#2b2116]">
                      {appointment.service?.name || "Service"}
                    </h4>
                    <p className="mt-1 text-sm text-[#6f5d47]">
                      {formatDate(appointment.appointment_date)} •{" "}
                      {formatTime(appointment.start_time)} - {formatTime(appointment.end_time)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <StatusBadge status={appointment.status} />
                    {["pending", "confirmed"].includes(appointment.status) &&
                    new Date(appointment.appointment_date) >=
                      new Date(new Date().toDateString()) ? (
                      <button
                        onClick={() => handleCancelAppointment(appointment.id)}
                        className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-1 text-xs text-red-300 hover:bg-red-500/20"
                      >
                        Annuler
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
