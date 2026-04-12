"use client";

import Link from "next/link";
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
    const next = searchParams.get("next");
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
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4">
      <Link href="/" className="mb-8 font-display text-xl font-semibold text-white">
        ← Coding Rocket
      </Link>
      <div className="glass rounded-2xl p-8">
        <h1 className="font-display text-2xl font-semibold text-white">Log in</h1>
        <p className="mt-2 text-sm text-slate-400">Use the email and password for your account.</p>
        {success && <p className="mt-4 rounded-lg border border-emerald-400/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">{success}</p>}
        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <div>
            <label className="text-xs font-medium uppercase tracking-wide text-slate-400">Email</label>
            <input
              className="mt-1 w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2 text-sm outline-none ring-accent focus:ring-2"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="text-xs font-medium uppercase tracking-wide text-slate-400">Password</label>
            <input
              className="mt-1 w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2 text-sm outline-none ring-accent focus:ring-2"
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
            className="w-full rounded-lg bg-accent py-2.5 text-sm font-semibold text-white hover:bg-accent-dim disabled:opacity-50"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
          <button
            type="button"
            onClick={() => void onGoogleLogin()}
            disabled={loading || googleLoading}
            className="btn-google disabled:opacity-50"
          >
            <span aria-hidden="true" className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white text-[10px] font-bold text-slate-800">
              G
            </span>
            {googleLoading ? "Connecting Google…" : "Continue with Google"}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-400">
          New here?{" "}
          <Link href="/register" className="text-accent hover:underline">
            Register
          </Link>
        </p>
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
