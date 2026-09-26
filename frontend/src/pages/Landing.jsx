import { Link } from "react-router-dom";
import {
  Rocket, Users, Kanban, MessageSquare, GraduationCap, TrendingUp,
  ArrowRight,
} from "lucide-react";

const FEATURES = [
  { icon: Users, title: "Recruit teammates", body: "Post roles and review applicants for your startup." },
  { icon: Kanban, title: "Task board", body: "Assign tasks and track progress across your team." },
  { icon: MessageSquare, title: "Team chat", body: "Real-time messaging for every startup team." },
  { icon: GraduationCap, title: "Mentor feedback", body: "Request reviews from verified mentors." },
  { icon: TrendingUp, title: "Investor discovery", body: "Investors can browse startups and connect." },
  { icon: Rocket, title: "Startup profiles", body: "Showcase what you're building to the community." },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-navy text-white">
      {/* Nav */}
      <header className="border-b border-white/5">
        <nav className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold">
              <Rocket className="h-4 w-4 text-ink" />
            </span>
            <span className="font-display text-base font-semibold">
              Founder<span className="text-gold">Hub</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm text-white/70 hover:text-white">
              Log in
            </Link>
            <Link
              to="/register"
              className="rounded-lg bg-gold px-4 py-2 text-sm font-medium text-ink hover:bg-gold-dark"
            >
              Sign up
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-5xl px-6 py-20 text-center sm:py-24">
        <h1 className="font-display text-3xl font-semibold leading-tight sm:text-4xl">
          Where student founders find their{" "}
          <span className="text-gold">first team</span>.
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-sm text-white/60 sm:text-base">
          A workspace for early-stage teams — recruit teammates, manage tasks,
          chat in real time, and connect with mentors and investors.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            to="/register"
            className="inline-flex items-center gap-2 rounded-lg bg-gold px-5 py-2.5 text-sm font-medium text-ink hover:bg-gold-dark"
          >
            Get started <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <Link
            to="/login"
            className="rounded-lg border border-white/10 px-5 py-2.5 text-sm text-white/80 hover:bg-white/5"
          >
            Sign in
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-5xl px-6 pb-20">
        <h2 className="mb-8 text-center font-display text-xl font-semibold">
          Everything a startup team needs
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="rounded-xl border border-white/5 bg-white/[0.02] p-5"
            >
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-white/5">
                <f.icon className="h-4 w-4 text-gold" />
              </span>
              <h3 className="mt-3 font-display text-sm font-semibold">{f.title}</h3>
              <p className="mt-1 text-sm text-white/55">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-white/5">
        <div className="mx-auto max-w-3xl px-6 py-16 text-center">
          <h2 className="font-display text-2xl font-semibold">
            Ready to build your startup?
          </h2>
          <p className="mt-3 text-sm text-white/55">
            Create your account and get started in under a minute.
          </p>
          <Link
            to="/register"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-gold px-5 py-2.5 text-sm font-medium text-ink hover:bg-gold-dark"
          >
            Create account <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-3 px-6 py-6 sm:flex-row">
          <p className="font-mono text-xs text-white/35">
            © {new Date().getFullYear()} FounderHub
          </p>
          <div className="flex gap-5 text-xs text-white/45">
            <Link to="/login" className="hover:text-white">Login</Link>
            <Link to="/register" className="hover:text-white">Sign up</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}