interface CancelStatusModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (status: "cancelled" | "absent") => void;
  loading?: boolean;
}

export default function CancelStatusModal({
  open,
  onClose,
  onSelect,
  loading = false,
}: CancelStatusModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-sm rounded-[32px] border border-white/10 bg-[#111114] p-6 shadow-2xl backdrop-blur-xl">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">Annuler le rendez-vous</h2>
            <p className="mt-2 text-sm text-white/60">
              Choisissez le motif de l'annulation avant d'appliquer le statut.
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

        <div className="space-y-3">
          <button
            type="button"
            disabled={loading}
            onClick={() => onSelect("cancelled")}
            className="w-full rounded-2xl bg-red-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Annulation…" : "Annulé"}
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={() => onSelect("absent")}
            className="w-full rounded-2xl bg-gray-800 px-4 py-3 text-sm font-semibold text-white transition hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Enregistrement…" : "Absent"}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
}
