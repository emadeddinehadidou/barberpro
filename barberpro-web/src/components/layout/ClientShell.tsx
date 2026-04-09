import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { api } from "../../api/axios";
import { useAuthStore } from "../../app/store";

const links = [
  { to: "/client/profile", label: "Profil" },
  { to: "/client/appointments", label: "Mes rendez-vous" },
  { to: "/client/book", label: "Prendre rendez-vous" },
];

export default function ClientShell() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

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
    <div className="min-h-screen bg-transparent text-white">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[280px_1fr]">
        <aside className="border-r border-white/10 bg-[#111114]/90 p-6 backdrop-blur-md">
          <Link
            to="/client/profile"
            className="mb-8 block text-3xl font-bold tracking-tight text-[#c8a96b]"
          >
            Barber 23
          </Link>

          <div className="mb-6 rounded-3xl border border-white/10 bg-white/5 p-4">
            <p className="text-sm text-white/45">Espace Client </p>
            <p className="mt-2 text-lg font-semibold text-[#c8a96b]">
              {user?.name}
            </p>
            <p className="text-sm text-white/55">{user?.email}</p>
          </div>

          <nav className="space-y-2">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `block rounded-2xl px-4 py-3 transition ${
                    isActive
                      ? "bg-[#c8a96b] text-black shadow-lg"
                      : "bg-white/5 text-white hover:bg-white/10"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <button
            onClick={handleLogout}
            className="mt-8 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left transition hover:bg-white/10"
          >
            Déconnexion
          </button>
        </aside>

        <main className="p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}