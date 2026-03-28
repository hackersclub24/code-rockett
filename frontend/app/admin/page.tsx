"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { Settings, Plus, Calendar, Users, LayoutDashboard, BookOpen, LogOut } from "lucide-react";

type Tab = "dashboard" | "courses" | "users" | "settings";

interface Course {
  id: number;
  title: string;
  description?: string;
  created_at?: string;
}

interface EnrollmentUser {
  id: number;
  email: string;
}

interface Enrollment {
  id: number;
  user_id: number;
  course_id: number;
  created_at: string;
  course: Course;
  user?: EnrollmentUser;
}

interface SystemUser {
  id: number;
  email: string;
  created_at: string;
  is_teacher?: boolean;
}

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [systemUsers, setSystemUsers] = useState<SystemUser[]>([]);
  
  // Forms state
  const [newCourse, setNewCourse] = useState({ title: "", description: "" });
  const [newClass, setNewClass] = useState({ course_id: "", title: "", datetime: "", meet_link: "" });
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && user?.email !== "abhishekmathur200624@gmail.com") {
      router.push("/");
      return;
    }

    async function fetchData() {
      if (user?.email === "abhishekmathur200624@gmail.com") {
        try {
          const [coursesRes, enrollmentsRes, usersRes] = await Promise.all([
            api.get("/courses"),
            api.get("/admin/enrollments"),
            api.get("/admin/users").catch(() => ({ data: [] })) // In case API fails gracefully
          ]);
          setCourses(coursesRes.data);
          setEnrollments(enrollmentsRes.data);
          setSystemUsers(usersRes.data);
        } catch (error) {
          console.error("Admin fetch failed", error);
        } finally {
          setLoading(false);
        }
      }
    }
    fetchData();
  }, [user, authLoading, router]);

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post("/admin/courses", newCourse);
      setCourses([res.data, ...courses]);
      setNewCourse({ title: "", description: "" });
      alert("Course created!");
    } catch {
      alert("Failed to create course");
    }
  };

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/admin/classes", {
        course_id: parseInt(newClass.course_id),
        title: newClass.title,
        datetime: new Date(newClass.datetime).toISOString(),
        meet_link: newClass.meet_link
      });
      setNewClass({ course_id: "", title: "", datetime: "", meet_link: "" });
      alert("Class scheduled!");
    } catch {
      alert("Failed to schedule class");
    }
  };

  if (authLoading || loading) return <div className="p-8 flex items-center justify-center min-h-screen section-subtitle animate-pulse text-lg font-bold">Loading admin panel...</div>;

  return (
    <div className="flex min-h-[calc(100vh-64px)] bg-[var(--background)] transition-colors duration-300">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-[var(--surface-strong)] border-r border-[var(--line)] flex flex-col hidden md:flex transition-colors duration-300">
        <div className="p-6 border-b border-[var(--line)] flex items-center space-x-3">
           <div className="p-2 bg-[var(--brand-soft)] text-[var(--brand)] rounded-lg">
             <Settings className="w-6 h-6" />
           </div>
           <span className="font-bold text-xl section-title tracking-tight">Admin<span className="text-[var(--brand)]">Pro</span></span>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2">
          <button 
            onClick={() => setActiveTab("dashboard")}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'dashboard' ? 'bg-[var(--brand-soft)] text-[var(--brand)]' : 'section-subtitle hover:bg-[var(--brand-soft)]/50'}`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span>Dashboard</span>
          </button>
          
          <button 
            onClick={() => setActiveTab("courses")}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'courses' ? 'bg-[var(--brand-soft)] text-[var(--brand)]' : 'section-subtitle hover:bg-[var(--brand-soft)]/50'}`}
          >
            <BookOpen className="w-5 h-5" />
            <span>Courses</span>
          </button>
          
          <button 
            onClick={() => setActiveTab("users")}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'users' ? 'bg-[var(--brand-soft)] text-[var(--brand)]' : 'section-subtitle hover:bg-[var(--brand-soft)]/50'}`}
          >
            <Users className="w-5 h-5" />
            <span>Users</span>
          </button>
          
          <button 
            onClick={() => setActiveTab("settings")}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'settings' ? 'bg-[var(--brand-soft)] text-[var(--brand)]' : 'section-subtitle hover:bg-[var(--brand-soft)]/50'}`}
          >
            <Settings className="w-5 h-5" />
            <span>Settings</span>
          </button>
        </nav>
        
          <div className="p-4 border-t border-[var(--line)]">
            <button onClick={() => router.push('/')} className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium section-subtitle hover:bg-[var(--brand-soft)]/50 transition-colors">
             <LogOut className="w-5 h-5" />
             <span>Exit to Home</span>
           </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-8 overflow-auto app-shell">
        
        {/* DASHBOARD TAB */}
        {activeTab === "dashboard" && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white">Dashboard Overview</h1>
              <p className="text-zinc-500 dark:text-zinc-400 mt-1 text-lg">Platform metrics and recent activity.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center space-x-4">
                 <div className="p-4 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-2xl"><BookOpen className="w-8 h-8" /></div>
                 <div>
                   <p className="text-sm font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Total Courses</p>
                   <p className="text-4xl font-extrabold text-zinc-900 dark:text-white">{courses.length}</p>
                 </div>
              </div>
              
              <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center space-x-4">
                 <div className="p-4 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-2xl"><Users className="w-8 h-8" /></div>
                 <div>
                   <p className="text-sm font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Total Enrollments</p>
                   <p className="text-4xl font-extrabold text-zinc-900 dark:text-white">{enrollments.length}</p>
                 </div>
              </div>

              <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center space-x-4">
                 <div className="p-4 bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-2xl"><Users className="w-8 h-8" /></div>
                 <div>
                   <p className="text-sm font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Registered Users</p>
                   <p className="text-4xl font-extrabold text-zinc-900 dark:text-white">{systemUsers.length}</p>
                 </div>
              </div>
            </div>

            <section className="bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm mt-8">
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-6 flex items-center space-x-3">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 rounded-lg">
                   <Calendar className="w-5 h-5" />
                </div>
                <span>Recent Enrollments</span>
              </h2>
              {enrollments.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 uppercase text-xs font-bold tracking-wider">
                        <th className="pb-4 px-4">Student Email</th>
                        <th className="pb-4 px-4">Course</th>
                        <th className="pb-4 px-4">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {enrollments.slice(0, 5).map((e) => (
                        <tr key={e.id} className="border-b border-zinc-100 dark:border-zinc-800/50 last:border-0 hover:bg-zinc-50 dark:hover:bg-zinc-800/20 transition-colors">
                          <td className="py-4 px-4 font-medium text-zinc-900 dark:text-zinc-100">
                            {e.user?.email ?? `User #${e.user_id}`}
                          </td>
                          <td className="py-4 px-4 text-zinc-600 dark:text-zinc-300">{e.course.title}</td>
                          <td className="py-4 px-4 text-zinc-500 dark:text-zinc-400 text-sm">{new Date(e.created_at).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12 rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700">
                  <p className="text-zinc-500 dark:text-zinc-400 font-medium">No recent enrollments found.</p>
                </div>
              )}
            </section>
          </div>
        )}

        {/* COURSES TAB */}
        {activeTab === "courses" && (
          <div className="space-y-8 animate-fade-in">
            <div>
              <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white">Course Management</h1>
              <p className="text-zinc-500 dark:text-zinc-400 mt-1 text-lg">Create new courses and schedule live classes.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Create Course Component */}
              <section className="ui-card p-8 rounded-3xl">
                <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-6 flex items-center space-x-3">
                  <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 rounded-lg">
                    <Plus className="w-5 h-5" />
                  </div>
                  <span>Create New Course</span>
                </h2>
                <form onSubmit={handleCreateCourse} className="space-y-5">
                  <div>
                    <label className="ui-label">Course Title</label>
                    <input
                      required
                      type="text"
                      className="ui-input"
                      value={newCourse.title}
                      onChange={e => setNewCourse({...newCourse, title: e.target.value})}
                      placeholder="e.g. Next.js Masterclass"
                    />
                  </div>
                  <div>
                    <label className="ui-label">Description</label>
                    <textarea
                      required
                      rows={4}
                      className="ui-textarea"
                      value={newCourse.description}
                      onChange={e => setNewCourse({...newCourse, description: e.target.value})}
                      placeholder="Describe the course curriculum..."
                    />
                  </div>
                  <button className="w-full ui-btn ui-btn-primary font-bold py-3.5 px-4">
                    Publish Course
                  </button>
                </form>
              </section>

              {/* Create Class Component */}
              <section className="ui-card p-8 rounded-3xl">
                <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-6 flex items-center space-x-3">
                  <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 rounded-lg">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <span>Schedule Live Class</span>
                </h2>
                <form onSubmit={handleCreateClass} className="space-y-5">
                  <div>
                    <label className="ui-label">Select Active Course</label>
                    <select
                      required
                      className="ui-select cursor-pointer"
                      value={newClass.course_id}
                      onChange={e => setNewClass({...newClass, course_id: e.target.value})}
                    >
                      <option value="" disabled>-- Choose Course --</option>
                      {courses.map(c => (
                        <option key={c.id} value={c.id}>{c.title}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="ui-label">Class Topic / Session Title</label>
                    <input
                      required
                      type="text"
                      className="ui-input"
                      value={newClass.title}
                      onChange={e => setNewClass({...newClass, title: e.target.value})}
                      placeholder="e.g. Introduction to React Hooks"
                    />
                  </div>
                  <div>
                    <label className="ui-label">Date & Time</label>
                    <input
                      required
                      type="datetime-local"
                      className="ui-input"
                      value={newClass.datetime}
                      onChange={e => setNewClass({...newClass, datetime: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="ui-label">Meeting Link</label>
                    <input
                      required
                      type="url"
                      placeholder="https://meet.google.com/xyz-abcd-123"
                      className="ui-input"
                      value={newClass.meet_link}
                      onChange={e => setNewClass({...newClass, meet_link: e.target.value})}
                    />
                  </div>
                  <button className="w-full ui-btn ui-btn-secondary font-bold py-3.5 px-4">
                    Schedule Session
                  </button>
                </form>
              </section>
            </div>
          </div>
        )}

        {/* USERS TAB */}
        {activeTab === "users" && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white">User Management</h1>
              <p className="text-zinc-500 dark:text-zinc-400 mt-1 text-lg">View all registered students and teachers.</p>
            </div>

            <section className="bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm mt-8">
              {systemUsers.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 uppercase text-xs font-bold tracking-wider">
                        <th className="pb-4 px-4">User ID</th>
                        <th className="pb-4 px-4">Email</th>
                        <th className="pb-4 px-4">Role</th>
                        <th className="pb-4 px-4">Registered Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {systemUsers.map(u => (
                        <tr key={u.id} className="border-b border-zinc-100 dark:border-zinc-800/50 last:border-0 hover:bg-zinc-50 dark:hover:bg-zinc-800/20 transition-colors">
                          <td className="py-4 px-4 text-zinc-500 dark:text-zinc-400 font-mono text-sm">{u.id}</td>
                          <td className="py-4 px-4 font-medium text-zinc-900 dark:text-zinc-100">{u.email}</td>
                          <td className="py-4 px-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${u.is_teacher ? 'bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-500/20' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700'}`}>
                              {u.is_teacher ? "Teacher" : "Student"}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-zinc-500 dark:text-zinc-400 text-sm">
                            {new Date(u.created_at).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-16 border border-dashed border-zinc-300 dark:border-zinc-700 rounded-2xl">
                  <Users className="w-12 h-12 text-zinc-300 dark:text-zinc-700 mx-auto mb-4" />
                  <p className="text-zinc-500 dark:text-zinc-400 text-lg font-medium">No users found in the system.</p>
                </div>
              )}
            </section>
          </div>
        )}

        {/* SETTINGS TAB */}
        {activeTab === "settings" && (
          <div className="space-y-6 max-w-3xl animate-fade-in">
            <div>
              <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white">Platform Settings</h1>
              <p className="text-zinc-500 dark:text-zinc-400 mt-1 text-lg">Configure global application settings.</p>
            </div>

            <div className="bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-8">
              <div className="border-b border-zinc-100 dark:border-zinc-800 pb-8">
                <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">Account Ownership</h3>
                <p className="text-zinc-600 dark:text-zinc-400 mb-6">Transfer administrative privileges to someone else.</p>
                <div className="flex items-center space-x-4">
                  <input type="email" placeholder="New owner email..." className="flex-1 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-3 outline-none opacity-50 cursor-not-allowed" disabled />
                  <button className="bg-zinc-100 dark:bg-zinc-800 text-zinc-400 px-8 py-3 rounded-xl font-bold cursor-not-allowed border border-transparent">Transfer</button>
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-bold text-red-600 dark:text-red-400 mb-2">Danger Zone</h3>
                <p className="text-zinc-600 dark:text-zinc-400 mb-6">Permanently delete all system data including courses and enrollments. This cannot be undone.</p>
                <button className="bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20 px-8 py-3.5 rounded-xl font-bold hover:bg-red-100 dark:hover:bg-red-500/20 active:scale-[0.98] transition-all">
                  Purge Database
                </button>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
