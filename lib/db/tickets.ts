import { PrismaClient } from "@prisma/client";
import type {
  Prisma,
  Sentiment,
  TicketPriority,
  TicketStatus,
} from "@prisma/client";

type ListTicketsFilters = {
  search?: string;
  status?: TicketStatus;
  priority?: TicketPriority;
};

const globalForPrisma = globalThis as typeof globalThis & {
  reeRoutePrisma?: PrismaClient;
};

const prisma = globalForPrisma.reeRoutePrisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.reeRoutePrisma = prisma;
}

const ticketInclude = {
  customer: true,
  messages: {
    orderBy: {
      createdAt: "asc",
    },
  },
  internalNotes: {
    orderBy: {
      createdAt: "desc",
    },
  },
  activityLogs: {
    orderBy: {
      createdAt: "desc",
    },
  },
} satisfies Prisma.TicketInclude;

export async function getTicketById(id: number) {
  return prisma.ticket.findUnique({
    where: { id },
    include: ticketInclude,
  });
}

export async function listTickets({
  search,
  status,
  priority,
}: ListTicketsFilters = {}) {
  const where: Prisma.TicketWhereInput = {
    ...(status ? { status } : {}),
    ...(priority ? { priority } : {}),
    ...(search
      ? {
          OR: [
            {
              subject: {
                contains: search,
                mode: "insensitive",
              },
            },
            {
              category: {
                contains: search,
                mode: "insensitive",
              },
            },
            {
              customer: {
                name: {
                  contains: search,
                  mode: "insensitive",
                },
              },
            },
            {
              customer: {
                email: {
                  contains: search,
                  mode: "insensitive",
                },
              },
            },
          ],
        }
      : {}),
  };

  return prisma.ticket.findMany({
    where,
    include: {
      customer: true,
      messages: {
        orderBy: {
          createdAt: "desc",
        },
        take: 1,
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
  });
}

export async function updateTicketStatus(id: number, status: TicketStatus) {
  return prisma.ticket.update({
    where: { id },
    data: { status },
  });
}

export async function updateSentiment(id: number, sentiment: Sentiment) {
  return prisma.ticket.update({
    where: { id },
    data: { sentiment },
  });
}

export async function addInternalNote(
  ticketId: number,
  author: string,
  content: string,
) {
  return prisma.internalNote.create({
    data: {
      ticketId,
      author,
      content,
    },
  });
}

export async function addActivityLog(ticketId: number, action: string) {
  return prisma.activityLog.create({
    data: {
      ticketId,
      action,
    },
  });
}
