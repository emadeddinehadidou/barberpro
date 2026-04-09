import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/axios";
import { useAuthStore } from "../app/store";
import type { Client, Service, User } from "../types";

const salonId = 1;

function addMinutesToTime(time: string, minutesToAdd: number) {
  if (!time) return "";

  const [hours, minutes] = time.split(":").map(Number);
  const total = hours * 60 + minutes + minutesToAdd;
  const newHours = Math.floor(total / 60) % 24;
  const newMinutes = total % 60;

  return `${String(newHours).padStart(2, "0")}:${String(newMinutes).padStart(2, "0")}`;
}

export default function ClientBookAppointmentPage() {
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();

  const [client, setClient] = useState<Client | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [barbers, setBarbers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    service_id: "",
    barber_id: "",
    appointment_date: "",
    start_time: "",
    end_time: "",
    total_price: 0,
    notes: "",
  });

  useEffect(() => {
    if (!user) return;

    Promise.all([
      api.get<Client[]>("/clients?salon_id=1"),
      api.get<Service[]>(`/services?salon_id=${salonId}`),
      api.get<User[]>("/barbers"),
    ])
      .then(([clientsRes, servicesRes, barbersRes]) => {
        const foundClient =
          clientsRes.data.find((item) => item.user_id === user.id) || null;

        setClient(foundClient);
        setServices(servicesRes.data);
        setBarbers(barbersRes.data);
      })
      .catch(() => setError("Échec du chargement des données de réservation."))
      .finally(() => setPageLoading(false));
  }, [user]);

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
        ["service_id", "barber_id", "total_price"].includes(name)
          ? value === ""
            ? ""
            : Number(value)
          : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!client) return;

    setLoading(true);
    setError("");

    const payload = {
      salon_id: salonId,
      client_id: client.id,
      barber_id: Number(form.barber_id),
      service_id: Number(form.service_id),
      appointment_date: form.appointment_date,
      start_time: `${form.start_time}:00`,
      end_time: `${form.end_time}:00`,
      status: "pending",
      total_price: Number(form.total_price),
      notes: form.notes || null,
      source: "app",
    };

    try {
      await api.post("/appointments", payload);
      navigate("/client/appointments");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Échec de la réservation du rendez-vous.");
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return <div className="text-white">Chargement de la page de réservation…</div>;
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Prendre rendez-vous</h1>
        <p className="mt-2 text-white/60">
          Choisissez votre service, votre barbier et votre créneau horaire
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-3xl border border-white/10 bg-white/5 p-6"
      >
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
                {service.name} — {Number(service.price).toLocaleString("fr-FR", {
                  style: "currency",
                  currency: "EUR",
                })}
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

        <div>
          <label className="mb-2 block text-sm">Notes</label>
          <textarea
            name="notes"
            value={form.notes}
            onChange={handleChange}
            className="min-h-[120px] w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 outline-none"
            placeholder="Add a note for your appointment..."
          />
        </div>

        {error ? <p className="text-red-400">{error}</p> : null}

        <div className="flex items-center justify-between">
          <p className="text-lg font-semibold text-[#c8a96b]">
            {Number(form.total_price).toLocaleString("fr-FR", {
              style: "currency",
              currency: "EUR",
            })}
          </p>

          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-[#c8a96b] px-5 py-3 font-semibold text-black"
          >
            {loading ? "Réservation en cours…" : "Confirmer le rendez-vous"}
          </button>
        </div>
      </form>
    </div>
  );
}