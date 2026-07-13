import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "../components/auth-provider";
import AppHeader from "../components/app-header";
import AppFooter from "../components/app-footer";

export const metadata: Metadata = {
  title: "JobFinder - Professional Job Search & Recruitment Platform",
  description: "Connect with top employers and find your dream job with ease. A modern platform built for candidates and recruiters.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen">
        <AuthProvider>
          <AppHeader />
          <main className="flex-grow mx-auto w-full max-w-6xl px-4 pt-3 pb-8">
            {children}
          </main>
          <AppFooter />
        </AuthProvider>
      </body>
    </html>
  );
}
