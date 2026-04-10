import AppointmentForm from "./AppointmentForm";
import type { Appointment } from "../../types";

interface AppointmentModalProps {
  open: boolean;
  onClose: () => void;
  appointment?: Appointment | null;
  onSubmit: (data: any) => void;
  loading: boolean;
}

export default function AppointmentModal({ open, onClose, appointment, onSubmit, loading }: AppointmentModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-4xl rounded-[32px] border border-white/10 bg-[#111114] p-6 shadow-2xl backdrop-blur-xl max-h-[90vh] overflow-y-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">
              {appointment ? "Modifier le rendez-vous" : "Nouveau rendez-vous"}
            </h2>
            <p className="mt-2 text-sm text-white/60">
              {appointment ? "Modifiez les informations du rendez-vous." : "Ajoutez un nouveau rendez-vous."}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/10 bg-white/5 p-2 text-white transition hover:bg-white/10"
          >
            ✕
          </button>
        </div>

        <AppointmentForm appointment={appointment} onSubmit={onSubmit} onCancel={onClose} loading={loading} />
      </div>
    </div>
  );
}