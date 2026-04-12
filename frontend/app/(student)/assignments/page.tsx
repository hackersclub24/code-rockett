"use client";

import { useEffect, useState } from "react";

import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import type { StudentAssignment } from "@/types";

export default function AssignmentsPage() {
  const [items, setItems] = useState<StudentAssignment[] | null>(null);

  useEffect(() => {
    void (async () => {
      const { data } = await api.get<StudentAssignment[]>("/assignments");
      setItems(data);
    })();
  }, []);

  if (!items) return <p className="text-slate-400">Loading assignments…</p>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold text-white">Assignments</h1>
        <p className="mt-2 text-slate-400">Tasks assigned to you and their review status.</p>
      </div>
      <div className="overflow-hidden rounded-2xl border border-white/10">
        <table className="w-full text-left text-sm">
          <thead className="bg-ink-900/80 text-xs uppercase tracking-wide text-slate-400">
            <tr>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Due</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {items.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-6 text-slate-500">
                  No assignments yet.
                </td>
              </tr>
            )}
            {items.map((row) => (
              <tr key={row.id} className="bg-ink-950/40">
                <td className="px-4 py-3 font-medium text-white">{row.assignment?.title ?? "—"}</td>
                <td className="px-4 py-3 text-slate-400">
                  {row.assignment?.due_date ? formatDate(row.assignment.due_date) : "—"}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      row.status === "reviewed" ? "bg-emerald-500/15 text-emerald-300" : "bg-amber-500/15 text-amber-200"
                    }`}
                  >
                    {row.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
