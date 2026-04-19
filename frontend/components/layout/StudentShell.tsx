"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { api } from "@/lib/api";
import { clearAccessToken, getAccessToken, parseJwtPayload } from "@/lib/auth";
import type { User } from "@/types";

const links = [
  { href: "/dashboard", label: "Home" },
  { href: "/classes", label: "Classes" },
  { href: "/assignments", label: "Assignments" },
  { href: "/profile", label: "Profile" },
];

export function StudentShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const token = getAccessToken();
      if (!token) {
        router.replace("/login");
        return;
      }
      const p = parseJwtPayload(token);
      if (p?.role !== "student" || p?.status !== "approved") {
        router.replace("/login");
        return;
      }
      try {
        const { data } = await api.get<User>("/auth/me");
        if (!cancelled) setUser(data);
      } catch {
        clearAccessToken();
        if (!cancelled) router.replace("/login");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  async function logout() {
    await api.post("/auth/logout").catch(() => {});
    clearAccessToken();
    router.replace("/login");
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-400">
        Loading…
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 pb-8 pt-5 sm:px-6">
      <header className="sticky top-4 z-20 panel rounded-2xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <Link href="/dashboard" className="font-display text-lg font-semibold tracking-tight text-white">
            Coding Rocket
          </Link>
          <nav className="flex flex-wrap items-center gap-1 rounded-xl border border-white/10 bg-black/10 p-1 text-sm">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`rounded-lg px-3 py-2 transition ${
                  pathname === l.href ? "bg-accent text-[#fff7ef]" : "text-slate-300 hover:bg-white/10"
                }`}
              >
                {l.label}
              </Link>
            ))}
            <button
              type="button"
              onClick={() => void logout()}
              className="ml-2 rounded-lg px-3 py-2 text-slate-300 hover:bg-white/10"
            >
              Log out
            </button>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-2 py-10 sm:px-4">{children}</main>
    </div>
  );
}
