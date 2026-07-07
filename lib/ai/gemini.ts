import { GoogleGenerativeAI } from "@google/generative-ai";
import type { AIProvider, ConversationMessage } from "./provider";

const MODEL_NAME = "gemini-2.5-flash";
const TIMEOUT_MS = 8000;

export const SUMMARY_PROMPT =
  "Summarize this customer support conversation in 2-3 concise sentences.";

export const REPLY_PROMPT = `
You are a customer support agent for ReeRoute.

Read the conversation below.

Write ONLY the next reply the support agent should send.

Requirements:
- friendly
- empathetic
- professional
- mention the customer's issue
- don't repeat previous replies
- don't explain your reasoning
`;

export const SENTIMENT_PROMPT =
  "Analyze the customer's sentiment. Respond with only one word: POSITIVE, NEUTRAL, or NEGATIVE.";

const FALLBACK_SUMMARY = "Unable to summarize this conversation right now.";
const FALLBACK_REPLY = "Unable to suggest a reply right now.";
const FALLBACK_SENTIMENT = "Unable to analyze sentiment right now.";

function formatMessages(messages: ConversationMessage[]): string {
  return messages
    .map((message) => `${message.sender}: ${message.content}`)
    .join("\n");
}

async function withTimeout<T>(callback: (signal: AbortSignal) => Promise<T>) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    return await callback(controller.signal);
  } finally {
    clearTimeout(timeout);
  }
}

class GeminiProvider implements AIProvider {
  private async generate(prompt: string, messages: ConversationMessage[]) {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not configured.");
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });
    const content = `${prompt}\n\nConversation:\n${formatMessages(messages)}`;

    const result = await withTimeout((signal) =>
      model.generateContent(content, { signal }),
    );

    return result.response.text().trim();
  }

  async summarizeConversation(messages: ConversationMessage[]) {
    try {
      return await this.generate(SUMMARY_PROMPT, messages);
    } catch (error) {
        console.error("Gemini Error:", error);
      return FALLBACK_SUMMARY;
    }
  }

  async suggestReply(messages: ConversationMessage[]) {
    try {
      return await this.generate(REPLY_PROMPT, messages);
    } catch(error) {
      console.error("Gemini Reply Error:", error);
      return FALLBACK_REPLY;
    }
  }

  async analyzeSentiment(messages: ConversationMessage[]) {
    try {
      return await this.generate(SENTIMENT_PROMPT, messages);
    } catch {
      return FALLBACK_SENTIMENT;
    }
  }
}

export const geminiProvider: AIProvider = new GeminiProvider();

