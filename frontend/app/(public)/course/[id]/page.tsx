"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import api from "@/lib/api";
import { useAuth } from "@/components/AuthProvider";
import AuthModal from "@/components/AuthModal";
import { useScrollReveal } from "@/lib/useScrollReveal";
import { Calendar, ExternalLink, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { AxiosError, isAxiosError } from "axios";

interface ClassSession {
  id: number;
  title: string;
  datetime: string;
  meet_link: string;
}

interface CourseDetail {
  id: number;
  title: string;
  description: string;
  classes: ClassSession[];
}

interface EnrollmentRow {
  course_id: number;
}

export default function CourseDetailPage() {
  const { id } = useParams();
  const { user, loading: authLoading } = useAuth();
  
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useScrollReveal(course?.classes.length ?? 0);
  const now = new Date();

  async function fetchWithRetry<T>(request: () => Promise<T>, retries = 2, delayMs = 600): Promise<T> {
    let lastError: unknown;

    for (let attempt = 0; attempt <= retries; attempt += 1) {
      try {
        return await request();
      } catch (error) {
        lastError = error;
        const isNetworkError = isAxiosError(error) && !error.response;
        const shouldRetry = isNetworkError && attempt < retries;

        if (!shouldRetry) {
          break;
        }

        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }

    throw lastError;
  }

  useEffect(() => {
    const courseId = Number(id);
    if (!Number.isFinite(courseId)) {
      setFetchError("Invalid course ID.");
      setLoading(false);
      return;
    }

    async function fetchData() {
      setFetchError(null);
      try {
        const [courseRes, enrollmentsRes] = await Promise.all([
          fetchWithRetry(() => api.get(`/courses/${courseId}`)),
          user ? fetchWithRetry(() => api.get("/enrollments/my-courses")) : Promise.resolve({ data: [] })
        ]);
        
        setCourse(courseRes.data);
        
        if (user && enrollmentsRes.data) {
          const isUserEnrolled = enrollmentsRes.data.some(
            (e: EnrollmentRow) => e.course_id === courseId
          );
          setIsEnrolled(isUserEnrolled);
        }
      } catch (error) {
        if (isAxiosError(error) && !error.response) {
          setFetchError("Could not connect to the backend. Make sure the API server is running and CORS is configured for this frontend port.");
        } else {
          setFetchError("Failed to load course data.");
        }
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id, user]);

  const handleEnroll = async () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    
    setEnrolling(true);
    try {
      const courseId = Number(id);
      await api.post("/enrollments/enroll", { course_id: courseId });
      setIsEnrolled(true);
    } catch (error: unknown) {
      const axiosError = error as AxiosError;
      if (axiosError.response?.status === 400) {
        setIsEnrolled(true); // Already enrolled
      } else {
        alert("Failed to enroll. Please try again.");
      }
    } finally {
      setEnrolling(false);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 animate-pulse">
        <div className="h-12 bg-[var(--surface-strong)] border border-[var(--line)] w-2/3 rounded-2xl mb-6"></div>
        <div className="h-32 bg-[var(--surface-strong)] border border-[var(--line)] rounded-2xl mb-12"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-32 text-zinc-500 dark:text-zinc-400 text-xl font-medium">
        {fetchError || "Course not found"}
      </div>
    );
  }

  const totalClasses = course.classes.length;
  const completedClasses = course.classes.filter((c) => new Date(c.datetime) <= now).length;
  const progressPct = totalClasses > 0 ? Math.round((completedClasses / totalClasses) * 100) : 0;
  const upcomingClasses = totalClasses - completedClasses;

  return (
    <div className="app-shell section-wrap">
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      
      <div className="ui-card premium-card rounded-[2rem] p-8 md:p-12 shadow-xl mb-8 transition-all">
        <p className="text-xs uppercase tracking-[0.12em] text-[var(--muted)] font-semibold mb-3">Course Syllabus</p>
        <h1 className="heading-lg section-title mb-6">{course.title}</h1>
        <p className="body-lead section-subtitle mb-10 whitespace-pre-wrap">
          {course.description}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
          <div className="ui-card-compact p-3">
            <p className="text-xs uppercase section-subtitle">Instructor</p>
            <p className="font-semibold section-title">Code Rocket Mentor Team</p>
          </div>
          <div className="ui-card-compact p-3">
            <p className="text-xs uppercase section-subtitle">Progress</p>
            <p className="font-semibold section-title">{progressPct}%</p>
            <div className="progress-track mt-2"><div className="progress-fill" style={{ width: `${progressPct}%` }} /></div>
          </div>
          <div className="ui-card-compact p-3">
            <p className="text-xs uppercase section-subtitle">Upcoming Classes</p>
            <p className="font-semibold section-title">{upcomingClasses}</p>
          </div>
        </div>
        
        <div className="flex items-center">
          {isEnrolled ? (
            <div className="inline-flex items-center space-x-3 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 px-8 py-4 rounded-2xl font-bold">
              <CheckCircle className="w-6 h-6" />
              <span>You are enrolled in this course</span>
            </div>
          ) : (
            <button
              onClick={handleEnroll}
              disabled={enrolling}
              className="ui-btn ui-btn-primary px-10 py-5 rounded-2xl font-bold disabled:opacity-50 text-lg"
            >
              {enrolling ? "Enrolling..." : "Enroll Now"}
            </button>
          )}
        </div>
      </div>

      <h2 className="heading-md section-title mb-8 flex items-center space-x-3">
        <div className="p-3 bg-[var(--brand-soft)] text-[var(--brand)] rounded-xl">
          <Calendar className="w-6 h-6" />
        </div>
        <span>Live Classes</span>
      </h2>

      {course.classes.length > 0 ? (
        <div className="space-y-4">
          {course.classes.map((cls, index) => (
            <div key={cls.id} className="ui-card premium-card rounded-2xl p-6 md:p-8 hover:bg-[var(--surface-strong)] transition-colors flex flex-col md:flex-row md:items-center justify-between gap-6 group" data-reveal style={{ "--reveal-delay": index } as React.CSSProperties}>
              <div>
                <h3 className="heading-md section-title mb-2">{cls.title}</h3>
                <p className="section-subtitle text-[0.98rem] font-medium">
                  {format(new Date(cls.datetime), "EEEE, MMMM d, yyyy 'at' h:mm a")}
                </p>
              </div>
              
              {isEnrolled ? (
                <a
                  href={cls.meet_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center space-x-2 px-8 py-4 ui-btn ui-btn-secondary font-bold"
                >
                  <span>Join Class</span>
                  <ExternalLink className="w-4 h-4 ml-1" />
                </a>
              ) : (
                <button
                  type="button"
                  onClick={handleEnroll}
                  disabled={enrolling}
                  className="inline-flex items-center justify-center space-x-2 px-8 py-4 ui-btn ui-btn-secondary font-bold disabled:opacity-60"
                >
                  <span>{enrolling ? "Enrolling..." : "Enroll to Join"}</span>
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="ui-card rounded-[2rem] p-12 text-center">
          <p className="section-subtitle text-[1.05rem] font-medium">No live classes scheduled for this course yet.</p>
        </div>
      )}
    </div>
  );
}
