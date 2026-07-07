import { Badge } from "@/components/ui/badge";
import type {
  Sentiment,
  TicketPriority,
  TicketStatus,
} from "@prisma/client";

export function StatusBadge({ status }: { status: TicketStatus }) {
  const variant = status === "OPEN" ? "default" : "secondary";

  return <Badge variant={variant}>{status}</Badge>;
}

export function PriorityBadge({ priority }: { priority: TicketPriority }) {
  const variant =
    priority === "URGENT" || priority === "HIGH" ? "destructive" : "outline";

  return <Badge variant={variant}>{priority}</Badge>;
}

export function SentimentBadge({
  sentiment,
}: {
  sentiment: Sentiment | null | undefined;
}) {
  if (!sentiment) {
    return <Badge variant="outline">UNKNOWN</Badge>;
  }

  const variant = sentiment === "NEGATIVE" ? "destructive" : "secondary";

  return <Badge variant={variant}>{sentiment}</Badge>;
}

