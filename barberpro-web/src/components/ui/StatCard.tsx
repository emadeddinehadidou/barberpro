type StatCardProps = {
  title: string;
  value: string | number;
  subtitle?: string;
};

export default function StatCard({ title, value, subtitle }: StatCardProps) {
  return (
    <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/8 to-white/4 p-5 shadow-[0_10px_40px_rgba(0,0,0,0.25)] backdrop-blur-sm">
      <p className="text-sm text-white/55">{title}</p>
      <h3 className="mt-3 text-3xl font-bold tracking-tight text-[#c8a96b]">
        {value}
      </h3>
      {subtitle ? <p className="mt-2 text-sm text-white/45">{subtitle}</p> : null}
    </div>
  );
}