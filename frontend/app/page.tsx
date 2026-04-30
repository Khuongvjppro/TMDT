import JobCard from "../components/job-card";
import JobSearchForm from "../components/job-search-form";
import { fetchJobs } from "../lib/api";

type HomePageProps = {
  searchParams: Promise<Record<string, string | undefined>>;
};

function normalizeType(value?: string) {
  if (!value) return "";
  return value.trim().toUpperCase().replace(/\s+/g, "_");
}

function includesIgnoreCase(value: string, query?: string) {
  if (!query) return true;
  return value.toLowerCase().includes(query.toLowerCase());
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const data = await fetchJobs({
    q: params.q,
    location: params.location,
    type: params.type,
    page: params.page,
  });

  const normalizedType = normalizeType(params.type);
  const filteredItems = data.items.filter((job) => {
    const matchesType = normalizedType ? job.type === normalizedType : true;
    const matchesLocation = includesIgnoreCase(job.location, params.location);
    const matchesQuery =
      includesIgnoreCase(job.title, params.q) ||
      includesIgnoreCase(job.companyName, params.q);
    return matchesType && matchesLocation && matchesQuery;
  });

  return (
    <section className="space-y-8">
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 p-8 text-white shadow-2xl">
        <div className="pointer-events-none absolute -right-20 -top-16 h-48 w-48 rounded-full bg-brand-500/30 blur-3xl" />
        <div className="pointer-events-none absolute -left-24 bottom-0 h-52 w-52 rounded-full bg-slate-500/30 blur-3xl" />

        <div className="relative grid gap-8 md:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-brand-200">
              Starter Job Platform
            </p>
            <h1 className="mt-3 text-4xl font-black leading-tight md:text-5xl">
              Find your next
              <span className="text-brand-200"> opportunity</span> faster
            </h1>
            <p className="mt-4 max-w-2xl text-sm text-slate-200 md:text-base">
              Monorepo starter with Next.js frontend and Node.js backend. Search
              jobs, view details, and apply with clean architecture ready for
              teamwork.
            </p>
            <div className="mt-5 flex flex-wrap gap-2 text-xs">
              <span className="rounded-full bg-white/10 px-3 py-1 text-slate-100">
                Remote-friendly roles
              </span>
              <span className="rounded-full bg-white/10 px-3 py-1 text-slate-100">
                Curated employers
              </span>
              <span className="rounded-full bg-white/10 px-3 py-1 text-slate-100">
                Fast applications
              </span>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-200">
              At a Glance
            </p>
            <div className="mt-4 grid gap-4">
              <div className="rounded-2xl bg-white/10 px-4 py-3">
                <p className="text-xs text-slate-200">Jobs available</p>
                <p className="mt-1 text-2xl font-black">1,200+</p>
              </div>
              <div className="rounded-2xl bg-white/10 px-4 py-3">
                <p className="text-xs text-slate-200">Average hire time</p>
                <p className="mt-1 text-2xl font-black">48 hours</p>
              </div>
              <div className="rounded-2xl bg-white/10 px-4 py-3">
                <p className="text-xs text-slate-200">Verified employers</p>
                <p className="mt-1 text-2xl font-black">200+</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <JobSearchForm />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Open Positions</h2>
          <p className="text-sm text-slate-600">
            Discover roles matched to your skills.
          </p>
        </div>
        <span className="rounded-full bg-white px-4 py-1.5 text-sm font-semibold text-slate-700 shadow">
          {filteredItems.length} jobs found
        </span>
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {filteredItems.map((job) => (
          <JobCard key={job.id} job={job} />
        ))}
      </div>
    </section>
  );
}
