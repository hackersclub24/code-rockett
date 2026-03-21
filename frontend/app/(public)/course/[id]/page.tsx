"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import { useAuth } from "@/components/AuthProvider";
import AuthModal from "@/components/AuthModal";
import { Calendar, ExternalLink, CheckCircle } from "lucide-react";
import { format } from "date-fns";

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

export default function CourseDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const [courseRes, enrollmentsRes] = await Promise.all([
          api.get(`/courses/${id}`),
          user ? api.get("/enrollments/my-courses") : Promise.resolve({ data: [] })
        ]);
        
        setCourse(courseRes.data);
        
        if (user && enrollmentsRes.data) {
          const isUserEnrolled = enrollmentsRes.data.some(
            (e: any) => e.course_id === parseInt(id as string)
          );
          setIsEnrolled(isUserEnrolled);
        }
      } catch (error) {
        console.error("Failed to fetch course data", error);
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
      await api.post("/enrollments/enroll", { course_id: parseInt(id as string) });
      setIsEnrolled(true);
    } catch (error: any) {
      if (error.response?.status === 400) {
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
        <div className="h-12 bg-zinc-200 dark:bg-zinc-800 w-2/3 rounded-2xl mb-6"></div>
        <div className="h-32 bg-zinc-200 dark:bg-zinc-800 rounded-2xl mb-12"></div>
      </div>
    );
  }

  if (!course) {
    return <div className="text-center py-32 text-zinc-500 dark:text-zinc-400 text-xl font-medium">Course not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto py-16 px-4">
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      
      <div className="bg-white dark:bg-zinc-900/50 backdrop-blur-md rounded-[2rem] p-8 md:p-12 border border-zinc-200 dark:border-zinc-800 shadow-xl shadow-zinc-200/50 dark:shadow-zinc-950/50 mb-12 transition-all">
        <h1 className="text-4xl md:text-5xl font-extrabold text-zinc-900 dark:text-white mb-6 leading-tight">{course.title}</h1>
        <p className="text-lg md:text-xl text-zinc-600 dark:text-zinc-400 mb-10 leading-relaxed whitespace-pre-wrap">
          {course.description}
        </p>
        
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
              className="bg-indigo-600 text-white px-10 py-5 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/20 hover:shadow-indigo-600/40 disabled:opacity-50 hover:-translate-y-1 active:translate-y-0 text-lg"
            >
              {enrolling ? "Enrolling..." : "Enroll Now"}
            </button>
          )}
        </div>
      </div>

      <h2 className="text-2xl font-extrabold text-zinc-900 dark:text-white mb-8 flex items-center space-x-3">
        <div className="p-3 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl">
          <Calendar className="w-6 h-6" />
        </div>
        <span>Live Classes</span>
      </h2>

      {course.classes.length > 0 ? (
        <div className="space-y-4">
          {course.classes.map((cls) => (
            <div key={cls.id} className="bg-white dark:bg-zinc-900/80 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-zinc-200 dark:border-zinc-800 hover:border-indigo-200 dark:hover:border-indigo-800 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-6 group">
              <div>
                <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">{cls.title}</h3>
                <p className="text-zinc-500 dark:text-zinc-400 font-medium">
                  {format(new Date(cls.datetime), "EEEE, MMMM d, yyyy 'at' h:mm a")}
                </p>
              </div>
              
              <a
                href={cls.meet_link}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center justify-center space-x-2 px-8 py-4 rounded-xl font-bold transition-all ${
                  isEnrolled 
                    ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-500/20" 
                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-600 cursor-not-allowed pointer-events-none"
                }`}
              >
                <span>Join Class</span>
                <ExternalLink className="w-4 h-4 ml-1" />
              </a>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-zinc-50 dark:bg-zinc-900/50 backdrop-blur-sm border border-zinc-200 dark:border-zinc-800 rounded-[2rem] p-12 text-center">
          <p className="text-xl text-zinc-500 dark:text-zinc-400 font-medium">No live classes scheduled for this course yet.</p>
        </div>
      )}
    </div>
  );
}
