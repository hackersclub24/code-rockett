"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { signInWithPopup } from "firebase/auth";

import { api } from "@/lib/api";
import { parseJwtPayload, setAccessToken } from "@/lib/auth";
import { firebaseAuth, googleProvider } from "@/lib/firebase";

function LoginPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  function routeAfterAuth(accessToken: string) {
    setAccessToken(accessToken);
    const p = parseJwtPayload(accessToken);
    if (p?.role === "admin") {
      router.replace("/admin");
      return;
    }
    const next = searchParams?.get("next");
    if (next && next.startsWith("/")) router.replace(next);
    else router.replace("/dashboard");
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      const { data } = await api.post<{ access_token: string }>("/auth/login", { email, password });
      routeAfterAuth(data.access_token);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? "Could not sign in";
      setError(typeof msg === "string" ? msg : "Could not sign in");
    } finally {
      setLoading(false);
    }
  }

  async function onGoogleLogin() {
    setError(null);
    setSuccess(null);
    setGoogleLoading(true);
    try {
      const cred = await signInWithPopup(firebaseAuth, googleProvider);
      const idToken = await cred.user.getIdToken();
      const { data } = await api.post<{ access_token: string }>("/auth/firebase-login", { id_token: idToken });
      setSuccess("Google sign-in successful. Redirecting...");
      setTimeout(() => routeAfterAuth(data.access_token), 250);
    } catch {
      setError("Could not sign in with Google");
    } finally {
      setGoogleLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen w-full items-center px-4 pb-8 pt-20 sm:px-6 sm:py-10 lg:px-8 lg:py-8">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 top-12 h-64 w-64 rounded-full bg-accent/15 blur-3xl animate-pulse" />
        <div className="absolute -right-20 bottom-4 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
      </div>

      <div className="relative grid w-full overflow-hidden rounded-[1.5rem] border border-white/10 bg-[color:var(--panel-bg)] shadow-[0_30px_80px_-50px_rgba(0,0,0,0.75)] backdrop-blur-xl sm:rounded-[2rem] lg:grid-cols-[0.95fr_1.05fr]">
        <section className="hidden border-r border-white/10 p-8 lg:block xl:p-10">
          <Link href="/" className="inline-flex items-center gap-2 text-lg font-semibold text-white/90 transition hover:text-accent">
            <span aria-hidden="true">Back</span>
            Coding Rocket
          </Link>

          <div className="mt-10">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-accent">Welcome Back</p>
            <h1 className="mt-4 font-display text-4xl font-semibold leading-tight text-white">
              Continue your
              <span className="block text-accent">learning mission</span>
            </h1>
            <p className="mt-4 max-w-sm text-sm leading-7 text-slate-300">
              Rejoin your classes, projects, and assignments with a cleaner dashboard experience.
            </p>
          </div>

          <div className="mt-10 space-y-3">
            {[
              "Live classes with clear schedules",
              "Project-first learning path",
              "Track attendance and submissions",
            ].map((item) => (
              <div key={item} className="glass rounded-xl px-4 py-3 text-sm text-slate-300">
                {item}
              </div>
            ))}
          </div>

          <div className="relative mt-10 h-40 overflow-hidden rounded-2xl border border-white/10">
            <Image
              src="/images/StockCake-Neon_Coding_Session-465513-standard.jpg"
              alt="Coding workspace"
              fill
              priority
              sizes="(max-width: 1280px) 40vw, 420px"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-transparent" />
          </div>
        </section>

        <section className="p-5 sm:p-8 lg:p-10">
          <div className="mb-6 flex items-center justify-between gap-3 sm:mb-8 sm:gap-4">
            <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-white/90 transition hover:text-accent sm:text-base lg:hidden">
              <span aria-hidden="true">Back</span>
              Coding Rocket
            </Link>
            <div className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-accent sm:px-3 sm:text-[11px] sm:tracking-[0.2em]">
              Secure Sign In
            </div>
          </div>

          <h2 className="font-display text-2xl font-semibold text-white sm:text-3xl">Log in</h2>
          <p className="mt-2 text-sm text-slate-300">Use your account credentials to access your learning space.</p>

          {success && <p className="mt-5 rounded-lg border border-emerald-400/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">{success}</p>}

          <form className="mt-6 space-y-4 sm:space-y-5" onSubmit={onSubmit}>
            <div>
              <label className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400 sm:tracking-[0.2em]">Email</label>
              <input
                className="mt-2 w-full rounded-xl border border-white/10 px-4 py-3 text-sm outline-none ring-accent/60 transition focus:ring-2"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400 sm:tracking-[0.2em]">Password</label>
              <input
                className="mt-2 w-full rounded-xl border border-white/10 px-4 py-3 text-sm outline-none ring-accent/60 transition focus:ring-2"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && <p className="text-sm text-rose-400">{error}</p>}

            <button
              type="submit"
              disabled={loading || googleLoading}
              className="btn-primary w-full py-3 text-sm disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>

            <button
              type="button"
              onClick={() => void onGoogleLogin()}
              disabled={loading || googleLoading}
              className="btn-google py-3 disabled:opacity-50"
            >
              <span aria-hidden="true" className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white text-[10px] font-bold text-slate-800">
                G
              </span>
              {googleLoading ? "Connecting Google..." : "Continue with Google"}
            </button>
          </form>

          <p className="mt-7 text-center text-sm text-slate-400">
            New here?{" "}
            <Link href="/register" className="font-semibold text-accent hover:underline">
              Register
            </Link>
          </p>
        </section>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 text-slate-400">Loading…</div>}>
      <LoginPageInner />
    </Suspense>
  );
}
