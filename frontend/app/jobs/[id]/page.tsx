import { fetchJobDetail } from "../../../lib/api";
import JobApplyPanel from "../../../components/job-apply-panel";
import SaveJobToggle from "../../../components/save-job-toggle";
import ChatWithEmployerButton from "../../../components/chat-with-employer-button";
import CompanyReviewsPanel from "../../../components/company-reviews-panel";

type JobDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function JobDetailPage({ params }: JobDetailPageProps) {
  const { id } = await params;
  const job = await fetchJobDetail(Number(id));

  return (
    <section className="space-y-6">
      <div className="rounded-3xl bg-white/80 p-6 shadow-md backdrop-blur">
        <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">
          {job.type.replace("_", " ")}
        </p>
        <h1 className="mt-2 text-3xl font-black text-slate-900">{job.title}</h1>
        <p className="mt-2 text-slate-700">
          {job.companyName} • {job.location}
        </p>
        <p className="mt-1 text-sm text-slate-600">
          Salary: {job.salaryMin ?? "?"} - {job.salaryMax ?? "?"} | Min experience: {job.minExperienceYears ?? 0} year(s)
        </p>
        <div className="mt-4">
          <SaveJobToggle jobId={job.id} />
        </div>
        <div className="mt-3">
          <ChatWithEmployerButton
            employerId={job.employerId}
            employerName={job.employer?.fullName || job.companyName}
          />
        </div>
      </div>

      <article className="rounded-3xl bg-white p-6 shadow-md">
        <h2 className="text-xl font-bold text-slate-900">Job Description</h2>
        <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-700">
          {job.description}
        </p>
      </article>

      <article className="rounded-3xl bg-white p-6 shadow-md">
        <h2 className="text-xl font-bold text-slate-900">Requirements</h2>
        <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-700">
          {job.requirements}
        </p>
      </article>

      <CompanyReviewsPanel
        jobId={job.id}
        jobTitle={job.title}
        companyName={job.companyName}
      />

      <JobApplyPanel jobId={job.id} />
    </section>
  );
}
