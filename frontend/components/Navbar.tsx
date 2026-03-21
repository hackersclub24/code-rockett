"use client";

import Link from "next/link";
import { useAuth } from "./AuthProvider";
import { LogIn, LogOut, LayoutDashboard, Settings } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

export default function Navbar() {
  const { user, login, logout, loading } = useAuth();
  const isAdmin = user?.email === "your-email@gmail.com";

  return (
    <nav className="sticky top-0 z-50 border-b bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-zinc-200 dark:border-zinc-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
              Code Rocket 🚀
            </span>
          </Link>
          
          <div className="flex items-center space-x-4">
            {!loading && (
              <>
                <ThemeToggle />
                {user ? (
                  <>
                    <Link href="/dashboard" className="text-zinc-600 dark:text-zinc-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium flex items-center space-x-1 transition-colors">
                      <LayoutDashboard className="w-4 h-4" />
                      <span>Dashboard</span>
                    </Link>
                    {isAdmin && (
                      <Link href="/admin" className="text-zinc-600 dark:text-zinc-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium flex items-center space-x-1 transition-colors">
                        <Settings className="w-4 h-4" />
                        <span>Admin</span>
                      </Link>
                    )}
                    <button
                      onClick={logout}
                      className="flex items-center space-x-2 px-4 py-2 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200 transition-all duration-300"
                    >
                      <img src={user.photoURL || "/default-avatar.png"} alt="avatar" className="w-6 h-6 rounded-full" />
                      <span className="hidden sm:inline">Logout</span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={login}
                    className="flex items-center space-x-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30 transition-all duration-300 hover:-translate-y-0.5"
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
