import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import LottieWrapper from "@/components/common/LottieWrapper";
import chatbotAnimation from "@/public/animations/chatbot.json";
import { sendMessage } from "@/lib/api/chatbotApi";
import { getProjects } from "@/lib/api/projectsApi";
import ProjectCard from "@/components/projects/ProjectCard";
import type { Project } from "@/lib/api/projectsApi";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const quickPrompts = [
  "Suggest AI projects",
  "Show IoT ideas",
  "Find data science FYPs"
];

export default function ChatbotPanel() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<Project[]>([]);
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    const loadRecommendations = async () => {
      try {
        const data = await getProjects();
        setRecommendations(Array.isArray(data) ? data : []);
        setOffline(false);
      } catch {
        setOffline(true);
        setRecommendations([]);
      }
    };

    loadRecommendations();
  }, []);

  const handleSend = async () => {
    if (!input.trim()) {
      return;
    }

    const nextMessage: ChatMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, nextMessage]);
    setInput("");
    setLoading(true);

    try {
      const history = messages.map((message) => ({
        role: message.role === "assistant" ? "bot" : "user",
        message: message.content
      }));
      const response = await sendMessage(input, history, 5);
      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: response?.bot_response || "Here are some ideas to explore."
      };
      setMessages((prev) => [...prev, assistantMessage]);
      if (Array.isArray(response?.recommended_projects)) {
        setRecommendations(response.recommended_projects);
      }
      setOffline(false);
    } catch {
      const assistantMessage: ChatMessage = {
        role: "assistant",
        content:
          "The advisor is offline right now. Please try again once the backend is running."
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setOffline(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
      <div className="glass-card rounded-2xl p-6 h-[70vh] flex flex-col">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12">
            <LottieWrapper animationData={chatbotAnimation} className="w-12 h-12" />
          </div>
          <div>
            <h1 className="text-xl font-display text-text-100">NovaFYP Advisor</h1>
            <p className="text-sm text-text-200">Your RAG-powered assistant</p>
          </div>
        </div>
        {offline ? (
          <div className="mt-4 text-xs text-accent-500">
            Backend is offline. Using demo mode until it reconnects.
          </div>
        ) : null}

        <div className="mt-6 flex-1 overflow-y-auto space-y-4 pr-2">
          {messages.length === 0 ? (
            <p className="text-text-200">
              Ask anything about final year projects. The advisor will guide you
              with data-backed insights.
            </p>
          ) : (
            messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`p-3 rounded-xl text-sm max-w-[80%] ${
                  message.role === "user"
                    ? "ml-auto bg-brand-500/20 text-text-100"
                    : "bg-white/5 text-text-200"
                }`}
              >
                {message.content}
              </div>
            ))
          )}
          {loading ? (
            <p className="text-text-200 text-sm">Thinking...</p>
          ) : null}
        </div>

        <div className="mt-4">
          <div className="flex flex-wrap gap-2 mb-3">
            {quickPrompts.map((prompt) => (
              <button
                key={prompt}
                type="button"
                className="text-xs px-3 py-1 rounded-full bg-white/5 text-text-200 hover:text-text-100"
                onClick={() => setInput(prompt)}
              >
                {prompt}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              className="flex-1 px-4 py-3 rounded-xl input-surface text-text-100"
              placeholder="Type your question..."
              value={input}
              onChange={(event) => setInput(event.target.value)}
            />
            <button
              type="button"
              onClick={handleSend}
              className="bg-accent-500 hover:bg-accent-400 text-white px-5 rounded-xl transition"
            >
              Send
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="glass-card rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-text-100">
            Current Context
          </h2>
          <p className="text-sm text-text-200 mt-2">
            Personalized recommendations based on your conversation.
          </p>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-text-100 mb-3">
            Top Recommendations
          </h3>
          <div className="space-y-4">
            {recommendations.slice(0, 3).map((project) => (
              <ProjectCard key={String(project.id)} project={project} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
