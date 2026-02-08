import api from "@/lib/api/http";

export interface ChatHistoryItem {
  role: "user" | "bot";
  message: string;
}

export async function sendMessage(
  message: string,
  conversationHistory: ChatHistoryItem[] = [],
  topK = 5
) {
  const { data } = await api.post("/chatbot", {
    user_message: message,
    conversation_history: conversationHistory,
    top_k: topK
  });
  return data;
}
