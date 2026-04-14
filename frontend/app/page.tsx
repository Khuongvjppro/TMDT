import JobCard from "../components/job-card";
import JobSearchForm from "../components/job-search-form";
import { fetchJobs } from "../lib/api";

type HomePageProps = {
  searchParams: Promise<Record<string, string | undefined>>;
};

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const data = await fetchJobs({
    q: params.q,
    location: params.location,
    type: params.type,
    page: params.page
  });

  return (
    <section className="space-y-8">
      <div className="rounded-3xl bg-gradient-to-br from-brand-600 to-brand-700 p-8 text-white shadow-2xl">
        <p className="text-xs uppercase tracking-[0.2em] text-brand-50">Starter Job Platform</p>
        <h1 className="mt-2 text-3xl font-black md:text-5xl">Find your next opportunity faster</h1>
        <p className="mt-3 max-w-2xl text-sm text-brand-50 md:text-base">
          Monorepo starter with Next.js frontend and Node.js backend. Search jobs, view details, and apply with clean architecture ready for teamwork.
        </p>
      </div>

      <JobSearchForm />

      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">Open Positions</h2>
        <p className="text-sm text-slate-600">{data.pagination.total} jobs found</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {data.items.map((job) => (
          <JobCard key={job.id} job={job} />
        ))}
      </div>
    </section>
  );
}
