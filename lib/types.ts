import type {
  Customer as PrismaCustomer,
  Message as PrismaMessage,
  Sentiment,
  Ticket as PrismaTicket,
  TicketPriority,
  TicketStatus,
} from "@prisma/client";

export type Customer = PrismaCustomer;
export type Message = PrismaMessage;
export type Ticket = PrismaTicket;

export type { Sentiment, TicketPriority, TicketStatus };

