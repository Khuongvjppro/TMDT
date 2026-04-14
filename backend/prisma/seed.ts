import { PrismaClient, JobType, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const guestPassword = await bcrypt.hash("123456", 10);
  const employerPassword = await bcrypt.hash("123456", 10);
  const candidatePassword = await bcrypt.hash("123456", 10);
  const adminPassword = await bcrypt.hash("123456", 10);

  const guest = await prisma.user.upsert({
    where: { email: "guest@demo.com" },
    update: {},
    create: {
      fullName: "Demo Guest",
      email: "guest@demo.com",
      passwordHash: guestPassword,
      role: UserRole.GUEST,
    },
  });

  const employer = await prisma.user.upsert({
    where: { email: "employer@demo.com" },
    update: {},
    create: {
      fullName: "Demo Employer",
      email: "employer@demo.com",
      passwordHash: employerPassword,
      role: UserRole.EMPLOYER,
    },
  });

  const candidate = await prisma.user.upsert({
    where: { email: "candidate@demo.com" },
    update: {},
    create: {
      fullName: "Demo Candidate",
      email: "candidate@demo.com",
      passwordHash: candidatePassword,
      role: UserRole.CANDIDATE,
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: "admin@demo.com" },
    update: {},
    create: {
      fullName: "Demo Admin",
      email: "admin@demo.com",
      passwordHash: adminPassword,
      role: UserRole.ADMIN,
    },
  });

  await prisma.candidateProfile.upsert({
    where: { userId: candidate.id },
    update: {},
    create: {
      userId: candidate.id,
      phone: "0900000001",
      bio: "Starter candidate profile for demo.",
      cvLink: "https://example.com/cv/candidate",
    },
  });

  await prisma.employerProfile.upsert({
    where: { userId: employer.id },
    update: {},
    create: {
      userId: employer.id,
      companyName: "TechNova",
      companyWebsite: "https://technova.example.com",
      companyLocation: "Ho Chi Minh City",
      description: "Demo employer profile for starter scaffold.",
    },
  });

  await prisma.adminProfile.upsert({
    where: { userId: admin.id },
    update: {},
    create: {
      userId: admin.id,
      department: "System Operations",
      permissionsNote: "Manage users, roles and system-level settings.",
    },
  });

  const count = await prisma.job.count();
  if (count === 0) {
    await prisma.job.createMany({
      data: [
        {
          title: "Frontend Developer (Next.js)",
          companyName: "TechNova",
          location: "Ho Chi Minh City",
          salaryMin: 1200,
          salaryMax: 2000,
          description:
            "Build and maintain modern web applications with Next.js.",
          requirements: "At least 1 year with React/Next.js.",
          type: JobType.FULL_TIME,
          employerId: employer.id,
        },
        {
          title: "Node.js Backend Engineer",
          companyName: "CloudWorks",
          location: "Ha Noi",
          salaryMin: 1300,
          salaryMax: 2200,
          description: "Develop APIs and optimize database performance.",
          requirements: "Experience with Express, MySQL, and REST APIs.",
          type: JobType.FULL_TIME,
          employerId: employer.id,
        },
      ],
    });
  }

  const firstJob = await prisma.job.findFirst({ orderBy: { id: "asc" } });
  if (firstJob) {
    await prisma.application.upsert({
      where: {
        candidateId_jobId: {
          candidateId: candidate.id,
          jobId: firstJob.id,
        },
      },
      update: {},
      create: {
        candidateId: candidate.id,
        jobId: firstJob.id,
        coverLetter:
          "I am interested in this role and available for interview.",
        cvLink: "https://example.com/cv/candidate",
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
