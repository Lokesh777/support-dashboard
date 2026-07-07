"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const statuses = ["OPEN", "PENDING", "RESOLVED", "CLOSED"] as const;
const priorities = ["LOW", "MEDIUM", "HIGH", "URGENT"] as const;

export function TicketFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

function updateParam(key: string, value: string | null) {
   const params = new URLSearchParams(searchParams.toString());

    if (!value || value === "all") {
      params.delete(key);
    } else {
      params.set(key, value);
    }

    router.push(`/tickets?${params.toString()}`);
  }

  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center">
      <div className="relative min-w-0 md:w-80">
        <Search className="pointer-events-none absolute left-2.5 top-2 size-4 text-muted-foreground" />
        <Input
          defaultValue={searchParams.get("search") ?? ""}
          className="pl-8"
          placeholder="Search tickets"
          onChange={(event) => updateParam("search", event.target.value)}
        />
      </div>
      <Select
        value={searchParams.get("status") ?? "all"}
        onValueChange={(value) => updateParam("status", value)}
      >
        <SelectTrigger className="w-full md:w-36">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All status</SelectItem>
          {statuses.map((status) => (
            <SelectItem key={status} value={status}>
              {status}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={searchParams.get("priority") ?? "all"}
        onValueChange={(value) => updateParam("priority", value)}
      >
        <SelectTrigger className="w-full md:w-36">
          <SelectValue placeholder="Priority" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All priority</SelectItem>
          {priorities.map((priority) => (
            <SelectItem key={priority} value={priority}>
              {priority}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={searchParams.get("sort") ?? "updated-desc"}
        onValueChange={(value) => updateParam("sort", value)}
      >
        <SelectTrigger className="w-full md:w-44">
          <SelectValue placeholder="Sort" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="updated-desc">Newest update</SelectItem>
          <SelectItem value="created-desc">Newest created</SelectItem>
          <SelectItem value="priority-desc">Highest priority</SelectItem>
          <SelectItem value="status-asc">Status</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

