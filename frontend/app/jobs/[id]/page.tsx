import React from "react";
import Link from "next/link";
import { fetchJobDetail } from "../../../lib/api";
import JobApplyPanel from "../../../components/job-apply-panel";
import CompanyLogo from "../../../components/company-logo";
import SaveJobButton from "../../../components/save-job-button";
import { formatSalaryRange } from "../../../lib/job-utils";

type JobDetailPageProps = {
  params: Promise<{ id: string }>;
};

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not updated";
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(date);
}

function renderRichText(text: string) {
  const lines = text.split("\n").map((line) => line.trim());
  const elements: React.ReactNode[] = [];
  let bullets: string[] = [];

  function flushBullets(key: number) {
    if (!bullets.length) return;
    elements.push(
      <ul
        key={`list-${key}`}
        className="space-y-2 text-sm leading-relaxed text-slate-600 pl-4 list-disc"
      >
        {bullets.map((item, index) => (
          <li key={`item-${key}-${index}`}>
            {item}
          </li>
        ))}
      </ul>,
    );
    bullets = [];
  }

  lines.forEach((line, index) => {
    if (!line) {
      flushBullets(index);
      return;
    }

    const bulletMatch = line.match(/^[-*•]\s+(.*)$/);
    if (bulletMatch) {
      bullets.push(bulletMatch[1]);
      return;
    }

    flushBullets(index);
    elements.push(
      <p key={`p-${index}`} className="text-sm leading-relaxed text-slate-600">
        {line}
      </p>,
    );
  });

  flushBullets(lines.length);
  return elements;
}

function renderBulletList(items: string[]) {
  return (
    <ul className="space-y-2 text-sm leading-relaxed text-slate-600 pl-4 list-disc">
      {items.map((item, index) => (
        <li key={`list-${index}`}>
          {item}
        </li>
      ))}
    </ul>
  );
}

export default async function JobDetailPage({ params }: JobDetailPageProps) {
  const { id } = await params;
  const job = await fetchJobDetail(Number(id));

  const sampleBenefits = [
    "Salary: 10 - 50 million (based on experience)",
    "Project bonuses, quarterly/yearly performance bonuses",
    "Full social, health, and unemployment insurance",
    "Training opportunities and clear career paths",
    "Professional working environment with supportive teammates",
  ];
  const sampleWorkLocation = [
    "Hanoi: 6A/183 Hoang Van Thai, Phuong Lien Ward",
    "Branch: Floor 6, 219 Trung Kinh, Cau Giay (if needed)",
  ];
  const sampleWorkTime = [
    "Monday - Saturday (08:00 - 17:00)",
    "Sundays and public holidays off",
    "One flexible half-day per week based on team plan",
  ];
  const sampleRequiredDocs = [
    "Updated CV with project experience",
    "Portfolio/product links (if any)",
    "Relevant degrees/certificates",
  ];
  const sampleHiringProcess = [
    "Resume screening (1-2 days)",
    "Technical interview (1 round)",
    "Results notified within 3-5 business days",
  ];
  const sampleContactInfo = [
    "HR department: 0901 234 567",
    "Email: hr@congty.vn",
    "Application hours: 08:30 - 17:30",
  ];
  const sampleDescription = [
    "Design civil and interior architecture aligned with project goals.",
    "Create 2D/3D concepts and deliver construction drawings.",
    "Coordinate with related teams to finalize design packages.",
    "Join site surveys, measurements, and field documentation updates.",
    "Ensure design aesthetics, technical accuracy, and buildability.",
  ];
  const sampleRequirements = [
    "At least 1 year of architecture or interior design experience.",
    "Proficient in AutoCAD, SketchUp/3ds Max, or similar tools.",
    "Knowledge of materials, structures, and basic building standards.",
    "Strong design thinking, careful work style, and attention to detail.",
    "Responsible, proactive, and collaborative team player.",
  ];

  return (
    <section className="relative mx-auto max-w-5xl px-4 py-6 space-y-8">
      {/* Background Ambient Glows */}
      <div className="pointer-events-none absolute -top-40 left-10 -z-10 h-[500px] w-[500px] rounded-full bg-brand-500/5 blur-3xl animate-pulse" />
      <div className="pointer-events-none absolute bottom-40 right-10 -z-10 h-[400px] w-[400px] rounded-full bg-indigo-500/5 blur-3xl" />

      {/* Premium Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
        <Link href="/" className="hover:text-slate-900 transition-colors">Home</Link>
        <svg viewBox="0 0 24 24" className="h-3 w-3 text-slate-300" fill="none" stroke="currentColor" strokeWidth="3">
          <path d="M9 5l7 7-7 7" />
        </svg>
        <Link href="/" className="hover:text-slate-900 transition-colors">Jobs</Link>
        <svg viewBox="0 0 24 24" className="h-3 w-3 text-slate-300" fill="none" stroke="currentColor" strokeWidth="3">
          <path d="M9 5l7 7-7 7" />
        </svg>
        <span className="text-slate-800 line-clamp-1">{job.title}</span>
      </div>

      {/* Page Content Grid (Reversed layout: Left Sidebar, Right Content) */}
      <div className="grid gap-10 lg:grid-cols-[280px_1fr] items-start">
        
        {/* Left Column: Sticky Sidebar (Company & Metadata) */}
        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start order-2 lg:order-1">

          {/* Company Box */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col items-center text-center space-y-4">
              <CompanyLogo companyName={job.companyName} size="lg" />
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Employer</p>
                <h2 className="text-lg font-black text-slate-900 leading-tight mt-1">
                  {job.companyName}
                </h2>
              </div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-[11px] font-bold text-emerald-800 border border-emerald-100 shadow-xs">
                <svg className="h-3.5 w-3.5 text-emerald-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                <span>Reputation: {job.employer?.employerProfile?.reputation ?? 0}</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                A verified professional employer active on our talent network.
              </p>
            </div>

            <hr className="border-slate-100 my-5" />

            <div className="space-y-3.5 text-xs font-semibold text-slate-600">
              <div className="flex justify-between">
                <span>Location</span>
                <span className="text-slate-900">{job.location}</span>
              </div>
              <div className="flex justify-between">
                <span>Company Size</span>
                <span className="text-slate-900">Not updated</span>
              </div>
              <div className="flex justify-between">
                <span>Industry</span>
                <span className="text-slate-900">Not updated</span>
              </div>
            </div>
          </div>

          {/* Job Info Box */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-3">
              Position Details
            </h3>
            <div className="mt-4 space-y-3.5 text-xs font-semibold text-slate-600">
              <div className="flex justify-between">
                <span>Job ID</span>
                <span className="text-slate-900">#{job.id}</span>
              </div>
              <div className="flex justify-between">
                <span>Status</span>
                <span className="inline-flex rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-600">
                  {job.isActive ? "Hiring" : "Paused"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Posted On</span>
                <span className="text-slate-900">{formatDate(job.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span>Category</span>
                <span className="text-slate-900">{job.type.replace("_", " ")}</span>
              </div>
              <div className="flex justify-between">
                <span>Salary</span>
                <span className="text-slate-900">{formatSalaryRange(job.salaryMin, job.salaryMax)}</span>
              </div>
            </div>
          </div>

          {/* Save Action Button */}
          <SaveJobButton jobId={job.id} variant="button" />
        </aside>

        {/* Right Column: Main Content (Header & Job Text) */}
        <div className="space-y-6 order-1 lg:order-2">
          {/* Main Title & Action Bar */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm space-y-6">
            <div className="flex justify-between items-start gap-4">
              <div>
                <span className="inline-flex rounded-lg bg-brand-50 px-2.5 py-1 text-[10px] font-extrabold text-brand-600 uppercase tracking-wide">
                  {job.type.replace("_", " ")}
                </span>
                <h1 className="mt-3 text-3xl font-black text-slate-900 sm:text-4xl tracking-tight leading-tight">
                  {job.title}
                </h1>
                <p className="mt-1 text-sm font-semibold text-slate-500">
                  {job.companyName} • {job.location}
                </p>
              </div>
              <SaveJobButton jobId={job.id} variant="icon" />
            </div>

            {/* Premium CTA Apply Bar */}
            <div className="rounded-2xl bg-slate-900 p-5 md:p-6 text-white flex flex-col sm:flex-row gap-4 justify-between items-center shadow-lg shadow-slate-900/10">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Compensation</p>
                <p className="text-lg font-black mt-0.5">{formatSalaryRange(job.salaryMin, job.salaryMax)}</p>
              </div>
              <a
                href="#apply-panel"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-white hover:bg-slate-100 text-slate-950 font-bold text-xs px-8 py-3.5 shadow-md transition-all duration-300 hover:-translate-y-0.5"
              >
                <span>Apply For This Position</span>
                <svg
                  viewBox="0 0 24 24"
                  className="h-3.5 w-3.5 text-slate-950"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          </div>

          {/* Job Body Description Card */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm space-y-8">
            
            {/* Overview */}
            <section className="space-y-3">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <span className="h-4.5 w-1 rounded bg-brand-500" />
                <span>Role Overview</span>
              </h3>
              <div className="space-y-3 leading-relaxed">
                {renderRichText(job.description)}
              </div>
              <div className="mt-4">
                {renderBulletList(sampleDescription)}
              </div>
            </section>

            <hr className="border-slate-100" />

            {/* Requirements */}
            <section className="space-y-3">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <span className="h-4.5 w-1 rounded bg-brand-500" />
                <span>Requirements & Experience</span>
              </h3>
              <div className="space-y-3 leading-relaxed">
                {renderRichText(job.requirements)}
              </div>
              <div className="mt-4">
                {renderBulletList(sampleRequirements)}
              </div>
            </section>

            <hr className="border-slate-100" />

            {/* Benefits */}
            <section className="space-y-3">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <span className="h-4.5 w-1 rounded bg-brand-500" />
                <span>Benefits & Perks</span>
              </h3>
              <div className="mt-2">
                {renderBulletList(sampleBenefits)}
              </div>
            </section>

            <hr className="border-slate-100" />

            {/* Logistics Grid */}
            <div className="grid gap-6 sm:grid-cols-2">
              <section className="space-y-3">
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <span className="h-4.5 w-1 rounded bg-brand-500" />
                  <span>Work Location</span>
                </h3>
                <div className="mt-2">
                  {renderBulletList(sampleWorkLocation)}
                </div>
              </section>

              <section className="space-y-3">
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <span className="h-4.5 w-1 rounded bg-brand-500" />
                  <span>Schedule</span>
                </h3>
                <div className="mt-2">
                  {renderBulletList(sampleWorkTime)}
                </div>
              </section>
            </div>

            <hr className="border-slate-100" />

            {/* Recruitment Pipeline */}
            <div className="grid gap-6 sm:grid-cols-2">
              <section className="space-y-3">
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <span className="h-4.5 w-1 rounded bg-brand-500" />
                  <span>Required Documents</span>
                </h3>
                <div className="mt-2">
                  {renderBulletList(sampleRequiredDocs)}
                </div>
              </section>

              <section className="space-y-3">
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <span className="h-4.5 w-1 rounded bg-brand-500" />
                  <span>Hiring Process</span>
                </h3>
                <div className="mt-2">
                  {renderBulletList(sampleHiringProcess)}
                </div>
              </section>
            </div>

            <hr className="border-slate-100" />

            {/* Contact */}
            <section className="space-y-3">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <span className="h-4.5 w-1 rounded bg-brand-500" />
                <span>Contact Information</span>
              </h3>
              <div className="mt-2">
                {renderBulletList(sampleContactInfo)}
              </div>
            </section>
          </div>

          {/* Apply Panel Wrapper */}
          <div id="apply-panel" className="scroll-mt-6">
            <JobApplyPanel jobId={job.id} />
          </div>
        </div>

      </div>
    </section>
  );
}
