"use client";

import { useEffect, useState } from "react";
import CourseCard from "@/components/CourseCard";
import api from "@/lib/api";
import { ArrowRight, Sparkles } from "lucide-react";

interface Course {
  id: number;
  title: string;
  description: string;
}

export default function LandingPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCourses() {
      try {
        const response = await api.get("/courses");
        setCourses(response.data);
      } catch (error) {
        console.error("Failed to fetch courses", error);
      } finally {
        setLoading(false);
      }
    }
    fetchCourses();
  }, []);

  return (
    <div className="flex flex-col items-center relative overflow-hidden">
      {/* Background ambient light */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] opacity-30 dark:opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 blur-[100px] rounded-full mix-blend-multiply dark:mix-blend-screen" />
      </div>

      {/* Hero Section */}
      <section className="relative w-full border-b border-zinc-200 dark:border-zinc-800 py-24 md:py-32 px-4">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center space-x-2 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20 px-5 py-2.5 rounded-full font-bold text-sm mb-8 animate-fade-in">
            <Sparkles className="w-4 h-4" />
            <span>Launch your tech career</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-zinc-900 dark:text-white tracking-tight mb-6 leading-tight">
            Accelerate your learning with <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">Code Rocket</span>
          </h1>
          <p className="text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed">
             Join the premier learning platform for college students. Access high-quality courses, attend live classes, and level up your engineering skills.
          </p>
          <a
            href="#courses"
            className="inline-flex items-center space-x-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-8 py-4 rounded-xl font-bold hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-all duration-300 hover:-translate-y-1 shadow-xl shadow-zinc-900/10 dark:shadow-white/10"
          >
            <span>Explore Courses</span>
            <ArrowRight className="w-5 h-5" />
          </a>
        </div>
      </section>

      {/* Courses Section */}
      <section id="courses" className="relative w-full max-w-7xl mx-auto py-24 px-4">
        <div className="mb-16 text-center md:text-left">
          <h2 className="text-4xl font-extrabold text-zinc-900 dark:text-white mb-4">Available Courses</h2>
          <p className="text-xl text-zinc-600 dark:text-zinc-400">Discover hand-crafted courses designed for modern developers.</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse bg-zinc-200 dark:bg-zinc-800 h-72 rounded-3xl"></div>
            ))}
          </div>
        ) : courses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course) => (
              <CourseCard
                key={course.id}
                id={course.id}
                title={course.title}
                description={course.description}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm rounded-3xl border border-zinc-200 dark:border-zinc-800">
            <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-3">No courses available yet</h3>
            <p className="text-lg text-zinc-500 dark:text-zinc-400">Check back later for new content!</p>
          </div>
        )}
      </section>
    </div>
  );
}
