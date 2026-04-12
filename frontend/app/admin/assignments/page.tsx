"use client";

import { useCallback, useEffect, useState } from "react";

import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import type { AssignmentOut } from "@/types";

type LinkRow = {
  id: string;
  assignment_id: string;
  assignment_title: string | null;
  student_id: string;
  student_name: string | null;
  status: string;
  notes: string | null;
  updated_at: string;
};

export default function AdminAssignmentsPage() {
  const [assignments, setAssignments] = useState<AssignmentOut[] | null>(null);
  const [links, setLinks] = useState<LinkRow[] | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [due, setDue] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [{ data: a }, { data: l }] = await Promise.all([
      api.get<AssignmentOut[]>("/admin/assignments"),
      api.get<LinkRow[]>("/admin/student-assignments"),
    ]);
    setAssignments(a);
    setLinks(l);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    await api.post("/admin/assignments", {
      title,
      description: description || null,
      due_date: due ? new Date(due).toISOString() : null,
      assign_all: true,
      student_ids: [],
    });
    setTitle("");
    setDescription("");
    setDue("");
    setMsg("Assignment created for all students.");
    await load();
  }

  async function updateLink(id: string, status: string) {
    await api.patch(`/admin/student-assignments/${id}`, { status });
    await load();
  }

  if (!assignments || !links) return <p className="text-slate-400">Loading…</p>;

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-display text-3xl font-semibold text-white">Assignments</h1>
        <p className="mt-2 text-slate-400">Create tasks and update per-student status.</p>
      </div>
      <form onSubmit={create} className="glass space-y-4 rounded-2xl p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Create assignment (all students)</h2>
        <input className="w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2 text-sm" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <textarea className="min-h-[80px] w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2 text-sm" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
        <input type="datetime-local" className="w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2 text-sm" value={due} onChange={(e) => setDue(e.target.value)} />
        {msg && <p className="text-sm text-emerald-400">{msg}</p>}
        <button type="submit" className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-dim">
          Create
        </button>
      </form>
      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">All assignments</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {assignments.map((a) => (
            <li key={a.id} className="rounded-lg border border-white/10 bg-ink-900/40 px-4 py-2 text-slate-300">
              <span className="font-medium text-white">{a.title}</span>
              {a.due_date && <span className="ml-3 text-slate-500">Due {formatDate(a.due_date)}</span>}
            </li>
          ))}
        </ul>
      </section>
      <section className="overflow-hidden rounded-2xl border border-white/10">
        <table className="w-full text-left text-sm">
          <thead className="bg-ink-900/80 text-xs uppercase tracking-wide text-slate-400">
            <tr>
              <th className="px-4 py-3">Student</th>
              <th className="px-4 py-3">Assignment</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {links.map((r) => (
              <tr key={r.id} className="bg-ink-950/40">
                <td className="px-4 py-3 text-white">{r.student_name}</td>
                <td className="px-4 py-3 text-slate-400">{r.assignment_title}</td>
                <td className="px-4 py-3">
                  <select
                    className="rounded-lg border border-white/10 bg-ink-950 px-2 py-1 text-xs"
                    value={r.status}
                    onChange={(e) => void updateLink(r.id, e.target.value)}
                  >
                    <option value="assigned">assigned</option>
                    <option value="reviewed">reviewed</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
