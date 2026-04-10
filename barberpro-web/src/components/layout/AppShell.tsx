import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { api } from "../../api/axios";
import { useAuthStore } from "../../app/store";
import NotificationMenu from "../ui/NotificationMenu";

const getNavigationLinks = (role: string) => {
  const adminLinks = [
    { to: "/dashboard", label: "Tableau de bord" },
    { to: "/planning", label: "Planning" },
    { to: "/barbers", label: "Coiffeurs" },
    { to: "/services", label: "Services" },
    { to: "/clients", label: "Clients" },
    { to: "/appointments", label: "Rendez-vous" },
  ];

  const barberLinks = [
    { to: "/dashboard", label: "Tableau de bord" },
    { to: "/planning", label: "Mon planning" },
    { to: "/appointments", label: "Mes rendez-vous" },
  ];

  return role === "barber" ? barberLinks : adminLinks;
};

export default function AppShell() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const links = getNavigationLinks(user?.role || "admin");

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      //
    } finally {
      logout();
      navigate("/login");
    }
  };

  return (
    <div className="luxury-light min-h-screen bg-transparent text-[#2b2116]">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[280px_1fr]">
        <aside className="border-r border-[#d8c7aa] bg-[linear-gradient(180deg,#fbf7f0_0%,#f2e8d9_100%)] p-6 shadow-[inset_-1px_0_0_rgba(103,73,41,0.08)]">
          <Link
            to="/dashboard"
            className="mb-8 block text-3xl font-bold tracking-tight text-[#8a6a3c]"
          >
            Barber 23
          </Link>

          <div className="mb-6 rounded-3xl border border-[#e1d3bc] bg-[linear-gradient(180deg,rgba(255,255,255,0.92)_0%,rgba(250,244,234,0.88)_100%)] p-4 shadow-[0_16px_40px_rgba(116,84,48,0.08)] backdrop-blur-sm">
            <p className="text-sm font-medium uppercase tracking-[0.14em] text-[#8f7a60]">Connecte en tant que</p>
            <p className="mt-2 text-xl font-bold tracking-tight text-[#7f6035]">{user?.name}</p>
            <p className="mt-1 text-sm text-[#6f5d47]">{user?.email}</p>
          </div>

          <nav className="space-y-2">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `block rounded-2xl px-4 py-3 transition ${
                    isActive
                      ? "bg-[#8a6a3c] text-[#fffaf2] shadow-[0_14px_28px_rgba(138,106,60,0.25)]"
                      : "bg-white/70 text-[#4b3824] hover:bg-white"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="mt-6">
            <NotificationMenu />
          </div>

          <button
            onClick={handleLogout}
            className="mt-8 w-full rounded-2xl border border-[#d8c7aa] bg-white/80 px-4 py-3 text-left text-[#4b3824] transition hover:bg-white"
          >
            Deconnexion
          </button>
        </aside>

        <main className="bg-[radial-gradient(circle_at_top_left,rgba(201,168,115,0.14),transparent_28%),linear-gradient(180deg,#fffdf9_0%,#f7efe3_100%)] p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
