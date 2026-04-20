import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.count();
  const jobs = await prisma.job.count();
  const applications = await prisma.application.count();
  const candidateProfiles = await prisma.candidateProfile.count();
  const candidateCvs = await prisma.candidateCv.count();
  const savedJobs = await (prisma as any).savedJob.count();
  const jobAlerts = await (prisma as any).jobAlert.count();
  const alertNotifications = await (prisma as any).alertNotification.count();
  const conversations = await (prisma as any).conversation.count();
  const messages = await (prisma as any).message.count();
  const companyReviews = await (prisma as any).companyReview.count();
  const employerProfiles = await prisma.employerProfile.count();
  const adminProfiles = await prisma.adminProfile.count();

  console.log(
    JSON.stringify(
      {
        users,
        jobs,
        applications,
        candidateProfiles,
        candidateCvs,
        savedJobs,
        jobAlerts,
        alertNotifications,
        conversations,
        messages,
        companyReviews,
        employerProfiles,
        adminProfiles,
      },
      null,
      2,
    ),
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
