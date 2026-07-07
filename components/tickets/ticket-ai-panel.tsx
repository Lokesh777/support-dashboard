"use client";

import { useEffect, useMemo, useState } from "react";
import { Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { SentimentBadge } from "@/components/tickets/ticket-badges";
import type { Sentiment } from "@prisma/client";

type AiResponse<T extends string> = Record<T, string>;

async function postTicketAi<T extends string>(path: string, ticketId: number) {
  const response = await fetch(path, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ticketId }),
  });

  if (!response.ok) {
    throw new Error("AI request failed.");
  }

  return (await response.json()) as AiResponse<T>;
}

export function TicketAiPanel({
  ticketId,
  initialSentiment,
}: {
  ticketId: number;
  initialSentiment: Sentiment | null;
}) {
  const sentimentCacheKey = useMemo(
    () => `ticket:${ticketId}:sentiment`,
    [ticketId],
  );
  const [summary, setSummary] = useState("");
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [reply, setReply] = useState("");
  const [replyLoading, setReplyLoading] = useState(false);
  const [sentiment, setSentiment] = useState<Sentiment | null>(
    initialSentiment,
  );

  useEffect(() => {
    let cancelled = false;

    async function loadSummary() {
      try {
        const result = await postTicketAi<"summary">(
          "/api/ai/summarize",
          ticketId,
        );

        if (!cancelled) {
          setSummary(result.summary);
        }
      } catch {
        if (!cancelled) {
          setSummary("Unable to load AI summary.");
        }
      } finally {
        if (!cancelled) {
          setSummaryLoading(false);
        }
      }
    }

    void loadSummary();

    return () => {
      cancelled = true;
    };
  }, [ticketId]);

  useEffect(() => {
    if (initialSentiment) {
      sessionStorage.setItem(sentimentCacheKey, initialSentiment);
      return;
    }

    const cached = sessionStorage.getItem(sentimentCacheKey) as Sentiment | null;

    if (cached) {
      setSentiment(cached);
      return;
    }

    let cancelled = false;

    async function loadSentiment() {
      try {
        const result = await postTicketAi<"sentiment">(
          "/api/ai/sentiment",
          ticketId,
        );
        const nextSentiment = result.sentiment as Sentiment;

        if (!cancelled) {
          sessionStorage.setItem(sentimentCacheKey, nextSentiment);
          setSentiment(nextSentiment);
        }
      } catch {
        if (!cancelled) {
          setSentiment(null);
        }
      }
    }

    void loadSentiment();

    return () => {
      cancelled = true;
    };
  }, [initialSentiment, sentimentCacheKey, ticketId]);

  async function suggestReply() {
    setReplyLoading(true);

    try {
      const result = await postTicketAi<"suggestedReply">(
        "/api/ai/suggest-reply",
        ticketId,
      );
      setReply(result.suggestedReply);
    } catch {
      setReply("Unable to load a suggested reply.");
    } finally {
      setReplyLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader className="gap-2">
          <div className="flex items-center justify-between gap-3">
            <CardTitle>AI Summary</CardTitle>
            <Badge variant="outline" className="gap-1">
              <Sparkles className="size-3" />
              AI-generated
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {summaryLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm leading-6">{summary}</p>
              <p className="text-xs text-muted-foreground">
                AI-generated — please review
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <CardTitle>Suggested Reply</CardTitle>
            <Button
              size="sm"
              variant="outline"
              onClick={suggestReply}
              disabled={replyLoading}
            >
              {replyLoading ? "Generating" : "Suggest Reply"}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <Textarea
            value={reply}
            onChange={(event) => setReply(event.target.value)}
            placeholder="Generate or write a reply..."
            className="min-h-32"
          />
          {reply ? (
            <p className="text-xs text-muted-foreground">
              AI-generated — please review
            </p>
          ) : null}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between rounded-lg border bg-card px-3 py-2">
        <span className="text-sm font-medium">Sentiment</span>
        <SentimentBadge sentiment={sentiment} />
      </div>
    </div>
  );
}

