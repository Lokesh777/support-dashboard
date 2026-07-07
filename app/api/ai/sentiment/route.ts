import { z } from "zod";
import { aiProvider } from "@/lib/ai/index";
import { getTicketById, updateSentiment } from "@/lib/db/tickets";

const requestSchema = z.object({
  ticketId: z.number().int().positive(),
});

const sentimentSchema = z.enum(["POSITIVE", "NEUTRAL", "NEGATIVE"]);

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

  const aiSentiment = await aiProvider.analyzeSentiment(
    ticket.messages.map(({ sender, content }) => ({ sender, content })),
  );
  const sentiment = sentimentSchema.safeParse(aiSentiment.trim().toUpperCase());

  if (!sentiment.success) {
    return Response.json(
      { error: "Unable to analyze sentiment." },
      { status: 502 },
    );
  }

  await updateSentiment(ticket.id, sentiment.data);

  return Response.json({ sentiment: sentiment.data });
}
