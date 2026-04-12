"use client";

import { useCallback, useEffect, useState } from "react";

import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import type { ClassItem, CourseItem, EnrollmentRequest } from "@/types";

export default function AdminClassesPage() {
  const [items, setItems] = useState<ClassItem[] | null>(null);
  const [requests, setRequests] = useState<EnrollmentRequest[] | null>(null);
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionBusy, setActionBusy] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [duration, setDuration] = useState(60);
  const [meetingLink, setMeetingLink] = useState("");
  const [courseId, setCourseId] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [classesRes, requestsRes, coursesRes] = await Promise.all([
        api.get<ClassItem[]>("/admin/classes"),
        api.get<EnrollmentRequest[]>("/admin/enrollment-requests?status=pending"),
        api.get<CourseItem[]>("/admin/courses"),
      ]);
      setItems(classesRes.data);
      setRequests(requestsRes.data);
      setCourses(coursesRes.data);
      setError(null);
    } catch {
      setError("Could not load classes right now.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    try {
      await api.post("/admin/classes", {
        title,
        description: description || null,
        scheduled_at: new Date(scheduledAt).toISOString(),
        duration_mins: duration,
        meeting_link: meetingLink,
        course_id: courseId || null,
      });
      setTitle("");
      setDescription("");
      setScheduledAt("");
      setMeetingLink("");
      setCourseId("");
      setMsg("Class created.");
      await load();
    } catch {
      setMsg("Could not create class.");
    }
  }

  async function cancel(id: string) {
    if (!confirm("Cancel this class?")) return;
    await api.delete(`/admin/classes/${id}`);
    await load();
  }

  async function decideRequest(id: string, decision: "approve" | "reject") {
    setActionBusy(id);
    try {
      await api.patch(`/admin/enrollment-requests/${id}/${decision}`);
      await load();
    } finally {
      setActionBusy(null);
    }
  }

  if (loading && (!items || !requests)) return <p className="text-slate-400">Loading…</p>;
  if (error && (!items || !requests)) return <p className="text-rose-400">{error}</p>;

  const requestItems = requests ?? [];
  const classItems = items ?? [];

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-display text-3xl font-semibold text-white">Classes</h1>
        <p className="mt-2 text-slate-400">Schedule live sessions and manage meeting links.</p>
        {error && <p className="mt-2 text-sm text-rose-400">{error}</p>}
      </div>
      <form id="create-course" onSubmit={create} className="glass grid gap-4 rounded-2xl p-6 sm:grid-cols-2">
        <h2 className="sm:col-span-2 text-sm font-semibold uppercase tracking-wide text-slate-400">Create class</h2>
        <div className="sm:col-span-2">
          <label className="text-xs text-slate-400">Title</label>
          <input className="mt-1 w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2 text-sm" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>
        <div className="sm:col-span-2">
          <label className="text-xs text-slate-400">Description</label>
          <textarea className="mt-1 min-h-[80px] w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2 text-sm" value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div>
          <label className="text-xs text-slate-400">When (local)</label>
          <input
            type="datetime-local"
            className="mt-1 w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2 text-sm"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="text-xs text-slate-400">Duration (minutes)</label>
          <input
            type="number"
            className="mt-1 w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2 text-sm"
            value={duration}
            min={15}
            step={15}
            onChange={(e) => setDuration(Number(e.target.value))}
          />
        </div>
        <div className="sm:col-span-2">
          <label className="text-xs text-slate-400">Meeting link</label>
          <input className="mt-1 w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2 text-sm" value={meetingLink} onChange={(e) => setMeetingLink(e.target.value)} required />
        </div>
        <div className="sm:col-span-2">
          <label className="text-xs text-slate-400">Course</label>
          <select
            className="mt-1 w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2 text-sm"
            value={courseId}
            onChange={(e) => setCourseId(e.target.value)}
          >
            <option value="">No course</option>
            {courses
              .filter((x) => x.is_active)
              .map((x) => (
                <option key={x.id} value={x.id}>
                  {x.name}
                </option>
              ))}
          </select>
        </div>
        {msg && <p className="sm:col-span-2 text-sm text-emerald-400">{msg}</p>}
        <button type="submit" className="btn-primary sm:col-span-2 py-2">
          Save class
        </button>
      </form>
      <div className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Pending enrollment approvals</h2>
        {requestItems.length === 0 && <p className="text-slate-500">No pending class enrollment approvals.</p>}
        {requestItems.map((req) => (
          <div
            key={req.id}
            className="flex flex-col justify-between gap-3 rounded-2xl border border-white/10 bg-ink-900/40 p-4 sm:flex-row sm:items-center"
          >
            <div>
              <p className="text-sm font-medium text-white">{req.student_name} requested to join {req.class_title}</p>
              <p className="text-xs text-slate-400">{req.student_email}</p>
              <p className="text-xs text-slate-500">Requested {formatDate(req.enrolled_at)}</p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                className="btn-primary px-3 py-1.5"
                onClick={() => void decideRequest(req.id, "approve")}
                disabled={actionBusy === req.id}
              >
                Approve
              </button>
              <button
                type="button"
                className="btn-secondary px-3 py-1.5"
                onClick={() => void decideRequest(req.id, "reject")}
                disabled={actionBusy === req.id}
              >
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">All classes</h2>
        {classItems.map((c) => (
          <div key={c.id} className="flex flex-col justify-between gap-3 rounded-2xl border border-white/10 bg-ink-900/40 p-4 sm:flex-row sm:items-center">
            <div>
              <p className="text-xs uppercase text-slate-500">{c.status}</p>
              <p className="font-medium text-white">{c.title}</p>
              {c.course_name && <p className="text-xs text-slate-500">Course: {c.course_name}</p>}
              <p className="text-sm text-slate-400">{formatDate(c.scheduled_at)}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <a className="rounded-lg border border-white/15 px-3 py-1.5 text-sm hover:bg-white/5" href={`/admin/classes/${c.id}`}>
                Attendance
              </a>
              {c.status !== "cancelled" && (
                <button type="button" className="text-sm text-rose-400 hover:underline" onClick={() => void cancel(c.id)}>
                  Cancel class
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
