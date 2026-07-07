"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  addActivityLog,
  addInternalNote,
  updateTicketStatus,
} from "@/lib/db/tickets";

const statusSchema = z.enum(["OPEN", "PENDING", "RESOLVED", "CLOSED"]);

export async function updateTicketStatusAction(
  ticketId: number,
  status: string,
) {
  const parsed = statusSchema.safeParse(status);

  if (!parsed.success) {
    throw new Error("Invalid ticket status.");
  }

  await updateTicketStatus(ticketId, parsed.data);
  await addActivityLog(ticketId, `Status changed to ${parsed.data}`);
  revalidatePath(`/tickets/${ticketId}`);
  revalidatePath("/tickets");
}

export async function addInternalNoteAction(formData: FormData) {
  const ticketId = Number(formData.get("ticketId"));
  const author = String(formData.get("author") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();

  if (!Number.isInteger(ticketId) || ticketId <= 0 || !author || !content) {
    throw new Error("Invalid internal note.");
  }

  await addInternalNote(ticketId, author, content);
  await addActivityLog(ticketId, `Internal note added by ${author}`);
  revalidatePath(`/tickets/${ticketId}`);
}

