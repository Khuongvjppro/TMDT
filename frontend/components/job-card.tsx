import Link from "next/link";
import { Job } from "../types";

type Props = {
  job: Job;
};

function formatSalary(min?: number | null, max?: number | null) {
  if (!min && !max) return "Negotiable";
  if (min && max) return `$${min} - $${max}`;
  return `$${min || max}+`;
}

export default function JobCard({ job }: Props) {
  return (
    <article className="group rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
      <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-brand-600">
        {job.type.replace("_", " ")}
      </p>
      <h3 className="text-xl font-bold text-slate-900">{job.title}</h3>
      <p className="mt-1 text-sm text-slate-600">
        {job.companyName} • {job.location}
      </p>
      <p className="mt-3 text-sm font-medium text-accent">
        {formatSalary(job.salaryMin, job.salaryMax)}
      </p>
      <p className="mt-3 line-clamp-2 text-sm text-slate-700">
        {job.description}
      </p>
      <Link
        className="mt-4 inline-block rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition group-hover:bg-brand-700"
        href={`/jobs/${job.id}`}
      >
        View Details
      </Link>
    </article>
  );
}
