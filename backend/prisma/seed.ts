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

  const employerPartners = await prisma.user.upsert({
    where: { email: "employer_partners@demo.com" },
    update: { emailVerifiedAt: new Date() },
    create: {
      fullName: "NovaCommerce Partners HR",
      email: "employer_partners@demo.com",
      passwordHash: employerPassword,
      role: UserRole.EMPLOYER,
      emailVerifiedAt: new Date(),
    },
  });

  const employerLogistics = await prisma.user.upsert({
    where: { email: "employer_logistics@demo.com" },
    update: { emailVerifiedAt: new Date() },
    create: {
      fullName: "RetailHub Logistics HR",
      email: "employer_logistics@demo.com",
      passwordHash: employerPassword,
      role: UserRole.EMPLOYER,
      emailVerifiedAt: new Date(),
    },
  });

  const employerData = await prisma.user.upsert({
    where: { email: "employer_data@demo.com" },
    update: { emailVerifiedAt: new Date() },
    create: {
      fullName: "CommerceData Inc HR",
      email: "employer_data@demo.com",
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
    update: {
      bio: "Passionate E-Commerce Developer with 2+ years of experience building scalable Shopify apps, Next.js storefronts, and optimizing sales conversions.",
    },
    create: {
      userId: candidate.id,
      phone: "0900000001",
      bio: "Passionate E-Commerce Developer with 2+ years of experience building scalable Shopify apps, Next.js storefronts, and optimizing sales conversions.",
      cvLink: "https://example.com/cv/candidate",
    },
  });

  const extraCandidates = [
    {
      fullName: "Minh Tran",
      email: "minh.tran@demo.com",
      phone: "0900000002",
      bio: "Frontend developer specializing in building dynamic, accessible user interfaces for e-commerce shopping carts and payment checkouts.",
      cvLink: "https://example.com/cv/minh-tran",
    },
    {
      fullName: "Linh Nguyen",
      email: "linh.nguyen@demo.com",
      phone: "0900000003",
      bio: "Backend engineer focusing on e-commerce transaction APIs, MySQL catalog optimization, and webhooks integration.",
      cvLink: "https://example.com/cv/linh-nguyen",
    },
    {
      fullName: "Huy Pham",
      email: "huy.pham@demo.com",
      phone: "0900000004",
      bio: "QA engineer specialized in automated testing for retail checkouts, discount logic, and payment gateway flows.",
      cvLink: "https://example.com/cv/huy-pham",
    },
    {
      fullName: "Trang Vo",
      email: "trang.vo@demo.com",
      phone: "0900000005",
      bio: "UI/UX Designer with a strong track record of reducing checkout friction and increasing retail page conversion rates.",
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
      companyName: "EcoCommerce Co. (NovaCommerce)",
      companyWebsite: "https://novacommerce.example.com",
      companyLocation: "Ho Chi Minh City",
      description: "NovaCommerce is a leading digital commerce agency specializing in retail automation, headless e-commerce solutions, payment gateways, and conversion rate optimization (CRO) for international retail brands.",
      credits: 100,
      reputation: 150,
    },
    create: {
      userId: employer.id,
      companyName: "EcoCommerce Co. (NovaCommerce)",
      companyWebsite: "https://novacommerce.example.com",
      companyLocation: "Ho Chi Minh City",
      description: "NovaCommerce is a leading digital commerce agency specializing in retail automation, headless e-commerce solutions, payment gateways, and conversion rate optimization (CRO) for international retail brands.",
      credits: 100,
      reputation: 150,
    },
  });

  await prisma.employerProfile.upsert({
    where: { userId: employerPartners.id },
    update: {
      companyName: "NovaCommerce Partners",
      companyWebsite: "https://partners.example.com",
      companyLocation: "Da Nang",
      description: "NovaCommerce Partners specializes in product development and technical consulting for enterprise e-commerce platforms.",
      credits: 50,
      reputation: 80,
    },
    create: {
      userId: employerPartners.id,
      companyName: "NovaCommerce Partners",
      companyWebsite: "https://partners.example.com",
      companyLocation: "Da Nang",
      description: "NovaCommerce Partners specializes in product development and technical consulting for enterprise e-commerce platforms.",
      credits: 50,
      reputation: 80,
    },
  });

  await prisma.employerProfile.upsert({
    where: { userId: employerLogistics.id },
    update: {
      companyName: "RetailHub Logistics",
      companyWebsite: "https://logistics.example.com",
      companyLocation: "Ho Chi Minh City",
      description: "RetailHub Logistics provides e-commerce supply chain management and automated order fulfillment services.",
      credits: 55,
      reputation: 95,
    },
    create: {
      userId: employerLogistics.id,
      companyName: "RetailHub Logistics",
      companyWebsite: "https://logistics.example.com",
      companyLocation: "Ho Chi Minh City",
      description: "RetailHub Logistics provides e-commerce supply chain management and automated order fulfillment services.",
      credits: 55,
      reputation: 95,
    },
  });

  await prisma.employerProfile.upsert({
    where: { userId: employerData.id },
    update: {
      companyName: "CommerceData Inc",
      companyWebsite: "https://data.example.com",
      companyLocation: "Ha Noi",
      description: "CommerceData Inc is a data analytics firm specializing in e-commerce purchase patterns and conversion rate optimization insights.",
      credits: 40,
      reputation: 70,
    },
    create: {
      userId: employerData.id,
      companyName: "CommerceData Inc",
      companyWebsite: "https://data.example.com",
      companyLocation: "Ha Noi",
      description: "CommerceData Inc is a data analytics firm specializing in e-commerce purchase patterns and conversion rate optimization insights.",
      credits: 40,
      reputation: 70,
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

  // Clean up old IT seed data to make room for E-commerce specialized data
  await prisma.review.deleteMany({});
  await prisma.interviewSchedule.deleteMany({});
  await prisma.application.deleteMany({});
  await prisma.job.deleteMany({});

  await prisma.job.createMany({
    data: [
      {
        title: "E-Commerce Frontend Developer (Next.js & Shopify)",
        companyName: "EcoCommerce Co. (NovaCommerce)",
        location: "Ho Chi Minh City",
        salaryMin: 15,
        salaryMax: 60,
        description:
          "Develop fast headless commerce storefronts, cart systems, and payment gateway integrations using Next.js, Tailwind CSS, and Shopify Storefront API.",
        requirements: "At least 1-2 years with React/Next.js. Experience with e-commerce cart/checkout flows is a major plus.",
        type: JobType.FULL_TIME,
        employerId: employer.id,
        status: "APPROVED",
      },
      {
        title: "SEO & Digital Marketing Specialist",
        companyName: "EcoCommerce Co. (NovaCommerce)",
        location: "Ha Noi",
        salaryMin: 12,
        salaryMax: 45,
        description: "Optimize product listing pages (PLP), manage search engine marketing campaigns, track conversion rates, and build retention funnels.",
        requirements: "Experience with Google Analytics, Ads, SEO tools, and conversion rate optimization (CRO).",
        type: JobType.FULL_TIME,
        employerId: employer.id,
        status: "APPROVED",
      },
    ],
  });

  const extraJobs = [
    {
      title: "E-Commerce Product Manager",
      companyName: "NovaCommerce Partners",
      location: "Da Nang",
      salaryMin: 20,
      salaryMax: 70,
      description: "Own the digital shopping experience roadmap, lead checkout optimization initiatives, A/B test landing pages, and analyze sales funnels.",
      requirements: "2+ years of experience in product management, specifically in e-commerce or marketplace products.",
      type: JobType.FULL_TIME,
    },
    {
      title: "Supply Chain & Order Operations Specialist",
      companyName: "RetailHub Logistics",
      location: "Ho Chi Minh City",
      salaryMin: 10,
      salaryMax: 30,
      description: "Coordinate order fulfillment, manage inventory synchronization APIs, and collaborate with shipping API partners (GHTK, ViettelPost).",
      requirements: "Knowledge of logistics operations, inventory control, and digital supply chain workflows.",
      type: JobType.FULL_TIME,
    },
    {
      title: "Data Analyst (E-Commerce Sales)",
      companyName: "CommerceData Inc",
      location: "Ha Noi",
      salaryMin: 14,
      salaryMax: 55,
      description: "Analyze purchase patterns, cart abandonment rates, customer lifetime value (LTV), and marketing campaign performance.",
      requirements: "Proficient in SQL, Python, Excel, and BI tools (PowerBI, Tableau).",
      type: JobType.FULL_TIME,
    },
    {
      title: "Customer Success & Live Chat Representative",
      companyName: "EcoCommerce Co. (NovaCommerce)",
      location: "Remote",
      salaryMin: 8,
      salaryMax: 25,
      description: "Manage client order inquiries, process refund requests, and support customers via live chat channels.",
      requirements: "Excellent communication skills and experience with CRM or live chat support tools.",
      type: JobType.REMOTE,
    },
  ];

  for (const job of extraJobs) {
    let empId = employer.id;
    if (job.companyName === "NovaCommerce Partners") empId = employerPartners.id;
    else if (job.companyName === "RetailHub Logistics") empId = employerLogistics.id;
    else if (job.companyName === "CommerceData Inc") empId = employerData.id;

    await prisma.job.create({
      data: {
        ...job,
        employerId: empId,
        status: "APPROVED",
      },
    });
  }

  // Force update all existing jobs to APPROVED so they show up on the public homepage
  await prisma.job.updateMany({
    data: { status: "APPROVED" },
  });

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
          "I am highly interested in this E-commerce developer role. I have extensive experience with Next.js storefront integrations and payment gateways.",
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
            "Great interview process and clear job description. Highly recommend applying here for e-commerce developers.",
        },
        {
          jobId: jobs[1]?.id ?? firstJob.id,
          rating: 4,
          content:
            "Responsive recruitment team and clear task requirements during screening.",
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
            isHidden: false,
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
