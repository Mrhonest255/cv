"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Bot, User, Loader2, Sparkles, FileText } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { useRouter } from "next/navigation";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function AIChatPage() {
  const router = useRouter();
  const { currentResume, setCurrentResume, createNewResume, loadAllResumes } = useAppStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const STORAGE_KEY = 'jobkit_chat_history_v1';
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load resume & chat history on mount
  useEffect(() => {
    (async () => {
      if (!currentResume) {
        await loadAllResumes();
        if (!useAppStore.getState().currentResume) {
          createNewResume();
        }
      }
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as Message[];
          if (Array.isArray(parsed) && parsed.length) {
            setMessages(parsed);
            return;
          }
        }
      } catch {}
      // fallback initial greeting
      setMessages([{
        role: 'assistant',
        content: 'Habari! 👋 Niko hapa kukusaidia kutengeneza CV yako. Je, tuanze na jina lako kamili?',
      }]);
    })();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    // Ensure we have a resume to work with
    if (!currentResume) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Samahani, CV haijatengenezwa. Tafadhali nenda kwenye CV Builder kwanza.",
        },
      ]);
      return;
    }

    const userMessage: Message = { role: "user", content: input.trim() };
  setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      // Create context summary from current resume
      const resumeData = currentResume;
      const context = `Personal: ${resumeData.personalInfo.fullName || 'N/A'}, ${resumeData.personalInfo.email || 'N/A'}
Experience: ${resumeData.experience.length} entries
Education: ${resumeData.education.length} entries
Skills: ${resumeData.skills.length} skills
Summary: ${resumeData.summary || 'N/A'}`;

      // If this is the first user turn, send only the user message to avoid
      // history starting with assistant greeting on the server
      const outboundMessages = messages.some(m => m.role === "user")
        ? [...messages, userMessage]
        : [userMessage];

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: outboundMessages,
          context,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      let data: any = null;
      try {
        data = await response.json();
      } catch (e) {
        throw new Error('Invalid JSON response');
      }
      
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.message },
      ]);

      // Simple parsing to update resume (basic heuristic)
      // In production, you'd use structured extraction
      const text = userMessage.content.toLowerCase();
      const resume = currentResume;
      
      // Detect name
      if (text.includes("jina") || text.includes("name") || messages.length <= 2) {
        const name = userMessage.content.trim();
        if (name.length > 2 && !name.includes("jina") && !name.includes("ni")) {
          setCurrentResume({
            ...resume,
            personalInfo: { ...resume.personalInfo, fullName: userMessage.content.trim() },
          });
        }
      }

      // Detect email
      if (text.includes("@")) {
        const emailMatch = userMessage.content.match(/[\w.-]+@[\w.-]+\.\w+/);
        if (emailMatch) {
          setCurrentResume({
            ...resume,
            personalInfo: { ...resume.personalInfo, email: emailMatch[0] },
          });
        }
      }

      // Detect phone
      if (text.match(/\+?\d[\d\s-]{7,}/)) {
        const phoneMatch = userMessage.content.match(/\+?\d[\d\s-]{7,}/);
        if (phoneMatch) {
          setCurrentResume({
            ...resume,
            personalInfo: { ...resume.personalInfo, phone: phoneMatch[0] },
          });
        }
      }

    } catch (error: any) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Kuna tatizo: ${error.message || 'jaribu tena.'}`,
        },
      ]);
    } finally {
      setLoading(false);
      // persist after every turn
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(messages)); } catch {}
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl animate-fadeIn">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-title mb-2">
            AI CV Chat
          </h1>
          <p className="text-muted-foreground">
            Jenga CV yako kwa mazungumzo na AI
          </p>
        </div>
        <Button
          onClick={() => router.push("/resume")}
          variant="outline"
          className="gap-2"
        >
          <FileText className="h-4 w-4" />
          Nenda CV Builder
        </Button>
        <Button
          onClick={() => {
            setMessages([{
              role: 'assistant',
              content: 'Tumeanza mazungumzo mapya. Taja jina lako kamili kuanza.',
            }]);
            try { localStorage.removeItem(STORAGE_KEY); } catch {}
          }}
          variant="outline"
          className="gap-2"
        >
          Anza Upya
        </Button>
      </div>

      <div className="card p-0 overflow-hidden">
        {/* Messages area */}
        <div className="h-[500px] overflow-y-auto p-6 space-y-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex gap-3 animate-fadeIn ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {msg.role === "assistant" && (
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Bot className="h-5 w-5 text-primary" />
                </div>
              )}
              
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              </div>

              {msg.role === "user" && (
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                  <User className="h-5 w-5 text-primary-foreground" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 justify-start animate-fadeIn">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Bot className="h-5 w-5 text-primary" />
              </div>
              <div className="bg-muted rounded-2xl px-4 py-3">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div className="border-t bg-muted/30 p-4">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Andika jibu lako hapa..."
              disabled={loading}
              className="flex-1"
            />
            <Button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              size="icon"
              className="flex-shrink-0"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
            <Sparkles className="h-3 w-3" />
            Taarifa unazotoa zinasaidia kuboresha CV yako katika CV Builder
          </p>
        </div>
      </div>

      {/* Quick actions */}
      <div className="mt-4 flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setInput("Ninataka kuongeza experience yangu")}
          disabled={loading}
        >
          Ongeza Experience
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setInput("Nisaidie kuandika summary")}
          disabled={loading}
        >
          Andika Summary
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setInput("Nina skills gani muhimu?")}
          disabled={loading}
        >
          Skills Suggestions
        </Button>
      </div>
    </div>
  );
}
