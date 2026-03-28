"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import CourseCard from "@/components/CourseCard";
import api from "@/lib/api";
import { useScrollReveal } from "@/lib/useScrollReveal";
import { ArrowRight, Sparkles, BadgeCheck, CalendarDays, UsersRound, BookOpen, Star, BriefcaseBusiness } from "lucide-react";

interface Course {
  id: number;
  title: string;
  description: string;
}

const testimonials = [
  {
    name: "Aarav Mehta",
    role: "Frontend Engineer",
    company: "Razorpay",
    outcome: "18 LPA",
    image: "https://i.pravatar.cc/120?img=12",
    quote:
      "The live checkpoints forced consistency. I shipped two production-grade projects and converted that into interviews within 8 weeks.",
  },
  {
    name: "Nidhi Verma",
    role: "SDE-1",
    company: "Zoho",
    outcome: "Offer in 3 months",
    image: "https://i.pravatar.cc/120?img=32",
    quote:
      "What worked for me was the structure. Every class had action items, code reviews, and direct feedback that kept me moving.",
  },
  {
    name: "Rohan Kulkarni",
    role: "Backend Developer",
    company: "Postman",
    outcome: "2 internships + PPO",
    image: "https://i.pravatar.cc/120?img=14",
    quote:
      "I finally stopped learning randomly. The roadmap and weekly live sessions turned scattered effort into measurable results.",
  },
];

export default function LandingPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useScrollReveal(courses.length);

  useEffect(() => {
    async function fetchCourses() {
      try {
        const response = await api.get("/courses");
        setCourses(response.data);
      } catch (error) {
        console.error("Failed to fetch courses", error);
      } finally {
        setLoading(false);
      }
    }
    fetchCourses();
  }, []);

  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 edu-grid opacity-20 pointer-events-none" />
      <div className="absolute inset-x-0 top-0 h-[460px] hero-aurora pointer-events-none" />
      <div className="absolute -top-28 right-[-140px] w-[420px] h-[420px] rounded-full bg-[var(--brand-soft)] blur-3xl opacity-80 pointer-events-none float-orb" />
      <div className="absolute top-[280px] left-[-120px] w-[360px] h-[360px] rounded-full bg-amber-200/40 dark:bg-amber-500/20 blur-3xl pointer-events-none float-orb" style={{ animationDelay: "1.4s" }} />

      <section className="relative w-full border-b border-[var(--line)] py-16 sm:py-20 lg:py-28 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-[1.1fr_0.9fr] gap-10 lg:gap-12 items-center">
          <div className="stagger-in hero-copy-plate" data-reveal="left" style={{ animationDelay: "60ms" }}>
            <div className="inline-flex items-center space-x-2 hero-kicker text-[var(--brand)] px-4 py-2 rounded-full font-bold text-xs tracking-[0.08em] uppercase mb-6">
              <Sparkles className="w-4 h-4" />
              <span>Live Mentorship Program</span>
            </div>
            <h1 className="display-hero hero-copy-title max-w-3xl drop-shadow-[0_6px_16px_rgba(8,15,40,0.14)]">
              Learn with structure,
              <span className="block hero-gradient-text mt-2">grow with guidance.</span>
            </h1>
            <p className="body-lead hero-copy-body mt-6 sm:mt-7">
              Code Rocket is built for teaching-first learning. Follow curated paths, join live sessions, and get project-level clarity from expert-led classes.
            </p>
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-9 sm:mt-10">
              <Link
                href="/dashboard"
                className="inline-flex items-center space-x-2 hero-cta-primary px-6 sm:px-7 py-3.5 sm:py-4 rounded-xl font-bold transition-all duration-300"
              >
                <span>Join Program</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="#courses"
                className="inline-flex items-center space-x-2 hero-cta-secondary px-6 sm:px-7 py-3.5 sm:py-4 rounded-xl font-semibold hover:bg-[var(--brand-soft)] transition-colors"
              >
                <span>View Courses</span>
              </Link>
            </div>
          </div>

          <div className="edu-glass why-card premium-card hero-float-card rounded-[1.8rem] p-7 md:p-9 stagger-in" data-reveal="right" style={{ animationDelay: "180ms", ["--reveal-delay" as string]: 1 }}>
            <h2 className="heading-md section-title mb-6">Why students stay consistent</h2>
            <div className="space-y-4">
              <div className="why-point">
                <div className="why-point-icon"><BadgeCheck className="w-5 h-5" /></div>
                <p className="section-subtitle text-[0.97rem] leading-7">Step-by-step curriculum with live class checkpoints every week.</p>
              </div>
              <div className="why-point">
                <div className="why-point-icon"><CalendarDays className="w-5 h-5" /></div>
                <p className="section-subtitle text-[0.97rem] leading-7">Session calendars and links in one place, no context switching.</p>
              </div>
              <div className="why-point">
                <div className="why-point-icon"><UsersRound className="w-5 h-5" /></div>
                <p className="section-subtitle text-[0.97rem] leading-7">Learn with peer momentum and regular accountability loops.</p>
              </div>
            </div>
            <div className="stats-grid mt-7">
              <div className="stat-card text-center">
                <div className="stat-icon"><BookOpen className="w-4 h-4" /></div>
                <p className="text-xl font-semibold text-[var(--brand)]">12+</p>
                <p className="text-xs section-subtitle">Courses</p>
              </div>
              <div className="stat-card text-center">
                <div className="stat-icon"><CalendarDays className="w-4 h-4" /></div>
                <p className="text-xl font-semibold text-[var(--brand)]">36</p>
                <p className="text-xs section-subtitle">Live Classes</p>
              </div>
              <div className="stat-card text-center">
                <div className="stat-icon"><BadgeCheck className="w-4 h-4" /></div>
                <p className="text-xl font-semibold text-[var(--brand)]">94%</p>
                <p className="text-xs section-subtitle">Completion</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-20" data-reveal>
        <div className="mb-8 md:mb-10 text-center md:text-left">
          <p className="text-xs uppercase tracking-[0.14em] font-semibold text-[var(--brand)] mb-3">Social Proof</p>
          <h2 className="heading-lg section-title mb-3">Outcomes students are proud of</h2>
          <p className="body-lead section-subtitle max-w-3xl">Real learners, real placements, real progress. These are snapshots from students who stayed consistent through the live mentorship flow.</p>
        </div>

        <div className="testimonial-rail">
          {testimonials.map((item, index) => (
            <article
              key={item.name}
              className="testimonial-card edu-glass premium-card"
              data-reveal
              style={{ "--reveal-delay": index } as React.CSSProperties}
            >
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-3 min-w-0">
                  <img src={item.image} alt={`${item.name} profile`} className="w-12 h-12 rounded-full object-cover border border-[var(--line)]" />
                  <div className="min-w-0">
                    <p className="font-semibold section-title truncate">{item.name}</p>
                    <p className="text-sm section-subtitle truncate">{item.role}</p>
                  </div>
                </div>
                <div className="inline-flex items-center gap-1 text-amber-500 shrink-0">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>
              </div>

              <p className="section-subtitle text-[0.98rem] leading-7 mb-5">“{item.quote}”</p>

              <div className="flex items-center justify-between gap-3 pt-4 border-t border-[var(--line)]">
                <div className="inline-flex items-center gap-2 text-[var(--brand)] font-medium text-sm">
                  <BriefcaseBusiness className="w-4 h-4" />
                  <span>{item.company}</span>
                </div>
                <span className="result-pill">{item.outcome}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="courses" className="relative w-full max-w-7xl mx-auto py-24 px-4">
        <div className="mb-16 text-center md:text-left" data-reveal>
          <h2 className="heading-lg section-title mb-4">Teaching Tracks</h2>
          <p className="body-lead section-subtitle max-w-3xl">Each course combines concept foundations, guided labs, and live classes so you can learn theory and execution together.</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse bg-[var(--surface-strong)] border border-[var(--line)] h-72 rounded-3xl"></div>
            ))}
          </div>
        ) : courses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course) => (
              <CourseCard
                key={course.id}
                id={course.id}
                title={course.title}
                description={course.description}
                revealDelay={course.id % 6}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-24 edu-glass rounded-3xl">
            <h3 className="text-2xl font-bold section-title mb-3">No courses published yet</h3>
            <p className="text-lg section-subtitle">Your teaching tracks will appear here once they are live.</p>
          </div>
        )}
      </section>
    </div>
  );
}
