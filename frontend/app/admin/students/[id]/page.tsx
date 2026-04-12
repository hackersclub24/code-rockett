"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import type { User } from "@/types";

type Detail = {
  user: User;
  attendance_rate: number;
  assignment_completion: number;
  attendance: { class_id: string; class_title: string | null; status: string; marked_at: string }[];
  assignments: { id: string; assignment_id: string; title: string | null; status: string; notes: string | null; due_date: string | null }[];
};

export default function AdminStudentDetailPage() {
  const params = useParams<{ id: string }>();
  const [d, setD] = useState<Detail | null>(null);

  useEffect(() => {
    void (async () => {
      const { data } = await api.get<Detail>(`/admin/students/${params.id}`);
      setD(data);
    })();
  }, [params.id]);

  if (!d) return <p className="text-slate-400">Loading…</p>;

  return (
    <div className="space-y-8">
      <Link href="/admin/students" className="text-sm text-accent hover:underline">
        ← Students
      </Link>
      <div>
        <h1 className="font-display text-3xl font-semibold text-white">{d.user.name}</h1>
        <p className="mt-1 text-slate-400">{d.user.email}</p>
        <div className="mt-4 flex flex-wrap gap-4 text-sm">
          <span className="rounded-full bg-white/10 px-3 py-1">Status: {d.user.status}</span>
          <span className="rounded-full bg-white/10 px-3 py-1">Attendance: {d.attendance_rate}%</span>
          <span className="rounded-full bg-white/10 px-3 py-1">Assignments done: {d.assignment_completion}%</span>
        </div>
      </div>
      <section className="glass rounded-2xl p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Attendance history</h2>
        <ul className="mt-4 space-y-2 text-sm">
          {d.attendance.length === 0 && <li className="text-slate-500">No records yet.</li>}
          {d.attendance.map((a) => (
            <li key={`${a.class_id}-${a.marked_at}`} className="flex justify-between gap-4 border-b border-white/5 py-2">
              <span className="text-white">{a.class_title ?? a.class_id}</span>
              <span className="text-slate-400">
                {a.status} · {formatDate(a.marked_at)}
              </span>
            </li>
          ))}
        </ul>
      </section>
      <section className="glass rounded-2xl p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Assignments</h2>
        <ul className="mt-4 space-y-2 text-sm">
          {d.assignments.length === 0 && <li className="text-slate-500">No assignments yet.</li>}
          {d.assignments.map((a) => (
            <li key={a.id} className="flex justify-between gap-4 border-b border-white/5 py-2">
              <span className="text-white">{a.title ?? a.assignment_id}</span>
              <span className="text-slate-400">{a.status}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
