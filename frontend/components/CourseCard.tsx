import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";

interface CourseCardProps {
  id: number;
  title: string;
  description: string;
  isEnrolled?: boolean;
}

export default function CourseCard({ id, title, description, isEnrolled }: CourseCardProps) {
  return (
    <div className="bg-white dark:bg-zinc-900/80 backdrop-blur-sm rounded-3xl p-8 border border-zinc-200 dark:border-zinc-800 hover:shadow-2xl hover:shadow-indigo-500/5 dark:hover:shadow-indigo-500/10 transition-all duration-300 flex flex-col h-full group hover:-translate-y-1">
      <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
        <BookOpen className="w-6 h-6" />
      </div>
      
      <h3 className="text-2xl font-extrabold text-zinc-900 dark:text-white mb-3">{title}</h3>
      <p className="text-zinc-600 dark:text-zinc-400 mb-8 flex-grow leading-relaxed">
        {description}
      </p>
      
      <Link
        href={isEnrolled ? `/course/${id}` : `/course/${id}`}
        className="w-full flex items-center justify-center space-x-2 py-4 px-4 rounded-xl font-bold transition-all duration-300 border
          hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:text-indigo-700 dark:hover:text-indigo-300 hover:border-indigo-200 dark:hover:border-indigo-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 active:scale-[0.98]"
      >
        <span>{isEnrolled ? "Go to Course" : "View Details"}</span>
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}
