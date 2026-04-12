"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { api } from "@/lib/api";
import type { CourseItem } from "@/types";

export default function LandingPage() {
  const [courses, setCourses] = useState<CourseItem[] | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const { data } = await api.get<CourseItem[]>("/courses/catalog");
        setCourses(data);
      } catch {
        setCourses([]);
      }
    })();
  }, []);

  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-accent/25 via-transparent to-transparent" />
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col justify-center px-6 py-20">
        <p className="mb-3 text-sm font-medium uppercase tracking-widest text-accent">Coding Rocket</p>
        <h1 className="font-display text-4xl font-semibold leading-tight text-white sm:text-5xl">
          Learn to ship real software with live classes and guided practice.
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-slate-300">
          Register once, browse the course catalog, and request enrollment with clear progression and feedback from
          your instructor.
        </p>
        <div className="mt-10 flex flex-wrap gap-4">
          <Link href="/login" className="btn-primary rounded-xl px-6 py-3">
            Log in to enroll
          </Link>
        </div>
        <div className="mt-16 grid gap-4 sm:grid-cols-3">
          {[
            { t: "Simple registration", d: "Create an account and start exploring courses right away." },
            { t: "Multiple courses", d: "Choose from a growing catalog of learning tracks." },
            { t: "Visible progress", d: "Attendance and assignment status tracked for every learner." },
          ].map((x) => (
            <div key={x.t} className="glass rounded-2xl p-5">
              <h3 className="font-medium text-white">{x.t}</h3>
              <p className="mt-2 text-sm text-slate-400">{x.d}</p>
            </div>
          ))}
        </div>
        <div className="mt-14">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="font-display text-2xl font-semibold text-white">Course catalog</h2>
              <p className="mt-2 text-sm text-slate-400">Browse the courses first. You can request enrollment after logging in.</p>
            </div>
            <Link href="/courses" className="btn-secondary">
              View all courses
            </Link>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {!courses && <p className="text-slate-400">Loading courses...</p>}
            {courses?.map((course) => (
              <div key={course.id} className="glass rounded-2xl p-5">
                <p className="text-xs uppercase tracking-wide text-slate-500">Course</p>
                <h3 className="mt-1 text-xl font-semibold text-white">{course.name}</h3>
                <p className="mt-1 text-xs text-slate-500">{course.level ?? "General"}</p>
                {course.description && <p className="mt-3 text-sm text-slate-300">{course.description}</p>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
