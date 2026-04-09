import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/axios";
import Panel from "../components/ui/Panel";
import StatCard from "../components/ui/StatCard";
import type { DashboardOverview } from "../types";
import RevenueChart from "../components/ui/RevenueChart";
import AppointmentsChart from "../components/ui/AppointmentsChart";

const salonId = 1;

type DashboardStatItem = {
  date: string;
  revenue: number | string;
  count: number | string;
};

function formatCurrency(value: number) {
  return value.toLocaleString("fr-FR", {
    style: "currency",
    currency: "EUR",
  });
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("fr-FR");
}

function formatTimeRange(start: string, end: string) {
  return `${start.slice(0, 5)} - ${end.slice(0, 5)}`;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardOverview | null>(null);
  const [stats, setStats] = useState<DashboardStatItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get<DashboardOverview>(`/dashboard/overview?salon_id=${salonId}`),
      api.get<DashboardStatItem[]>(`/dashboard/stats?salon_id=${salonId}`),
    ])
      .then(([overviewRes, statsRes]) => {
        setData(overviewRes.data);
        setStats(statsRes.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const revenueData = stats.map((item) => ({
    date: new Date(item.date).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
    }),
    revenue: Number(item.revenue),
  }));

  const appointmentsData = stats.map((item) => ({
    date: new Date(item.date).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
    }),
    count: Number(item.count),
  }));

  if (loading) {
    return <div className="text-white">Chargement du tableau de bord…</div>;
  }

  return (
    <div className="space-y-8">
      <section className="rounded-[32px] border border-white/10 bg-gradient-to-r from-[#17171c] via-[#111114] to-[#0d0d10] p-7 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-[#c8a96b]/80">
              Tableau de bord Barber23
            </p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight text-white">
              Vue d’ensemble
            </h1>
            <p className="mt-3 max-w-2xl text-white/55">
              Suivez les réservations, les revenus, les clients et l’activité quotidienne du salon depuis un seul endroit.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              to="/appointments/create"
              className="rounded-2xl bg-[#c8a96b] px-5 py-3 font-semibold text-black transition hover:opacity-90"
            >
              Nouveau rendez-vous
            </Link>
            <Link
              to="/clients/create"
              className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 font-semibold text-white transition hover:bg-white/10"
            >
              Nouveau client
            </Link>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Rendez-vous d’aujourd’hui"
          value={data?.appointments_today ?? 0}
          subtitle="Activité confirmée d’aujourd’hui"
        />
        <StatCard
          title="Chiffre d’affaires d’aujourd’hui"
          value={formatCurrency(Number(data?.revenue_today ?? 0))}
          subtitle="Affiché en euros"
        />
        <StatCard
          title="Total des clients"
          value={data?.clients_count ?? 0}
          subtitle="Clients du salon enregistrés"
        />
        <StatCard
          title="Services actifs"
          value={data?.services_count ?? 0}
          subtitle="Services disponibles du barbier"
        />
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.3fr_0.9fr]">
        <Panel
          title="Rendez-vous récents"
          subtitle="Dernières réservations créées dans le système"
        >
          <div className="space-y-3">
            {data?.recent_appointments?.length ? (
              data.recent_appointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-black/20 p-4 lg:flex-row lg:items-center lg:justify-between"
                >
                  <div>
                    <h3 className="font-semibold text-white">
                      {appointment.client?.full_name || "Client"} —{" "}
                      <span className="text-[#c8a96b]">
                        {appointment.service?.name || "Service"}
                      </span>
                    </h3>
                    <p className="mt-1 text-sm text-white/50">
                      {formatDate(appointment.appointment_date)} •{" "}
                      {formatTimeRange(appointment.start_time, appointment.end_time)}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-white/70">
                      {appointment.status}
                    </span>
                    <span className="text-sm font-medium text-[#c8a96b]">
                      {formatCurrency(Number(appointment.total_price))}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-white/50">Aucun rendez-vous récent pour le moment.</p>
            )}
          </div>
        </Panel>

        <Panel
          title="Clients récents"
          subtitle="Nouveaux dossiers clients ajoutés au salon"
        >
          <div className="space-y-3">
            {data?.recent_clients?.length ? (
              data.recent_clients.map((client) => (
                <div
                  key={client.id}
                  className="rounded-2xl border border-white/10 bg-black/20 p-4"
                >
                  <h3 className="font-semibold text-white">{client.full_name}</h3>
                  <p className="mt-1 text-sm text-white/55">{client.phone}</p>
                  <p className="text-sm text-white/40">{client.email || "No email"}</p>
                  <p className="mt-2 text-sm text-[#c8a96b]">
                    Style préféré: {client.preferred_style || "—"}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-white/50">Aucun client récent pour le moment.</p>
            )}
          </div>
        </Panel>
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Panel title="Chiffre d’affaires (7 derniers jours)">
          <RevenueChart data={revenueData} />
        </Panel>

        <Panel title="Rendez-vous (7 derniers jours)">
          <AppointmentsChart data={appointmentsData} />
        </Panel>
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Panel title="Actions rapides" subtitle="Accès rapide aux opérations courantes">
          <div className="grid gap-3">
            <Link
              to="/services/create"
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white transition hover:bg-white/10"
            >
              Ajouter un nouveau service
            </Link>
            <Link
              to="/clients/create"
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white transition hover:bg-white/10"
            >
              Ajouter un nouveau client
            </Link>
            <Link
              to="/appointments/create"
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white transition hover:bg-white/10"
            >
              Planifier un rendez-vous
            </Link>
          </div>
        </Panel>

        <Panel title="Vue d’ensemble de l’activité" subtitle="Aperçu opérationnel simple">
          <div className="space-y-4">
            <div className="rounded-2xl bg-black/20 p-4">
              <p className="text-sm text-white/50">Base de clients</p>
              <p className="mt-2 text-2xl font-bold text-white">
                {data?.clients_count ?? 0}
              </p>
            </div>

            <div className="rounded-2xl bg-black/20 p-4">
              <p className="text-sm text-white/50">Catalogue de services</p>
              <p className="mt-2 text-2xl font-bold text-white">
                {data?.services_count ?? 0}
              </p>
            </div>
          </div>
        </Panel>

        <Panel title="Priorités du jour" subtitle="Ce qui nécessite votre attention en priorité">
          <div className="space-y-4">
            <div className="rounded-2xl bg-black/20 p-4">
              <p className="text-sm text-white/50">Rendez-vous d’aujourd’hui</p>
              <p className="mt-2 text-2xl font-bold text-white">
                {data?.appointments_today ?? 0}
              </p>
            </div>

            <div className="rounded-2xl bg-black/20 p-4">
              <p className="text-sm text-white/50">Chiffre d’affaires d’aujourd’hui</p>
              <p className="mt-2 text-2xl font-bold text-white">
                {formatCurrency(Number(data?.revenue_today ?? 0))}
              </p>
            </div>
          </div>
        </Panel>
      </section>
    </div>
  );
}