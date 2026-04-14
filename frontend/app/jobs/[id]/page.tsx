import { fetchJobDetail } from "../../../lib/api";
import JobApplyPanel from "../../../components/job-apply-panel";

type JobDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function JobDetailPage({ params }: JobDetailPageProps) {
  const { id } = await params;
  const job = await fetchJobDetail(Number(id));

  return (
    <section className="space-y-6">
      <div className="rounded-3xl bg-white/80 p-6 shadow-md backdrop-blur">
        <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">{job.type.replace("_", " ")}</p>
        <h1 className="mt-2 text-3xl font-black text-slate-900">{job.title}</h1>
        <p className="mt-2 text-slate-700">{job.companyName} • {job.location}</p>
      </div>

      <article className="rounded-3xl bg-white p-6 shadow-md">
        <h2 className="text-xl font-bold text-slate-900">Job Description</h2>
        <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-700">{job.description}</p>
      </article>

      <article className="rounded-3xl bg-white p-6 shadow-md">
        <h2 className="text-xl font-bold text-slate-900">Requirements</h2>
        <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-700">{job.requirements}</p>
      </article>

      <JobApplyPanel jobId={job.id} />
    </section>
  );
}
