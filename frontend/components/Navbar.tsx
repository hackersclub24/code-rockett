"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "./AuthProvider";
import { LogIn, LayoutDashboard, Settings, Rocket } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

export default function Navbar() {
  const { user, login, logout, loading } = useAuth();
  const isAdmin = user?.email === "abhishekmathur200624@gmail.com";
  const [failedAvatarUrl, setFailedAvatarUrl] = useState<string | null>(null);

  const avatarInitial = (user?.displayName?.[0] || user?.email?.[0] || "U").toUpperCase();

  return (
    <nav className="sticky top-0 z-50 border-b border-[var(--line)] bg-[var(--surface-strong)]/92 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-[72px] items-center py-3">
          <Link href="/" className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-[var(--brand-soft)] text-[var(--brand)] flex items-center justify-center border border-[var(--line)]">
              <Rocket className="w-5 h-5" />
            </div>
            <div>
              <span className="block text-xl font-bold leading-none">Code Rocket</span>
              <span className="block text-xs text-[var(--muted)] tracking-[0.12em] uppercase">Teach. Learn. Launch.</span>
            </div>
          </Link>
          
          <div className="flex items-center space-x-3">
            {!loading && (
              <>
                <ThemeToggle />
                {user ? (
                  <>
                    <Link href="/dashboard" className="px-3 py-2 rounded-lg text-sm text-[var(--muted)] hover:text-[var(--brand)] hover:bg-[var(--brand-soft)] font-semibold flex items-center space-x-1 transition-all">
                      <LayoutDashboard className="w-4 h-4" />
                      <span>Dashboard</span>
                    </Link>
                    {isAdmin && (
                      <Link href="/admin" className="px-3 py-2 rounded-lg text-sm text-[var(--muted)] hover:text-[var(--brand)] hover:bg-[var(--brand-soft)] font-semibold flex items-center space-x-1 transition-all">
                        <Settings className="w-4 h-4" />
                        <span>Admin</span>
                      </Link>
                    )}
                    <button
                      onClick={logout}
                      className="flex items-center space-x-2 px-3 py-2 ui-btn ui-btn-secondary text-sm font-semibold"
                    >
                      {user.photoURL && failedAvatarUrl !== user.photoURL ? (
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
                    className="flex items-center space-x-2 px-5 py-2.5 ui-btn ui-btn-primary text-sm font-bold"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Sign in</span>
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
