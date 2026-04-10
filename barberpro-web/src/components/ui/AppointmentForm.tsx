import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { api } from "../../api/axios";
import { DEFAULT_SALON_ID } from "../../constants/app";
import type { Appointment, Client, Service, User } from "../../types";
import {
  addMinutesToTime,
  createEmptyAppointmentForm,
  mapAppointmentToForm,
  type AppointmentFormData,
} from "../../utils/appointmentForm";

interface AppointmentFormProps {
  appointment?: Appointment | null;
  onSubmit: (data: AppointmentFormData) => void;
  onCancel: () => void;
  loading: boolean;
}

export default function AppointmentForm({
  appointment,
  onSubmit,
  onCancel,
  loading,
}: AppointmentFormProps) {
  const [form, setForm] = useState<AppointmentFormData>(() => createEmptyAppointmentForm());
  const [clients, setClients] = useState<Client[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [barbers, setBarbers] = useState<User[]>([]);
  const [optionsLoading, setOptionsLoading] = useState(true);
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});

  useEffect(() => {
    setOptionsLoading(true);

    Promise.all([
      api.get<Client[]>(`/clients?salon_id=${DEFAULT_SALON_ID}`),
      api.get<Service[]>(`/services?salon_id=${DEFAULT_SALON_ID}`),
      api.get<User[]>("/barbers"),
    ])
      .then(([clientsRes, servicesRes, barbersRes]) => {
        setClients(clientsRes.data);
        setServices(servicesRes.data);
        setBarbers(barbersRes.data);
      })
      .catch(() => {
        setClients([]);
        setServices([]);
        setBarbers([]);
      })
      .finally(() => setOptionsLoading(false));
  }, []);

  useEffect(() => {
    setForm(appointment ? mapAppointmentToForm(appointment) : createEmptyAppointmentForm());
    setValidationErrors({});
  }, [appointment]);

  const selectedService = useMemo(
    () => services.find((service) => service.id === Number(form.service_id)),
    [services, form.service_id]
  );

  useEffect(() => {
    if (!selectedService) {
      return;
    }

    setForm((prev) => {
      const nextEndTime = prev.start_time
        ? addMinutesToTime(prev.start_time, selectedService.duration_minutes)
        : prev.end_time;

      return {
        ...prev,
        total_price: Number(selectedService.price),
        end_time: nextEndTime,
      };
    });
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
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: name === "total_price" ? Number(value) : value,
    }));

    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: [] }));
    }
  };

  const validateForm = () => {
    const errors: Record<string, string[]> = {};

    if (!form.client_id) {
      errors.client_id = ["Le client est requis"];
    }

    if (!form.barber_id) {
      errors.barber_id = ["Le barbier est requis"];
    }

    if (!form.service_id) {
      errors.service_id = ["Le service est requis"];
    }

    if (!form.appointment_date) {
      errors.appointment_date = ["La date est requise"];
    }

    if (!form.start_time) {
      errors.start_time = ["L'heure de debut est requise"];
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    onSubmit(form);
  };

  if (optionsLoading) {
    return <div className="text-white">Chargement des options...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-white">Client *</label>
          <select
            name="client_id"
            value={form.client_id}
            onChange={handleChange}
            className="mt-1 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-[#c8a96b]/50"
          >
            <option value="">Selectionnez un client</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.full_name}
              </option>
            ))}
          </select>
          {validationErrors.client_id && (
            <p className="mt-1 text-sm text-red-400">{validationErrors.client_id[0]}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-white">Barbier *</label>
          <select
            name="barber_id"
            value={form.barber_id}
            onChange={handleChange}
            className="mt-1 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-[#c8a96b]/50"
          >
            <option value="">Selectionnez un barbier</option>
            {barbers.map((barber) => (
              <option key={barber.id} value={barber.id}>
                {barber.name}
              </option>
            ))}
          </select>
          {validationErrors.barber_id && (
            <p className="mt-1 text-sm text-red-400">{validationErrors.barber_id[0]}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-white">Service *</label>
          <select
            name="service_id"
            value={form.service_id}
            onChange={handleChange}
            className="mt-1 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-[#c8a96b]/50"
          >
            <option value="">Selectionnez un service</option>
            {services.map((service) => (
              <option key={service.id} value={service.id}>
                {service.name}
              </option>
            ))}
          </select>
          {validationErrors.service_id && (
            <p className="mt-1 text-sm text-red-400">{validationErrors.service_id[0]}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-white">Date *</label>
          <input
            name="appointment_date"
            type="date"
            value={form.appointment_date}
            onChange={handleChange}
            className="mt-1 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-[#c8a96b]/50"
          />
          {validationErrors.appointment_date && (
            <p className="mt-1 text-sm text-red-400">{validationErrors.appointment_date[0]}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-white">Heure de debut *</label>
          <input
            name="start_time"
            type="time"
            value={form.start_time}
            onChange={handleChange}
            className="mt-1 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-[#c8a96b]/50"
          />
          {validationErrors.start_time && (
            <p className="mt-1 text-sm text-red-400">{validationErrors.start_time[0]}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-white">Heure de fin</label>
          <input
            name="end_time"
            type="time"
            value={form.end_time}
            onChange={handleChange}
            className="mt-1 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-[#c8a96b]/50"
            readOnly
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-white">Prix total</label>
          <input
            name="total_price"
            type="number"
            min={0}
            step="0.01"
            value={form.total_price}
            onChange={handleChange}
            className="mt-1 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-[#c8a96b]/50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white">Statut</label>
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="mt-1 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-[#c8a96b]/50"
          >
            <option value="pending">En attente</option>
            <option value="confirmed">Confirme</option>
            <option value="completed">Termine</option>
            <option value="cancelled">Annule</option>
            <option value="absent">Absent</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-white">Notes</label>
        <textarea
          name="notes"
          value={form.notes}
          onChange={handleChange}
          rows={3}
          className="mt-1 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/35 outline-none transition focus:border-[#c8a96b]/50"
          placeholder="Notes supplementaires"
        />
      </div>

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 rounded-2xl bg-[#c8a96b] px-4 py-3 font-semibold text-black transition hover:bg-[#b8955a] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Sauvegarde..." : appointment ? "Mettre a jour" : "Creer"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 font-semibold text-white transition hover:bg-white/10"
        >
          Annuler
        </button>
      </div>
    </form>
  );
}
