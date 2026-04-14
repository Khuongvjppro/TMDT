import { prisma } from "../lib/prisma";
import { UserRole } from "../constants/enums";

type EnsureRoleProfileInput = {
  userId: number;
  role: UserRole;
  fullName: string;
};

export async function ensureRoleProfile({
  userId,
  role,
  fullName,
}: EnsureRoleProfileInput) {
  if (role === "CANDIDATE") {
    await prisma.candidateProfile.upsert({
      where: { userId },
      update: {},
      create: { userId },
    });
    return;
  }

  if (role === "EMPLOYER") {
    await prisma.employerProfile.upsert({
      where: { userId },
      update: {},
      create: {
        userId,
        companyName: `${fullName} Company`,
      },
    });
    return;
  }

  if (role === "ADMIN") {
    await prisma.adminProfile.upsert({
      where: { userId },
      update: {},
      create: { userId },
    });
  }
}
