"use client";

import { useEffect, useState } from "react";

import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import type { ClassItem } from "@/types";

export default function ClassesPage() {
  const [items, setItems] = useState<ClassItem[] | null>(null);

  useEffect(() => {
    void (async () => {
      const { data } = await api.get<ClassItem[]>("/classes");
      setItems(data);
    })();
  }, []);

  if (!items) return <p className="text-slate-400">Loading classes…</p>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold text-white">Classes</h1>
        <p className="mt-2 text-slate-400">Upcoming sessions and past classes you attended.</p>
      </div>
      <div className="grid gap-4">
        {items.length === 0 && <p className="text-slate-500">No classes to show yet.</p>}
        {items.map((c) => (
          <div
            key={c.id}
            className="flex flex-col justify-between gap-4 rounded-2xl border border-white/10 bg-ink-900/50 p-5 sm:flex-row sm:items-center"
          >
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">{c.status}</p>
              <h2 className="mt-1 font-display text-xl font-semibold text-white">{c.title}</h2>
              {c.course_name && <p className="text-xs text-slate-500">Course: {c.course_name}</p>}
              <p className="mt-1 text-sm text-slate-400">{formatDate(c.scheduled_at)}</p>
              {c.instructor_name && <p className="text-sm text-slate-500">Instructor: {c.instructor_name}</p>}
            </div>
            <div className="flex flex-wrap gap-2">
              {c.status === "scheduled" && (
                <a
                  href={c.meeting_link}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-primary"
                >
                  Join class
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
