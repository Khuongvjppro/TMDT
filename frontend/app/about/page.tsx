import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About Us - JobFinder",
  description: "Learn about JobFinder's mission, vision, and the values driving our professional job search and recruitment platform.",
};

const STATS = [
  { label: "Active Job Seekers", value: "150,000+" },
  { label: "Verified Employers", value: "12,000+" },
  { label: "Successful Hires", value: "45,000+" },
  { label: "Average Time to Hire", value: "14 Days" },
];

const VALUES = [
  {
    icon: (
      <svg className="h-6 w-6 text-brand-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    ),
    title: "Continuous Innovation",
    desc: "We relentlessly build next-generation search and matching tools to simplify the hiring journey for everyone.",
  },
  {
    icon: (
      <svg className="h-6 w-6 text-brand-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    title: "Absolute Transparency",
    desc: "No hidden processes. Candidates know where their applications stand, and employers see verified match metrics.",
  },
  {
    icon: (
      <svg className="h-6 w-6 text-brand-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    title: "Candidate-First Experience",
    desc: "We prioritize user experience, privacy, and speed, helping professionals showcase their true value to hiring managers.",
  },
  {
    icon: (
      <svg className="h-6 w-6 text-brand-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
    title: "Trust & Quality",
    desc: "We screen listings to prevent spam and duplicate postings, ensuring candidates access legitimate career matches.",
  },
];

const TIMELINE = [
  {
    year: "2024",
    title: "The Genesis",
    desc: "JobFinder was born from a college ecommerce initiative with a mission to eliminate tedious application processes.",
  },
  {
    year: "2025",
    title: "10K Milestones",
    desc: "Reached our first 10,000 verified candidate profiles and integrated live recruitment pipeline dashboards for employers.",
  },
  {
    year: "2026",
    title: "The Matching Engine Upgrade",
    desc: "Launched a structured matching system featuring 98% compatibility screening, quick interview scheduling, and global searches.",
  },
];

export default function AboutPage() {
  return (
    <section className="space-y-16 py-8 relative">
      {/* Background Ambient Glows */}
      <div className="pointer-events-none absolute -top-40 right-10 -z-10 h-[500px] w-[500px] rounded-full bg-brand-500/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-10 left-10 -z-10 h-[400px] w-[400px] rounded-full bg-accent/5 blur-3xl" />

      {/* Hero Section */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 rounded-full border border-brand-100 bg-brand-50/50 px-4 py-1.5 text-xs font-bold text-brand-700 shadow-sm backdrop-blur-sm">
          <span>Our Story & Mission</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 leading-[1.1]">
          We are bridging the gap between{" "}
          <span className="bg-gradient-to-r from-brand-600 via-indigo-600 to-accent bg-clip-text text-transparent">
            talent and opportunity
          </span>
        </h1>
        <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
          JobFinder is designed to make recruiting collaborative, transparent, and direct. We bypass conventional job board noise by focusing on what matters: verified profile matches, instant feedback, and seamless communication.
        </p>
      </div>

      {/* Stats Board */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-8 rounded-3xl bg-slate-950 text-white shadow-xl border border-slate-900">
        {STATS.map((stat) => (
          <div key={stat.label} className="text-center space-y-1">
            <p className="text-3xl sm:text-4xl font-black text-brand-500">{stat.value}</p>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Our Mission Detail */}
      <div className="grid gap-8 lg:grid-cols-2 items-center">
        <div className="space-y-6">
          <h2 className="text-3xl font-extrabold text-slate-900 leading-tight">
            Building a community where careers flourish
          </h2>
          <p className="text-slate-600 leading-relaxed">
            Finding a job shouldn't feel like a lottery. For employers, spotting top-tier talent shouldn't feel like sorting through mountains of irrelevant paperwork. We believe the future of hiring is centered around clarity and mutual alignment.
          </p>
          <div className="space-y-3">
            {[
              "Real-time application tracking for candidates",
              "Pre-vetted portfolio displays for recruiters",
              "Structured pipeline workflow for team management",
            ].map((point) => (
              <div key={point} className="flex items-center gap-3">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-500/10 text-brand-600 text-xs font-bold">
                  ✓
                </span>
                <span className="text-sm font-semibold text-slate-700">{point}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Brand Story Mockup / Decorative Card */}
        <div className="relative p-8 rounded-3xl bg-gradient-to-br from-brand-50 to-indigo-50 border border-brand-100 shadow-lg space-y-6">
          <div className="absolute top-4 right-4 h-16 w-16 bg-white/40 rounded-full blur-xl" />
          <h3 className="text-xl font-bold text-slate-900">Empowering Modern Recruitment</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            By shifting from simple resumes to structured developer and marketer profiles, JobFinder ensures hiring managers receive relevant applications and candidates receive decisions faster.
          </p>
          <div className="h-2 w-2/3 rounded bg-brand-500/20" />
          <div className="h-2 w-1/2 rounded bg-brand-500/20" />
        </div>
      </div>

      {/* Core Values Section */}
      <div className="space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-3xl font-extrabold text-slate-900">What Drives JobFinder</h2>
          <p className="text-sm text-slate-600">
            Our guidelines and goals when designing every workflow inside JobFinder.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {VALUES.map((val) => (
            <div
              key={val.title}
              className="group p-6 rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-md"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 mb-4 transition-colors group-hover:bg-brand-100">
                {val.icon}
              </div>
              <h3 className="font-extrabold text-slate-900 group-hover:text-brand-600 transition-colors">
                {val.title}
              </h3>
              <p className="mt-2 text-xs text-slate-500 leading-relaxed">{val.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Timeline */}
      <div className="space-y-12">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-3xl font-extrabold text-slate-900">Our Journey</h2>
          <p className="text-sm text-slate-600">How we evolved from a prototype into a matching engine.</p>
        </div>

        <div className="relative border-l border-slate-200 ml-4 md:ml-auto md:max-w-2xl space-y-8">
          {TIMELINE.map((item) => (
            <div key={item.year} className="relative pl-8 group">
              {/* Bullet indicator */}
              <div className="absolute -left-[9px] top-1 h-4.5 w-4.5 rounded-full border-4 border-white bg-slate-200 group-hover:bg-brand-500 group-hover:scale-110 transition-all duration-300" />
              <div className="space-y-1">
                <span className="inline-block px-2.5 py-0.5 rounded bg-brand-50 text-brand-700 font-extrabold text-xs">
                  {item.year}
                </span>
                <h3 className="text-lg font-extrabold text-slate-900">{item.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Page CTA Section */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900 text-white p-8 md:p-12 text-center space-y-6 shadow-xl relative overflow-hidden">
        <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-brand-500/10 blur-3xl" />
        <h2 className="text-3xl font-extrabold leading-tight">Ready to begin your journey?</h2>
        <p className="text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
          Whether you are looking for your next challenge or building a high-performing team, JobFinder is ready to assist.
        </p>
        <div className="flex flex-wrap justify-center gap-4 pt-2">
          <Link
            href="/"
            className="rounded-xl bg-white px-6 py-3 text-xs font-bold text-slate-900 hover:bg-slate-100 transition-all shadow"
          >
            Explore Jobs
          </Link>
          <Link
            href="/register"
            className="rounded-xl border border-slate-700 bg-slate-800/40 px-6 py-3 text-xs font-bold text-slate-200 hover:bg-slate-800 transition-all"
          >
            Create Free Profile
          </Link>
        </div>
      </div>
    </section>
  );
}
