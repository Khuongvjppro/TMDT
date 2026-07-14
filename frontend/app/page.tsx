import JobCard from "../components/job-card";
import JobSearchForm from "../components/job-search-form";
import { fetchJobs } from "../lib/api";

type HomePageProps = {
  searchParams: Promise<Record<string, string | undefined>>;
};

const HERO_TAGS = [
  "E-Commerce Careers",
  "Digital Marketing",
  "Retail & Supply Chain",
];

const TRUSTED_BRANDS = [
  "NovaCommerce",
  "EcoMart Group",
  "Shopify Solutions",
  "RetailHub VNPAY",
  "Tiki Logistics",
  "Momo Delivery",
  "GigaStore VN",
  "Lazada Vietnam",
];

const FEATURED_COMPANIES = [
  {
    name: "EcoCommerce Co.",
    focus: "E-Commerce storefronts & marketing",
    roles: "12 open roles",
  },
  {
    name: "RetailHub Logistics",
    focus: "Supply chain & distribution platforms",
    roles: "8 open roles",
  },
  {
    name: "CommerceData Inc",
    focus: "Retail customer behavior analytics",
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
    <section className="space-y-16 relative">
      {/* Background Ambient Glows */}
      <div className="pointer-events-none absolute -top-40 right-10 -z-10 h-[500px] w-[500px] rounded-full bg-brand-500/10 blur-3xl animate-pulse" />
      <div className="pointer-events-none absolute top-40 left-10 -z-10 h-[400px] w-[400px] rounded-full bg-accent/5 blur-3xl" />

      {/* Upgraded Premium Split Hero Section */}
      <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr] items-center pt-0">
        {/* Left Side: Typography & Action */}
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-100 bg-brand-50/50 px-4 py-1.5 text-xs font-bold text-brand-700 shadow-sm backdrop-blur-sm">
            <span className="flex h-2 w-2 rounded-full bg-brand-500 animate-ping" />
            <span>E-Commerce & Digital Commerce Career Engine</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.1]">
            Find your next{" "}
            <span className="bg-gradient-to-r from-brand-600 via-indigo-600 to-accent bg-clip-text text-transparent">
              e-commerce opportunity
            </span>{" "}
            faster
          </h1>

          <p className="text-base sm:text-lg text-slate-600 max-w-xl leading-relaxed">
            Discover a better way to search for e-commerce jobs. We connect talented professionals with forward-thinking retailers and digital commerce agencies through structured profiles and verified database matches.
          </p>

          {/* Interactive Hero Tags */}
          <div className="flex flex-wrap gap-2 pt-2">
            {HERO_TAGS.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-slate-200 bg-white/60 px-4 py-1.5 text-xs font-semibold text-slate-600 backdrop-blur-sm shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-200 hover:bg-brand-50/20 hover:text-brand-700"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Right Side: Hand-crafted Mockup Dashboard Widget */}
        <div className="relative hidden lg:block">
          {/* Main Applicant Match Card */}
          <div className="relative z-10 w-[350px] rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl transition-all duration-500 hover:scale-[1.02]">
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-bold text-emerald-700">
                Match Recommendation
              </span>
              <div className="flex gap-1">
                <span className="h-2 w-2 rounded-full bg-slate-200" />
                <span className="h-2 w-2 rounded-full bg-slate-200" />
                <span className="h-2 w-2 rounded-full bg-slate-200" />
              </div>
            </div>

            <div className="mt-6 flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-indigo-600 text-lg font-black text-white shadow-lg">
                MK
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900">Minh Khoa</h3>
                <p className="text-xs text-slate-500 font-semibold">E-Commerce Developer</p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4 rounded-2xl bg-slate-50 p-4 border border-slate-100">
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Match score</p>
                <p className="mt-1 text-2xl font-black text-emerald-600">98%</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Response rate</p>
                <p className="mt-1 text-2xl font-black text-brand-600">Fast</p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-1.5">
              <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">Shopify</span>
              <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">Next.js</span>
              <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">Google Ads</span>
            </div>
          </div>

          {/* Layered Decorative Overlay Card */}
          <div className="absolute -bottom-6 -right-6 z-20 w-[240px] rounded-2xl border border-slate-200 bg-white p-4 shadow-xl animate-bounce [animation-duration:8s]">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/10">
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4 text-accent"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
              <div>
                <p className="text-[11px] font-extrabold text-slate-900">Interview Scheduled</p>
                <p className="text-[9px] text-slate-400 font-bold">EcoCommerce Co. — 10:00 AM</p>
              </div>
            </div>
          </div>

          {/* Decorative Back Gradients */}
          <div className="absolute inset-0 bg-gradient-to-tr from-brand-100 to-indigo-100 rounded-3xl -rotate-3 scale-[0.98] -z-10 shadow" />
        </div>
      </div>

      {/* Floating Glassmorphic Search Bar wrapper */}
      <div className="relative z-20 -mt-6">
        <div className="rounded-3xl border border-slate-200/50 bg-white/40 p-2 shadow-2xl backdrop-blur-md">
          <JobSearchForm />
        </div>
      </div>

      {/* Modern minimalist brands area */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <span className="h-px bg-slate-200 flex-grow" />
          <h2 className="px-4 text-xs font-bold uppercase tracking-[0.3em] text-slate-400 text-center">
            Trusted by verified employers
          </h2>
          <span className="h-px bg-slate-200 flex-grow" />
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-8">
          {TRUSTED_BRANDS.map((brand) => (
            <div
              key={brand}
              className="flex items-center justify-center rounded-xl border border-slate-200/60 bg-white/50 px-4 py-3 text-center text-xs font-extrabold text-slate-500 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white hover:text-slate-900"
            >
              {brand}
            </div>
          ))}
        </div>
      </section>

      {/* Open Positions Grid */}
      <section className="space-y-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900">Open Positions</h2>
            <p className="mt-2 text-sm text-slate-600">
              Discover verified career listings matched to your skill profile.
            </p>
          </div>
          <span className="rounded-full bg-slate-900 px-4 py-1.5 text-xs font-bold text-white shadow">
            {filteredItems.length} jobs active
          </span>
        </div>

        {filteredItems.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredItems.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center">
            <p className="text-slate-500 font-medium">No positions match your search query.</p>
            <p className="text-xs text-slate-400 mt-1">Try resetting the keyword or location filters.</p>
          </div>
        )}
      </section>

      {/* Spotlight and Brand Story Row (Upgraded to look human-designed) */}
      <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        {/* Left Column: Premium Featured Employer spotlight */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl space-y-6">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-[11px] font-bold text-indigo-700">
              <svg
                viewBox="0 0 24 24"
                className="h-3.5 w-3.5 text-indigo-700"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
              <span>Spotlight</span>
            </div>
            <h2 className="mt-3 text-2xl font-extrabold text-slate-900">
              Featured Employers this week
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Explore companies actively screening candidates right now.
            </p>
          </div>

          <div className="grid gap-4">
            {FEATURED_COMPANIES.map((company, index) => (
              <div
                key={company.name}
                className="group flex items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4 transition-all duration-300 hover:bg-white hover:border-brand-100 hover:shadow-md"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-sm font-black text-white">
                    {company.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-900 group-hover:text-brand-600 transition">
                      {company.name}
                    </h4>
                    <p className="text-[11px] text-slate-500">{company.focus}</p>
                  </div>
                </div>
                <span className="rounded-full bg-white border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600">
                  {company.roles}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Dynamic Dark Card with checkmarks */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 text-white shadow-xl space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-brand-500">
              Employer Branding
            </span>
            <h2 className="text-2xl font-extrabold leading-tight">
              Build a hiring brand that candidates trust
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Showcase company values, highlight benefits, and move applicants through a fast, automated pipeline. Get access to matched portfolios instantly.
            </p>
          </div>

          <div className="space-y-3 pt-4">
            {BRAND_STORY_POINTS.map((item) => (
              <div
                key={item}
                className="group flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-800/40 px-4 py-3 text-xs transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-800/80 hover:border-slate-700"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-500/20 text-brand-400 font-bold">
                  ✓
                </span>
                <span className="font-semibold text-slate-200">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </section>
  );
}
