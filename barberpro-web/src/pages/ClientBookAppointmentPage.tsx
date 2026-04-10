import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { api } from "../api/axios";
import { DEFAULT_SALON_ID } from "../constants/app";
import type { Appointment, Client, Service, User } from "../types";
import { addMinutesToTime } from "../utils/appointmentForm";

interface ClientAppointmentLocationState {
  appointment?: Appointment;
}

export default function ClientBookAppointmentPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const preloadedAppointment =
    (location.state as ClientAppointmentLocationState | null)?.appointment ?? null;

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
    Promise.all([
      api.get<Client>("/client/profile"),
      api.get<Service[]>(`/client/services?salon_id=${DEFAULT_SALON_ID}`),
      api.get<User[]>("/client/barbers"),
      isEdit && !preloadedAppointment
        ? api.get<Appointment>(`/client/appointments/${id}`)
        : Promise.resolve({ data: preloadedAppointment }),
    ])
      .then(([clientRes, servicesRes, barbersRes, appointmentRes]) => {
        setClient(clientRes.data);
        setServices(servicesRes.data);
        setBarbers(barbersRes.data);

        const appointment = appointmentRes.data;

        if (appointment) {
          setForm({
            service_id: String(appointment.service_id),
            barber_id: String(appointment.barber_id),
            appointment_date: appointment.appointment_date,
            start_time: appointment.start_time.slice(0, 5),
            end_time: appointment.end_time.slice(0, 5),
            total_price: Number(appointment.total_price),
            notes: appointment.notes || "",
          });
        }
      })
      .catch((err: any) => {
        setError(
          err?.response?.data?.message || "Impossible de charger les donnees de reservation."
        );
      })
      .finally(() => setPageLoading(false));
  }, [id, isEdit, preloadedAppointment]);

  const selectedService = useMemo(
    () => services.find((service) => service.id === Number(form.service_id)),
    [services, form.service_id]
  );

  useEffect(() => {
    if (!selectedService) {
      return;
    }

    setForm((prev) => ({
      ...prev,
      total_price: Number(selectedService.price),
      end_time: prev.start_time
        ? addMinutesToTime(prev.start_time, selectedService.duration_minutes)
        : prev.end_time,
    }));
  }, [selectedService]);

  useEffect(() => {
    if (!form.start_time || !selectedService) {
      return;
    }

    setForm((prev) => ({
      ...prev,
      end_time: addMinutesToTime(prev.start_time, selectedService.duration_minutes),
    }));
  }, [form.start_time, selectedService]);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target;

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

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!client) {
      return;
    }

    setLoading(true);
    setError("");

    const payload = {
      salon_id: client.salon_id || DEFAULT_SALON_ID,
      client_id: client.id,
      barber_id: Number(form.barber_id),
      service_id: Number(form.service_id),
      appointment_date: form.appointment_date,
      start_time: `${form.start_time}:00`,
      end_time: `${form.end_time}:00`,
      total_price: Number(form.total_price),
      notes: form.notes || null,
      source: "app",
    };

    try {
      if (isEdit) {
        await api.put(`/client/appointments/${id}`, payload);
      } else {
        await api.post("/client/appointments", payload);
      }

      navigate("/client/appointments");
    } catch (err: any) {
      setError(
        err?.response?.data?.message || "Impossible d'enregistrer le rendez-vous."
      );
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return <div className="text-white">Chargement de la reservation...</div>;
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">
          {isEdit ? "Modifier mon rendez-vous" : "Prendre rendez-vous"}
        </h1>
        <p className="mt-2 text-white/60">
          {isEdit
            ? "Le formulaire est pre-rempli avec votre rendez-vous."
            : "Choisissez votre service, votre barbier et votre horaire."}
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
            <option value="">Selectionner un service</option>
            {services.map((service) => (
              <option key={service.id} value={service.id}>
                {service.name} -{" "}
                {Number(service.price).toLocaleString("fr-FR", {
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
            <option value="">Selectionner un barbier</option>
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
            <label className="mb-2 block text-sm">Heure de debut</label>
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
              readOnly
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
            placeholder="Ajoutez une note si besoin."
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

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => navigate("/client/appointments")}
              className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 font-semibold text-white"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-[#c8a96b] px-5 py-3 font-semibold text-black"
            >
              {loading ? "Enregistrement..." : isEdit ? "Mettre a jour" : "Confirmer"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
