interface SectionHeaderProps {
  title: string;
  subtitle?: string;
}

export function SectionHeader({ title, subtitle }: SectionHeaderProps) {
  return (
    <div className="mb-8 flex flex-col gap-2">
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-indigo-600">Explore</p>
      <h2 className="text-3xl font-semibold text-slate-900">{title}</h2>
      {subtitle ? <p className="max-w-2xl text-slate-500">{subtitle}</p> : null}
    </div>
  );
}
