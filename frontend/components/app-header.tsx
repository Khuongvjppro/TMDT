"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import AuthNav from "./auth-nav";

export default function AppHeader() {
  const pathname = usePathname();

  if (pathname === "/login") {
    return null;
  }

  return (
    <header className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-5 md:py-6">
      <AuthNav />
      <Link
        href="/"
        className="text-2xl font-black tracking-tight text-slate-900 md:text-4xl"
      >
        JobFinder
      </Link>
    </header>
  );
}
