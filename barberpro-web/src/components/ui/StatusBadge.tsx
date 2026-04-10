import type { AppointmentStatus } from '../../types/index';

interface StatusBadgeProps {
  status: AppointmentStatus;
  className?: string;
}

const statusConfig = {
  pending: {
    label: 'En attente',
    className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  },
  confirmed: {
    label: 'Confirmé',
    className: 'bg-blue-100 text-blue-800 border-blue-200',
  },
  completed: {
    label: 'Terminé',
    className: 'bg-green-100 text-green-800 border-green-200',
  },
  cancelled: {
    label: 'Annulé',
    className: 'bg-red-100 text-red-800 border-red-200',
  },
  absent: {
    label: 'Absent',
    className: 'bg-gray-100 text-gray-800 border-gray-200',
  },
  no_show: {
    label: 'Absent',
    className: 'bg-gray-100 text-gray-800 border-gray-200',
  },
};

export default function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const config = statusConfig[status as keyof typeof statusConfig];

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold tracking-[0.01em] ${config.className} ${className}`}
    >
      {config.label}
    </span>
  );
}
