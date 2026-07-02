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
    update: {
      emailVerifiedAt: new Date(),
    },
    create: {
      fullName: "Demo Guest",
      email: "guest@demo.com",
      passwordHash: guestPassword,
      role: UserRole.GUEST,
      emailVerifiedAt: new Date(),
    },
  });

  const employer = await prisma.user.upsert({
    where: { email: "employer@demo.com" },
    update: {
      emailVerifiedAt: new Date(),
    },
    create: {
      fullName: "Demo Employer",
      email: "employer@demo.com",
      passwordHash: employerPassword,
      role: UserRole.EMPLOYER,
      emailVerifiedAt: new Date(),
    },
  });

  const candidate = await prisma.user.upsert({
    where: { email: "candidate@demo.com" },
    update: {
      emailVerifiedAt: new Date(),
    },
    create: {
      fullName: "Demo Candidate",
      email: "candidate@demo.com",
      passwordHash: candidatePassword,
      role: UserRole.CANDIDATE,
      emailVerifiedAt: new Date(),
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: "admin@demo.com" },
    update: {
      emailVerifiedAt: new Date(),
    },
    create: {
      fullName: "Demo Admin",
      email: "admin@demo.com",
      passwordHash: adminPassword,
      role: UserRole.ADMIN,
      emailVerifiedAt: new Date(),
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
      update: {
        emailVerifiedAt: new Date(),
      },
      create: {
        fullName: item.fullName,
        email: item.email,
        passwordHash: candidatePassword,
        role: UserRole.CANDIDATE,
        emailVerifiedAt: new Date(),
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
    update: {
      credits: 100,
    },
    create: {
      userId: employer.id,
      companyName: "TechNova",
      companyWebsite: "https://technova.example.com",
      companyLocation: "Ho Chi Minh City",
      description: "Demo employer profile for starter scaffold.",
      credits: 100,
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
    update: {
      price: 190000,
      durationDays: 30,
      maxJobPosts: 30,
      isActive: true,
    },
    create: {
      name: "Starter",
      price: 190000,
      durationDays: 30,
      maxJobPosts: 30,
      isActive: true,
    },
  });

  await prisma.billingPackage.upsert({
    where: { name: "Growth" },
    update: {
      price: 450000,
      durationDays: 60,
      maxJobPosts: 80,
      isActive: true,
    },
    create: {
      name: "Growth",
      price: 450000,
      durationDays: 60,
      maxJobPosts: 80,
      isActive: true,
    },
  });

  await prisma.billingPackage.upsert({
    where: { name: "Scale" },
    update: {
      price: 890000,
      durationDays: 90,
      maxJobPosts: 180,
      isActive: true,
    },
    create: {
      name: "Scale",
      price: 890000,
      durationDays: 90,
      maxJobPosts: 180,
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
          amountCents: pkg.price,
          credits: pkg.maxJobPosts,
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
          salaryMin: 10,
          salaryMax: 50,
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
          salaryMin: 10,
          salaryMax: 50,
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
      salaryMin: 10,
      salaryMax: 50,
      description: "Design user flows, wireframes, and polished UI systems.",
      requirements: "2+ years in product design, strong Figma skills.",
      type: JobType.FULL_TIME,
    },
    {
      title: "QA Automation Engineer",
      companyName: "QualityHub",
      location: "Ho Chi Minh City",
      salaryMin: 10,
      salaryMax: 50,
      description: "Build E2E tests and maintain automation pipelines.",
      requirements: "Playwright/Cypress experience, CI/CD familiarity.",
      type: JobType.FULL_TIME,
    },
    {
      title: "Product Manager",
      companyName: "NexaSoft",
      location: "Ha Noi",
      salaryMin: 10,
      salaryMax: 50,
      description: "Own product roadmap, align stakeholders, ship features.",
      requirements: "3+ years PM, strong communication and analytics.",
      type: JobType.FULL_TIME,
    },
    {
      title: "DevOps Engineer",
      companyName: "CloudWorks",
      location: "Remote",
      salaryMin: 10,
      salaryMax: 50,
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

    const reviewCount = await prisma.review.count();
    if (reviewCount === 0) {
      const jobs = await prisma.job.findMany({
        take: 3,
        orderBy: { id: "asc" },
      });

      const seedReviews = [
        {
          jobId: jobs[0]?.id ?? firstJob.id,
          rating: 5,
          content:
            "Great interview process and clear job description. Highly recommend applying here.",
        },
        {
          jobId: jobs[1]?.id ?? firstJob.id,
          rating: 2,
          content:
            "Slow response from HR team. The role description did not match the actual interview topics.",
        },
        {
          jobId: jobs[2]?.id ?? firstJob.id,
          rating: 1,
          content:
            "Inappropriate questions during interview. Would not recommend this company to others.",
          isHidden: true,
          hideReason: "Contains inappropriate content flagged during moderation",
        },
      ];

      for (const item of seedReviews) {
        await prisma.review.upsert({
          where: {
            authorId_jobId: {
              authorId: candidate.id,
              jobId: item.jobId,
            },
          },
          update: {},
          create: {
            authorId: candidate.id,
            jobId: item.jobId,
            rating: item.rating,
            content: item.content,
            isHidden: item.isHidden ?? false,
            hideReason: item.isHidden ? item.hideReason : null,
            hiddenAt: item.isHidden ? new Date() : null,
          },
        });
      }
    }
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
