"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { useScrollReveal } from "@/lib/useScrollReveal";
import {
  ArrowRight,
  BriefcaseBusiness,
  CodeXml,
  Compass,
  Gauge,
  GraduationCap,
  Handshake,
  MessageSquareHeart,
  Rocket,
  ShieldCheck,
  Users,
} from "lucide-react";
import SectionHeading from "@/components/landing/SectionHeading";
import FeatureCard from "@/components/landing/FeatureCard";
import RoadmapStep from "@/components/landing/RoadmapStep";
import ProjectCard from "@/components/landing/ProjectCard";
import TestimonialCard from "@/components/landing/TestimonialCard";

interface Course {
  id: number;
  title: string;
  description: string;
}

interface CourseDetail {
  id: number;
  classes?: Array<{ id: number }>;
}

interface FeaturedProject {
  title: string;
  summary: string;
  stack: string[];
  accent: string;
  href?: string;
}

const testimonials = [
  {
    name: "Aarav Mehta",
    role: "Frontend Engineer, Razorpay",
    image: "https://i.pravatar.cc/120?img=12",
    quote: "The project-driven flow made me job-ready faster than any random tutorial path. I shipped confidently in interviews.",
  },
  {
    name: "Nidhi Verma",
    role: "SDE-1, Zoho",
    image: "https://i.pravatar.cc/120?img=32",
    quote: "Mentor check-ins and weekly milestones removed confusion. I always knew what to build next and why.",
  },
  {
    name: "Rohan Kulkarni",
    role: "Backend Developer, Postman",
    image: "https://i.pravatar.cc/120?img=14",
    quote: "From zero confidence to two internships. The roadmap plus real code reviews changed my consistency completely.",
  },
];

const featureHighlights = [
  {
    icon: CodeXml,
    title: "Learn By Building",
    description: "Every module ends with deployable projects so your portfolio grows as fast as your skills.",
  },
  {
    icon: Gauge,
    title: "Fast-Track Learning",
    description: "Structured sprints and milestone deadlines keep you moving without burnout or scattered learning.",
  },
  {
    icon: Handshake,
    title: "Mentorship First",
    description: "Get regular mentor reviews, direct feedback loops, and support when you are blocked.",
  },
  {
    icon: ShieldCheck,
    title: "Real-World Skills",
    description: "Ship production-style projects using modern stacks and interview-driven problem solving.",
  },
];

const roadmapSteps = [
  {
    phase: "Stage 01",
    title: "Beginner Foundation",
    description: "Master core web fundamentals, Git, and coding habits through guided hands-on labs.",
  },
  {
    phase: "Stage 02",
    title: "Project Sprints",
    description: "Build full-stack products with code reviews, mentor checkpoints, and weekly demos.",
  },
  {
    phase: "Stage 03",
    title: "Internship-Ready",
    description: "Refine your resume, portfolio, and interview confidence to become internship and job ready.",
  },
];

const projects: FeaturedProject[] = [
  {
    title: "DevConnect Community Hub",
    summary: "A collaboration platform with events, announcements, and peer discussion channels.",
    stack: ["Next.js", "Firebase", "Tailwind"],
    accent: "#7a63ff",
  },
  {
    title: "Mentor Match Dashboard",
    summary: "A dashboard to pair learners with mentors based on learning goals and progress.",
    stack: ["React", "FastAPI", "PostgreSQL"],
    accent: "#34bcff",
  },
  {
    title: "Interview Prep Tracker",
    summary: "Track DSA, project progress, and mock interview feedback in one productivity workspace.",
    stack: ["TypeScript", "Node", "Charts"],
    accent: "#5eead4",
  },
];

export default function LandingPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [classCountByCourse, setClassCountByCourse] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useScrollReveal(courses.length);

  useEffect(() => {
    let isCancelled = false;

    async function fetchCourses() {
      try {
        setFetchError(null);
        const response = await api.get("/courses");
        const courseRows: Course[] = response.data;
        if (isCancelled) return;
        setCourses(courseRows);

        const detailResults = await Promise.allSettled(
          courseRows.map((course) => api.get(`/courses/${course.id}`))
        );
        if (isCancelled) return;

        const classesMap: Record<number, number> = {};
        detailResults.forEach((result, index) => {
          const fallbackId = courseRows[index]?.id;
          if (result.status === "fulfilled") {
            const detail = result.value.data as CourseDetail;
            classesMap[detail.id] = detail.classes?.length ?? 0;
          } else if (fallbackId) {
            classesMap[fallbackId] = 0;
          }
        });

        setClassCountByCourse(classesMap);
      } catch (error) {
        console.error("Failed to fetch courses", error);
        if (!isCancelled) {
          setFetchError("Could not load live course data right now. Please try again shortly.");
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }
    fetchCourses();

    return () => {
      isCancelled = true;
    };
  }, []);

  const totalTracks = courses.length;
  const totalSessions = Object.values(classCountByCourse).reduce((sum, count) => sum + count, 0);
  const featuredProjects: FeaturedProject[] =
    courses.length > 0
      ? courses.slice(0, 3).map((course, idx) => ({
          title: course.title,
          summary: course.description,
          stack: ["Live Classes", `${classCountByCourse[course.id] ?? 0} Sessions`, "Mentorship"],
          accent: idx % 3 === 0 ? "#7a63ff" : idx % 3 === 1 ? "#34bcff" : "#5eead4",
          href: `/course/${course.id}`,
        }))
      : projects;

  return (
    <div id="home" className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 opacity-50 bg-[radial-gradient(circle_at_15%_18%,rgba(111,93,255,0.32),transparent_28%),radial-gradient(circle_at_86%_22%,rgba(30,167,255,0.28),transparent_30%),radial-gradient(circle_at_50%_82%,rgba(137,97,255,0.22),transparent_26%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(130,152,255,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(130,152,255,0.08)_1px,transparent_1px)] bg-[size:44px_44px]" />

      <section className="relative px-4 sm:px-6 pt-16 sm:pt-20 pb-14 sm:pb-16 border-b border-[var(--line)]">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-[1.05fr_0.95fr] gap-10 lg:gap-12 items-center">
          <div data-reveal="left">
            <p className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold uppercase tracking-[0.18em] px-4 py-2 rounded-full bg-[var(--surface)] border border-[var(--line)] text-[var(--foreground)]">
              <Rocket className="w-4 h-4 text-[var(--secondary)]" />
              Cohort Based Learning Program
            </p>
            <h1 className="mt-6 text-4xl sm:text-5xl md:text-6xl font-semibold tracking-[-0.045em] leading-[1.02] text-[var(--foreground)] max-w-3xl">
              Launch Your Coding Journey 🚀
            </h1>
            <p className="mt-6 text-base sm:text-lg md:text-xl text-[var(--muted)] leading-8 max-w-2xl">
              Learn coding by building real products, shipping projects with mentors, and following a proven roadmap from beginner to internship-ready.
            </p>
            <div className="mt-9 flex flex-wrap gap-3 sm:gap-4">
              <Link href="/dashboard" className="ui-btn ui-btn-primary px-7 py-3.5 rounded-xl font-semibold inline-flex items-center gap-2">
                Join Now
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="#roadmap" className="ui-btn ui-btn-secondary px-7 py-3.5 rounded-xl font-semibold inline-flex items-center gap-2">
                View Roadmap
                <Compass className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="rounded-[1.8rem] border border-[var(--line)] bg-[var(--surface)] backdrop-blur-xl p-6 sm:p-8 shadow-[0_30px_70px_rgba(0,0,0,0.22)]" data-reveal="right">
            <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface-strong)] p-4 sm:p-5">
              <div className="flex gap-2 mb-5">
                <span className="w-2.5 h-2.5 rounded-full bg-[var(--primary)]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[var(--secondary)]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[var(--accent)]" />
              </div>
              <div className="space-y-3 font-mono text-sm sm:text-[0.95rem] text-[var(--muted)]">
                <p><span className="text-[var(--secondary)]">const</span> journey = [&quot;learn&quot;, &quot;build&quot;, &quot;ship&quot;];</p>
                <p><span className="text-[var(--secondary)]">const</span> mentor = &quot;weekly-code-reviews&quot;;</p>
                <p><span className="text-[var(--secondary)]">const</span> result = &quot;internship-ready&quot;;</p>
                <p className="text-[var(--accent)]">{"// Your next cohort starts this week"}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mt-6 text-center">
              <div className="rounded-xl border border-[var(--line)] bg-[var(--surface-strong)] p-3">
                <p className="text-lg sm:text-xl font-semibold text-[var(--foreground)]">{totalTracks > 0 ? `${totalTracks}+` : "0"}</p>
                <p className="text-xs text-[var(--muted)]">Tracks</p>
              </div>
              <div className="rounded-xl border border-[var(--line)] bg-[var(--surface-strong)] p-3">
                <p className="text-lg sm:text-xl font-semibold text-[var(--foreground)]">{totalSessions > 0 ? `${totalSessions}+` : "0"}</p>
                <p className="text-xs text-[var(--muted)]">Live Sessions</p>
              </div>
              <div className="rounded-xl border border-[var(--line)] bg-[var(--surface-strong)] p-3">
                <p className="text-lg sm:text-xl font-semibold text-[var(--foreground)]">{testimonials.length * 100}+</p>
                <p className="text-xs text-[var(--muted)]">Success Stories</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 py-14 sm:py-20" id="why">
        <SectionHeading
          kicker="Why Choose Us"
          title="Designed for serious learners who want real outcomes"
          description="Not just videos. A complete growth system with practical coding, live support, and accountability."
        />
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {featureHighlights.map((item) => (
            <FeatureCard key={item.title} icon={item.icon} title={item.title} description={item.description} />
          ))}
        </div>
      </section>

      <section id="roadmap" className="relative max-w-7xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
        <SectionHeading
          kicker="Learning Roadmap"
          title="A structured path from zero to internship-ready"
          description="Follow a timeline that removes guesswork and builds confidence week after week."
        />
        <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
          {roadmapSteps.map((step) => (
            <RoadmapStep key={step.phase} phase={step.phase} title={step.title} description={step.description} />
          ))}
        </div>
      </section>

      <section id="projects" className="relative max-w-7xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
        <SectionHeading
          kicker="Projects Showcase"
          title="Build portfolio projects companies actually value"
          description="Your work will reflect production-style practices, modern tooling, and collaborative development."
        />
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {featuredProjects.map((project) => (
            <ProjectCard
              key={project.title}
              title={project.title}
              summary={project.summary}
              stack={project.stack}
              accent={project.accent}
              href={project.href}
              ctaLabel={project.href ? "Open Course" : "View Details"}
            />
          ))}
        </div>
      </section>

      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 py-14 sm:py-20" id="mentorship">
        <div className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface)] p-7 sm:p-10 backdrop-blur-xl grid md:grid-cols-[0.85fr_1.15fr] gap-8 items-center" data-reveal>
          <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] p-6">
            <div className="w-14 h-14 rounded-2xl bg-[var(--brand-soft)] text-[var(--secondary)] border border-[var(--line)] flex items-center justify-center mb-4">
              <GraduationCap className="w-7 h-7" />
            </div>
            <p className="text-sm uppercase tracking-[0.14em] text-[var(--secondary)] font-semibold mb-2">Mentor Spotlight</p>
            <h3 className="text-2xl font-semibold text-[var(--foreground)] mb-2">Aman Raj</h3>
            <p className="text-[var(--muted)]">Student-led mentor, ex-intern @ product startup</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-[var(--secondary)] font-semibold mb-3">Mentorship</p>
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-[-0.03em] text-[var(--foreground)] mb-4">Guidance from people who recently cracked it</h2>
            <p className="text-[var(--muted)] text-base sm:text-lg leading-8 mb-6">
              Learn from mentors who understand college-level pressure, interview prep timelines, and project depth that recruiters expect.
            </p>
            <div className="flex flex-wrap gap-3 text-sm">
              <span className="px-4 py-2 rounded-full border border-[var(--line)] bg-[var(--surface-strong)] text-[var(--foreground)]">Weekly Code Reviews</span>
              <span className="px-4 py-2 rounded-full border border-[var(--line)] bg-[var(--surface-strong)] text-[var(--foreground)]">Career Q&A Sessions</span>
              <span className="px-4 py-2 rounded-full border border-[var(--line)] bg-[var(--surface-strong)] text-[var(--foreground)]">Doubt Clearing Rooms</span>
            </div>
          </div>
        </div>
      </section>

      <section id="community" className="relative max-w-7xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
        <SectionHeading
          kicker="Community"
          title="Build with a tribe that keeps you accountable"
          description="Collaborate daily in Discord and WhatsApp pods to stay consistent, solve blockers fast, and celebrate wins."
        />
        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
          <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-6" data-reveal>
            <Users className="w-6 h-6 text-[var(--secondary)] mb-4" />
            <p className="text-3xl font-semibold text-[var(--foreground)]">{totalTracks > 0 ? totalTracks : "0"}</p>
            <p className="text-[var(--muted)] mt-1">Active learning tracks</p>
          </div>
          <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-6" data-reveal>
            <MessageSquareHeart className="w-6 h-6 text-[var(--secondary)] mb-4" />
            <p className="text-3xl font-semibold text-[var(--foreground)]">{totalSessions > 0 ? totalSessions : "0"}</p>
            <p className="text-[var(--muted)] mt-1">Scheduled live sessions</p>
          </div>
          <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-6" data-reveal>
            <BriefcaseBusiness className="w-6 h-6 text-[var(--secondary)] mb-4" />
            <p className="text-3xl font-semibold text-[var(--foreground)]">{testimonials.length}</p>
            <p className="text-[var(--muted)] mt-1">Published student stories</p>
          </div>
        </div>
      </section>

      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 py-14 sm:py-20" id="testimonials">
        <SectionHeading
          kicker="Testimonials"
          title="Students who transformed consistency into outcomes"
          description="Real feedback from learners who completed projects, improved confidence, and landed opportunities."
        />
        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
          {testimonials.map((item) => (
            <TestimonialCard key={item.name} name={item.name} role={item.role} quote={item.quote} image={item.image} />
          ))}
        </div>
      </section>

      <section id="join" className="relative max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
        <div className="rounded-[2rem] border border-[var(--secondary)]/35 bg-[linear-gradient(130deg,rgba(111,93,255,0.35),rgba(30,167,255,0.2),rgba(111,93,255,0.2))] p-8 sm:p-10 md:p-12 backdrop-blur-xl text-center" data-reveal>
          <p className="text-xs sm:text-sm uppercase tracking-[0.22em] text-[var(--foreground)] mb-3 font-semibold">Pricing / Free Batch</p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-[-0.03em] text-white mb-4">Reserve Your Spot 🚀</h2>
          <p className="text-[var(--foreground)]/90 text-base sm:text-lg leading-8 max-w-2xl mx-auto mb-8">
            Join the next free orientation batch. Limited seats, direct mentor access, and project kick-off from day one.
          </p>
          <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
            <Link href="/dashboard" className="ui-btn rounded-xl bg-white text-[#0a1331] px-7 py-3.5 font-semibold hover:bg-[#eef4ff]">
              Join Now
            </Link>
            <Link href="#projects" className="ui-btn rounded-xl border border-white/50 bg-white/10 text-white px-7 py-3.5 font-semibold hover:bg-white/20">
              Explore Projects
            </Link>
          </div>
        </div>
      </section>

      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 pb-20" id="courses">
        <SectionHeading
          kicker="Live Tracks"
          title="Active courses from our learning ecosystem"
          description="Explore current tracks and begin your guided coding path today."
          action={
            <Link href="/dashboard" className="ui-btn ui-btn-secondary px-5 py-3 rounded-xl font-semibold inline-flex items-center gap-2">
              Go to Dashboard
              <ArrowRight className="w-4 h-4" />
            </Link>
          }
        />

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-10">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-60 rounded-3xl border border-[var(--line)] bg-[var(--surface)] animate-pulse" />
            ))}
          </div>
        ) : fetchError ? (
          <div className="mt-10 text-center rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-12" data-reveal>
            <p className="text-xl font-semibold text-[var(--foreground)] mb-2">Unable to load courses</p>
            <p className="text-[var(--muted)]">{fetchError}</p>
          </div>
        ) : courses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-10">
            {courses.map((course) => (
              <ProjectCard
                key={course.id}
                title={course.title}
                summary={course.description}
                stack={["Live Classes", `${classCountByCourse[course.id] ?? 0} Sessions`, "Mentorship"]}
                accent={course.id % 2 === 0 ? "#34bcff" : "#7a63ff"}
                href={`/course/${course.id}`}
                ctaLabel="Open Syllabus"
              />
            ))}
          </div>
        ) : (
          <div className="mt-10 text-center rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-12" data-reveal>
            <p className="text-xl font-semibold text-[var(--foreground)] mb-2">New batch details dropping soon</p>
            <p className="text-[var(--muted)]">Courses will appear here once the next cohort opens.</p>
          </div>
        )}
      </section>
    </div>
  );
}
