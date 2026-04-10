import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/axios";
import { useAuthStore } from "../app/store";
import Panel from "../components/ui/Panel";
import StatCard from "../components/ui/StatCard";
import StatusBadge from "../components/ui/StatusBadge";
import type { AdminDashboardData, BarberDashboardData, ClientDashboardData } from "../types";
import RevenueChart from "../components/ui/RevenueChart";
import AppointmentsChart from "../components/ui/AppointmentsChart";

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
  const user = useAuthStore((state) => state.user);
  const [data, setData] = useState<AdminDashboardData | BarberDashboardData | ClientDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    let endpoint = '/dashboard/overview'; // fallback

    if (user.role === 'admin') {
      endpoint = '/dashboard/admin';
    } else if (user.role === 'barber') {
      endpoint = '/dashboard/barber';
    } else if (user.role === 'client') {
      endpoint = '/dashboard/client';
    }

    api.get(endpoint)
      .then((res) => {
        setData(res.data);
        setError(null);
      })
      .catch((err) => {
        console.error('Dashboard API error:', err);
        setError(err?.response?.data?.message || 'Erreur de chargement des données');
        setData(null);
      })
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) {
    return <div className="text-white">Chargement du tableau de bord…</div>;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-400 text-lg mb-4">⚠️ {error}</div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-[#c8a96b] text-black rounded-lg hover:bg-[#c8a96b]/80"
        >
          Réessayer
        </button>
      </div>
    );
  }

  if (!data) {
    return <div className="text-white">Aucune donnée disponible</div>;
  }

  // Admin Dashboard
  if (user?.role === 'admin') {
    const adminData = data as AdminDashboardData;
    const revenueData = adminData.revenue_last_7_days.map((item) => ({
      date: new Date(item.date).toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "short",
      }),
      revenue: item.total,
    }));

    const appointmentsData = adminData.appointments_last_7_days.map((item) => ({
      date: new Date(item.date).toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "short",
      }),
      count: item.count,
    }));

    return (
      <div className="space-y-8">
        <section className="rounded-[32px] border border-white/10 bg-gradient-to-r from-[#17171c] via-[#111114] to-[#0d0d10] p-7 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-[#c8a96b]/80">
                Tableau de bord Admin
              </p>
              <h1 className="mt-3 text-4xl font-bold tracking-tight text-white">
                Centre de contrôle d'entreprise
              </h1>
              <p className="mt-3 max-w-2xl text-white/55">
                Gérez tout le salon, suivez les performances et prenez des décisions éclairées.
              </p>
            </div>
          </div>
        </section>

        {/* Top Stats */}
        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Rendez-vous aujourd'hui"
            value={adminData.appointments_today}
            subtitle="Activité confirmée"
          />
          <StatCard
            title="Revenus aujourd'hui"
            value={formatCurrency(adminData.revenue_today)}
            subtitle="Chiffre d'affaires"
          />
          <StatCard
            title="Total clients"
            value={adminData.total_clients}
            subtitle="Base de données clients"
          />
          <StatCard
            title="Services actifs"
            value={adminData.total_services}
            subtitle="Catalogue disponible"
          />
        </section>

        {/* Charts */}
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Panel title="Revenus (7 derniers jours)">
            <RevenueChart data={revenueData} />
          </Panel>
          <Panel title="Rendez-vous (7 derniers jours)">
            <AppointmentsChart data={appointmentsData} />
          </Panel>
        </section>

        {/* Recent Activity */}
        <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.3fr_0.9fr]">
          <Panel title="Rendez-vous récents" subtitle="Dernières réservations">
            <div className="space-y-3">
              {adminData.recent_appointments.map((appointment) => (
                <div key={appointment.id} className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-black/20 p-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h3 className="font-semibold text-white">
                      {appointment.client?.full_name || "Client"} —{" "}
                      <span className="text-[#c8a96b]">{appointment.service?.name || "Service"}</span>
                    </h3>
                    <p className="mt-1 text-sm text-white/50">
                      {formatDate(appointment.appointment_date)} •{" "}
                      {formatTimeRange(appointment.start_time, appointment.end_time)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={appointment.status} />
                    <span className="text-sm font-medium text-[#c8a96b]">
                      {formatCurrency(Number(appointment.total_price))}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Clients récents" subtitle="Nouveaux clients">
            <div className="space-y-3">
              {adminData.recent_clients.map((client) => (
                <div key={client.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <h3 className="font-semibold text-white">{client.full_name}</h3>
                  <p className="mt-1 text-sm text-white/55">{client.phone}</p>
                  <p className="text-sm text-white/40">{client.email || "No email"}</p>
                </div>
              ))}
            </div>
          </Panel>
        </section>
      </div>
    );
  }

  // Barber Dashboard
  if (user?.role === 'barber') {
    const barberData = data as BarberDashboardData;

    return (
      <div className="space-y-8">
        <section className="rounded-[32px] border border-white/10 bg-gradient-to-r from-[#17171c] via-[#111114] to-[#0d0d10] p-7 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-[#c8a96b]/80">
                Espace Barbier
              </p>
              <h1 className="mt-3 text-4xl font-bold tracking-tight text-white">
                Mon tableau de bord
              </h1>
              <p className="mt-3 max-w-2xl text-white/55">
                Gérez votre planning, suivez vos rendez-vous et consultez vos performances.
              </p>
            </div>
          </div>
        </section>

        {/* Personal Stats */}
        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
          <StatCard
            title="Rendez-vous aujourd’hui"
            value={barberData.stats.appointments_today}
            subtitle="Vos réservations du jour"
          />
          <StatCard
            title="Terminés aujourd’hui"
            value={barberData.stats.completed_today}
            subtitle="Rendez-vous finalisés"
          />
          <StatCard
            title="À venir"
            value={barberData.stats.upcoming_appointments}
            subtitle="Rendez-vous programmés"
          />
          <StatCard
            title="Revenus aujourd’hui"
            value={formatCurrency(barberData.stats.revenue_today)}
            subtitle="Gains du jour"
          />
          <StatCard
            title="Annulations"
            value={barberData.stats.cancelled_today}
            subtitle="Rendez-vous annulés"
          />
        </section>

        {/* Today's Appointments */}
        <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.3fr_0.9fr]">
          <Panel title="Rendez-vous d’aujourd’hui" subtitle="Votre planning du jour">
            <div className="space-y-3">
              {barberData.today_appointments.map((appointment) => (
                <div key={appointment.id} className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-black/20 p-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h3 className="font-semibold text-white">
                      {appointment.client?.full_name || "Client"} —{" "}
                      <span className="text-[#c8a96b]">{appointment.service?.name || "Service"}</span>
                    </h3>
                    <p className="mt-1 text-sm text-white/50">
                      {formatTimeRange(appointment.start_time, appointment.end_time)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={appointment.status} />
                    <span className="text-sm font-medium text-[#c8a96b]">
                      {formatCurrency(Number(appointment.total_price))}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="À venir" subtitle="Prochains rendez-vous">
            <div className="space-y-3">
              {barberData.upcoming_appointments.slice(0, 5).map((appointment) => (
                <div key={appointment.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <h3 className="font-semibold text-white">{appointment.client?.full_name}</h3>
                  <p className="text-sm text-[#c8a96b]">{appointment.service?.name}</p>
                  <p className="mt-1 text-sm text-white/50">
                    {formatDate(appointment.appointment_date)} • {formatTimeRange(appointment.start_time, appointment.end_time)}
                  </p>
                </div>
              ))}
            </div>
          </Panel>
        </section>

        {/* Weekly Performance */}
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Panel title="Performance hebdomadaire" subtitle="Vos statistiques de la semaine">
            <div className="space-y-4">
              <div className="rounded-2xl bg-black/20 p-4">
                <p className="text-sm text-white/50">Rendez-vous terminés</p>
                <p className="mt-2 text-2xl font-bold text-white">{barberData.weekly_performance.completed}</p>
              </div>
              <div className="rounded-2xl bg-black/20 p-4">
                <p className="text-sm text-white/50">Revenus générés</p>
                <p className="mt-2 text-2xl font-bold text-[#c8a96b]">
                  {formatCurrency(barberData.weekly_performance.revenue)}
                </p>
              </div>
              <div className="rounded-2xl bg-black/20 p-4">
                <p className="text-sm text-white/50">Taux de retour clients</p>
                <p className="mt-2 text-2xl font-bold text-white">
                  {barberData.weekly_performance.client_return_rate}%
                </p>
              </div>
            </div>
          </Panel>

          <Panel title="Services populaires" subtitle="Ce que vos clients préfèrent">
            <div className="space-y-3">
              {barberData.weekly_performance.top_services.map((service, index) => (
                <div key={index} className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div>
                    <h3 className="font-semibold text-white">{service.name}</h3>
                    <p className="text-sm text-white/50">{service.count} prestations</p>
                  </div>
                  <span className="text-lg font-bold text-[#c8a96b]">#{index + 1}</span>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Actions" subtitle="Gérer vos rendez-vous">
            <div className="grid gap-3">
              <Link to="/planning" className="rounded-2xl bg-[#c8a96b] px-4 py-3 font-semibold text-black transition hover:opacity-90">
                Voir mon planning
              </Link>
              <Link to="/appointments" className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white transition hover:bg-white/10">
                Mes rendez-vous
              </Link>
              <button className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white transition hover:bg-white/10">
                Pause déjeuner
              </button>
            </div>
          </Panel>
        </section>
      </div>
    );
  }

  // Client Dashboard
  if (user?.role === 'client') {
    const clientData = data as ClientDashboardData;

    return (
      <div className="space-y-8">
        <section className="rounded-[32px] border border-white/10 bg-gradient-to-r from-[#17171c] via-[#111114] to-[#0d0d10] p-7 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-[#c8a96b]/80">
                Espace Client
              </p>
              <h1 className="mt-3 text-4xl font-bold tracking-tight text-white">
                Mon compte
              </h1>
              <p className="mt-3 max-w-2xl text-white/55">
                Réservez facilement, suivez vos rendez-vous et gérez votre profil.
              </p>
            </div>
          </div>
        </section>

        {/* Quick Stats */}
        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Prochain rendez-vous"
            value={clientData.next_appointment ? formatDate(clientData.next_appointment.appointment_date) : "Aucun"}
            subtitle="Votre prochaine visite"
          />
          <StatCard
            title="Total visites"
            value={clientData.total_visits}
            subtitle="Nombre de passages"
          />
          <StatCard
            title="Points fidélité"
            value={clientData.loyalty_points}
            subtitle="Points cumulés"
          />
          <StatCard
            title="Service préféré"
            value={clientData.favorite_service?.name || "—"}
            subtitle="Le plus demandé"
          />
        </section>

        {/* Main Content */}
        <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.3fr_0.9fr]">
          <Panel title="Rendez-vous à venir" subtitle="Vos prochaines visites">
            <div className="space-y-3">
              {clientData.upcoming_appointments.map((appointment) => (
                <div key={appointment.id} className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-black/20 p-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h3 className="font-semibold text-white">
                      {appointment.service?.name || "Service"}
                    </h3>
                    <p className="mt-1 text-sm text-white/50">
                      {formatDate(appointment.appointment_date)} •{" "}
                      {formatTimeRange(appointment.start_time, appointment.end_time)}
                    </p>
                    <p className="text-sm text-[#c8a96b]">
                      Avec {appointment.barber?.name || "Barbier"}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={appointment.status} />
                    <span className="text-sm font-medium text-[#c8a96b]">
                      {formatCurrency(Number(appointment.total_price))}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Historique" subtitle="Vos dernières visites">
            <div className="space-y-3">
              {clientData.appointment_history.slice(0, 5).map((appointment) => (
                <div key={appointment.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <h3 className="font-semibold text-white">{appointment.service?.name}</h3>
                  <p className="text-sm text-white/50">
                    {formatDate(appointment.appointment_date)} • {appointment.barber?.name}
                  </p>
                  <div className="mt-2 flex items-center justify-between">
                    <StatusBadge status={appointment.status} />
                    <span className="text-sm font-medium text-[#c8a96b]">
                      {formatCurrency(Number(appointment.total_price))}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </section>

        {/* Profile & Actions */}
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Panel title="Mon profil" subtitle="Informations personnelles">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-[#c8a96b] flex items-center justify-center text-2xl font-bold text-black">
                  {clientData.profile.full_name[0]}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{clientData.profile.full_name}</h3>
                  <p className="text-white/50">{clientData.profile.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-white/50">Téléphone</p>
                  <p className="font-semibold text-white">{clientData.profile.phone || "—"}</p>
                </div>
                <div>
                  <p className="text-sm text-white/50">Style préféré</p>
                  <p className="font-semibold text-white">{clientData.profile.preferred_style || "—"}</p>
                </div>
              </div>
            </div>
          </Panel>

          <Panel title="Actions rapides" subtitle="Gérer vos rendez-vous">
            <div className="grid gap-3">
              <Link to="/client/book" className="rounded-2xl bg-[#c8a96b] px-4 py-3 font-semibold text-black transition hover:opacity-90">
                Prendre rendez-vous
              </Link>
              <Link to="/client/appointments" className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white transition hover:bg-white/10">
                Mes rendez-vous
              </Link>
              <Link to="/client/profile" className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white transition hover:bg-white/10">
                Modifier mon profil
              </Link>
            </div>
          </Panel>
        </section>
      </div>
    );
  }

  return <div className="text-white">Rôle non reconnu</div>;
}
