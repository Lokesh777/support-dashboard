import { z } from "zod";
import { aiProvider } from "@/lib/ai/index";
import { getTicketById } from "@/lib/db/tickets";

const requestSchema = z.object({
  ticketId: z.number().int().positive(),
});

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = requestSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const ticket = await getTicketById(parsed.data.ticketId);

  if (!ticket) {
    return Response.json({ error: "Ticket not found." }, { status: 404 });
  }

  const suggestedReply = await aiProvider.suggestReply(
    ticket.messages.map(({ sender, content }) => ({ sender, content })),
  );

  return Response.json({ suggestedReply });
}
