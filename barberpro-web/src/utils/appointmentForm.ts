import { DEFAULT_SALON_ID } from "../constants/app";
import type { Appointment } from "../types";

export interface AppointmentFormData {
  salon_id: number;
  client_id: string;
  barber_id: string;
  service_id: string;
  appointment_date: string;
  start_time: string;
  end_time: string;
  status: Appointment["status"];
  total_price: number;
  notes: string;
  source: Appointment["source"];
}

export const createEmptyAppointmentForm = (): AppointmentFormData => ({
  salon_id: DEFAULT_SALON_ID,
  client_id: "",
  barber_id: "",
  service_id: "",
  appointment_date: "",
  start_time: "",
  end_time: "",
  status: "pending",
  total_price: 0,
  notes: "",
  source: "admin",
});

export const mapAppointmentToForm = (
  appointment: Appointment
): AppointmentFormData => ({
  salon_id: appointment.salon_id,
  client_id: String(appointment.client_id),
  barber_id: String(appointment.barber_id),
  service_id: String(appointment.service_id),
  appointment_date: appointment.appointment_date,
  start_time: appointment.start_time.slice(0, 5),
  end_time: appointment.end_time.slice(0, 5),
  status: appointment.status === "no_show" ? "absent" : appointment.status,
  total_price: Number(appointment.total_price),
  notes: appointment.notes || "",
  source: appointment.source,
});

export function addMinutesToTime(time: string, minutesToAdd: number) {
  if (!time) return "";

  const [hours, minutes] = time.split(":").map(Number);
  const total = hours * 60 + minutes + minutesToAdd;
  const newHours = Math.floor(total / 60) % 24;
  const newMinutes = total % 60;

  return `${String(newHours).padStart(2, "0")}:${String(newMinutes).padStart(2, "0")}`;
}

export const buildAppointmentPayload = (form: AppointmentFormData) => ({
  salon_id: Number(form.salon_id),
  client_id: Number(form.client_id),
  barber_id: Number(form.barber_id),
  service_id: Number(form.service_id),
  appointment_date: form.appointment_date,
  start_time: `${form.start_time}:00`,
  end_time: `${form.end_time}:00`,
  status: form.status,
  total_price: Number(form.total_price),
  notes: form.notes || null,
  source: form.source,
});
