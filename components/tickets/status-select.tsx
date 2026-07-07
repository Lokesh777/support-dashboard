"use client";

import { useState, useTransition } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateTicketStatusAction } from "@/app/tickets/[id]/actions";
import type { TicketStatus } from "@prisma/client";

const statuses = ["OPEN", "PENDING", "RESOLVED", "CLOSED"] as const;

export function StatusSelect({
  ticketId,
  status,
}: {
  ticketId: number;
  status: TicketStatus;
}) {
  const [value, setValue] = useState<TicketStatus>(status);
  const [isPending, startTransition] = useTransition();

  return (
    <Select
      value={value}
      onValueChange={(nextStatus) => {
        const typedStatus = nextStatus as TicketStatus;
        setValue(typedStatus);
        startTransition(() => {
          void updateTicketStatusAction(ticketId, typedStatus);
        });
      }}
      disabled={isPending}
    >
      <SelectTrigger className="w-full">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {statuses.map((option) => (
          <SelectItem key={option} value={option}>
            {option}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

