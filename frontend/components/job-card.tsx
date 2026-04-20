import Link from "next/link";
import { Job } from "../types";
import SaveJobToggle from "./save-job-toggle";

type Props = {
  job: Job;
};

function formatSalary(min?: number | null, max?: number | null) {
  if (!min && !max) return "Negotiable";
  if (min && max) return `$${min} - $${max}`;
  return `$${min || max}+`;
}

function formatCompanyRating(average?: number | null, count?: number) {
  const safeCount = count ?? 0;
  if (safeCount <= 0 || average == null) {
    return "Job rating: No reviews yet";
  }

  return `Job rating: ${average.toFixed(1)}/5 (${safeCount} review${safeCount > 1 ? "s" : ""})`;
}

export default function JobCard({ job }: Props) {
  return (
    <article className="group rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
      <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-brand-600">{job.type.replace("_", " ")}</p>
      <h3 className="text-xl font-bold text-slate-900">{job.title}</h3>
      <p className="mt-1 text-sm text-slate-600">{job.companyName} • {job.location}</p>
      <p className="mt-1 text-xs font-medium text-amber-700">
        {formatCompanyRating(job.jobAverageRating, job.jobReviewCount)}
      </p>
      <p className="mt-3 text-sm font-medium text-accent">{formatSalary(job.salaryMin, job.salaryMax)}</p>
      <p className="mt-1 text-xs text-slate-500">
        Min experience: {job.minExperienceYears ?? 0} year(s)
      </p>
      <p className="mt-3 line-clamp-2 text-sm text-slate-700">{job.description}</p>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Link
          className="inline-block rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition group-hover:bg-brand-700"
          href={`/jobs/${job.id}`}
        >
          View Details
        </Link>
        <SaveJobToggle jobId={job.id} compact />
      </div>
    </article>
  );
}
