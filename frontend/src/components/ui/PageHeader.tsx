import type { ReactNode } from "react";

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <header className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
      <div>
        <p className="mb-2 text-xs uppercase tracking-[0.32em] text-cyan-200/70">Mystic Japan</p>
        <h1 className="text-3xl font-semibold text-white text-glow md:text-5xl">{title}</h1>
        {subtitle ? <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-200/78">{subtitle}</p> : null}
      </div>
      {action}
    </header>
  );
}
