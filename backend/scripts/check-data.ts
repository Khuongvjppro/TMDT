import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.count();
  const jobs = await prisma.job.count();
  const applications = await prisma.application.count();
  const candidateProfiles = await prisma.candidateProfile.count();
  const employerProfiles = await prisma.employerProfile.count();
  const adminProfiles = await prisma.adminProfile.count();

  console.log(
    JSON.stringify(
      {
        users,
        jobs,
        applications,
        candidateProfiles,
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
