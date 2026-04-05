import { ArrowUpRight, Code2 } from "lucide-react";
import Link from "next/link";

interface ProjectCardProps {
  title: string;
  summary: string;
  stack: string[];
  accent: string;
  href?: string;
  ctaLabel?: string;
}

export default function ProjectCard({ title, summary, stack, accent, href, ctaLabel = "View Details" }: ProjectCardProps) {
  const CardBody = (
    <article
      className="group rounded-3xl border border-white/10 bg-[var(--surface-strong)]/95 overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.35)] hover:-translate-y-1.5 transition-all duration-300"
      data-reveal
    >
      <div
        className="h-40 border-b border-white/10 p-5 flex items-end justify-between"
        style={{
          background: `linear-gradient(135deg, ${accent}45 0%, rgba(15, 21, 48, 0.8) 80%)`,
        }}
      >
        <div className="w-10 h-10 rounded-xl border border-white/25 bg-white/10 flex items-center justify-center text-white">
          <Code2 className="w-5 h-5" />
        </div>
        <ArrowUpRight className="w-5 h-5 text-white/80 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
      </div>
      <div className="p-6">
        <h3 className="text-xl font-semibold text-[var(--foreground)] tracking-[-0.02em] mb-2">{title}</h3>
        <p className="text-[var(--muted)] leading-7 mb-5">{summary}</p>
        <div className="flex flex-wrap gap-2 mb-5">
          {stack.map((item) => (
            <span
              key={item}
              className="text-xs px-3 py-1.5 rounded-full border border-white/20 bg-white/5 text-[var(--foreground)]/90"
            >
              {item}
            </span>
          ))}
        </div>
        {href ? (
          <span className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--secondary)]">
            {ctaLabel}
            <ArrowUpRight className="w-4 h-4" />
          </span>
        ) : null}
      </div>
    </article>
  );

  if (!href) {
    return CardBody;
  }

  return (
    <Link href={href} className="block">
      {CardBody}
    </Link>
  );
}
