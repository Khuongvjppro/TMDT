import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import AuthNav from "../components/auth-nav";
import { AuthProvider } from "../components/auth-provider";

export const metadata: Metadata = {
  title: "JobFinder Starter",
  description: "Professional starter for job search platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <header className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-6">
            <Link
              href="/"
              className="text-2xl font-black tracking-tight text-slate-900"
            >
              JobFinder
            </Link>
            <AuthNav />
          </header>
          <main className="mx-auto w-full max-w-6xl px-4 pb-10">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
