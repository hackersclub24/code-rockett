"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";

import { api } from "@/lib/api";
import { getAccessToken, parseJwtPayload } from "@/lib/auth";
import { formatDate } from "@/lib/utils";
import type { CourseEnrollmentStatus, CourseItem, EnrolledCourse } from "@/types";

export default function CoursesPage() {
  const [courses, setCourses] = useState<CourseItem[] | null>(null);
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[] | null>(null);
  const [statusMap, setStatusMap] = useState<Record<string, CourseEnrollmentStatus["status"]>>({});
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [approvedStudent, setApprovedStudent] = useState(false);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      setApprovedStudent(false);
      setAuthReady(true);
      return;
    }

    const payload = parseJwtPayload(token);
    setApprovedStudent(payload?.role === "student" && payload?.status === "approved");
    setAuthReady(true);
  }, []);

  useEffect(() => {
    void (async () => {
      try {
        const { data } = await api.get<CourseItem[]>("/courses/catalog");
        setCourses(data);
      } catch {
        setCourses([]);
      }
    })();
  }, []);

  useEffect(() => {
    if (!authReady || !approvedStudent) return;
    const loadEnrolledCourses = async () => {
      try {
        const { data } = await api.get<EnrolledCourse[]>("/students/enrolled-courses");
        setEnrolledCourses(data);
      } catch {
        setEnrolledCourses([]);
      }
    };

    void loadEnrolledCourses();

    const loadStatuses = async () => {
      try {
        const { data } = await api.get<CourseEnrollmentStatus[]>("/student/course-requests");
        const map: Record<string, CourseEnrollmentStatus["status"]> = {};
        for (const item of data) map[item.course_id] = item.status;
        setStatusMap(map);
      } catch {
        setStatusMap({});
      }
    };

    void loadStatuses();
    const interval = window.setInterval(() => {
      void loadStatuses();
    }, 10000);

    return () => window.clearInterval(interval);
  }, [authReady, approvedStudent]);

  async function requestEnrollment(courseId: string) {
    setMessage(null);
    if (!approvedStudent) {
      window.location.href = "/login?next=/courses";
      return;
    }
    setBusyId(courseId);
    try {
      const { data } = await api.post<CourseEnrollmentStatus>(`/courses/${courseId}/enroll-request`);
      setStatusMap((prev) => ({ ...prev, [courseId]: data.status }));
      setMessage("Enrollment request sent.");
    } catch {
      setMessage("Could not send request.");
    } finally {
      setBusyId(null);
    }
  }

  const labelMap: Record<CourseEnrollmentStatus["status"], string> = {
    pending: "Request pending - waiting for admin approval",
    approved: "Approved by admin",
    rejected: "Request rejected - try again",
  };

  const courseImages = [
    "/images/StockCake-Coding_in_Neon-1262118-standard.jpg",
    "/images/StockCake-Coder's_Neon_World-1904810-standard.jpg",
    "/images/StockCake-Digital_Workspace_Glowing-1486967-standard.jpg",
    "/images/StockCake-Neon_Developer_Workspace-1527102-standard.jpg",
  ];

  function getCourseImage(course: CourseItem, idx: number) {
    // Try simple keyword matching, fallback to an index-based image selection
    const name = (course.name || "").toLowerCase();
    if (name.includes("frontend") || name.includes("react") || name.includes("next")) return courseImages[0];
    if (name.includes("backend") || name.includes("api") || name.includes("django") || name.includes("fastapi")) return courseImages[2];
    if (name.includes("students") || name.includes("learning")) return courseImages[3];
    return courseImages[idx % courseImages.length];
  }

  return (
    <div className="min-h-screen w-full px-6 py-16 lg:px-8">
      <div className="mb-10 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#0b1020] via-[#11192b] to-[#070816] p-8 sm:p-12">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between max-w-4xl">
          <div>
            <p className="text-sm uppercase tracking-widest text-accent">Coding Rocket</p>
            <h1 className="mt-2 text-4xl sm:text-5xl font-display font-semibold text-white">Course catalog</h1>
            <p className="mt-3 text-slate-300">
              Explore the courses available on the platform before logging in or requesting enrollment.
            </p>
          </div>
          <Link href="/" className="btn-secondary whitespace-nowrap shrink-0">
            Back home
          </Link>
        </div>
      </div>

      {message && <p className="mb-4 text-sm text-emerald-400">{message}</p>}

      {authReady && approvedStudent && (
        <section className="mb-10 rounded-2xl border border-white/10 bg-ink-900/50 p-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">My enrolled courses</h2>
              <p className="mt-2 text-sm text-slate-500">These are the courses approved by admin.</p>
            </div>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {enrolledCourses === null && <p className="text-slate-500">Loading your enrolled courses...</p>}
            {enrolledCourses?.length === 0 && <p className="text-slate-500">You are not enrolled in any course yet.</p>}
            {enrolledCourses?.map((course) => (
              <div key={course.id} className="glass rounded-2xl p-5">
                <p className="text-xs uppercase tracking-wide text-slate-500">{course.level ?? "General"}</p>
                <h3 className="mt-2 text-xl font-semibold text-white">{course.name}</h3>
                {course.description && <p className="mt-3 text-sm text-slate-300">{course.description}</p>}
                {course.approved_at && <p className="mt-3 text-xs text-slate-500">Approved {formatDate(course.approved_at)}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {!courses && <p className="text-slate-400">Loading courses...</p>}
      {courses && courses.length === 0 && <p className="text-slate-500">No courses available right now.</p>}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {courses?.map((course, idx) => (
          <div key={course.id} className="glass rounded-2xl p-5">
            <div className="relative mb-3 h-44 w-full overflow-hidden rounded-xl bg-slate-800 ring-1 ring-white/10">
              <Image
                src={getCourseImage(course, idx)}
                alt={course.name}
                fill
                className="object-cover"
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                priority={false}
              />
            </div>
            <p className="text-xs uppercase tracking-wide text-slate-500">{course.level ?? "General"}</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">{course.name}</h2>
            {course.description && <p className="mt-3 text-sm text-slate-300">{course.description}</p>}
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => void requestEnrollment(course.id)}
                disabled={!course.is_active || busyId === course.id || statusMap[course.id] === "pending" || statusMap[course.id] === "approved"}
                className="btn-primary disabled:cursor-not-allowed disabled:opacity-60"
              >
                {busyId === course.id ? "Sending..." : statusMap[course.id] ? labelMap[statusMap[course.id]] : "Request enrollment"}
              </button>
              <p className="text-sm text-slate-500">{course.is_active ? "Open for new students" : "Inactive"}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
