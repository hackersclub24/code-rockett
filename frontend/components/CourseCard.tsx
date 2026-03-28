import Link from "next/link";
import type { CSSProperties } from "react";
import { ArrowRight, BookOpen } from "lucide-react";

interface CourseCardProps {
  id: number;
  title: string;
  description: string;
  isEnrolled?: boolean;
  revealDelay?: number;
}

export default function CourseCard({ id, title, description, isEnrolled, revealDelay = 0 }: CourseCardProps) {
  return (
    <div
      className="edu-glass premium-card rounded-3xl p-7 border border-[var(--line)] shadow-[0_12px_30px_rgba(16,24,40,0.06)] transition-all duration-300 flex flex-col h-full group hover:-translate-y-1"
      data-reveal
      style={{ "--reveal-delay": revealDelay } as CSSProperties}
    >
      <div className="w-14 h-14 bg-[var(--brand-soft)] text-[var(--brand)] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
        <BookOpen className="w-6 h-6" />
      </div>
      
      <p className="text-xs tracking-[0.12em] uppercase font-semibold text-[var(--muted)] mb-2">Teaching Track</p>
      <h3 className="heading-md section-title mb-3">{title}</h3>
      <p className="section-subtitle text-[0.98rem] mb-8 flex-grow">
        {description}
      </p>
      
      <Link
        href={isEnrolled ? `/course/${id}` : `/course/${id}`}
        className="w-full flex items-center justify-center space-x-2 py-4 px-4 rounded-xl font-bold transition-all duration-300 border border-[var(--line)] text-[var(--foreground)] hover:bg-[var(--brand-soft)] hover:text-[var(--brand)] active:scale-[0.98]"
      >
        <span>{isEnrolled ? "Continue Course" : "View Syllabus"}</span>
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}
