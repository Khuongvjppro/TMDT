"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AppFooter() {
  const pathname = usePathname();

  // Hide footer on login page
  if (pathname === "/login") {
    return null;
  }

  return (
    <footer className="mt-auto border-t border-slate-800 bg-slate-900 text-white">
      <div className="mx-auto max-w-6xl px-4 py-12 md:py-16">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
          {/* Logo & Description */}
          <div className="space-y-4">
            <Link
              href="/"
              className="flex items-center gap-2 text-xl font-extrabold tracking-tight text-white"
            >
              <span>
                Job<span className="text-slate-400 font-semibold">Finder</span>
              </span>
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-base font-black text-slate-900">
                JF
              </span>
            </Link>
            <p className="text-xs leading-relaxed text-slate-400">
              Connecting talented candidates with top companies. Simplify your job search and hiring process with JobFinder.
            </p>
          </div>

          {/* For Candidates */}
          <div>
            <h3 className="text-sm font-bold text-white">For Candidates</h3>
            <ul className="mt-4 space-y-2 text-xs text-slate-400">
              <li>
                <Link href="/" className="hover:text-white transition">
                  Browse Jobs
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-white transition">
                  Candidate Login
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-white transition">
                  Register Profile
                </Link>
              </li>
            </ul>
          </div>

          {/* For Employers */}
          <div>
            <h3 className="text-sm font-bold text-white">For Employers</h3>
            <ul className="mt-4 space-y-2 text-xs text-slate-400">
              <li>
                <Link href="/employer/jobs/new" className="hover:text-white transition">
                  Post a Job
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-white transition">
                  Employer Dashboard
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-white transition">
                  Buy Packages
                </Link>
              </li>
            </ul>
          </div>

          {/* Company & Support */}
          <div>
            <h3 className="text-sm font-bold text-white">Company</h3>
            <ul className="mt-4 space-y-2 text-xs text-slate-400">
              <li>
                <Link href="/about" className="hover:text-white transition">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition">
                  Contact Support
                </Link>
              </li>
              <li>
                <Link href="/terms-privacy" className="hover:text-white transition">
                  Terms & Privacy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} JobFinder. All rights reserved.</p>
          <p className="font-medium text-slate-500">
            E-Commerce Course Project (TMDT)
          </p>
        </div>
      </div>
    </footer>
  );
}
