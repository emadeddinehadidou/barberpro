import type { ReactNode } from "react";

type PanelProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
};

export default function Panel({ title, subtitle, children }: PanelProps) {
  return (
    <div className="rounded-3xl border border-[#e2d5c2] bg-white/80 p-6 shadow-[0_18px_50px_rgba(114,84,48,0.1)] backdrop-blur-sm">
      <div className="mb-5">
        <h2 className="text-xl font-semibold text-[#2b2116]">{title}</h2>
        {subtitle ? <p className="mt-1 text-sm text-[#7b6b58]">{subtitle}</p> : null}
      </div>

      {children}
    </div>
  );
}
