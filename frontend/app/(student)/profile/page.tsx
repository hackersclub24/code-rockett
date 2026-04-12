"use client";

import { useEffect, useState } from "react";

import { api } from "@/lib/api";
import type { User } from "@/types";

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [name, setName] = useState("");
  const [intro, setIntro] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      const { data } = await api.get<User>("/students/me");
      setUser(data);
      setName(data.name);
      setIntro(data.intro ?? "");
    })();
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    const { data } = await api.patch<User>("/students/me", { name, intro: intro || null });
    setUser(data);
    setMsg("Saved.");
  }

  if (!user) return <p className="text-slate-400">Loading…</p>;

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold text-white">Profile</h1>
        <p className="mt-2 text-slate-400">Update how you appear to instructors.</p>
      </div>
      <form onSubmit={save} className="glass space-y-4 rounded-2xl p-6">
        <div>
          <label className="text-xs font-medium uppercase tracking-wide text-slate-400">Email</label>
          <p className="mt-1 text-sm text-slate-300">{user.email}</p>
        </div>
        <div>
          <label className="text-xs font-medium uppercase tracking-wide text-slate-400">Name</label>
          <input
            className="mt-1 w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2 text-sm outline-none ring-accent focus:ring-2"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <label className="text-xs font-medium uppercase tracking-wide text-slate-400">Intro</label>
          <textarea
            className="mt-1 min-h-[100px] w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2 text-sm outline-none ring-accent focus:ring-2"
            value={intro}
            onChange={(e) => setIntro(e.target.value)}
          />
        </div>
        {msg && <p className="text-sm text-emerald-400">{msg}</p>}
        <button type="submit" className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-dim">
          Save changes
        </button>
      </form>
    </div>
  );
}
