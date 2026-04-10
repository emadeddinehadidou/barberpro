import ClientForm from "./ClientForm";
import type { Client, ClientFormData } from "../../types";

interface ClientModalProps {
  open: boolean;
  onClose: () => void;
  client?: Client | null;
  onSubmit: (data: ClientFormData) => void;
  loading: boolean;
}

export default function ClientModal({ open, onClose, client, onSubmit, loading }: ClientModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-2xl rounded-[32px] border border-white/10 bg-[#111114] p-6 shadow-2xl backdrop-blur-xl max-h-[90vh] overflow-y-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">
              {client ? "Modifier le client" : "Nouveau client"}
            </h2>
            <p className="mt-2 text-sm text-white/60">
              {client ? "Modifiez les informations du client." : "Ajoutez un nouveau client au salon."}
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

        <ClientForm client={client} onSubmit={onSubmit} onCancel={onClose} loading={loading} />
      </div>
    </div>
  );
}