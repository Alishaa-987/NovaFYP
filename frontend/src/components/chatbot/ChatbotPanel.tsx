import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import LottieWrapper from "@/components/common/LottieWrapper";
import chatbotAnimation from "@/public/animations/chatbot.json";
import { sendMessage } from "@/lib/api/chatbotApi";
import type { ChatHistoryItem } from "@/lib/api/chatbotApi";
import { getProjects } from "@/lib/api/projectsApi";
import ProjectCard from "@/components/projects/ProjectCard";
import type { Project } from "@/lib/api/projectsApi";
import ReactMarkdown from "react-markdown";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  cards?: IdeaCard[];
}

interface IdeaCard {
  title: string;
  description: string;
}

const quickPrompts = [
  "Suggest AI projects",
  "Show IoT ideas",
  "Find data science FYPs"
];

const actionVerbs = [
  "Automate",
  "Adjust",
  "Build",
  "Create",
  "Monitor",
  "Track",
  "Detect",
  "Predict",
  "Analyze",
  "Design",
  "Develop",
  "Implement",
  "Secure",
  "Classify",
  "Use",
  "Control",
  "Log",
  "Display",
  "Recommend"
];

const normalizeLines = (text: string) =>
  text
    .replace(/\r/g, "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

const toIdeaCards = (items: Array<{ title: string; description: string }>): IdeaCard[] =>
  items
    .map((item) => {
      const cleanTitle = item.title.replace(/^\d+[.)-]?\s+/, "").trim();
      const cleanDescription = item.description.trim();

      if (!cleanTitle) {
        return null;
      }

      if (!cleanDescription) {
        return { title: cleanTitle, description: "" };
      }

      const verbMatch = actionVerbs.find((verb) =>
        cleanDescription.includes(` ${verb} `)
      );

      if (verbMatch && cleanDescription.startsWith(verbMatch)) {
        return { title: cleanTitle, description: cleanDescription };
      }

      return { title: cleanTitle, description: cleanDescription };
    })
    .filter((card): card is IdeaCard => Boolean(card));

const extractIdeaItems = (content: string) => {
  const lines = normalizeLines(content)
    .map((line) => line.replace(/^\d+[.)-]?\s+/, "").trim())
    .filter(
      (line) =>
        line.length > 0 &&
        !/^\d+$/.test(line) &&
        !/^iot project ideas$/i.test(line) &&
        !/^project ideas$/i.test(line) &&
        !/^all of these/i.test(line)
    );

  const items: Array<{ title: string; description: string }> = [];
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    if (line.includes(":")) {
      const [title, description] = line.split(":", 2);
      items.push({ title: title.trim(), description: description.trim() });
      continue;
    }

    const nextLine = lines[i + 1];
    if (nextLine && !nextLine.includes(":")) {
      items.push({ title: line, description: nextLine });
      i += 1;
      continue;
    }

    items.push({ title: line, description: "" });
  }

  return items;
};

const formatAssistantContent = (content: string) => {
  const items = extractIdeaItems(content);
  if (items.length < 2) {
    return { markdown: content, cards: [] as IdeaCard[] };
  }

  const intro = "Here are some project ideas you can explore.";
  const cards = toIdeaCards(items);
  const heading = content.toLowerCase().includes("iot")
    ? "## IoT Project Ideas"
    : "## Project Ideas";
  const bullets = cards
    .map((card) => `- **${card.title}**${card.description ? `: ${card.description}` : ""}`)
    .join("\n");

  return {
    markdown: `${intro}\n\n${heading}\n${bullets}`,
    cards
  };
};

export default function ChatbotPanel() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<Project[]>([]);
  const [offline, setOffline] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);

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
      const history: ChatHistoryItem[] = messages.map((message) => ({
        role: message.role === "assistant" ? "bot" : "user",
        message: message.content
      }));
      const response = await sendMessage(input, history, 5);
      const formatted = formatAssistantContent(
        response?.bot_response || "Here are some ideas to explore."
      );
      const assistantMessage: ChatMessage = {
        role: "assistant",
        content:
          formatted.markdown.replace(/\s+(\d+\.)/g, "\n\n$1") ||
          "Here are some ideas to explore.",
        cards: formatted.cards
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
    <div
      className={`grid gap-8 ${
        isMaximized ? "grid-cols-1" : "lg:grid-cols-[2fr_1fr]"
      }`}
    >
      <div
        className={`glass-card rounded-2xl p-6 flex flex-col ${
          isMaximized ? "h-[85vh]" : "h-[70vh]"
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12">
            <LottieWrapper animationData={chatbotAnimation} className="w-12 h-12" />
          </div>
          <div>
            <h1 className="text-xl font-display text-text-100">NovaFYP Advisor</h1>
            <p className="text-sm text-text-200">Your RAG-powered assistant</p>
          </div>
          <div className="ml-auto">
            <button
              type="button"
              onClick={() => setIsMaximized((prev) => !prev)}
              className="text-xs px-3 py-2 rounded-full bg-white/5 text-text-200 hover:text-text-100"
            >
              {isMaximized ? "Minimize" : "Maximize"}
            </button>
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
              <div key={`${message.role}-${index}`}>
              <div
                className={`p-3 rounded-xl text-sm max-w-[80%] ${
                  message.role === "user"
                    ? "ml-auto bg-brand-500/20 text-text-100"
                    : "bg-white/5 text-text-200"
                }`}
              >
                {message.role === "assistant" ? (
                  <ReactMarkdown>{message.content}</ReactMarkdown>
                ) : (
                  message.content
                )}
              </div>
              {message.role === "assistant" && message.cards?.length ? (
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {message.cards.map((card, cardIndex) => (
                    <div
                      key={`${card.title}-${cardIndex}`}
                      className="glass-card rounded-xl p-4 text-sm text-text-200"
                    >
                      <p className="text-text-100 font-semibold">
                        {card.title}
                      </p>
                      {card.description ? (
                        <p className="mt-2 text-xs text-text-200">
                          {card.description}
                        </p>
                      ) : null}
                    </div>
                  ))}
                </div>
              ) : null}
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

      <div className={`space-y-6 ${isMaximized ? "hidden" : "block"}`}>
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
