"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import CourseCard from "@/components/CourseCard";
import { LayoutDashboard } from "lucide-react";

interface Enrollment {
  id: number;
  course: {
    id: number;
    title: string;
    description: string;
  };
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/");
      return;
    }

    async function fetchMyCourses() {
      if (user) {
        try {
          const response = await api.get("/enrollments/my-courses");
          setEnrollments(response.data);
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
    return <div className="p-8 text-center text-zinc-500 animate-pulse">Loading dashboard...</div>;
  }

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto py-12 px-4">
      <div className="flex items-center space-x-3 mb-10 pb-6 border-b border-zinc-200">
        <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl">
          <LayoutDashboard className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-zinc-900">My Dashboard</h1>
          <p className="text-zinc-600">Welcome back! Here are your enrolled courses.</p>
        </div>
      </div>

      {enrollments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {enrollments.map((enrollment) => (
            <CourseCard
              key={enrollment.id}
              id={enrollment.course.id}
              title={enrollment.course.title}
              description={enrollment.course.description}
              isEnrolled={true}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-3xl border border-zinc-200 shadow-sm">
          <h2 className="text-2xl font-bold text-zinc-900 mb-4">No courses yet</h2>
          <p className="text-zinc-600 mb-8 max-w-md mx-auto">
            You haven't enrolled in any courses yet. Browse our catalog and start learning today!
          </p>
          <a
            href="/"
            className="inline-flex bg-indigo-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-indigo-700 transition-colors"
          >
            Explore Courses
          </a>
        </div>
      )}
    </div>
  );
}
