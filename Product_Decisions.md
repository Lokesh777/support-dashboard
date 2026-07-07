# Product Decisions Document

## Features Implemented

**Ticket Management**
- Ticket list with search (subject/customer), status filter, priority filter, and sorting
- Ticket detail view with full conversation thread, customer info sidebar, and status updates
- Internal notes (agent-only, not visible to customer)
- Activity log timeline (status changes, notes added, etc.)

**AI Assistance**
- **Ticket Summarization** — a 2-3 sentence AI summary shown at the top of every ticket, so an agent can understand context in seconds instead of reading the full thread.
- **Suggested Replies** — AI drafts a reply based on conversation history, which the agent can edit before sending. This was prioritized because it directly reduces response time without removing agent control over what's actually sent.
- **Sentiment Analysis** — computed once per ticket and cached in the database, shown as a badge in both the list and detail view, so agents can spot frustrated customers before opening the ticket.

## Features Intentionally Excluded

- **Escalation recommendations** and **similar ticket discovery** were scoped out given the assignment timeline. Both require either a scoring/ranking model or embeddings + vector search, which adds real engineering surface area without proportionally improving the core workflow shown in this submission. I prioritized depth on summarization and suggested replies over breadth across all six AI examples listed in the brief.
- **Authentication, permissions, settings** — explicitly out of scope per the assignment brief. A single logged-in agent is assumed.

## Product Tradeoffs

- **SQLite over Postgres** for local development — faster to set up and iterate on for a timeboxed assignment. Documented in Architecture Notes as the first thing to swap for a production deployment.
- **AI output is always editable, never auto-sent** — suggested replies and summaries are treated as a first draft, not a final answer. This was a deliberate choice: the assignment asks "how should agents interact with AI-generated responses," and the answer here is "AI assists, agent decides."
- **Sentiment is cached, not recomputed on every view** — avoids redundant AI calls and keeps the UI fast, at the cost of the badge going stale if a lot of new messages come in without a manual refresh.
- **A visible "AI-generated — please review" label** is shown next to every AI output. This was a direct response to the assignment's question about communicating AI confidence — rather than a numeric confidence score (which can be misleading if not well-calibrated), a simple review prompt sets the right expectation for agents.

## Future Improvements (Priority Order)

1. **Similar ticket discovery** — embeddings-based search over past tickets, surfaced on the detail page, so agents can see how similar issues were resolved before.
2. **Escalation recommendation** — a rule-based first pass (e.g., sentiment=NEGATIVE + priority=URGENT + no reply in X hours) before investing in a model-based approach.
3. **Postgres + connection pooling** for production readiness.
4. **Streaming AI responses** instead of waiting for the full summary/reply before rendering.
5. **Feedback loop on suggested replies** (accepted as-is / edited / rejected) to eventually fine-tune prompts based on real agent behavior.
