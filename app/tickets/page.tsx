import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  PriorityBadge,
  SentimentBadge,
  StatusBadge,
} from "@/components/tickets/ticket-badges";
import { TicketFilters } from "@/components/tickets/ticket-filters";
import { listTickets } from "@/lib/db/tickets";
import type { TicketPriority, TicketStatus } from "@prisma/client";

type TicketsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const priorityRank: Record<TicketPriority, number> = {
  LOW: 1,
  MEDIUM: 2,
  HIGH: 3,
  URGENT: 4,
};

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function isTicketStatus(value: string | undefined): value is TicketStatus {
  return value === "OPEN" || value === "PENDING" || value === "RESOLVED" || value === "CLOSED";
}

function isTicketPriority(value: string | undefined): value is TicketPriority {
  return value === "LOW" || value === "MEDIUM" || value === "HIGH" || value === "URGENT";
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export default async function TicketsPage({ searchParams }: TicketsPageProps) {
  const params = await searchParams;
  const search = firstParam(params.search);
  const status = firstParam(params.status);
  const priority = firstParam(params.priority);
  const sort = firstParam(params.sort) ?? "updated-desc";
  const tickets = await listTickets({
    search,
    status: isTicketStatus(status) ? status : undefined,
    priority: isTicketPriority(priority) ? priority : undefined,
  });

  const sortedTickets = [...tickets].sort((a, b) => {
    if (sort === "created-desc") {
      return b.createdAt.getTime() - a.createdAt.getTime();
    }

    if (sort === "priority-desc") {
      return priorityRank[b.priority] - priorityRank[a.priority];
    }

    if (sort === "status-asc") {
      return a.status.localeCompare(b.status);
    }

    return b.updatedAt.getTime() - a.updatedAt.getTime();
  });

  return (
    <main className="min-h-screen bg-muted/30 px-4 py-6 md:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-5">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Tickets</h1>
          <p className="text-sm text-muted-foreground">
            Monitor ReeRoute support conversations and queue health.
          </p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Support Queue</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <TicketFilters />
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subject</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Sentiment</TableHead>
                  <TableHead className="text-right">Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedTickets.map((ticket) => (
                  <TableRow key={ticket.id}>
                    <TableCell className="max-w-80 whitespace-normal">
                      <Link
                        href={`/tickets/${ticket.id}`}
                        className="font-medium hover:underline"
                      >
                        {ticket.subject}
                      </Link>
                    </TableCell>
                    <TableCell>{ticket.customer.name}</TableCell>
                    <TableCell>
                      <StatusBadge status={ticket.status} />
                    </TableCell>
                    <TableCell>
                      <PriorityBadge priority={ticket.priority} />
                    </TableCell>
                    <TableCell>{ticket.category}</TableCell>
                    <TableCell>
                      <SentimentBadge sentiment={ticket.sentiment} />
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {formatDate(ticket.updatedAt)}
                    </TableCell>
                  </TableRow>
                ))}
                {sortedTickets.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="h-28 text-center text-muted-foreground"
                    >
                      No tickets match these filters.
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

