import type { ReactNode } from "react";

type PanelProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
};

export default function Panel({ title, subtitle, children }: PanelProps) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_10px_40px_rgba(0,0,0,0.2)]">
      <div className="mb-5">
        <h2 className="text-xl font-semibold text-white">{title}</h2>
        {subtitle ? <p className="mt-1 text-sm text-white/50">{subtitle}</p> : null}
      </div>

      {children}
    </div>
  );
}