import { createBrowserRouter, Navigate } from "react-router-dom";
import ProtectedRoute from "../components/auth/ProtectedRoute";
import AppShell from "../components/layout/AppShell";
import ClientShell from "../components/layout/ClientShell";
import AppointmentFormPage from "../pages/AppointementFormPage";
import AppointmentsPage from "../pages/AppointmentsPage";
import BarberFormPage from "../pages/BarberFormPage";
import BarbersPage from "../pages/BarbersPage";
import ClientAppointmentsPage from "../pages/ClientAppointmentsPage";
import ClientBookAppointmentPage from "../pages/ClientBookAppointmentPage";
import ClientFormPage from "../pages/ClientFormPage";
import ClientProfilePage from "../pages/ClientProfilePage";
import ClientRegisterPage from "../pages/ClientRegisterPage";
import ClientsPage from "../pages/ClientsPage";
import DashboardPage from "../pages/DashboardPage";
import LoginPage from "../pages/LoginPage";
import PlanningPage from "../pages/PlanningPage";
import ServiceFormPage from "../pages/ServiceFormPage";
import ServicesPage from "../pages/ServicesPage";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/client/register",
    element: <ClientRegisterPage />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: "/",
        element: <AppShell />,
        children: [
          { index: true, element: <Navigate to="/dashboard" replace /> },
          { path: "dashboard", element: <DashboardPage /> },
          { path: "planning", element: <PlanningPage /> },

          { path: "services", element: <ServicesPage /> },
          { path: "services/create", element: <ServiceFormPage /> },
          { path: "services/:id/edit", element: <ServiceFormPage /> },

          { path: "clients", element: <ClientsPage /> },
          { path: "clients/create", element: <ClientFormPage /> },
          { path: "clients/:id/edit", element: <ClientFormPage /> },

          { path: "appointments", element: <AppointmentsPage /> },
          { path: "appointments/create", element: <AppointmentFormPage /> },
          { path: "appointments/:id/edit", element: <AppointmentFormPage /> },

          { path: "barbers", element: <BarbersPage /> },
          { path: "barbers/create", element: <BarberFormPage /> },
          { path: "barbers/:id/edit", element: <BarberFormPage /> },
        ],
      },
      {
        path: "/client",
        element: <ClientShell />,
        children: [
          { index: true, element: <Navigate to="/client/profile" replace /> },
          { path: "profile", element: <ClientProfilePage /> },
          { path: "appointments", element: <ClientAppointmentsPage /> },
          { path: "book", element: <ClientBookAppointmentPage /> },
        ],
      },
    ],
  },
]);