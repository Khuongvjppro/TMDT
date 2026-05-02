import JobCard from "../components/job-card";
import JobSearchForm from "../components/job-search-form";
import { fetchJobs } from "../lib/api";

type HomePageProps = {
  searchParams: Promise<Record<string, string | undefined>>;
};

const HERO_TAGS = [
  "Remote-friendly roles",
  "Curated employers",
  "Fast applications",
];

const HERO_STATS = [
  { label: "Jobs available", value: "1,200+" },
  { label: "Average hire time", value: "48 hours" },
  { label: "Verified employers", value: "200+" },
];

const TRUSTED_BRANDS = [
  "Lumen Studio",
  "Skyline Labs",
  "Nova Commerce",
  "Aurora Health",
  "Pulse Energy",
  "Atlas Mobility",
  "Beacon Tech",
  "Evergreen Finance",
];

const FEATURED_COMPANIES = [
  {
    name: "Apex Studio",
    focus: "Product design & branding",
    roles: "12 open roles",
  },
  {
    name: "Orbit Systems",
    focus: "Cloud infrastructure",
    roles: "8 open roles",
  },
  {
    name: "Lumina Health",
    focus: "Healthcare analytics",
    roles: "5 open roles",
  },
];

const BRAND_STORY_POINTS = [
  "Showcase company values",
  "Highlight compensation & benefits",
  "Move faster with smart filters",
];

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
              {HERO_TAGS.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-white/10 px-3 py-1 text-slate-100"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-200">
              At a Glance
            </p>
            <div className="mt-4 grid gap-4">
              {HERO_STATS.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl bg-white/10 px-4 py-3"
                >
                  <p className="text-xs text-slate-200">{stat.label}</p>
                  <p className="mt-1 text-2xl font-black">{stat.value}</p>
                </div>
              ))}
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

      <section className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-lg backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">
              Trusted by teams
            </p>
            <h2 className="mt-2 text-2xl font-black text-slate-900">
              Companies hiring with JobFinder
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              From fast-moving startups to global brands.
            </p>
          </div>
          <span className="rounded-full border border-slate-200 bg-white px-4 py-1.5 text-xs font-semibold text-slate-700 shadow-sm">
            200+ verified employers
          </span>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {TRUSTED_BRANDS.map((brand) => (
            <div
              key={brand}
              className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 shadow-sm"
            >
              <span>{brand}</span>
              <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-500">
                Hiring
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
            Featured employers
          </p>
          <h2 className="mt-2 text-2xl font-black text-slate-900">
            Spotlight companies this week
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Explore roles from employers actively interviewing right now.
          </p>

          <div className="mt-5 grid gap-3">
            {FEATURED_COMPANIES.map((company) => (
              <div
                key={company.name}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {company.name}
                  </p>
                  <p className="text-xs text-slate-500">{company.focus}</p>
                </div>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600 shadow-sm">
                  {company.roles}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-slate-900 p-6 text-white shadow-lg">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-200">
            Brand story
          </p>
          <h2 className="mt-2 text-2xl font-black">
            Build an employer brand that stands out
          </h2>
          <p className="mt-2 text-sm text-slate-200">
            Share your culture, post roles with clarity, and move candidates
            through a fast, clean hiring flow.
          </p>
          <div className="mt-4 space-y-3">
            {BRAND_STORY_POINTS.map((item) => (
              <div
                key={item}
                className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-500/30 text-brand-200">
                  ✓
                </span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </section>
  );
}
