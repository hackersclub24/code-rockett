"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";

type Dashboard = {
  enrolled_courses: { id: string; name: string; description: string | null; level: string | null; approved_at: string | null }[];
  upcoming_classes: { id: string; title: string; course_name?: string | null; scheduled_at: string; meeting_link: string }[];
  attendance: { present: number; total_marked: number; percent: number };
  pending_assignments: { link_id: string; assignment_id: string; title: string | null; due_date: string | null }[];
};

export default function DashboardPage() {
  const [data, setData] = useState<Dashboard | null>(null);

  useEffect(() => {
    void (async () => {
      const { data: d } = await api.get<Dashboard>("/students/dashboard");
      setData(d);
    })();
  }, []);

  if (!data) {
    return <p className="text-slate-400">Loading dashboard…</p>;
  }

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-display text-3xl font-semibold text-white">Dashboard</h1>
        <p className="mt-2 text-slate-400">Your enrolled courses, upcoming sessions, attendance snapshot, and open work.</p>
      </div>

      <section className="glass rounded-2xl p-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">My enrolled courses</h2>
            <p className="mt-2 text-sm text-slate-500">Courses that have been approved by admin.</p>
          </div>
          <Link href="/courses" className="text-sm text-accent hover:underline">
            Browse more courses
          </Link>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.enrolled_courses.length === 0 && <p className="text-slate-500">No enrolled courses yet.</p>}
          {data.enrolled_courses.map((course) => (
            <div key={course.id} className="rounded-2xl border border-white/10 bg-ink-900/60 p-5">
              <p className="text-xs uppercase tracking-wide text-slate-500">{course.level ?? "General"}</p>
              <h3 className="mt-2 text-xl font-semibold text-white">{course.name}</h3>
              {course.description && <p className="mt-2 text-sm text-slate-300">{course.description}</p>}
              {course.approved_at && <p className="mt-3 text-xs text-slate-500">Approved {formatDate(course.approved_at)}</p>}
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="glass rounded-2xl p-6 lg:col-span-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Upcoming classes</h2>
          <ul className="mt-4 space-y-3">
            {data.upcoming_classes.length === 0 && <li className="text-slate-500">No upcoming classes.</li>}
            {data.upcoming_classes.map((c) => (
              <li key={c.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-ink-900/60 px-4 py-3">
                <div>
                  <p className="font-medium text-white">{c.title}</p>
                  {c.course_name && <p className="text-xs text-slate-500">Course: {c.course_name}</p>}
                  <p className="text-sm text-slate-400">{formatDate(c.scheduled_at)}</p>
                </div>
                <div className="flex gap-2">
                  <a
                    href={c.meeting_link}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-primary px-3 py-1.5"
                  >
                    Join
                  </a>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className="glass rounded-2xl p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Attendance</h2>
          <p className="mt-4 font-display text-4xl font-semibold text-white">{data.attendance.percent}%</p>
          <p className="mt-2 text-sm text-slate-400">
            Present {data.attendance.present} of {data.attendance.total_marked} marked sessions
          </p>
        </div>
      </section>
      <section className="glass rounded-2xl p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Pending assignments</h2>
        <ul className="mt-4 divide-y divide-white/10">
          {data.pending_assignments.length === 0 && <li className="py-3 text-slate-500">You are all caught up.</li>}
          {data.pending_assignments.map((a) => (
            <li key={a.link_id} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <div>
                <p className="font-medium text-white">{a.title ?? "Assignment"}</p>
                {a.due_date && <p className="text-sm text-slate-400">Due {formatDate(a.due_date)}</p>}
              </div>
              <Link href="/assignments" className="text-sm text-accent hover:underline">
                View
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
