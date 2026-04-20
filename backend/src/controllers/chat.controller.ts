import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";

const prismaConversation = (prisma as any).conversation;
const prismaMessage = (prisma as any).message;

const conversationIdParamSchema = z.coerce.number().int().positive();

const listMessagesQuerySchema = z.object({
  afterId: z.coerce.number().int().positive().optional(),
  pageSize: z.coerce.number().int().min(1).max(100).default(30),
});

const createConversationSchema = z.object({
  participantId: z.coerce.number().int().positive(),
  initialMessage: z.string().trim().max(2000).optional(),
});

const createMessageSchema = z.object({
  content: z.string().trim().min(1).max(2000),
});

type ConversationRow = {
  id: number;
  candidateId: number;
  employerId: number;
  createdAt: Date;
  updatedAt: Date;
  candidate: {
    id: number;
    fullName: string;
    email: string;
    role: string;
  };
  employer: {
    id: number;
    fullName: string;
    email: string;
    role: string;
  };
  messages: Array<{
    id: number;
    conversationId: number;
    senderId: number;
    content: string;
    isRead: boolean;
    createdAt: Date;
  }>;
};

type ChatContactItem = {
  id: number;
  participantId: number;
  role: "CANDIDATE" | "EMPLOYER";
  fullName: string;
  email: string;
  companyName?: string | null;
  jobId?: number;
  jobTitle?: string;
  label: string;
};

function getAuthUser(req: Request, res: Response) {
  if (!req.user) {
    res.status(401).json({ message: "Unauthorized" });
    return null;
  }
  return req.user;
}

function mapConversationItem(
  conversation: ConversationRow,
  authUserId: number,
  unreadCount: number,
) {
  const peerUser =
    conversation.candidateId === authUserId
      ? conversation.employer
      : conversation.candidate;

  return {
    id: conversation.id,
    candidateId: conversation.candidateId,
    employerId: conversation.employerId,
    createdAt: conversation.createdAt,
    updatedAt: conversation.updatedAt,
    peerUser,
    lastMessage: conversation.messages[0] ?? null,
    unreadCount,
  };
}

async function findConversationForUser(conversationId: number, userId: number) {
  return prismaConversation.findFirst({
    where: {
      id: conversationId,
      OR: [{ candidateId: userId }, { employerId: userId }],
    },
    select: {
      id: true,
      candidateId: true,
      employerId: true,
    },
  });
}

async function getConversationUnreadCounts(
  conversationIds: number[],
  authUserId: number,
) {
  if (conversationIds.length === 0) {
    return new Map<number, number>();
  }

  const grouped = await prismaMessage.groupBy({
    by: ["conversationId"],
    where: {
      conversationId: { in: conversationIds },
      senderId: { not: authUserId },
      isRead: false,
    },
    _count: {
      _all: true,
    },
  });

  const unreadCountMap = new Map<number, number>();
  for (const item of grouped) {
    unreadCountMap.set(item.conversationId, item._count._all);
  }

  return unreadCountMap;
}

export async function listMyConversations(req: Request, res: Response) {
  const authUser = getAuthUser(req, res);
  if (!authUser) return;

  const rows = (await prismaConversation.findMany({
    where: {
      OR: [{ candidateId: authUser.userId }, { employerId: authUser.userId }],
    },
    include: {
      candidate: {
        select: {
          id: true,
          fullName: true,
          email: true,
          role: true,
        },
      },
      employer: {
        select: {
          id: true,
          fullName: true,
          email: true,
          role: true,
        },
      },
      messages: {
        select: {
          id: true,
          conversationId: true,
          senderId: true,
          content: true,
          isRead: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
    orderBy: { updatedAt: "desc" },
    take: 100,
  })) as ConversationRow[];

  const conversationIds = rows.map((row) => row.id);
  const unreadCountMap = await getConversationUnreadCounts(
    conversationIds,
    authUser.userId,
  );

  const items = rows.map((row) =>
    mapConversationItem(row, authUser.userId, unreadCountMap.get(row.id) ?? 0),
  );

  return res.status(200).json({ items });
}

export async function listMyChatContacts(req: Request, res: Response) {
  const authUser = getAuthUser(req, res);
  if (!authUser) return;

  if (authUser.role === "CANDIDATE") {
    const jobs = await prisma.job.findMany({
      where: {
        isActive: true,
      },
      select: {
        id: true,
        title: true,
        companyName: true,
        employerId: true,
        employer: {
          select: {
            id: true,
            fullName: true,
            email: true,
            employerProfile: {
              select: {
                companyName: true,
              },
            },
          },
        },
      },
      orderBy: {
        id: "desc",
      },
      take: 500,
    });

    const items: ChatContactItem[] = jobs.map((item) => {
      const companyName =
        item.employer.employerProfile?.companyName || item.companyName || null;
      const label = `${item.companyName} - ${item.title} (${item.employer.fullName})`;

      return {
        id: item.id,
        participantId: item.employerId,
        role: "EMPLOYER",
        fullName: item.employer.fullName,
        email: item.employer.email,
        companyName,
        jobId: item.id,
        jobTitle: item.title,
        label,
      };
    });

    return res.status(200).json({ items });
  }

  const applications = await prisma.application.findMany({
    where: {
      job: {
        employerId: authUser.userId,
      },
    },
    select: {
      candidateId: true,
      candidate: {
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      },
    },
    distinct: ["candidateId"],
    take: 200,
  });

  const items: ChatContactItem[] = applications.map((item) => ({
    id: item.candidate.id,
    participantId: item.candidate.id,
    role: "CANDIDATE",
    fullName: item.candidate.fullName,
    email: item.candidate.email,
    companyName: null,
    label: item.candidate.fullName,
  }));

  return res.status(200).json({ items });
}

export async function createConversation(req: Request, res: Response) {
  const authUser = getAuthUser(req, res);
  if (!authUser) return;

  const parsed = createConversationSchema.safeParse(req.body);
  if (!parsed.success) {
    return res
      .status(400)
      .json({ message: "Invalid payload", errors: parsed.error.flatten() });
  }

  if (parsed.data.participantId === authUser.userId) {
    return res.status(400).json({ message: "Cannot chat with yourself" });
  }

  const participant = await prisma.user.findUnique({
    where: { id: parsed.data.participantId },
    select: {
      id: true,
      role: true,
    },
  });

  if (!participant) {
    return res.status(404).json({ message: "Participant not found" });
  }

  let candidateId: number;
  let employerId: number;

  if (authUser.role === "CANDIDATE") {
    if (participant.role !== "EMPLOYER") {
      return res
        .status(400)
        .json({ message: "Candidates can only chat with employers" });
    }
    candidateId = authUser.userId;
    employerId = participant.id;
  } else if (authUser.role === "EMPLOYER") {
    if (participant.role !== "CANDIDATE") {
      return res
        .status(400)
        .json({ message: "Employers can only chat with candidates" });
    }
    candidateId = participant.id;
    employerId = authUser.userId;
  } else {
    return res.status(403).json({ message: "Forbidden" });
  }

  const initialMessage = parsed.data.initialMessage?.trim() || "";

  const existing = (await prismaConversation.findUnique({
    where: {
      candidateId_employerId: {
        candidateId,
        employerId,
      },
    },
    include: {
      candidate: {
        select: {
          id: true,
          fullName: true,
          email: true,
          role: true,
        },
      },
      employer: {
        select: {
          id: true,
          fullName: true,
          email: true,
          role: true,
        },
      },
      messages: {
        select: {
          id: true,
          conversationId: true,
          senderId: true,
          content: true,
          isRead: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  })) as ConversationRow | null;

  if (existing) {
    if (initialMessage) {
      await prisma.$transaction(async (tx) => {
        const txMessage = (tx as any).message;
        const txConversation = (tx as any).conversation;

        await txMessage.create({
          data: {
            conversationId: existing.id,
            senderId: authUser.userId,
            content: initialMessage,
          },
        });

        await txConversation.update({
          where: { id: existing.id },
          data: { updatedAt: new Date() },
        });
      });
    }

    const unreadCount = await prismaMessage.count({
      where: {
        conversationId: existing.id,
        senderId: { not: authUser.userId },
        isRead: false,
      },
    });

    const refreshed = (await prismaConversation.findUnique({
      where: { id: existing.id },
      include: {
        candidate: {
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
          },
        },
        employer: {
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
          },
        },
        messages: {
          select: {
            id: true,
            conversationId: true,
            senderId: true,
            content: true,
            isRead: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    })) as ConversationRow;

    return res.status(200).json({
      item: mapConversationItem(refreshed, authUser.userId, unreadCount),
      created: false,
    });
  }

  const created = (await prisma.$transaction(async (tx) => {
    const txConversation = (tx as any).conversation;
    const txMessage = (tx as any).message;

    const conversation = await txConversation.create({
      data: {
        candidateId,
        employerId,
      },
    });

    if (initialMessage) {
      await txMessage.create({
        data: {
          conversationId: conversation.id,
          senderId: authUser.userId,
          content: initialMessage,
        },
      });
      await txConversation.update({
        where: { id: conversation.id },
        data: { updatedAt: new Date() },
      });
    }

    return txConversation.findUnique({
      where: { id: conversation.id },
      include: {
        candidate: {
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
          },
        },
        employer: {
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
          },
        },
        messages: {
          select: {
            id: true,
            conversationId: true,
            senderId: true,
            content: true,
            isRead: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });
  })) as ConversationRow;

  return res.status(201).json({
    item: mapConversationItem(created, authUser.userId, 0),
    created: true,
  });
}

export async function listConversationMessages(req: Request, res: Response) {
  const authUser = getAuthUser(req, res);
  if (!authUser) return;

  const conversationIdParsed = conversationIdParamSchema.safeParse(req.params.id);
  if (!conversationIdParsed.success) {
    return res.status(400).json({ message: "Invalid conversation id" });
  }

  const queryParsed = listMessagesQuerySchema.safeParse(req.query);
  if (!queryParsed.success) {
    return res
      .status(400)
      .json({ message: "Invalid query", errors: queryParsed.error.flatten() });
  }

  const conversationId = conversationIdParsed.data;
  const conversation = await findConversationForUser(conversationId, authUser.userId);
  if (!conversation) {
    return res.status(404).json({ message: "Conversation not found" });
  }

  const { afterId, pageSize } = queryParsed.data;

  let items: Array<{
    id: number;
    conversationId: number;
    senderId: number;
    content: string;
    isRead: boolean;
    createdAt: Date;
  }> = [];

  if (afterId !== undefined) {
    items = await prismaMessage.findMany({
      where: {
        conversationId,
        id: { gt: afterId },
      },
      orderBy: { id: "asc" },
      take: pageSize,
    });
  } else {
    const latest = await prismaMessage.findMany({
      where: { conversationId },
      orderBy: { id: "desc" },
      take: pageSize,
    });
    items = latest.reverse();
  }

  await prismaMessage.updateMany({
    where: {
      conversationId,
      senderId: { not: authUser.userId },
      isRead: false,
    },
    data: {
      isRead: true,
    },
  });

  return res.status(200).json({ items });
}

export async function sendConversationMessage(req: Request, res: Response) {
  const authUser = getAuthUser(req, res);
  if (!authUser) return;

  const conversationIdParsed = conversationIdParamSchema.safeParse(req.params.id);
  if (!conversationIdParsed.success) {
    return res.status(400).json({ message: "Invalid conversation id" });
  }

  const parsed = createMessageSchema.safeParse(req.body);
  if (!parsed.success) {
    return res
      .status(400)
      .json({ message: "Invalid payload", errors: parsed.error.flatten() });
  }

  const conversationId = conversationIdParsed.data;
  const conversation = await findConversationForUser(conversationId, authUser.userId);
  if (!conversation) {
    return res.status(404).json({ message: "Conversation not found" });
  }

  const item = await prisma.$transaction(async (tx) => {
    const txMessage = (tx as any).message;
    const txConversation = (tx as any).conversation;

    const message = await txMessage.create({
      data: {
        conversationId,
        senderId: authUser.userId,
        content: parsed.data.content,
      },
    });

    await txConversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    return message;
  });

  return res.status(201).json({ item });
}
