import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "../components/auth-provider";
import AppHeader from "../components/app-header";

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
          <AppHeader />
          <main className="mx-auto w-full max-w-6xl px-4 pb-10">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
