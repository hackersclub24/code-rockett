"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { api } from "@/lib/api";

type Overview = {
  registered_students: number;
  approved_students: number;
  upcoming_classes: number;
  pending_enrollments: number;
  pending_course_enrollments: number;
};

export default function AdminHomePage() {
  const [o, setO] = useState<Overview | null>(null);

  useEffect(() => {
    void (async () => {
      const { data } = await api.get<Overview>("/admin/overview");
      setO(data);
    })();
  }, []);

  if (!o) return <p className="text-slate-400">Loading…</p>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-semibold text-white">Admin dashboard</h1>
        <p className="mt-2 text-slate-400">Enrollment, classes, and assignments at a glance.</p>
        <div className="mt-4">
          <Link href="/admin/classes#create-course" className="btn-primary">
            + Create course
          </Link>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-5">
        <Link href="/admin/courses" className="glass rounded-2xl p-6 transition hover:border-accent/40">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Courses</p>
          <p className="mt-3 font-display text-xl font-semibold text-white">Manage catalog</p>
          <p className="mt-2 text-sm text-slate-500">Create and activate courses →</p>
        </Link>
        <Link href="/admin/students" className="glass rounded-2xl p-6 transition hover:border-accent/40">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Registered students</p>
          <p className="mt-3 font-display text-4xl font-semibold text-amber-300">{o.registered_students}</p>
          <p className="mt-2 text-sm text-slate-500">View the student roster →</p>
        </Link>
        <Link href="/admin/classes" className="glass rounded-2xl p-6 transition hover:border-accent/40">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Class enrollment approvals</p>
          <p className="mt-3 font-display text-4xl font-semibold text-amber-300">{o.pending_enrollments}</p>
          <p className="mt-2 text-sm text-slate-500">Review class join requests →</p>
        </Link>
        <Link href="/admin/courses" className="glass rounded-2xl p-6 transition hover:border-accent/40">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Course enrollment approvals</p>
          <p className="mt-3 font-display text-4xl font-semibold text-amber-300">{o.pending_course_enrollments}</p>
          <p className="mt-2 text-sm text-slate-500">Review course join requests →</p>
        </Link>
        <div className="glass rounded-2xl p-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Approved students</p>
          <p className="mt-3 font-display text-4xl font-semibold text-white">{o.approved_students}</p>
        </div>
        <div className="glass rounded-2xl p-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Upcoming classes</p>
          <p className="mt-3 font-display text-4xl font-semibold text-white">{o.upcoming_classes}</p>
        </div>
      </div>
    </div>
  );
}
