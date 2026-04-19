"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { signInWithPopup } from "firebase/auth";

import { api } from "@/lib/api";
import { parseJwtPayload, setAccessToken } from "@/lib/auth";
import { firebaseAuth, googleProvider } from "@/lib/firebase";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  function routeAfterAuth(accessToken: string) {
    setAccessToken(accessToken);
    const p = parseJwtPayload(accessToken);
    if (p?.role === "admin") router.replace("/admin");
    else router.replace("/dashboard");
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      await api.post("/auth/register", { name, email, password, intro: null });
      router.replace("/login?registered=1");
    } catch (err: unknown) {
      const d = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setError(typeof d === "string" ? d : "Could not register");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-10">
      <Link href="/" className="mb-8 font-display text-xl font-semibold text-white">
        ← Coding Rocket
      </Link>
      <div className="panel rounded-3xl p-8 shadow-2xl shadow-black/20">
        <h1 className="font-display text-2xl font-semibold text-white">Register</h1>
        <p className="mt-2 text-sm text-slate-400">Create your account to start browsing courses and requesting enrollment.</p>
        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <div>
            <label className="text-xs font-medium uppercase tracking-wide text-slate-400">Full name</label>
            <input
              className="mt-1 w-full rounded-lg border border-white/10 px-3 py-2 text-sm outline-none ring-accent focus:ring-2"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="text-xs font-medium uppercase tracking-wide text-slate-400">Email</label>
            <input
              className="mt-1 w-full rounded-lg border border-white/10 px-3 py-2 text-sm outline-none ring-accent focus:ring-2"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="text-xs font-medium uppercase tracking-wide text-slate-400">Password</label>
            <input
              className="mt-1 w-full rounded-lg border border-white/10 px-3 py-2 text-sm outline-none ring-accent focus:ring-2"
              type="password"
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="text-sm text-rose-400">{error}</p>}
          <button
            type="submit"
            disabled={loading || googleLoading}
            className="btn-primary w-full py-2.5 disabled:opacity-50"
          >
            {loading ? "Creating account…" : "Create account"}
          </button>
          <button
            type="button"
            onClick={async () => {
              setError(null);
              setSuccess(null);
              setGoogleLoading(true);
              try {
                const cred = await signInWithPopup(firebaseAuth, googleProvider);
                const idToken = await cred.user.getIdToken();
                const { data } = await api.post<{ access_token: string }>("/auth/firebase-login", { id_token: idToken });
                setSuccess("Google sign-up successful. Redirecting...");
                setTimeout(() => routeAfterAuth(data.access_token), 250);
              } catch {
                setError("Could not sign up with Google");
              } finally {
                setGoogleLoading(false);
              }
            }}
            disabled={loading || googleLoading}
            className="btn-google disabled:opacity-50"
          >
            <span aria-hidden="true" className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white text-[10px] font-bold text-slate-800">
              G
            </span>
            {googleLoading ? "Connecting Google…" : "Continue with Google"}
          </button>
        </form>
        {success && <p className="mt-4 rounded-lg border border-emerald-400/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">{success}</p>}
        <p className="mt-6 text-center text-sm text-slate-400">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-accent hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
