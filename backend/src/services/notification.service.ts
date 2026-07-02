import { sendJobModerationEmail } from "./email.service";

type EmployerInfo = {
  id: number;
  email: string;
  fullName: string;
};

type JobInfo = {
  id: number;
  title: string;
};

export async function notifyJobApproved(payload: {
  employer: EmployerInfo;
  job: JobInfo;
}) {
  return sendJobModerationEmail({
    toEmail: payload.employer.email,
    fullName: payload.employer.fullName,
    jobTitle: payload.job.title,
    type: "APPROVED",
  });
}

export async function notifyJobRejected(payload: {
  employer: EmployerInfo;
  job: JobInfo;
  rejectReason: string;
}) {
  return sendJobModerationEmail({
    toEmail: payload.employer.email,
    fullName: payload.employer.fullName,
    jobTitle: payload.job.title,
    type: "REJECTED",
    rejectReason: payload.rejectReason,
  });
}
