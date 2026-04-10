import { DEFAULT_SALON_ID } from "../constants/app";
import type { Client, ClientFormData } from "../types";

export const createEmptyClientForm = (): ClientFormData => ({
  salon_id: DEFAULT_SALON_ID,
  full_name: "",
  phone: "",
  email: "",
  password: "",
  birth_date: "",
  preferred_barber_id: "",
  preferred_style: "",
  notes: "",
  avatar: null,
  avatar_url: null,
});

export const mapClientToForm = (client: Client): ClientFormData => ({
  id: client.id,
  salon_id: client.salon_id,
  full_name: client.full_name,
  phone: client.phone,
  email: client.email,
  password: "",
  birth_date: client.birth_date || "",
  preferred_barber_id: client.preferred_barber_id?.toString() || "",
  preferred_style: client.preferred_style || "",
  notes: client.notes || "",
  avatar: null,
  avatar_url: client.avatar_url || client.avatar || null,
  loyalty_points: client.loyalty_points,
});

export const buildClientFormData = (
  form: ClientFormData,
  method?: "PUT" | "PATCH"
) => {
  const payload = new FormData();

  if (method) {
    payload.append("_method", method);
  }

  payload.append("salon_id", String(form.salon_id));
  payload.append("full_name", form.full_name.trim());
  payload.append("phone", form.phone.trim());
  payload.append("email", form.email.trim());

  if (form.password) {
    payload.append("password", form.password);
  }

  if (form.birth_date) {
    payload.append("birth_date", form.birth_date);
  }

  if (form.preferred_barber_id) {
    payload.append("preferred_barber_id", form.preferred_barber_id);
  }

  if (form.preferred_style.trim()) {
    payload.append("preferred_style", form.preferred_style.trim());
  }

  if (form.notes.trim()) {
    payload.append("notes", form.notes.trim());
  }

  if (form.avatar) {
    payload.append("avatar", form.avatar);
  }

  return payload;
};
