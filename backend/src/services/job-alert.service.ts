import { prisma } from "../lib/prisma";

const prismaJobAlert = (prisma as any).jobAlert;
const prismaAlertNotification = (prisma as any).alertNotification;

let schedulerTimer: NodeJS.Timeout | null = null;
let isSchedulerRunning = false;

type AlertRuleRow = {
  id: number;
  candidateId: number;
  keyword: string | null;
  location: string | null;
  type: "FULL_TIME" | "PART_TIME" | "INTERN" | "FREELANCE" | "REMOTE" | null;
  minSalary: number | null;
  maxExperienceYears: number | null;
  createdAt: Date;
  lastCheckedAt: Date | null;
};

export type AlertMatchingStats = {
  processedRules: number;
  matchedJobs: number;
  createdNotifications: number;
};

function buildAlertJobWhere(alert: AlertRuleRow) {
  const andConditions: Array<Record<string, unknown>> = [
    { isActive: true },
    {
      createdAt: {
        gt: alert.lastCheckedAt || alert.createdAt,
      },
    },
  ];

  if (alert.keyword) {
    andConditions.push({
      OR: [
        { title: { contains: alert.keyword } },
        { companyName: { contains: alert.keyword } },
      ],
    });
  }

  if (alert.location) {
    andConditions.push({
      location: { contains: alert.location },
    });
  }

  if (alert.type) {
    andConditions.push({ type: alert.type });
  }

  if (alert.minSalary !== null) {
    andConditions.push({
      OR: [{ salaryMax: null }, { salaryMax: { gte: alert.minSalary } }],
    });
  }

  if (alert.maxExperienceYears !== null) {
    andConditions.push({
      OR: [
        { minExperienceYears: null },
        { minExperienceYears: { lte: alert.maxExperienceYears } },
      ],
    });
  }

  return {
    AND: andConditions,
  };
}

async function runMatchingForAlerts(alerts: AlertRuleRow[]): Promise<AlertMatchingStats> {
  let matchedJobs = 0;
  let createdNotifications = 0;

  for (const alert of alerts) {
    const jobs = await prisma.job.findMany({
      where: buildAlertJobWhere(alert) as any,
      select: {
        id: true,
        title: true,
        companyName: true,
      },
      orderBy: { createdAt: "desc" },
      take: 30,
    });

    matchedJobs += jobs.length;

    if (jobs.length > 0) {
      const result = await prismaAlertNotification.createMany({
        data: jobs.map((job) => ({
          alertId: alert.id,
          candidateId: alert.candidateId,
          jobId: job.id,
          message: `New match: ${job.title} at ${job.companyName}`,
        })),
        skipDuplicates: true,
      });

      createdNotifications += result.count;
    }

    await prismaJobAlert.update({
      where: { id: alert.id },
      data: {
        lastCheckedAt: new Date(),
      },
    });
  }

  return {
    processedRules: alerts.length,
    matchedJobs,
    createdNotifications,
  };
}

export async function runJobAlertMatchingCycle(): Promise<AlertMatchingStats> {
  const alerts = (await prismaJobAlert.findMany({
    where: { isActive: true },
    select: {
      id: true,
      candidateId: true,
      keyword: true,
      location: true,
      type: true,
      minSalary: true,
      maxExperienceYears: true,
      createdAt: true,
      lastCheckedAt: true,
    },
    orderBy: { updatedAt: "desc" },
    take: 200,
  })) as AlertRuleRow[];

  return runMatchingForAlerts(alerts);
}

export async function runJobAlertMatchingForCandidate(
  candidateId: number,
): Promise<AlertMatchingStats> {
  const alerts = (await prismaJobAlert.findMany({
    where: {
      candidateId,
      isActive: true,
    },
    select: {
      id: true,
      candidateId: true,
      keyword: true,
      location: true,
      type: true,
      minSalary: true,
      maxExperienceYears: true,
      createdAt: true,
      lastCheckedAt: true,
    },
    orderBy: { updatedAt: "desc" },
    take: 50,
  })) as AlertRuleRow[];

  return runMatchingForAlerts(alerts);
}

async function runScheduledCycle() {
  if (isSchedulerRunning) {
    return;
  }

  isSchedulerRunning = true;
  try {
    const result = await runJobAlertMatchingCycle();
    if (result.createdNotifications > 0 || result.matchedJobs > 0) {
      console.log(
        `[job-alert] processed=${result.processedRules} matched=${result.matchedJobs} created=${result.createdNotifications}`,
      );
    }
  } catch (error) {
    console.error("[job-alert] scheduler cycle failed", error);
  } finally {
    isSchedulerRunning = false;
  }
}

export function startJobAlertScheduler() {
  if (process.env.NODE_ENV === "test") {
    return;
  }

  if (schedulerTimer) {
    return;
  }

  const parsedInterval = Number(process.env.ALERT_SCHEDULER_INTERVAL_MS || 60000);
  const intervalMs = Number.isFinite(parsedInterval) && parsedInterval > 0
    ? parsedInterval
    : 60000;

  schedulerTimer = setInterval(() => {
    void runScheduledCycle();
  }, intervalMs);

  void runScheduledCycle();
  console.log(`[job-alert] scheduler started with interval ${intervalMs}ms`);
}
