interface RoadmapStepProps {
  phase: string;
  title: string;
  description: string;
}

export default function RoadmapStep({ phase, title, description }: RoadmapStepProps) {
  return (
    <div className="relative rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-6 sm:p-7 backdrop-blur-xl" data-reveal>
      <p className="text-xs uppercase tracking-[0.16em] text-[var(--secondary)] font-semibold mb-3">{phase}</p>
      <h3 className="text-xl sm:text-2xl font-semibold tracking-[-0.02em] text-[var(--foreground)] mb-3">{title}</h3>
      <p className="text-[var(--muted)] leading-7">{description}</p>
    </div>
  );
}
