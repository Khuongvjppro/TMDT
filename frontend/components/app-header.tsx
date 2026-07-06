"use client";

import Link from "next/link";
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
        {/* User Icon Left */}
        <div className="flex justify-start">
          <AuthNav />
        </div>

        {/* Navigation Links Center */}
        <div className="flex justify-center gap-6 text-sm font-semibold text-slate-300">
          <Link href="/" className="hover:text-white transition-colors">
            Find Jobs
          </Link>
          <Link href="/candidate/saved" className="hover:text-white transition-colors">
            Saved Jobs
          </Link>
          <Link href="/candidate/profile" className="hover:text-white transition-colors">
            Profile
          </Link>
        </div>

        {/* Logo Right */}
        <div className="flex justify-end">
          <Link
            href="/"
            className="flex items-center gap-2 text-xl font-extrabold tracking-tight text-white md:text-2xl"
          >
            <span>
              Job<span className="text-slate-400 font-semibold">Finder</span>
            </span>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-base font-black text-slate-900">
              JF
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}
