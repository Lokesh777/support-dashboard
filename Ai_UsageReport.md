# AI Usage Report

## Tools Used

- **Claude (Anthropic)** — used for planning: deciding the tech stack, scoping which AI features to build given a 1-2 day timeline, structuring the codebase for a swappable AI provider, and breaking a large implementation prompt into smaller, verifiable phases.
- **Codex** — used for code generation: schema design, seed data, database helper functions, the AI abstraction layer, API routes, and UI pages, executed phase by phase.
- **Google Gemini API (gemini-2.5-flash)** — the AI model powering the in-app features (summarization, suggested replies, sentiment analysis), chosen for its no-cost, no-expiry free tier, which was important given assignment constraints.

## How They Were Used

The workflow had two layers: **planning with Claude**, then **execution with Codex**.

Claude was used first to think through the product before writing any code — what to build given the time available, what to explicitly leave out, and how to structure the AI logic so the underlying model/provider could change later without touching the rest of the app (`lib/ai/provider.ts` interface + `lib/ai/gemini.ts` implementation + `lib/ai/index.ts` single export point).

Rather than handing Codex one large prompt covering the entire app, the build was split into 6 sequential phases — schema, seed data, database layer, AI abstraction layer, API routes, then pages/UI — each verified before moving to the next. This was a deliberate decision: a single massive prompt risks the AI silently skipping requirements or producing shallow implementations of some parts, especially on tools with tighter output limits. Smaller phases meant any gap was caught immediately, not after the whole app was "done."

## Example Prompts That Were Effective

Phase-scoped prompts worked best — narrow scope, explicit "only output X, nothing else" constraint. Example (Phase 1, schema only):

> "Create a Prisma schema (schema.prisma) for a customer support dashboard using SQLite. Models needed: Customer (...), Ticket (...with enums for status/priority/sentiment...), Message, InternalNote, ActivityLog. Only output the schema.prisma file content. Don't generate anything else yet."

This produced a complete, correctly-related schema in one pass with no follow-up fixes needed.

Another effective pattern was stating an **architectural constraint up front** rather than asking for it after the fact, e.g., for the AI layer:

> "Keep all AI logic isolated behind a single abstraction so the provider or model can be swapped later without touching any page or API route... All API routes must import ONLY from lib/ai/index.ts, never directly from the provider implementation."

This produced genuinely swappable code rather than AI calls scattered across routes, which would have been much harder to untangle after the fact.

## Where AI Helped Significantly

- **Seed data generation** — writing 25 realistic, varied support tickets by hand would have taken far longer than reviewing AI-generated ones for realism.
- **Boilerplate CRUD and Prisma query functions** — repetitive, low-risk code where AI output needed only light review.
- **Initial page scaffolding with shadcn/ui** — component wiring is mechanical and AI handled it correctly with clear instructions.

## Where AI Produced Poor Results

- When given the full, unscoped prompt in one shot (before splitting into 6 phases), earlier drafts of this plan risked shallow or partially-skipped sections — this is why the phased approach was adopted instead of trusting a single large generation.
- Prisma client provider defaulted to a newer experimental client format in one generation; this was caught during review and reverted to the stable `prisma-client-js` provider, since docs and tooling support for it are far more mature.
- AI suggestions for "extra" features (escalation, similar-ticket discovery) tended to over-scope relative to the time available — these were consciously descoped rather than implemented at low quality just to check a box.

## Decisions That Remained Human-Driven

- Which AI features to build vs. explicitly exclude, given the timeline (documented in Product Decisions).
- The decision to make all AI output editable and never auto-sent — a product/trust decision, not a technical one.
- Choice of Gemini over Claude/OpenAI for the in-app AI provider, based on free-tier availability and reliability needs for a graded assignment.
- The 6-phase breakdown strategy itself, and reviewing/verifying each phase's output before proceeding to the next.
- Final review of all generated code for correctness, security (e.g., input validation on API routes), and consistency with the intended architecture.
