import type { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export default function FeatureCard({ icon: Icon, title, description }: FeatureCardProps) {
  return (
    <article
      className="group rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-6 sm:p-7 backdrop-blur-xl shadow-[0_16px_50px_rgba(6,9,24,0.14)] hover:-translate-y-1.5 hover:border-[var(--secondary)]/55 transition-all duration-300"
      data-reveal
    >
      <div className="w-12 h-12 rounded-2xl bg-[var(--brand-soft)] text-[var(--secondary)] border border-[var(--line)] flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
        <Icon className="w-5 h-5" />
      </div>
      <h3 className="text-xl font-semibold tracking-[-0.02em] text-[var(--foreground)] mb-2">{title}</h3>
      <p className="text-[var(--muted)] leading-7">{description}</p>
    </article>
  );
}
