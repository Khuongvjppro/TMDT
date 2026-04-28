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

  const extraCandidates = [
    {
      fullName: "Minh Tran",
      email: "minh.tran@demo.com",
      phone: "0900000002",
      bio: "Frontend developer with React and Tailwind experience.",
      cvLink: "https://example.com/cv/minh-tran",
    },
    {
      fullName: "Linh Nguyen",
      email: "linh.nguyen@demo.com",
      phone: "0900000003",
      bio: "Backend engineer focused on Node.js and MySQL.",
      cvLink: "https://example.com/cv/linh-nguyen",
    },
    {
      fullName: "Huy Pham",
      email: "huy.pham@demo.com",
      phone: "0900000004",
      bio: "QA automation with Playwright and Cypress.",
      cvLink: "https://example.com/cv/huy-pham",
    },
    {
      fullName: "Trang Vo",
      email: "trang.vo@demo.com",
      phone: "0900000005",
      bio: "Product designer with Figma and UX research background.",
      cvLink: "https://example.com/cv/trang-vo",
    },
  ];

  for (const item of extraCandidates) {
    const user = await prisma.user.upsert({
      where: { email: item.email },
      update: {},
      create: {
        fullName: item.fullName,
        email: item.email,
        passwordHash: candidatePassword,
        role: UserRole.CANDIDATE,
      },
    });

    await prisma.candidateProfile.upsert({
      where: { userId: user.id },
      update: {
        phone: item.phone,
        bio: item.bio,
        cvLink: item.cvLink,
      },
      create: {
        userId: user.id,
        phone: item.phone,
        bio: item.bio,
        cvLink: item.cvLink,
      },
    });
  }

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

  await prisma.billingPackage.upsert({
    where: { name: "Starter" },
    update: { credits: 30, priceCents: 1900, isActive: true },
    create: {
      name: "Starter",
      credits: 30,
      priceCents: 1900,
      isActive: true,
    },
  });

  await prisma.billingPackage.upsert({
    where: { name: "Growth" },
    update: { credits: 80, priceCents: 4500, isActive: true },
    create: {
      name: "Growth",
      credits: 80,
      priceCents: 4500,
      isActive: true,
    },
  });

  await prisma.billingPackage.upsert({
    where: { name: "Scale" },
    update: { credits: 180, priceCents: 8900, isActive: true },
    create: {
      name: "Scale",
      credits: 180,
      priceCents: 8900,
      isActive: true,
    },
  });

  const existingTransactions = await prisma.employerTransaction.count({
    where: { employerId: employer.id },
  });

  if (existingTransactions === 0) {
    const packages = await prisma.billingPackage.findMany({
      orderBy: { id: "asc" },
    });

    for (const pkg of packages) {
      await prisma.employerTransaction.create({
        data: {
          transactionCode: `SEED-TXN-${pkg.id}-${Date.now()}`,
          employerId: employer.id,
          packageId: pkg.id,
          amountCents: pkg.priceCents,
          credits: pkg.credits,
          status: "SUCCESS",
        },
      });
    }
  }

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

  const extraJobs = [
    {
      title: "UI/UX Designer",
      companyName: "BrightLabs",
      location: "Da Nang",
      salaryMin: 900,
      salaryMax: 1500,
      description: "Design user flows, wireframes, and polished UI systems.",
      requirements: "2+ years in product design, strong Figma skills.",
      type: JobType.FULL_TIME,
    },
    {
      title: "QA Automation Engineer",
      companyName: "QualityHub",
      location: "Ho Chi Minh City",
      salaryMin: 1000,
      salaryMax: 1600,
      description: "Build E2E tests and maintain automation pipelines.",
      requirements: "Playwright/Cypress experience, CI/CD familiarity.",
      type: JobType.FULL_TIME,
    },
    {
      title: "Product Manager",
      companyName: "NexaSoft",
      location: "Ha Noi",
      salaryMin: 1400,
      salaryMax: 2300,
      description: "Own product roadmap, align stakeholders, ship features.",
      requirements: "3+ years PM, strong communication and analytics.",
      type: JobType.FULL_TIME,
    },
    {
      title: "DevOps Engineer",
      companyName: "CloudWorks",
      location: "Remote",
      salaryMin: 1600,
      salaryMax: 2600,
      description: "Manage cloud infrastructure and deployment pipelines.",
      requirements: "AWS/GCP, Docker, Kubernetes, monitoring tools.",
      type: JobType.REMOTE,
    },
  ];

  for (const job of extraJobs) {
    const exists = await prisma.job.findFirst({
      where: {
        title: job.title,
        companyName: job.companyName,
        location: job.location,
      },
    });

    if (!exists) {
      await prisma.job.create({
        data: {
          ...job,
          employerId: employer.id,
        },
      });
    }
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
