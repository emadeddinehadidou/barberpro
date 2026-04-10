type StatCardProps = {
  title: string;
  value: string | number;
  subtitle?: string;
};

export default function StatCard({ title, value, subtitle }: StatCardProps) {
  return (
    <div className="rounded-3xl border border-[#e2d5c2] bg-[linear-gradient(180deg,#fffdfa_0%,#f7efe4_100%)] p-5 shadow-[0_16px_40px_rgba(114,84,48,0.1)]">
      <p className="text-sm text-[#7b6b58]">{title}</p>
      <h3 className="mt-3 text-3xl font-bold tracking-tight text-[#8a6a3c]">
        {value}
      </h3>
      {subtitle ? <p className="mt-2 text-sm text-[#8b7a64]">{subtitle}</p> : null}
    </div>
  );
}
