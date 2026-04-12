"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import type { ClassItem } from "@/types";

export default function ClassDetailPage() {
  const params = useParams<{ id: string }>();
  const [c, setC] = useState<ClassItem | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const { data } = await api.get<ClassItem>(`/classes/${params.id}`);
        setC(data);
      } catch {
        setError("Class not found or not available.");
      }
    })();
  }, [params.id]);

  if (error) {
    return (
      <div className="space-y-4">
        <p className="text-rose-400">{error}</p>
        <Link href="/classes" className="text-accent hover:underline">
          ← Back to classes
        </Link>
      </div>
    );
  }
  if (!c) return <p className="text-slate-400">Loading…</p>;

  return (
    <div className="space-y-6">
      <Link href="/classes" className="text-sm text-accent hover:underline">
        ← All classes
      </Link>
      <div className="glass rounded-2xl p-8">
        <p className="text-xs uppercase tracking-wide text-slate-500">{c.status}</p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-white">{c.title}</h1>
        <p className="mt-2 text-slate-400">{formatDate(c.scheduled_at)} · {c.duration_mins} minutes</p>
        {c.instructor_name && <p className="mt-4 text-slate-300">Instructor: {c.instructor_name}</p>}
        {c.description && <p className="mt-6 whitespace-pre-wrap text-slate-300">{c.description}</p>}
        <div className="mt-8 flex flex-wrap gap-3">
          <a
            href={c.meeting_link}
            target="_blank"
            rel="noreferrer"
            className="inline-flex rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent-dim"
          >
            Join class
          </a>
        </div>
      </div>
    </div>
  );
}
