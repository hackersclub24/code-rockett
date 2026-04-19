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
    <div className="relative overflow-hidden px-6 py-16 sm:px-10">
      <div className="mx-auto min-h-[calc(100vh-8rem)] max-w-6xl">
        <div className="panel relative overflow-hidden rounded-3xl px-7 py-10 sm:px-12 sm:py-14">
          <div className="pointer-events-none absolute -right-14 -top-20 h-52 w-52 rounded-full border border-white/15 bg-accent/25 blur-2xl" />
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.24em] text-accent">Coding Rocket</p>
          <h1 className="max-w-4xl font-display text-4xl font-semibold leading-tight text-white sm:text-6xl">
            Build software that works in the real world, not just in tutorials.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-slate-300">
            Live classes, practical assignments, and visible progress tracking so students and instructors can focus on
            steady outcomes.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link href="/login" className="btn-primary rounded-xl px-7 py-3">
              Log in to enroll
            </Link>
            <Link href="/courses" className="btn-secondary rounded-xl px-7 py-3">
              Browse catalog
            </Link>
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {[
            { t: "Direct onboarding", d: "Account creation is short, clear, and ready for immediate course browsing." },
            { t: "Classroom structure", d: "Course flows include attendance, assignments, and admin approvals." },
            { t: "Progress visibility", d: "Students and staff both get transparent updates on learning status." },
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
              <p className="mt-2 text-sm text-slate-400">Preview what is available first, then request enrollment after login.</p>
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
