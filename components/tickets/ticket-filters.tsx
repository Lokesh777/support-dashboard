"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Search } from "lucide-react";

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

  const [isPending, startTransition] = useTransition();

  const [search, setSearch] = useState(
    searchParams.get("search") ?? ""
  );

  // Keep input synced with URL
  useEffect(() => {
    setSearch(searchParams.get("search") ?? "");
  }, [searchParams]);

  function updateFilter(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());

    if (!value || value === "all") {
      params.delete(key);
    } else {
      params.set(key, value);
    }

    // Don't navigate if nothing changed
    if (params.toString() === searchParams.toString()) {
      return;
    }

    startTransition(() => {
      router.push(`/tickets?${params.toString()}`);
    });
  }

  // Debounced search
  useEffect(() => {
    const timeout = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());

      if (search.trim()) {
        params.set("search", search.trim());
      } else {
        params.delete("search");
      }

      if (params.toString() === searchParams.toString()) {
        return;
      }

      router.replace(`/tickets?${params.toString()}`);
    }, 350);

    return () => clearTimeout(timeout);
  }, [search]);

  return (
    <>
      <span
        className="sr-only"
        aria-live="polite"
        aria-atomic="true"
      >
        {isPending
          ? "Updating ticket filters."
          : "Ticket filters updated."}
      </span>

      <div
        role="search"
        aria-label="Ticket filters"
        className="flex flex-col gap-3 md:flex-row md:items-center"
      >
        <div className="relative min-w-0 md:w-80">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-2.5 top-3 size-4 text-muted-foreground"
          />

          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by subject, customer, email or category..."
            aria-label="Search tickets"
            className="pl-8"
          />
        </div>

        <Select
          disabled={isPending}
          value={searchParams.get("status") ?? "all"}
          onValueChange={(value) => updateFilter("status", value)}
        >
          <SelectTrigger
            aria-label="Filter tickets by status"
            className="w-full md:w-36"
          >
            <SelectValue placeholder="Status" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>

            {statuses.map((status) => (
              <SelectItem
                key={status}
                value={status}
              >
                {status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          disabled={isPending}
          value={searchParams.get("priority") ?? "all"}
          onValueChange={(value) => updateFilter("priority", value)}
        >
          <SelectTrigger
            aria-label="Filter tickets by priority"
            className="w-full md:w-36"
          >
            <SelectValue placeholder="Priority" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="all">All Priority</SelectItem>

            {priorities.map((priority) => (
              <SelectItem
                key={priority}
                value={priority}
              >
                {priority}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          disabled={isPending}
          value={searchParams.get("sort") ?? "updated-desc"}
          onValueChange={(value) => updateFilter("sort", value)}
        >
          <SelectTrigger
            aria-label="Sort tickets"
            className="w-full md:w-44"
          >
            <SelectValue placeholder="Sort" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="updated-desc">
              Newest Update
            </SelectItem>

            <SelectItem value="created-desc">
              Newest Created
            </SelectItem>

            <SelectItem value="priority-desc">
              Highest Priority
            </SelectItem>

            <SelectItem value="status-asc">
              Status (A-Z)
            </SelectItem>
          </SelectContent>
        </Select>

        {isPending && (
          <div
            className="flex items-center gap-2 text-sm text-muted-foreground"
            aria-hidden="true"
          >
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Updating...</span>
          </div>
        )}
      </div>
    </>
  );
}