"use client";

import Link from "next/link";
import { Job } from "../types";
import CompanyLogo from "./company-logo";
import { formatSalaryRange, formatTimeAgo } from "../lib/job-utils";

type Props = {
  job: Job;
};

export default function JobCard({ job }: Props) {
  const initials = job.companyName
    ? job.companyName.substring(0, 2).toUpperCase()
    : "CO";

  return (
    <Link
      href={`/jobs/${job.id}`}
      className="block h-full group"
      aria-label={`View details for ${job.title}`}
    >
      <article className={`flex h-full flex-col rounded-2xl border p-5 shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 ${
        job.boostLevel === 3
          ? "border-amber-400 bg-gradient-to-br from-amber-50/20 to-white ring-2 ring-amber-500/20 hover:border-amber-500 hover:shadow-xl hover:shadow-amber-500/10"
          : job.boostLevel === 2
            ? "border-indigo-400 bg-gradient-to-br from-indigo-50/10 to-white ring-1 ring-indigo-500/10 hover:border-indigo-500 hover:shadow-xl hover:shadow-indigo-500/10"
            : job.boostLevel === 1
              ? "border-slate-300 bg-white hover:border-slate-400 hover:shadow-xl hover:shadow-slate-500/5"
              : "border-slate-200 bg-white hover:border-brand-500 hover:shadow-xl hover:shadow-brand-500/5"
      }`}>
        <div className="flex gap-4 items-start">
          {/* Branded Logo Container */}
          <div className="group-hover:scale-105 transition-transform duration-300">
            <CompanyLogo companyName={job.companyName} size="sm" />
          </div>

          {/* Job Details Header */}
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="text-base font-extrabold text-slate-900 line-clamp-1 group-hover:text-brand-600 transition-colors duration-300">
                  {job.title}
                </h3>
                <div className="flex items-center gap-2 mt-0.5">
                  <p className="text-xs font-semibold text-slate-500">
                    {job.companyName}
                  </p>
                  {job.boostLevel > 0 ? (
                    <span
                      className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[9px] font-extrabold tracking-wide uppercase border ${
                        job.boostLevel === 3
                          ? "bg-amber-100 text-amber-800 border-amber-300 animate-pulse"
                          : job.boostLevel === 2
                            ? "bg-indigo-100 text-indigo-800 border-indigo-300"
                            : "bg-slate-100 text-slate-700 border-slate-300"
                      }`}
                    >
                      {job.boostLevel === 3 ? "🔥 Premium" : job.boostLevel === 2 ? "⚡ Priority" : "✨ Featured"}
                    </span>
                  ) : null}
                </div>
              </div>

              {/* Bookmark Icon */}
              <button
                type="button"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-100 text-slate-400 transition hover:bg-slate-50 hover:text-slate-600"
                onClick={(e) => e.preventDefault()}
                aria-label="Add to favorites"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-3.5 w-3.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
                </svg>
              </button>
            </div>

            {/* Badges */}
            <div className="mt-3 flex flex-wrap gap-1.5">
              <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600">
                {formatSalaryRange(job.salaryMin, job.salaryMax)}
              </span>
              <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600">
                {job.location}
              </span>
              <span className={`rounded-lg px-2.5 py-1 text-[11px] font-extrabold ${
                job.boostLevel === 3
                  ? "bg-amber-100 text-amber-800"
                  : job.boostLevel === 2
                    ? "bg-indigo-100 text-indigo-800"
                    : "bg-brand-50 text-brand-600"
              }`}>
                {job.type.replace("_", " ")}
              </span>
            </div>
          </div>
        </div>

        {/* Job Description Summary */}
        <p className="mt-4 line-clamp-3 text-sm text-slate-600 leading-relaxed">
          {job.description}
        </p>

        {/* View Details CTA Button */}
        <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-400">
            {formatTimeAgo(job.createdAt)}
          </span>
          <span className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-bold text-white shadow-sm transition-colors duration-300 ${
            job.boostLevel === 3
              ? "bg-amber-600 group-hover:bg-amber-700"
              : job.boostLevel === 2
                ? "bg-indigo-600 group-hover:bg-indigo-700"
                : "bg-slate-900 group-hover:bg-brand-600"
          }`}>
            <span>Apply Now</span>
            <svg
              viewBox="0 0 24 24"
              className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-0.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </span>
        </div>
      </article>
    </Link>
  );
}
