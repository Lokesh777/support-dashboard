export type ConversationMessage = {
  sender: string;
  content: string;
};

export interface AIProvider {
  summarizeConversation(messages: ConversationMessage[]): Promise<string>;
  suggestReply(messages: ConversationMessage[]): Promise<string>;
  analyzeSentiment(messages: ConversationMessage[]): Promise<string>;
}

