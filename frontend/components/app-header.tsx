"use client";

import { TransitionLink } from "./transition-link";
import { usePathname } from "next/navigation";
import AuthNav from "./auth-nav";

export default function AppHeader() {
  const pathname = usePathname();

  // Hide header on login page
  if (pathname === "/login") {
    return null;
  }

  return (
    <header className="sticky top-0 z-30 w-full border-b border-slate-800 bg-slate-900/95 backdrop-blur-md shadow-sm">
      <div className="mx-auto grid grid-cols-3 items-center max-w-6xl px-4 py-4">
        {/* Left Column: User Icon & Search Link */}
        <div className="flex items-center gap-6 justify-start">
          <AuthNav />
          <div className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-300">
            <TransitionLink href="/" className="hover:text-white transition-colors">
              Search Jobs
            </TransitionLink>
          </div>
        </div>

        {/* Center Column: Logo */}
        <div className="flex justify-center">
          <TransitionLink
            href="/"
            className="flex items-center gap-2 text-xl font-extrabold tracking-tight text-white md:text-2xl"
          >
            <span>
              Job<span className="text-slate-400 font-semibold">Finder</span>
            </span>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-base font-black text-slate-900">
              JF
            </span>
          </TransitionLink>
        </div>

        {/* Right Column: Company Links */}
        <div className="flex justify-end">
          <div className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-300">
            <TransitionLink href="/about" className="hover:text-white transition-colors">
              About Us
            </TransitionLink>
            <TransitionLink href="/contact" className="hover:text-white transition-colors">
              Contact Support
            </TransitionLink>
            <TransitionLink href="/terms-privacy" className="hover:text-white transition-colors text-nowrap">
              Terms & Privacy
            </TransitionLink>
          </div>
        </div>
      </div>
    </header>
  );
}
