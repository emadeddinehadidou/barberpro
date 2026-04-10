export type UserRole = "super_admin" | "admin" | "barber" | "receptionist" | "client";

export type AppointmentStatus = "pending" | "confirmed" | "completed" | "cancelled" | "absent" | "no_show";



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

export interface ClientFormData {
  id?: number;
  salon_id: number;
  full_name: string;
  phone: string;
  email: string;
  password?: string;
  birth_date: string;
  preferred_barber_id: string;
  preferred_style: string;
  notes: string;
  avatar: File | null;
  avatar_url?: string | null;
  loyalty_points?: number;
}

export interface Client {
  id: number;
  salon_id: number;
  user_id?: number | null;
  full_name: string;
  phone: string;
  email: string;
  birth_date?: string | null;
  preferred_barber_id?: number | null;
  preferred_style?: string | null;
  notes?: string | null;
  avatar?: string | null;
  avatar_url?: string | null;
  loyalty_points?: number;
  created_at?: string;
  updated_at?: string;
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
  status: "pending" | "confirmed" | "completed" | "cancelled" | "absent" | "no_show";
  total_price: string;
  notes?: string | null;
  source: "app" | "walk_in" | "phone" | "admin";
  client?: Client;
  barber?: User;
  service?: Service;
}

export interface AppNotificationData {
  title: string;
  body: string;
  event: string;
  appointment_id: number;
  status: AppointmentStatus;
  appointment_date: string;
  start_time: string;
  end_time: string;
  service_name?: string | null;
  barber_name?: string | null;
  changes?: string[];
}

export interface AppNotification {
  id: string;
  type: string;
  data: AppNotificationData;
  read_at?: string | null;
  created_at: string;
}

export interface NotificationsResponse {
  items: AppNotification[];
  unread_count: number;
}

export interface DashboardOverview {
  appointments_today: number;
  revenue_today: number;
  clients_count: number;
  services_count: number;
  recent_appointments: Appointment[];
  recent_clients: Client[];
}

// Admin Dashboard Types
export interface AdminDashboardData {
  total_clients: number;
  total_services: number;
  appointments_today: number;
  revenue_today: number;
  appointments_last_7_days: Array<{ date: string; count: number }>;
  revenue_last_7_days: Array<{ date: string; total: number }>;
  recent_appointments: Appointment[];
  recent_clients: Client[];
}

// Barber Dashboard Types
export interface BarberDashboardData {
  stats: {
    appointments_today: number;
    completed_today: number;
    upcoming_appointments: number;
    revenue_today: number;
    cancelled_today: number;
  };
  today_appointments: Appointment[];
  upcoming_appointments: Appointment[];
  weekly_performance: {
    completed: number;
    revenue: number;
    top_services: Array<{ name: string; count: number }>;
    client_return_rate: number;
  };
}

// Client Dashboard Types
export interface ClientDashboardData {
  next_appointment: Appointment | null;
  total_visits: number;
  loyalty_points: number;
  favorite_service: { name: string; count: number } | null;
  upcoming_appointments: Appointment[];
  appointment_history: Appointment[];
  profile: {
    full_name: string;
    phone: string;
    email: string;
    avatar: string | null;
    birth_date: string | null;
    preferred_style: string | null;
  };
}
