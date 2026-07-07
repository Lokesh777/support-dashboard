# Architecture Notes

## System Architecture

A single Next.js 14 (App Router) application handles both frontend and backend, avoiding a separate backend service for a project of this scope:

```
Browser (React Server + Client Components)
        |
        v
Next.js App Router
  ├── Pages (Server Components: /tickets, /tickets/[id])
  ├── API Routes (/api/ai/summarize, /api/ai/suggest-reply, /api/ai/sentiment)
  |         |
  |         v
  |     lib/ai/index.ts  →  lib/ai/gemini.ts  →  Google Gemini API
  |         (single import point — swappable provider)
  |
  └── lib/db/tickets.ts  →  Prisma Client  →  SQLite (dev.db)
```

Key structural decision: **API routes stay thin**. Each route validates its input with Zod, calls a single function from `lib/db` or `lib/ai`, and returns the result. No Prisma calls or Gemini calls live inside route handlers directly — this keeps routes easy to read and keeps business logic testable independent of HTTP.

## Database Design

Five models, normalized around a ticket-centric structure:

- `Customer` — 1-to-many with `Ticket`
- `Ticket` — the central entity; holds status, priority, category, and a cached `sentiment` field
- `Message` — 1-to-many with `Ticket`, ordered by `createdAt`, distinguishes `CUSTOMER` vs `AGENT` sender
- `InternalNote` — agent-only annotations, separate from the customer-visible `Message` thread
- `ActivityLog` — an append-only audit trail of actions taken on a ticket (status changes, notes added)

Sentiment is stored on the `Ticket` row itself rather than recomputed on every page load — it's set once by the `/api/ai/sentiment` route and only refreshed on demand, trading a small amount of staleness for avoiding redundant AI calls.

## AI Architecture

AI logic is isolated behind an interface (`lib/ai/provider.ts`) with a single active implementation (`lib/ai/gemini.ts`), exported through one file (`lib/ai/index.ts`) that the rest of the app imports from. This means:

- Switching from Gemini to another provider (Claude, OpenAI) requires writing one new file and changing one import — no changes to routes, pages, or components.
- Prompts are kept as named constants rather than inline strings, so they can be tuned without touching call sites.
- Every AI call is wrapped in try/catch with a fallback message and a request timeout, so a slow or failed AI call degrades gracefully instead of breaking the page.

Three AI capabilities are exposed: `summarizeConversation`, `suggestReply`, and `analyzeSentiment` — each takes the same shape of input (an array of `{sender, content}` messages), keeping the interface consistent regardless of what's underneath it.

## Scalability Considerations

This build optimizes for correctness and clarity within a short timeline, not for scale — but the seams for scaling are deliberately in place:

- **Database**: SQLite is a single-file, single-writer database — fine for a demo, but the Prisma schema and query layer are provider-agnostic enough to switch the `datasource` to Postgres (e.g., via Neon/Supabase) with a config change, not a rewrite.
- **AI calls**: currently synchronous, request-blocking calls. At higher volume, summarization/sentiment could move to a background job queue (e.g., triggered on ticket creation) so agents aren't waiting on API latency, with results cached until the underlying conversation changes.
- **Rate limits**: Gemini's free tier has per-minute/per-day caps; a production version would need request queuing or a paid tier plus retry/backoff handling.
- **Read-heavy ticket list**: as ticket volume grows, the list query would need pagination and indexed columns (status, priority, createdAt) rather than fetching all tickets client-side.
