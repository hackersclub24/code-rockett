import type { ReactNode } from "react";

interface SectionHeadingProps {
  kicker: string;
  title: string;
  description: string;
  align?: "left" | "center";
  action?: ReactNode;
}

export default function SectionHeading({
  kicker,
  title,
  description,
  align = "left",
  action,
}: SectionHeadingProps) {
  const center = align === "center";

  return (
    <div className={center ? "text-center max-w-3xl mx-auto" : "max-w-3xl"} data-reveal>
      <p className="text-xs sm:text-sm uppercase tracking-[0.22em] font-semibold text-[var(--secondary)] mb-3">
        {kicker}
      </p>
      <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-[var(--foreground)] leading-tight tracking-[-0.03em] mb-4">
        {title}
      </h2>
      <p className="text-[var(--muted)] text-base sm:text-lg leading-8">{description}</p>
      {action ? <div className="mt-7">{action}</div> : null}
    </div>
  );
}
