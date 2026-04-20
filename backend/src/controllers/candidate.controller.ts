import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";

const prismaCandidateCv = (prisma as any).candidateCv;

const cvIdParamSchema = z.coerce.number().int().positive();

const updateCandidateProfileSchema = z
  .object({
    fullName: z.string().trim().min(2).max(120).optional(),
    phone: z
      .union([z.string().trim().max(20), z.null()])
      .optional()
      .refine(
        (value) => value == null || /^\+?[0-9\s-]{8,20}$/.test(value),
        {
          message: "Invalid phone number format",
        },
      ),
    bio: z.union([z.string().trim().max(2000), z.null()]).optional(),
    cvLink: z.union([z.string().trim().url(), z.null()]).optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required",
  });

const createCandidateCvSchema = z.object({
  title: z.string().trim().min(2).max(120),
  cvUrl: z.string().trim().url(),
  summary: z.string().max(2000).optional(),
  isDefault: z.boolean().optional(),
});

const updateCandidateCvSchema = z
  .object({
    title: z.string().trim().min(2).max(120).optional(),
    cvUrl: z.string().trim().url().optional(),
    summary: z.union([z.string().max(2000), z.null()]).optional(),
    isDefault: z.boolean().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required",
  });

function normalizeNullableText(value: string | null | undefined) {
  if (value === undefined) return undefined;
  if (value === null) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function parseCvId(rawId: unknown) {
  return cvIdParamSchema.safeParse(rawId);
}

function isUniqueConstraintError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "P2002"
  );
}

async function ensureCandidateUser(userId: number) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      fullName: true,
      email: true,
    },
  });
}

function mapCandidateProfileResponse(input: {
  user: {
    id: number;
    fullName: string;
    email: string;
  };
  profile: {
    id: number;
    phone: string | null;
    bio: string | null;
    cvLink: string | null;
    createdAt: Date;
    updatedAt: Date;
  };
}) {
  return {
    userId: input.user.id,
    fullName: input.user.fullName,
    email: input.user.email,
    phone: input.profile.phone,
    bio: input.profile.bio,
    cvLink: input.profile.cvLink,
    createdAt: input.profile.createdAt,
    updatedAt: input.profile.updatedAt,
  };
}

export async function getMyCandidateProfile(req: Request, res: Response) {
  const authUser = req.user;
  if (!authUser) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const user = await ensureCandidateUser(authUser.userId);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const profile = await prisma.candidateProfile.upsert({
    where: { userId: authUser.userId },
    update: {},
    create: { userId: authUser.userId },
  });

  return res
    .status(200)
    .json({ item: mapCandidateProfileResponse({ user, profile }) });
}

export async function updateMyCandidateProfile(req: Request, res: Response) {
  const authUser = req.user;
  if (!authUser) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const parsed = updateCandidateProfileSchema.safeParse(req.body);
  if (!parsed.success) {
    return res
      .status(400)
      .json({ message: "Invalid payload", errors: parsed.error.flatten() });
  }

  const profileUpdateData: {
    phone?: string | null;
    bio?: string | null;
    cvLink?: string | null;
  } = {};

  if ("phone" in parsed.data) {
    profileUpdateData.phone = normalizeNullableText(parsed.data.phone);
  }

  if ("bio" in parsed.data) {
    profileUpdateData.bio = normalizeNullableText(parsed.data.bio);
  }

  if ("cvLink" in parsed.data) {
    profileUpdateData.cvLink = normalizeNullableText(parsed.data.cvLink);
  }

  const updatedProfile = await prisma.$transaction(async (tx) => {
    if (parsed.data.fullName !== undefined) {
      await tx.user.update({
        where: { id: authUser.userId },
        data: { fullName: parsed.data.fullName },
      });
    }

    const profile = await tx.candidateProfile.upsert({
      where: { userId: authUser.userId },
      update: profileUpdateData,
      create: {
        userId: authUser.userId,
        ...profileUpdateData,
      },
    });

    const user = await tx.user.findUnique({
      where: { id: authUser.userId },
      select: {
        id: true,
        fullName: true,
        email: true,
      },
    });

    if (!user) {
      throw new Error("USER_NOT_FOUND");
    }

    return mapCandidateProfileResponse({ user, profile });
  });

  return res.status(200).json({ item: updatedProfile });
}

export async function listMyCvs(req: Request, res: Response) {
  const authUser = req.user;
  if (!authUser) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const items = await prismaCandidateCv.findMany({
    where: { candidateId: authUser.userId },
    orderBy: [{ isDefault: "desc" }, { updatedAt: "desc" }],
  });

  return res.status(200).json({ items });
}

export async function createMyCv(req: Request, res: Response) {
  const authUser = req.user;
  if (!authUser) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const parsed = createCandidateCvSchema.safeParse(req.body);
  if (!parsed.success) {
    return res
      .status(400)
      .json({ message: "Invalid payload", errors: parsed.error.flatten() });
  }

  try {
    const item = await prisma.$transaction(async (tx) => {
      const txCandidateCv = (tx as any).candidateCv;
      const count = await txCandidateCv.count({
        where: { candidateId: authUser.userId },
      });
      const shouldSetDefault = parsed.data.isDefault === true || count === 0;

      if (shouldSetDefault) {
        await txCandidateCv.updateMany({
          where: { candidateId: authUser.userId },
          data: { isDefault: false },
        });
      }

      return txCandidateCv.create({
        data: {
          candidateId: authUser.userId,
          title: parsed.data.title,
          cvUrl: parsed.data.cvUrl,
          summary: normalizeNullableText(parsed.data.summary),
          isDefault: shouldSetDefault,
        },
      });
    });

    return res.status(201).json({ item });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return res.status(409).json({ message: "CV title already exists" });
    }
    throw error;
  }
}

export async function updateMyCv(req: Request, res: Response) {
  const authUser = req.user;
  if (!authUser) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const cvIdParsed = parseCvId(req.params.id);
  if (!cvIdParsed.success) {
    return res.status(400).json({ message: "Invalid cv id" });
  }

  const parsed = updateCandidateCvSchema.safeParse(req.body);
  if (!parsed.success) {
    return res
      .status(400)
      .json({ message: "Invalid payload", errors: parsed.error.flatten() });
  }

  const cvId = cvIdParsed.data;
  const existing = await prismaCandidateCv.findFirst({
    where: {
      id: cvId,
      candidateId: authUser.userId,
    },
  });

  if (!existing) {
    return res.status(404).json({ message: "CV not found" });
  }

  const updateData: {
    title?: string;
    cvUrl?: string;
    summary?: string | null;
    isDefault?: boolean;
  } = {};

  if (parsed.data.title !== undefined) {
    updateData.title = parsed.data.title;
  }

  if (parsed.data.cvUrl !== undefined) {
    updateData.cvUrl = parsed.data.cvUrl;
  }

  if ("summary" in parsed.data) {
    updateData.summary = normalizeNullableText(parsed.data.summary);
  }

  let item: any | null = null;

  try {
    await prisma.$transaction(async (tx) => {
      const txCandidateCv = (tx as any).candidateCv;
      if (parsed.data.isDefault === true) {
        await txCandidateCv.updateMany({
          where: {
            candidateId: authUser.userId,
            id: { not: cvId },
          },
          data: { isDefault: false },
        });

        item = await txCandidateCv.update({
          where: { id: cvId },
          data: {
            ...updateData,
            isDefault: true,
          },
        });
        return;
      }

      if (parsed.data.isDefault === false && existing.isDefault) {
        const fallbackCv = await txCandidateCv.findFirst({
          where: {
            candidateId: authUser.userId,
            id: { not: cvId },
          },
          orderBy: { updatedAt: "desc" },
        });

        if (!fallbackCv) {
          throw new Error("CANNOT_UNSET_LAST_DEFAULT_CV");
        }

        item = await txCandidateCv.update({
          where: { id: cvId },
          data: {
            ...updateData,
            isDefault: false,
          },
        });

        await txCandidateCv.update({
          where: { id: fallbackCv.id },
          data: { isDefault: true },
        });
        return;
      }

      item = await txCandidateCv.update({
        where: { id: cvId },
        data: {
          ...updateData,
          ...(parsed.data.isDefault === false ? { isDefault: false } : {}),
        },
      });
    });
  } catch (error) {
    if (error instanceof Error && error.message === "CANNOT_UNSET_LAST_DEFAULT_CV") {
      return res.status(400).json({
        message: "At least one CV must remain as default",
      });
    }

    if (isUniqueConstraintError(error)) {
      return res.status(409).json({ message: "CV title already exists" });
    }

    throw error;
  }

  if (!item) {
    return res.status(500).json({ message: "Cannot update CV" });
  }

  return res.status(200).json({ item });
}

export async function deleteMyCv(req: Request, res: Response) {
  const authUser = req.user;
  if (!authUser) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const cvIdParsed = parseCvId(req.params.id);
  if (!cvIdParsed.success) {
    return res.status(400).json({ message: "Invalid cv id" });
  }

  const cvId = cvIdParsed.data;
  const existing = await prismaCandidateCv.findFirst({
    where: {
      id: cvId,
      candidateId: authUser.userId,
    },
  });

  if (!existing) {
    return res.status(404).json({ message: "CV not found" });
  }

  await prisma.$transaction(async (tx) => {
    const txCandidateCv = (tx as any).candidateCv;
    await txCandidateCv.delete({ where: { id: cvId } });

    if (existing.isDefault) {
      const replacement = await txCandidateCv.findFirst({
        where: { candidateId: authUser.userId },
        orderBy: { updatedAt: "desc" },
      });

      if (replacement) {
        await txCandidateCv.update({
          where: { id: replacement.id },
          data: { isDefault: true },
        });
      }
    }
  });

  return res.status(204).send();
}

export async function setDefaultMyCv(req: Request, res: Response) {
  const authUser = req.user;
  if (!authUser) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const cvIdParsed = parseCvId(req.params.id);
  if (!cvIdParsed.success) {
    return res.status(400).json({ message: "Invalid cv id" });
  }

  const cvId = cvIdParsed.data;
  const existing = await prismaCandidateCv.findFirst({
    where: {
      id: cvId,
      candidateId: authUser.userId,
    },
  });

  if (!existing) {
    return res.status(404).json({ message: "CV not found" });
  }

  await prisma.$transaction(async (tx) => {
    const txCandidateCv = (tx as any).candidateCv;
    await txCandidateCv.updateMany({
      where: { candidateId: authUser.userId },
      data: { isDefault: false },
    });

    await txCandidateCv.update({
      where: { id: cvId },
      data: { isDefault: true },
    });
  });

  const item = await prismaCandidateCv.findUnique({ where: { id: cvId } });
  return res.status(200).json({ item });
}