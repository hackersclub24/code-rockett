"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import type { ClassItem, User } from "@/types";

export default function AdminClassAttendancePage() {
  const params = useParams<{ id: string }>();
  const [cls, setCls] = useState<ClassItem | null>(null);
  const [students, setStudents] = useState<User[]>([]);
  const [statusByStudent, setStatusByStudent] = useState<Record<string, string>>({});
  const [msg, setMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [{ data: c }, { data: studs }] = await Promise.all([
      api.get<ClassItem>(`/admin/classes/${params.id}`),
      api.get<User[]>("/admin/students", { params: { status: "approved" } }),
    ]);
    setCls(c);
    setStudents(studs);
  }, [params.id]);

  useEffect(() => {
    void load();
  }, [load]);

  async function save() {
    setMsg(null);
    const marks = students.map((s) => ({
      student_id: s.id,
      status: statusByStudent[s.id] ?? "absent",
    }));
    await api.post(`/admin/classes/${params.id}/attendance`, { marks });
    setMsg("Attendance saved.");
  }

  if (!cls) return <p className="text-slate-400">Loading…</p>;

  return (
    <div className="space-y-6">
      <Link href="/admin/classes" className="text-sm text-accent hover:underline">
        ← Classes
      </Link>
      <div>
        <h1 className="font-display text-3xl font-semibold text-white">{cls.title}</h1>
        <p className="mt-1 text-slate-400">{formatDate(cls.scheduled_at)}</p>
      </div>
      <div className="glass rounded-2xl p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Mark attendance</h2>
        <p className="mt-2 text-sm text-slate-500">Choose a status for each approved student, then save.</p>
        <div className="mt-6 space-y-3">
          {students.map((s) => (
            <div key={s.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-ink-900/50 px-4 py-3">
              <div>
                <p className="font-medium text-white">{s.name}</p>
                <p className="text-xs text-slate-500">{s.email}</p>
              </div>
              <select
                className="rounded-lg border border-white/10 bg-ink-950 px-2 py-1.5 text-sm"
                value={statusByStudent[s.id] ?? "absent"}
                onChange={(e) => setStatusByStudent((m) => ({ ...m, [s.id]: e.target.value }))}
              >
                <option value="absent">absent</option>
                <option value="present">present</option>
                <option value="excused">excused</option>
              </select>
            </div>
          ))}
        </div>
        {msg && <p className="mt-4 text-sm text-emerald-400">{msg}</p>}
        <button type="button" className="mt-6 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-dim" onClick={() => void save()}>
          Save attendance
        </button>
      </div>
    </div>
  );
}
