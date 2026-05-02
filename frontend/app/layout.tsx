import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import AuthNav from "../components/auth-nav";
import { AuthProvider } from "../components/auth-provider";

export const metadata: Metadata = {
  title: "JobFinder Starter",
  description: "Professional starter for job search platform",
};

const FOOTER_CTA_LINKS = [
  { href: "/employer/jobs", label: "Post a job", variant: "primary" },
  { href: "/jobs", label: "Browse jobs", variant: "ghost" },
];

const FOOTER_EXPLORE_LINKS = [
  { href: "/jobs", label: "Find Jobs" },
  { href: "/employer/candidates", label: "Find Candidates" },
  { href: "/employer/jobs", label: "Post Jobs" },
  { href: "/login", label: "Login" },
];

const FOOTER_SOCIAL_LABELS = ["LinkedIn", "Behance", "Dribbble"];
const FOOTER_LEGAL_LABELS = ["Privacy", "Terms", "Cookies"];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <header className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-5 md:py-6">
            <AuthNav />
            <Link
              href="/"
              className="text-2xl font-black tracking-tight text-slate-900 md:text-4xl"
            >
              JobFinder
            </Link>
          </header>
          <main className="mx-auto w-full max-w-6xl px-4 pb-10">
            {children}
          </main>
          <footer className="w-full bg-slate-950 px-4 pb-6 pt-4 text-white">
            <div className="mx-auto w-full max-w-6xl">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 px-2 py-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/60">
                    Ready to hire
                  </p>
                  <p className="mt-2 text-lg font-bold text-white">
                    Build your next dream team today.
                  </p>
                  <p className="mt-1 text-sm text-white/70">
                    Post a job or browse top candidates in minutes.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  {FOOTER_CTA_LINKS.map((link) => (
                    <Link
                      key={link.label}
                      href={link.href}
                      className={
                        link.variant === "primary"
                          ? "rounded-full bg-white px-5 py-2 text-xs font-semibold uppercase tracking-wide text-slate-900 shadow-sm transition hover:-translate-y-0.5 hover:bg-white/90"
                          : "rounded-full border border-white/30 px-5 py-2 text-xs font-semibold uppercase tracking-wide text-white transition hover:border-white/60"
                      }
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>

              <div className="grid gap-6 px-2 py-6 md:grid-cols-[1.4fr_1fr_1fr]">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/60">
                    JobFinder
                  </p>
                  <p className="mt-3 text-sm font-semibold text-white">
                    Built for fast hiring and great talent discovery.
                  </p>
                  <p className="mt-2 max-w-sm text-xs text-white/65">
                    Discover top candidates, manage pipelines, and keep hiring
                    workflows moving with ease.
                  </p>
                  <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-white/70">
                    <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-emerald-200">
                      Hiring now
                    </span>
                    <span className="rounded-full bg-white/10 px-3 py-1">
                      24/7 Support
                    </span>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/60">
                    Explore
                  </p>
                  <div className="mt-3 flex flex-col gap-2 text-sm font-semibold text-white/80">
                    {FOOTER_EXPLORE_LINKS.map((link) => (
                      <Link
                        key={link.label}
                        className="transition hover:text-white"
                        href={link.href}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/60">
                    Contact
                  </p>
                  <div className="mt-3 space-y-2 text-sm text-white/70">
                    <p className="font-semibold text-white">
                      hello@jobfinder.com
                    </p>
                    <p>+84 28 1234 5678</p>
                    <p className="text-xs text-white/50">
                      88 Nguyen Hue, District 1, HCMC
                    </p>
                  </div>
                  <div className="mt-4 flex items-center gap-3 text-xs font-semibold text-white/70">
                    {FOOTER_SOCIAL_LABELS.map((label) => (
                      <span
                        key={label}
                        className="rounded-full border border-white/20 px-3 py-1"
                      >
                        {label}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 px-2 py-3 text-xs text-white/60">
                <p>© 2026 JobFinder. All rights reserved.</p>
                <div className="flex flex-wrap items-center gap-3 font-semibold">
                  {FOOTER_LEGAL_LABELS.map((label) => (
                    <span key={label} className="transition hover:text-white">
                      {label}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
