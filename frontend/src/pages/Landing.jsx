export default function Landing() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-blueprint px-4 text-center text-white">
      <span className="font-mono text-sm text-white/60">foundrhub / v1</span>
      <h1 className="font-display text-4xl font-semibold">FoundrHub</h1>
      <p className="max-w-md text-white/70">
        Where student founders find their co-founders, teammates, mentors,
        and first believers.
      </p>
      <p className="text-xs text-white/40">
        Login and registration land in the next build.
      </p>
    </div>
  );
}