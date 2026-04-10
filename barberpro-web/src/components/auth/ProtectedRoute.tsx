import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "../../app/store";

export default function ProtectedRoute() {
  const user = useAuthStore((state) => state.user);
  const authChecked = useAuthStore((state) => state.authChecked);
  const location = useLocation();

  if (!authChecked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f0e6] text-[#2d2418]">
        Loading...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  const pathname = location.pathname;

  const isClientArea =
    pathname === "/client" || pathname.startsWith("/client/");

  const isAdminArea =
    pathname === "/" ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/planning") ||
    pathname.startsWith("/services") ||
    pathname.startsWith("/clients") ||
    pathname.startsWith("/appointments") ||
    pathname.startsWith("/barbers");

  if (user.role === "client" && isAdminArea) {
    return <Navigate to="/client/dashboard" replace />;
  }

  if (user.role !== "client" && isClientArea) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
