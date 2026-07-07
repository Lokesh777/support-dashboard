# Planning Conversation — Claude (Project Setup & Prompt Design)

This document captures the planning conversation with Claude before implementation began, covering requirement analysis, tech stack selection, and the design of phased prompts later used with Codex.

---

**Me:** I have this assignment — build an AI-powered Customer Support Dashboard (Next.js/React frontend, any backend, any database, with meaningful AI workflows like summarization, suggested replies, sentiment analysis). I need a plan from repo setup to deployment, and help thinking through the product decisions.

**Claude:** Since your background is React/Next.js, use **Next.js full-stack** — App Router for both frontend and API routes, so there's no separate backend framework to learn. Recommended stack:
- **Frontend + Backend**: Next.js 14 (App Router)
- **Database**: SQLite + Prisma ORM for local development (fast to set up), can move to Postgres for deployment
- **UI**: shadcn/ui + Tailwind
- **AI**: an LLM API for summarization, suggested replies, sentiment
- **Deployment**: Vercel

Given the assignment explicitly says "make reasonable decisions where requirements are ambiguous," I'd focus on Ticket Summarization and Suggested Replies as the core AI features (they're the most directly useful to an agent's workflow), and add Sentiment Analysis as a lightweight extra — rather than trying to build all six AI examples shallowly.

**Me:** For AI, I need a free option. I don't want to use Anthropic if it needs billing. What about Gemini, OpenAI, Groq, OpenRouter?

**Claude:** For this use case, **Google Gemini (gemini-2.5-flash)** is the best fit — it has a genuinely free tier (no credit card, no expiry) with generous rate limits (well above what a demo/assignment needs), unlike Anthropic's API which only gives a one-time trial credit. To make switching providers easy later, keep all AI logic behind a single abstraction (an `AIProvider` interface with one active implementation), so changing providers is a one-file change, not a rewrite.

**Me:** How do I structure the Codex prompts so nothing gets skipped and the code stays optimized?

**Claude:** Break the build into small, sequential, verifiable phases rather than one large prompt — a single large prompt risks the AI silently skipping requirements or producing shallow code. Six phases, each verified before moving to the next:

1. **Prisma schema only** — Customer, Ticket, Message, InternalNote, ActivityLog models with enums for status/priority/sentiment.
2. **Seed script** — 25 realistic tickets for a logistics company, varied status/priority/category.
3. **Database layer** (`lib/db/tickets.ts`) — typed, reusable query functions, no inline Prisma calls in routes.
4. **AI abstraction layer** (`lib/ai/provider.ts`, `lib/ai/gemini.ts`, `lib/ai/index.ts`) — interface + single Gemini implementation + single export point, so routes only ever import from `lib/ai/index.ts`.
5. **API routes** — thin handlers: validate input with Zod → call `lib/db` or `lib/ai` → return response.
6. **Pages/UI** — ticket list and detail views using shadcn/ui, Server Components for data fetching, Client Components only where interactive.

Each phase prompt explicitly says "only output X, don't generate anything else yet" to keep scope tight, and each output is verified (migration runs, seed data looks realistic, routes respond correctly) before the next phase is prompted.

---

*The six phase prompts generated from this discussion were used directly with Codex to implement the application. See `AI_USAGE_REPORT.md` for how those prompts performed and where manual review/correction was needed.*
