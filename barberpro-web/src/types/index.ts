export type UserRole = "super_admin" | "admin" | "barber" | "receptionist" | "client";



export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  role: "super_admin" | "admin" | "barber" | "receptionist" | "client";
  avatar?: string | null;
  is_active: boolean;
  created_at?: string;
}

export interface Client {
  id: number;
  user_id?: number | null;
  salon_id: number;
  full_name: string;
  phone: string;
  email?: string | null;
  avatar?: string | null;
  birth_date?: string | null;
  preferred_barber_id?: number | null;
  preferred_style?: string | null;
  notes?: string | null;
  loyalty_points: number;
}

export interface Service {
  id: number;
  salon_id: number;
  name: string;
  slug: string;
  description?: string | null;
  category: "haircut" | "beard" | "combo" | "care" | "vip";
  duration_minutes: number;
  price: string;
  image?: string | null;
  is_active: boolean;
}

export interface Appointment {
  id: number;
  salon_id: number;
  client_id: number;
  barber_id: number;
  service_id: number;
  appointment_date: string;
  start_time: string;
  end_time: string;
  status: "pending" | "confirmed" | "completed" | "cancelled" | "no_show";
  total_price: string;
  notes?: string | null;
  source: "app" | "walk_in" | "phone" | "admin";
  client?: Client;
  barber?: User;
  service?: Service;
}

export interface DashboardOverview {
  appointments_today: number;
  revenue_today: number;
  clients_count: number;
  services_count: number;
  recent_appointments: Appointment[];
  recent_clients: Client[];
}