"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { useScrollReveal } from "@/lib/useScrollReveal";
import CourseCard from "@/components/CourseCard";
import { LayoutDashboard, Clock3, BookMarked, Flame, Target, BookOpenCheck, TrendingUp } from "lucide-react";

interface Enrollment {
  id: number;
  course: {
    id: number;
    title: string;
    description: string;
  };
}

interface ClassSession {
  id: number;
  datetime: string;
}

interface CourseDetail {
  id: number;
  classes: ClassSession[];
}

function calculateStreakFromDates(dates: Date[]): number {
  if (dates.length === 0) return 0;

  const dayKeys = Array.from(
    new Set(
      dates
        .map((d) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime())
        .sort((a, b) => b - a)
    )
  );

  let streak = 1;
  for (let i = 1; i < dayKeys.length; i += 1) {
    const diffDays = Math.round((dayKeys[i - 1] - dayKeys[i]) / (1000 * 60 * 60 * 24));
    if (diffDays === 1) {
      streak += 1;
    } else {
      break;
    }
  }

  return streak;
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [progressByCourse, setProgressByCourse] = useState<Record<number, number>>({});
  const [overallCompletion, setOverallCompletion] = useState(0);
  const [totalSessions, setTotalSessions] = useState(0);
  const [streakDays, setStreakDays] = useState(0);
  const [loading, setLoading] = useState(true);

  useScrollReveal(`${enrollments.length}-${overallCompletion}`);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/");
      return;
    }

    async function fetchMyCourses() {
      if (user) {
        try {
          const response = await api.get("/enrollments/my-courses");
          const enrollmentData: Enrollment[] = response.data;
          setEnrollments(enrollmentData);

          if (enrollmentData.length > 0) {
            const details = await Promise.all(
              enrollmentData.map(async (item) => {
                try {
                  const detailRes = await api.get(`/courses/${item.course.id}`);
                  return detailRes.data as CourseDetail;
                } catch {
                  return { id: item.course.id, classes: [] } as CourseDetail;
                }
              })
            );

            const now = new Date();
            const progressMap: Record<number, number> = {};
            let completed = 0;
            let total = 0;
            const completedDates: Date[] = [];

            details.forEach((detail) => {
              const classes = detail.classes || [];
              const classTotal = classes.length;
              const classCompleted = classes.filter((c) => {
                const d = new Date(c.datetime);
                const isDone = d <= now;
                if (isDone) completedDates.push(d);
                return isDone;
              }).length;

              total += classTotal;
              completed += classCompleted;
              progressMap[detail.id] = classTotal > 0 ? Math.round((classCompleted / classTotal) * 100) : 0;
            });

            setProgressByCourse(progressMap);
            setTotalSessions(total);
            setOverallCompletion(total > 0 ? Math.round((completed / total) * 100) : 0);
            setStreakDays(calculateStreakFromDates(completedDates));
          } else {
            setProgressByCourse({});
            setTotalSessions(0);
            setOverallCompletion(0);
            setStreakDays(0);
          }
        } catch (error) {
          console.error("Failed to fetch enrollments", error);
        } finally {
          setLoading(false);
        }
      }
    }
    fetchMyCourses();
  }, [user, authLoading, router]);

  if (authLoading || loading) {
    return <div className="p-10 text-center section-subtitle animate-pulse">Loading your learning center...</div>;
  }

  if (!user) return null;

  const continueLearning = [...enrollments]
    .sort((a, b) => (progressByCourse[b.course.id] || 0) - (progressByCourse[a.course.id] || 0))
    .slice(0, 2);

  return (
    <div className="app-shell section-wrap">
      <div className="ui-card premium-card p-6 md:p-8 mb-8" data-reveal>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-[var(--brand-soft)] text-[var(--brand)] rounded-2xl">
              <LayoutDashboard className="w-8 h-8" />
            </div>
            <div>
              <h1 className="heading-lg section-title">My Learning Center</h1>
              <p className="section-subtitle text-[1rem]">Welcome back, {user.displayName?.split(" ")[0] || "Learner"}. Pick up where you left off.</p>
            </div>
          </div>
          <div className="ui-card-compact px-4 py-3 min-w-[150px]">
            <p className="text-xs uppercase tracking-[0.08em] section-subtitle">Continue Learning</p>
            <p className="text-lg font-semibold section-title">{continueLearning[0]?.course.title || "Pick a course"}</p>
          </div>
        </div>
      </div>

      <div className="kpi-grid mb-9" data-reveal style={{ ["--reveal-delay" as string]: 1 }}>
        <div className="kpi-card">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs uppercase tracking-[0.08em] section-subtitle">Enrolled Courses</p>
            <BookOpenCheck className="w-4 h-4 text-[var(--brand)]" />
          </div>
          <p className="text-3xl font-semibold section-title">{enrollments.length}</p>
        </div>
        <div className="kpi-card">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs uppercase tracking-[0.08em] section-subtitle">Completion</p>
            <Target className="w-4 h-4 text-[var(--brand)]" />
          </div>
          <p className="text-3xl font-semibold section-title">{overallCompletion}%</p>
          <div className="progress-track mt-3"><div className="progress-fill" style={{ width: `${overallCompletion}%` }} /></div>
        </div>
        <div className="kpi-card">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs uppercase tracking-[0.08em] section-subtitle">Study Streak</p>
            <Flame className="w-4 h-4 text-[var(--accent)]" />
          </div>
          <p className="text-3xl font-semibold section-title">{streakDays}d</p>
        </div>
        <div className="kpi-card">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs uppercase tracking-[0.08em] section-subtitle">Live Sessions</p>
            <TrendingUp className="w-4 h-4 text-[var(--brand)]" />
          </div>
          <p className="text-3xl font-semibold section-title">{totalSessions}</p>
        </div>
      </div>

      {continueLearning.length > 0 && (
        <section className="ui-card p-6 md:p-7 mb-8" data-reveal style={{ ["--reveal-delay" as string]: 2 }}>
          <div className="flex items-center justify-between mb-5">
            <h2 className="heading-md section-title">Continue Learning</h2>
            <Clock3 className="w-4 h-4 text-[var(--muted)]" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {continueLearning.map((item) => {
              const progress = progressByCourse[item.course.id] || 0;
              return (
                <div key={item.id} className="ui-card-compact p-4">
                  <p className="font-semibold section-title mb-1">{item.course.title}</p>
                  <p className="section-subtitle text-sm mb-3">{item.course.description}</p>
                  <div className="flex items-center justify-between text-xs section-subtitle mb-2">
                    <span>Progress</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="progress-track mb-4"><div className="progress-fill" style={{ width: `${progress}%` }} /></div>
                  <Link href={`/course/${item.course.id}`} className="inline-flex ui-btn ui-btn-primary px-4 py-2 text-sm font-semibold">
                    Continue
                  </Link>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <div className="flex items-center justify-between mb-6" data-reveal style={{ ["--reveal-delay" as string]: 1 }}>
        <h2 className="heading-md section-title">Current Courses</h2>
        <div className="hidden md:flex items-center gap-2 text-sm section-subtitle">
          <Clock3 className="w-4 h-4" />
          <span>Stay active this week</span>
        </div>
      </div>

      {enrollments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {enrollments.map((enrollment, index) => (
            <CourseCard
              key={enrollment.id}
              id={enrollment.course.id}
              title={enrollment.course.title}
              description={enrollment.course.description}
              isEnrolled={true}
              revealDelay={index % 6}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 ui-card premium-card" data-reveal>
          <div className="w-16 h-16 rounded-2xl bg-[var(--brand-soft)] text-[var(--brand)] flex items-center justify-center mx-auto mb-5">
            <BookMarked className="w-8 h-8" />
          </div>
          <h2 className="heading-md section-title mb-4">No courses yet</h2>
          <p className="section-subtitle text-[1rem] mb-8 max-w-md mx-auto">
            Start your first teaching track and unlock class schedules, materials, and live session links.
          </p>
          <Link
            href="/"
            className="inline-flex ui-btn ui-btn-primary px-6 py-3 font-medium"
          >
            Explore Courses
          </Link>
        </div>
      )}
    </div>
  );
}
