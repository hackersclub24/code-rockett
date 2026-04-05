"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "./AuthProvider";
import { LogIn, LayoutDashboard, Settings, Rocket, Menu, X } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

export default function Navbar() {
  const { user, login, logout, loading } = useAuth();
  const isAdmin = user?.email === "abhishekmathur200624@gmail.com";
  const [failedAvatarUrl, setFailedAvatarUrl] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const avatarInitial = (user?.displayName?.[0] || user?.email?.[0] || "U").toUpperCase();
  const links = [
    { href: "#home", label: "Home" },
    { href: "#roadmap", label: "Roadmap" },
    { href: "#projects", label: "Projects" },
    { href: "#join", label: "Join" },
  ];

  return (
    <nav className="sticky top-0 z-50 border-b border-[var(--line)] bg-[var(--surface-strong)]/90 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-[72px] items-center py-3">
          <Link href="/" className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-[var(--brand-soft)] text-[var(--secondary)] flex items-center justify-center border border-[var(--line)]">
              <Rocket className="w-5 h-5" />
            </div>
            <div>
              <span className="block text-xl font-semibold leading-none tracking-[-0.02em]">Code Rocket</span>
              <span className="block text-xs text-[var(--muted)] tracking-[0.12em] uppercase">Build. Mentor. Launch.</span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-1 rounded-full border border-[var(--line)] bg-[var(--surface)] px-2 py-1">
            {links.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="px-4 py-2 text-sm text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--brand-soft)] rounded-full transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center space-x-2 sm:space-x-3">
            {!loading && (
              <>
                <ThemeToggle />
                <button
                  onClick={() => setIsOpen((prev) => !prev)}
                  className="md:hidden w-10 h-10 rounded-xl border border-[var(--line)] bg-[var(--surface)] text-[var(--foreground)] inline-flex items-center justify-center"
                  aria-label="Toggle navigation"
                >
                  {isOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
                </button>
                {user ? (
                  <>
                    <Link href="/dashboard" className="hidden sm:inline-flex px-3 py-2 rounded-lg text-sm text-[var(--muted)] hover:text-[var(--secondary)] hover:bg-[var(--brand-soft)] font-semibold items-center space-x-1 transition-all">
                      <LayoutDashboard className="w-4 h-4" />
                      <span>Dashboard</span>
                    </Link>
                    {isAdmin && (
                      <Link href="/admin" className="hidden sm:inline-flex px-3 py-2 rounded-lg text-sm text-[var(--muted)] hover:text-[var(--secondary)] hover:bg-[var(--brand-soft)] font-semibold items-center space-x-1 transition-all">
                        <Settings className="w-4 h-4" />
                        <span>Admin</span>
                      </Link>
                    )}
                    <button
                      onClick={logout}
                      className="hidden sm:flex items-center space-x-2 px-3 py-2 ui-btn ui-btn-secondary text-sm font-semibold"
                    >
                      {user.photoURL && failedAvatarUrl !== user.photoURL ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={user.photoURL}
                          alt="avatar"
                          className="w-6 h-6 rounded-full"
                          onError={() => setFailedAvatarUrl(user.photoURL)}
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-[var(--brand-soft)] text-[var(--brand)] text-[10px] font-bold flex items-center justify-center">
                          {avatarInitial}
                        </div>
                      )}
                      <span className="hidden sm:inline">Log out</span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={login}
                    className="flex items-center space-x-2 px-4 sm:px-5 py-2.5 ui-btn ui-btn-primary text-sm font-semibold"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Join Now</span>
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        <div className={`${isOpen ? "grid" : "hidden"} md:hidden pb-4 gap-2`}>
          {links.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className="rounded-xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--muted)] hover:text-[var(--foreground)]"
            >
              {item.label}
            </Link>
          ))}
          {user ? (
            <>
              <Link href="/dashboard" onClick={() => setIsOpen(false)} className="rounded-xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--muted)]">
                Dashboard
              </Link>
              {isAdmin ? (
                <Link href="/admin" onClick={() => setIsOpen(false)} className="rounded-xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--muted)]">
                  Admin
                </Link>
              ) : null}
              <button onClick={logout} className="rounded-xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3 text-sm text-left text-[var(--muted)]">
                Log out
              </button>
            </>
          ) : null}
        </div>
      </div>
    </nav>
  );
}
