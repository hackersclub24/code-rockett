import RocketAnimation from "../components/animations/RocketAnimation";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#05060d] px-6 py-10 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(223,127,53,0.18),transparent_38%),radial-gradient(circle_at_bottom,rgba(255,228,190,0.12),transparent_32%)]" />
      <div className="relative z-10 w-full max-w-5xl">
        <RocketAnimation width="100%" height={560} showButton={false} autoLaunch />
        <div className="mt-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent">Coding Rocket</p>
          <p className="mt-2 text-sm text-slate-300">Preparing your learning space...</p>
        </div>
      </div>
    </div>
  );
}
