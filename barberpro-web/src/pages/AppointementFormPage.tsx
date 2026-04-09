import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../api/axios";
import type { Appointment, Client, Service, User } from "../types";

const salonId = 1;

const emptyForm = {
  salon_id: salonId,
  client_id: "",
  barber_id: "",
  service_id: "",
  appointment_date: "",
  start_time: "",
  end_time: "",
  status: "En attente",
  total_price: 0,
  notes: "",
  source: "admin",
};

function addMinutesToTime(time: string, minutesToAdd: number) {
  if (!time) return "";

  const [hours, minutes] = time.split(":").map(Number);
  const total = hours * 60 + minutes + minutesToAdd;
  const newHours = Math.floor(total / 60) % 24;
  const newMinutes = total % 60;

  return `${String(newHours).padStart(2, "0")}:${String(newMinutes).padStart(2, "0")}`;
}

export default function AppointmentFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState(emptyForm);
  const [clients, setClients] = useState<Client[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [barbers, setBarbers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState("");


  useEffect(() => {
    Promise.all([
      api.get<Client[]>(`/clients?salon_id=${salonId}`),
      api.get<Service[]>(`/services?salon_id=${salonId}`),
      api.get<User[]>("/barbers"),
    ])
      .then(async ([clientsRes, servicesRes, barbersRes]) => {
        setClients(clientsRes.data);
        setServices(servicesRes.data);
        setBarbers(barbersRes.data);

        if (isEdit) {
          const appointmentRes = await api.get<Appointment>(`/appointments/${id}`);
          const appointment = appointmentRes.data;

          setForm({
            salon_id: appointment.salon_id,
            client_id: String(appointment.client_id),
            barber_id: String(appointment.barber_id),
            service_id: String(appointment.service_id),
            appointment_date: appointment.appointment_date,
            start_time: appointment.start_time.slice(0, 5),
            end_time: appointment.end_time.slice(0, 5),
            status: appointment.status,
            total_price: Number(appointment.total_price),
            notes: appointment.notes || "",
            source: appointment.source,
          });
        }
      })
      .catch(() => setError("Impossible de charger les données des rendez-vous."))
      .finally(() => setPageLoading(false));
  }, [id, isEdit]);

  const selectedService = useMemo(
    () => services.find((service) => service.id === Number(form.service_id)),
    [services, form.service_id]
  );

  useEffect(() => {
    if (!selectedService) return;

    setForm((prev) => ({
      ...prev,
      total_price: Number(selectedService.price),
      end_time: prev.start_time
        ? addMinutesToTime(prev.start_time, selectedService.duration_minutes)
        : prev.end_time,
    }));
  }, [selectedService]);

  useEffect(() => {
    if (!form.start_time || !selectedService) return;

    setForm((prev) => ({
      ...prev,
      end_time: addMinutesToTime(prev.start_time, selectedService.duration_minutes),
    }));
  }, [form.start_time, selectedService]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]:
        ["salon_id", "client_id", "barber_id", "service_id", "total_price"].includes(name)
          ? value === ""
            ? ""
            : Number(value)
          : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const payload = {
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
    };

    try {
      if (isEdit) {
        await api.put(`/appointments/${id}`, payload);
      } else {
        await api.post("/appointments", payload);
      }

      navigate("/appointments");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Échec de l’enregistrement du rendez-vous.");
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return <div className="text-white">Chargement du rendez-vous…</div>;
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          {isEdit ? "Modifier le rendez-vous" : "Prendre un rendez-vous"}
        </h1>
        <p className="mt-2 text-white/60">Gérer les rendez-vous du salon de coiffure</p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-3xl border border-white/10 bg-white/5 p-6"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm">Client</label>
            <select
              name="client_id"
              value={form.client_id}
              onChange={handleChange}
              className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 outline-none"
              required
            >
              <option value="">Sélectionner un client</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.full_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm">Barbier</label>
            <select
              name="barber_id"
              value={form.barber_id}
              onChange={handleChange}
              className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 outline-none"
              required
            >
              <option value="">Sélectionner un barbier</option>
              {barbers.map((barber) => (
                <option key={barber.id} value={barber.id}>
                  {barber.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm">Service</label>
          <select
            name="service_id"
            value={form.service_id}
            onChange={handleChange}
            className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 outline-none"
            required
          >
            <option value="">Sélectionner un service</option>
            {services.map((service) => (
              <option key={service.id} value={service.id}>
                {service.name} — {service.price} Euro
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="mb-2 block text-sm">Date</label>
            <input
              name="appointment_date"
              type="date"
              value={form.appointment_date}
              onChange={handleChange}
              className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 outline-none"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm">Heure de début</label>
            <input
              name="start_time"
              type="time"
              value={form.start_time}
              onChange={handleChange}
              className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 outline-none"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm">Heure de fin</label>
            <input
              name="end_time"
              type="time"
              value={form.end_time}
              onChange={handleChange}
              className="w-full rounded-xl border border-white/10 bg-black/10 px-4 py-3 outline-none"
              required
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm">Statut</label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 outline-none"
            >
              <option value="pending">En attente</option>
              <option value="confirmed">Confirmé</option>
              <option value="completed">Terminé</option>
              <option value="cancelled">Annulé</option>
              <option value="no_show">Absence</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm">Prix total</label>
            <input
              name="total_price"
              type="number"
              min={0}
              step="0.01"
              value={form.total_price}
              onChange={handleChange}
              className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 outline-none"
              required
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm">Notes</label>
          <textarea
            name="notes"
            value={form.notes}
            onChange={handleChange}
            className="min-h-[120px] w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 outline-none"
            placeholder="Détails supplémentaires sur cette réservation…"
          />
        </div>

        {error ? <p className="text-red-400">{error}</p> : null}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-[#c8a96b] px-5 py-3 font-semibold text-black"
          >
            {loading
              ? "Enregistrement…"
              : isEdit
              ? "Mettre à jour le rendez-vous"
              : "Prendre un rendez-vous"}
          </button>

          <button
            type="button"
            onClick={() => navigate("/appointments")}
            className="rounded-xl border border-white/10 bg-white/5 px-5 py-3"
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
}