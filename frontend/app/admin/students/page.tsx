"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";

import { api } from "@/lib/api";
import type { User } from "@/types";

function AdminStudentsInner() {
  const search = useSearchParams();
  const status = search.get("status") ?? undefined;
  const [rows, setRows] = useState<User[] | null>(null);

  const load = useCallback(async () => {
    const { data } = await api.get<User[]>("/admin/students", { params: { status } });
    setRows(data);
  }, [status]);

  useEffect(() => {
    void load();
  }, [load]);

  async function approve(id: string) {
    await api.patch(`/admin/students/${id}/approve`);
    await load();
  }

  async function reject(id: string) {
    await api.patch(`/admin/students/${id}/reject`);
    await load();
  }

  if (!rows) return <p className="text-slate-400">Loading…</p>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-white">Students</h1>
          <p className="mt-2 text-slate-400">Roster and approval queue.</p>
        </div>
        <div className="flex gap-2 text-sm">
          <Link className={`rounded-lg px-3 py-1.5 ${!status ? "bg-white/10 text-white" : "text-slate-400"}`} href="/admin/students">
            All
          </Link>
          <Link
            className={`rounded-lg px-3 py-1.5 ${status === "pending" ? "bg-white/10 text-white" : "text-slate-400"}`}
            href="/admin/students?status=pending"
          >
            Pending
          </Link>
          <Link
            className={`rounded-lg px-3 py-1.5 ${status === "approved" ? "bg-white/10 text-white" : "text-slate-400"}`}
            href="/admin/students?status=approved"
          >
            Approved
          </Link>
        </div>
      </div>
      <div className="overflow-hidden rounded-2xl border border-white/10">
        <table className="w-full text-left text-sm">
          <thead className="bg-ink-900/80 text-xs uppercase tracking-wide text-slate-400">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {rows.map((u) => (
              <tr key={u.id} className="bg-ink-950/40">
                <td className="px-4 py-3 font-medium text-white">{u.name}</td>
                <td className="px-4 py-3 text-slate-400">{u.email}</td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-white/5 px-2 py-0.5 text-xs">{u.status}</span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <Link href={`/admin/students/${u.id}`} className="text-accent hover:underline">
                      View
                    </Link>
                    {u.status === "pending" && (
                      <>
                        <button type="button" className="text-emerald-400 hover:underline" onClick={() => void approve(u.id)}>
                          Approve
                        </button>
                        <button type="button" className="text-rose-400 hover:underline" onClick={() => void reject(u.id)}>
                          Reject
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function AdminStudentsPage() {
  return (
    <Suspense fallback={<p className="text-slate-400">Loading…</p>}>
      <AdminStudentsInner />
    </Suspense>
  );
}
