import Link from "next/link";
import { fetchJobDetail } from "../../../lib/api";
import JobApplyPanel from "../../../components/job-apply-panel";
import SaveJobButton from "../../../components/save-job-button";
import { formatSalaryRange, getCompanyLogoUrl } from "../../../lib/job-utils";

type JobDetailPageProps = { params: Promise<{ id: string }> };

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", { year: "numeric", month: "short", day: "2-digit" }).format(new Date(value));
}

function paragraphs(value: string) {
  return value.split("\n").map((line) => line.trim()).filter(Boolean);
}

export default async function JobDetailPage({ params }: JobDetailPageProps) {
  const { id } = await params;
  const job = await fetchJobDetail(Number(id));

  return (
    <section className="space-y-6">
      <nav className="text-xs text-slate-500"><Link href="/">Home</Link> / Jobs / <span className="text-slate-800">{job.title}</span></nav>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6">
          <article className="rounded-3xl bg-white p-6 shadow-xl ring-1 ring-slate-100">
            <div className="flex flex-wrap items-start gap-4">
              <img src={getCompanyLogoUrl(job.companyName)} alt={`${job.companyName} logo`} className="h-16 w-16 rounded-2xl border border-slate-200 object-cover" />
              <div className="min-w-0 flex-1"><p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-600">{job.type.replaceAll("_", " ")}</p><h1 className="mt-1 text-3xl font-black text-slate-900">{job.title}</h1><p className="mt-1 font-semibold text-slate-600">{job.companyName} · {job.location}</p></div>
            </div>
            <div className="mt-5 flex flex-wrap gap-2 text-sm"><span className="rounded-full bg-slate-100 px-4 py-2">Salary: {formatSalaryRange(job.salaryMin, job.salaryMax)}</span><span className="rounded-full bg-slate-100 px-4 py-2">Experience: {job.experienceYears || 0}+ years</span><span className="rounded-full bg-slate-100 px-4 py-2">Posted: {formatDate(job.createdAt)}</span></div>
            <div className="mt-5 flex flex-wrap gap-3"><a href="#apply-panel" className="rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-bold text-white">Apply Now</a><SaveJobButton jobId={job.id} /></div>
          </article>

          <article className="rounded-3xl bg-white p-6 shadow-lg"><h2 className="text-xl font-black">Job Description</h2><div className="mt-4 space-y-3 text-sm leading-7 text-slate-700">{paragraphs(job.description).map((line, index) => <p key={index}>{line}</p>)}</div></article>
          <article className="rounded-3xl bg-white p-6 shadow-lg"><h2 className="text-xl font-black">Requirements</h2><ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-7 text-slate-700">{paragraphs(job.requirements).map((line, index) => <li key={index}>{line.replace(/^[-*•]\s*/, "")}</li>)}</ul></article>
          <article className="rounded-3xl bg-white p-6 shadow-lg"><h2 className="text-xl font-black">What This Role Offers</h2><ul className="mt-4 grid gap-3 text-sm text-slate-700 sm:grid-cols-2"><li className="rounded-2xl bg-slate-50 p-4">Competitive compensation based on experience</li><li className="rounded-2xl bg-slate-50 p-4">Professional growth and learning opportunities</li><li className="rounded-2xl bg-slate-50 p-4">Collaborative working environment</li><li className="rounded-2xl bg-slate-50 p-4">Benefits provided by {job.companyName}</li></ul></article>
        </div>

        <aside className="space-y-5">
          <div id="apply-panel"><JobApplyPanel jobId={job.id} /></div>
          <article className="rounded-3xl bg-white p-5 shadow-lg"><div className="flex items-center gap-3"><img src={getCompanyLogoUrl(job.companyName)} alt="" className="h-12 w-12 rounded-xl border object-cover"/><div><h2 className="font-black">{job.companyName}</h2><p className="text-xs text-slate-500">Hiring in {job.location}</p></div></div><p className="mt-4 text-sm leading-6 text-slate-600">This company is actively hiring on JobFinder. Explore the role details and apply with your default CV.</p><Link href={`/candidate/jobs?q=${encodeURIComponent(job.companyName)}`} className="mt-4 inline-flex text-sm font-bold text-brand-700">View company jobs →</Link></article>
        </aside>
      </div>
    </section>
  );
}
