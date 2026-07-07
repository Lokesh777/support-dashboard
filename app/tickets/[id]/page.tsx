import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, Mail, UserRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  PriorityBadge,
  StatusBadge,
} from "@/components/tickets/ticket-badges";
import { StatusSelect } from "@/components/tickets/status-select";
import { TicketAiPanel } from "@/components/tickets/ticket-ai-panel";
import { getTicketById } from "@/lib/db/tickets";
import { addInternalNoteAction } from "./actions";

type TicketDetailPageProps = {
  params: Promise<{ id: string }>;
};

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export default async function TicketDetailPage({
  params,
}: TicketDetailPageProps) {
  const { id } = await params;
  const ticketId = Number(id);

  if (!Number.isInteger(ticketId) || ticketId <= 0) {
    notFound();
  }

  const ticket = await getTicketById(ticketId);

  if (!ticket) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-muted/30 px-4 py-6 md:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div className="space-y-2">
            <Button variant="ghost" size="sm" render={<Link href="/tickets" />}>
              <ArrowLeft className="size-4" />
              Tickets
            </Button>
            <div>
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <StatusBadge status={ticket.status} />
                <PriorityBadge priority={ticket.priority} />
                <Badge variant="outline">{ticket.category}</Badge>
              </div>
              <h1 className="text-2xl font-semibold tracking-tight">
                {ticket.subject}
              </h1>
              <p className="text-sm text-muted-foreground">
                Created {formatDate(ticket.createdAt)} · Updated{" "}
                {formatDate(ticket.updatedAt)}
              </p>
            </div>
          </div>
          <div className="w-full md:w-56">
            <StatusSelect ticketId={ticket.id} status={ticket.status} />
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="flex flex-col gap-5">
            <Card>
              <CardHeader>
                <CardTitle>Conversation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {ticket.messages.map((message) => {
                  const isCustomer = message.sender === "CUSTOMER";

                  return (
                    <div
                      key={message.id}
                      className={`flex ${isCustomer ? "justify-start" : "justify-end"}`}
                    >
                      <div
                        className={`max-w-[82%] rounded-lg px-3 py-2 text-sm ${
                          isCustomer
                            ? "bg-background ring-1 ring-border"
                            : "bg-primary text-primary-foreground"
                        }`}
                      >
                        <div className="mb-1 flex items-center gap-2 text-xs opacity-75">
                          <span>{message.sender}</span>
                          <span>{formatDate(message.createdAt)}</span>
                        </div>
                        <p className="whitespace-pre-wrap leading-6">
                          {message.content}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Internal Notes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <form action={addInternalNoteAction} className="space-y-3">
                  <input type="hidden" name="ticketId" value={ticket.id} />
                  <input type="hidden" name="author" value="Agent" />
                  <Textarea
                    name="content"
                    placeholder="Add an internal note..."
                    className="min-h-24"
                    required
                  />
                  <Button type="submit" size="sm">
                    Add Note
                  </Button>
                </form>
                <div className="space-y-3">
                  {ticket.internalNotes.map((note) => (
                    <div key={note.id} className="rounded-lg border p-3">
                      <div className="mb-1 flex items-center justify-between gap-3 text-xs text-muted-foreground">
                        <span>{note.author}</span>
                        <span>{formatDate(note.createdAt)}</span>
                      </div>
                      <p className="text-sm leading-6">{note.content}</p>
                    </div>
                  ))}
                  {ticket.internalNotes.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No internal notes yet.
                    </p>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          </div>

          <aside className="flex flex-col gap-5">
            <Card>
              <CardHeader>
                <CardTitle>Customer</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <UserRound className="size-4 text-muted-foreground" />
                  <span>{ticket.customer.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="size-4 text-muted-foreground" />
                  <span className="min-w-0 break-all">{ticket.customer.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="size-4 text-muted-foreground" />
                  <span>Customer since {formatDate(ticket.customer.createdAt)}</span>
                </div>
              </CardContent>
            </Card>

            <TicketAiPanel
              ticketId={ticket.id}
              initialSentiment={ticket.sentiment}
            />

            <Card>
              <CardHeader>
                <CardTitle>Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {ticket.activityLogs.map((activity) => (
                    <div key={activity.id} className="relative pl-5">
                      <span className="absolute left-0 top-1.5 size-2 rounded-full bg-primary" />
                      <p className="text-sm">{activity.action}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(activity.createdAt)}
                      </p>
                    </div>
                  ))}
                  {ticket.activityLogs.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No activity recorded.
                    </p>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </main>
  );
}

