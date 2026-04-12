"use client";

import { useCallback, useEffect, useState } from "react";

import { api } from "@/lib/api";
import type { CourseEnrollmentRequest, CourseItem } from "@/types";

export default function AdminCoursesPage() {
  const [items, setItems] = useState<CourseItem[] | null>(null);
  const [requests, setRequests] = useState<CourseEnrollmentRequest[] | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [level, setLevel] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [coursesRes, requestsRes] = await Promise.all([
      api.get<CourseItem[]>("/admin/courses"),
      api.get<CourseEnrollmentRequest[]>("/admin/course-enrollment-requests?status=pending"),
    ]);
    setItems(coursesRes.data);
    setRequests(requestsRes.data);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function createCourse(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    try {
      await api.post("/admin/courses", {
        name,
        description: description || null,
        level: level || null,
      });
      setName("");
      setDescription("");
      setLevel("");
      setMsg("Course created.");
      await load();
    } catch {
      setMsg("Could not create course.");
    }
  }

  async function toggleActive(course: CourseItem) {
    await api.patch(`/admin/courses/${course.id}`, { is_active: !course.is_active });
    await load();
  }

  async function decideRequest(id: string, action: "approve" | "reject") {
    await api.patch(`/admin/course-enrollment-requests/${id}/${action}`);
    await load();
  }

  if (!items || !requests) return <p className="text-slate-400">Loading courses...</p>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-semibold text-white">Courses</h1>
        <p className="mt-2 text-slate-400">Manage multiple courses in your program.</p>
      </div>

      <form onSubmit={createCourse} className="glass grid gap-4 rounded-2xl p-6 sm:grid-cols-2">
        <h2 className="sm:col-span-2 text-sm font-semibold uppercase tracking-wide text-slate-400">Create course</h2>
        <div>
          <label className="text-xs text-slate-400">Course name</label>
          <input
            className="mt-1 w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2 text-sm"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="text-xs text-slate-400">Level</label>
          <input
            className="mt-1 w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2 text-sm"
            placeholder="Beginner / Intermediate / Advanced"
            value={level}
            onChange={(e) => setLevel(e.target.value)}
          />
        </div>
        <div className="sm:col-span-2">
          <label className="text-xs text-slate-400">Description</label>
          <textarea
            className="mt-1 min-h-[90px] w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2 text-sm"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        {msg && <p className="sm:col-span-2 text-sm text-emerald-400">{msg}</p>}
        <button type="submit" className="btn-primary sm:col-span-2">
          Save course
        </button>
      </form>

      <div className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Pending course enrollment approvals</h2>
        {requests.length === 0 && <p className="text-slate-500">No pending course enrollment approvals.</p>}
        {requests.map((req) => (
          <div
            key={req.id}
            className="flex flex-col justify-between gap-3 rounded-2xl border border-white/10 bg-ink-900/40 p-4 sm:flex-row sm:items-center"
          >
            <div>
              <p className="font-medium text-white">{req.student_name} requested to join {req.course_name}</p>
              <p className="text-xs text-slate-400">{req.student_email}</p>
            </div>
            <div className="flex gap-2">
              <button type="button" className="btn-primary px-3 py-1.5" onClick={() => void decideRequest(req.id, "approve")}>
                Approve
              </button>
              <button type="button" className="btn-secondary px-3 py-1.5" onClick={() => void decideRequest(req.id, "reject")}>
                Reject
              </button>
            </div>
          </div>
        ))}

        <h2 className="pt-4 text-sm font-semibold uppercase tracking-wide text-slate-400">All courses</h2>
        {items.length === 0 && <p className="text-slate-500">No courses yet.</p>}
        {items.map((course) => (
          <div
            key={course.id}
            className="flex flex-col justify-between gap-3 rounded-2xl border border-white/10 bg-ink-900/40 p-4 sm:flex-row sm:items-center"
          >
            <div>
              <p className="font-medium text-white">{course.name}</p>
              <p className="text-xs text-slate-500">{course.level ?? "General"}</p>
              {course.description && <p className="mt-1 text-sm text-slate-400">{course.description}</p>}
            </div>
            <button type="button" className="btn-secondary" onClick={() => void toggleActive(course)}>
              {course.is_active ? "Deactivate" : "Activate"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
