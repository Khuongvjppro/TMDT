"use client";

import { useEffect, useState } from "react";

type TabType = "terms" | "privacy";

const TERMS_SECTIONS = [
  {
    title: "1. Acceptance of Terms",
    content: "By creating an account, posting jobs, applying to roles, or otherwise interacting with the Platform, you agree to be bound by these Terms and our Privacy Policy. If you do not agree to these Terms, you must not use or access the Platform.",
  },
  {
    title: "2. Account Registration & Security",
    content: "To access most features of the Platform (such as sending applications or publishing job descriptions), you must register an account. You agree to provide accurate, complete, and current information. You are solely responsible for maintaining the confidentiality of your credentials.",
    details: [
      { label: "Candidate Profile", value: "You must represent your own skills, portfolio, and work experiences truthfully." },
      { label: "Employer Profile", value: "You must represent your company details and job roles accurately. Fake hiring listings are strictly prohibited." },
    ],
  },
  {
    title: "3. Job Postings & Hiring Practices",
    content: "Employers are solely responsible for their job advertisements and recruitment decisions. JobFinder acts strictly as a matching database. We do not guarantee candidates will receive offers, nor do we guarantee employers will find viable hires.",
  },
  {
    title: "4. Prohibited Uses",
    content: "You agree not to use the platform to distribute spam, harvest emails or user data, transmit malware, post offensive content, or violate any applicable laws. We reserve the right to suspend or terminate accounts that breach these standards without prior notice.",
  },
  {
    title: "5. Limitation of Liability",
    content: "To the maximum extent permitted by law, JobFinder shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues resulting from your use of, or inability to use, our matching services.",
  },
];

const PRIVACY_SECTIONS = [
  {
    title: "1. Information We Collect",
    content: "We gather details necessary to connect candidates and employers. This includes:",
    details: [
      { label: "Account Credentials", value: "Email, password, and basic profile setups." },
      { label: "Professional Information", value: "Candidate resumes, skills, locations, portfolios, and employment history." },
      { label: "Employer Information", value: "Business names, tax identifiers, billing records, and company structures." },
    ],
  },
  {
    title: "2. How We Use Your Data",
    content: "We process data to provide matching and platform capabilities, specifically:",
    details: [
      { label: "Matching Recommendations", value: "Creating matching recommendations and score evaluations." },
      { label: "Communications", value: "Delivering support requests and communications between candidates and recruiters." },
      { label: "Payments", value: "Securing payment methods, processing bills, and auditing system safety." },
    ],
  },
  {
    title: "3. Sharing Your Information",
    content: "Candidates share their professional profiles directly with employers when applying. We do not sell user data to third-party marketing companies. We only disclose information to comply with legal processes or protect platform safety.",
  },
  {
    title: "4. Data Security",
    content: "We implement industry-standard encryption, firewalls, and security audits to prevent unauthorized data access, loss, or disclosure. However, no electronic storage or transmission is 100% secure.",
  },
  {
    title: "5. Your Privacy Rights",
    content: "Depending on your jurisdiction, you may have the right to request access to, edit, or delete the personal information we maintain. You can manage these settings directly inside your profile or contact our Support Center for assistance.",
  },
];

async function fetchLegalData() {
  return new Promise<{
    terms: typeof TERMS_SECTIONS;
    privacy: typeof PRIVACY_SECTIONS;
  }>((resolve) => {
    // Simulate minor network delay
    setTimeout(() => {
      resolve({
        terms: TERMS_SECTIONS,
        privacy: PRIVACY_SECTIONS,
      });
    }, 150);
  });
}

export default function TermsPrivacyPage() {
  const [activeTab, setActiveTab] = useState<TabType>("terms");
  const [legalData, setLegalData] = useState<{
    terms: typeof TERMS_SECTIONS;
    privacy: typeof PRIVACY_SECTIONS;
  } | null>(null);

  useEffect(() => {
    async function loadData() {
      const data = await fetchLegalData();
      setLegalData(data);
    }
    loadData();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  return (
    <section className="space-y-8 py-8 relative print:py-0 print:space-y-4">
      {/* Background Ambient Glows - Hidden when printing */}
      <div className="pointer-events-none absolute -top-40 right-10 -z-10 h-[450px] w-[450px] rounded-full bg-brand-500/10 blur-3xl print:hidden" />
      <div className="pointer-events-none absolute bottom-10 left-10 -z-10 h-[400px] w-[400px] rounded-full bg-accent/5 blur-3xl print:hidden" />

      {/* Header section */}
      <div className="text-center space-y-4 max-w-2xl mx-auto print:text-left print:max-w-full">
        <div className="inline-flex items-center gap-2 rounded-full border border-brand-100 bg-brand-50/50 px-4 py-1.5 text-xs font-bold text-brand-700 shadow-sm backdrop-blur-sm print:hidden">
          <span>Legal Agreements</span>
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
          Terms &{" "}
          <span className="bg-gradient-to-r from-brand-600 via-indigo-600 to-accent bg-clip-text text-transparent">
            Privacy Policy
          </span>
        </h1>
        <p className="text-sm text-slate-600 print:hidden">
          Please review the terms of service and privacy practices that govern the use of the JobFinder matching engine.
        </p>
        <p className="hidden print:block text-xs font-bold text-slate-400">
          Last Updated: July 14, 2026
        </p>
      </div>

      {/* Interactive Tabs & Utilities Row */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-200 pb-4 print:hidden">
        {/* Tab Buttons */}
        <div className="flex gap-2 rounded-2xl bg-slate-100 p-1.5 border border-slate-200">
          <button
            onClick={() => setActiveTab("terms")}
            className={`rounded-xl px-5 py-2.5 text-xs font-bold transition-all ${
              activeTab === "terms"
                ? "bg-white text-slate-900 shadow-md"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            Terms of Service
          </button>
          <button
            onClick={() => setActiveTab("privacy")}
            className={`rounded-xl px-5 py-2.5 text-xs font-bold transition-all ${
              activeTab === "privacy"
                ? "bg-white text-slate-900 shadow-md"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            Privacy Policy
          </button>
        </div>

        {/* Print Button */}
        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-slate-900"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <polyline points="6 9 6 2 18 2 18 9" />
            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
            <rect x="6" y="14" width="12" height="8" />
          </svg>
          <span>Print / Save PDF</span>
        </button>
      </div>

      {/* Main Legal Content Container */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-10 shadow-xl print:border-none print:shadow-none print:p-0">
        {!legalData ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <svg className="animate-spin h-8 w-8 text-brand-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider animate-pulse">Loading agreements...</p>
          </div>
        ) : (
          <div className="prose prose-slate max-w-none text-slate-600 space-y-8">
            {activeTab === "terms" ? (
              <div className="space-y-6 animate-fade-in">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <h2 className="text-2xl font-black text-slate-900">Terms of Service</h2>
                  <span className="text-xs font-semibold text-slate-400 print:hidden">Section 1 of 2</span>
                </div>
                <p className="text-sm leading-relaxed">
                  Welcome to JobFinder. These Terms of Service ("Terms") govern your access to and use of our matching website, online services, applications, and features (collectively, the "Platform"). Please read these Terms carefully.
                </p>

                {legalData.terms.map((sec) => (
                  <div key={sec.title} className="space-y-2">
                    <h3 className="text-lg font-extrabold text-slate-900">{sec.title}</h3>
                    <p className="text-xs sm:text-sm leading-relaxed">{sec.content}</p>
                    {sec.details ? (
                      <ul className="list-disc pl-5 text-xs sm:text-sm space-y-1 text-slate-500">
                        {sec.details.map((det) => (
                          <li key={det.label}>
                            <strong>{det.label}:</strong> {det.value}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-6 animate-fade-in">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <h2 className="text-2xl font-black text-slate-900">Privacy Policy</h2>
                  <span className="text-xs font-semibold text-slate-400 print:hidden">Section 2 of 2</span>
                </div>
                <p className="text-sm leading-relaxed">
                  At JobFinder, we value your trust and are committed to safeguarding your personal information. This Privacy Policy details how we collect, store, share, and protect your data when you visit our Platform.
                </p>

                {legalData.privacy.map((sec) => (
                  <div key={sec.title} className="space-y-2">
                    <h3 className="text-lg font-extrabold text-slate-900">{sec.title}</h3>
                    <p className="text-xs sm:text-sm leading-relaxed">{sec.content}</p>
                    {sec.details ? (
                      <ul className="list-disc pl-5 text-xs sm:text-sm space-y-1 text-slate-500">
                        {sec.details.map((det) => (
                          <li key={det.label}>
                            <strong>{det.label}:</strong> {det.value}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
