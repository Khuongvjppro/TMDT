import Link from "next/link";
import { Job } from "../types";
import { formatSalaryRange, getCompanyLogoUrl } from "../lib/job-utils";

type Props = {
  job: Job;
};

export default function JobCard({ job }: Props) {
  return (
    <Link
      href={`/jobs/${job.id}`}
      className="block"
      aria-label={`View details for ${job.title}`}
    >
      <article className="group flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-2.5 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-lg">
        <div className="flex gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white">
            <img
              src={getCompanyLogoUrl(job.companyName)}
              alt={`${job.companyName} logo`}
              className="h-9 w-9 rounded-lg object-cover"
              loading="lazy"
            />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="text-sm font-semibold text-slate-900 line-clamp-2">
                  {job.title}
                </h3>
                <p className="mt-0.5 text-xs text-slate-500">
                  {job.companyName}
                </p>
              </div>
              <button
                type="button"
                className="flex h-7 w-7 items-center justify-center rounded-full border border-brand-200 text-brand-600 transition hover:bg-brand-50"
                aria-label="Add to favorites"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-3 w-3"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M20.8 4.6c-1.7-1.6-4.4-1.6-6 0L12 7.4l-2.8-2.8c-1.7-1.6-4.4-1.6-6 0-1.8 1.7-1.8 4.5 0 6.2l8.8 8.6 8.8-8.6c1.8-1.7 1.8-4.5 0-6.2z" />
                </svg>
              </button>
            </div>

            <div className="mt-2 flex flex-wrap gap-1.5 text-[11px]">
              <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">
                {formatSalaryRange(job.salaryMin, job.salaryMax)}
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">
                {job.location}
              </span>
              <span className="rounded-full bg-brand-50 px-3 py-1 font-medium text-brand-600">
                {job.type.replace("_", " ")}
              </span>
            </div>
          </div>
        </div>

        <p className="mt-2 line-clamp-2 text-sm text-slate-700">
          {job.description}
        </p>

        <div className="mt-auto pt-2">
          <span className="inline-flex items-center justify-center rounded-full bg-brand-600 px-3 py-1 text-xs font-semibold text-white transition group-hover:bg-brand-700">
            View Details
          </span>
        </div>
      </article>
    </Link>
  );
}
