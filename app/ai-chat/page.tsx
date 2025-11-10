"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Bot, User, Loader2, Sparkles, FileText, FileUp, Download } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import type { Education, Experience, Resume } from "@/lib/types";
import dynamic from "next/dynamic";
const ResumePreview = dynamic(() => import("@/components/preview/ResumePreview"), { ssr: false });
import { generateResumePDF, downloadPDF } from "@/lib/pdf";
import { generateResumeDOCX, downloadDOCX } from "@/lib/docx";

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
  const [downloading, setDownloading] = useState<null | "pdf" | "docx">(null);

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
        let msg = `HTTP ${response.status}`;
        try {
          const err = await response.json();
          if (err?.error) msg = err.error;
        } catch {}
        throw new Error(msg);
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

  // Extract structured resume from chat messages (simple heuristic)
  function extractResumeFromChat(msgs: Message[]) {
    const resume = currentResume ? { ...currentResume } : null;
    if(!resume) return null;

    const text = msgs.map(m => m.content).join('\n');
    const lines = text.split(/\n+/).map(l => l.trim()).filter(Boolean);

    const personal = { ...resume.personalInfo };
    const experiences: Experience[] = resume.experience.map(exp => ({ ...exp }));
    const education: Education[] = resume.education.map(edu => ({ ...edu }));
    const skills = [...resume.skills];
    let lastExperience: Experience | null = experiences.length ? experiences[experiences.length - 1] : null;

    const dedupeByKey = <T,>(items: T[], keyFn: (item: T) => string) => {
      const seen = new Set<string>();
      return items.filter(item => {
        const key = keyFn(item);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    };

    // Pass 0: context-driven extraction from Q&A pairs (assistant asks => user answers)
    for (let i = 1; i < msgs.length; i++) {
      const prev = msgs[i - 1];
      const curr = msgs[i];
      if (prev.role === 'assistant' && curr.role === 'user') {
        const q = prev.content.toLowerCase();
        const a = curr.content.trim();
        // Location
        if (/\b(location|mahali)\b/.test(q) && a && a.length > 2 && !a.includes('@') && !/\d/.test(a)) {
          personal.location = a;
        }
        // Email
        if (/\b(email|barua pepe)\b/.test(q)) {
          const emailMatch = a.match(/[\w.-]+@[\w.-]+\.\w+/);
          if (emailMatch) personal.email = emailMatch[0];
        }
        // Phone
        if (/\b(phone|simu|nambari)\b/.test(q)) {
          const phoneMatch = a.match(/\+?\d[\d\s-]{7,}/);
          if (phoneMatch) personal.phone = phoneMatch[0];
        }
        // Company
        if (/(company|kampuni)/.test(q) && a.length >= 2) {
          if (!lastExperience) {
            lastExperience = {
              id: Date.now().toString()+Math.random(),
              title: '', company: a, location: '', startDate: '', endDate: '', current: false, description: [],
            };
            experiences.push(lastExperience);
          } else {
            lastExperience.company = a;
          }
        }
        // Job title
        if (/(job title|title|cheo|kazi)/.test(q) && a.length >= 2) {
          if (!lastExperience) {
            lastExperience = {
              id: Date.now().toString()+Math.random(),
              title: a, company: '', location: '', startDate: '', endDate: '', current: false, description: [],
            };
            experiences.push(lastExperience);
          } else {
            lastExperience.title = a;
          }
        }
        // Start/End dates
        if (/(start|kuanzia|from)/.test(q)) {
          if (!lastExperience) {
            lastExperience = {
              id: Date.now().toString()+Math.random(),
              title: '', company: '', location: '', startDate: a, endDate: '', current: false, description: [],
            };
            experiences.push(lastExperience);
          } else {
            lastExperience.startDate = a;
          }
        }
        if (/(end|hadi|to|mpaka)/.test(q)) {
          if (!lastExperience) {
            lastExperience = {
              id: Date.now().toString()+Math.random(),
              title: '', company: '', location: '', startDate: '', endDate: /sasa|present/i.test(a) ? '' : a,
              current: /sasa|present/i.test(a), description: [],
            };
            experiences.push(lastExperience);
          } else {
            lastExperience.current = /sasa|present/i.test(a);
            lastExperience.endDate = lastExperience.current ? '' : a;
          }
        }
      }
    }

    // Pass 1: pattern-based extraction across all lines
    lines.forEach(l => {
      // Name detection
      if(!personal.fullName && /^(jina|name)\s*[:\-]/i.test(l)) {
        const name = l.split(/[:\-]/)[1]?.trim();
        if(name && name.length > 2) personal.fullName = name;
      }

      const emailMatch = l.match(/[\w.-]+@[\w.-]+\.\w+/);
      if(emailMatch) personal.email = emailMatch[0];

      const phoneMatch = l.match(/\+?\d[\d\s-]{7,}/);
      if(phoneMatch) personal.phone = phoneMatch[0];

      if (/(niko|mahali|location)\s*[:\-]/i.test(l)) {
        const loc = l.split(/[:\-]/)[1]?.trim();
        if(loc && loc.length > 2) personal.location = loc;
      }
      // "Your location is Zanzibar" style
      const locSentence = l.match(/\b(location|mahali)\b\s+(is|ni)\s+(.+)/i);
      if (locSentence) {
        const loc = locSentence[3].trim();
        if (loc && loc.length > 2 && !/\d|@/.test(loc)) personal.location = loc;
      }

      if(/skills|ujuzi/i.test(l) && l.includes(':')) {
        const skillList = l.split(':')[1].split(/,|;/).map(s=>s.trim()).filter(Boolean);
        skillList.forEach(s => {
          if(!skills.some(k => k.name.toLowerCase() === s.toLowerCase())) {
            skills.push({ id: Date.now().toString() + Math.random(), name: s, level:3, category:'General' });
          }
        });
      }

      const experienceMatch = l.match(/(.+?)\s+at\s+(.+?)\s*\((\d{4}).?(\d{4}|Sasa|Now|Present)?\)/i);
      if(experienceMatch) {
        const [_, title, company, startY, endY] = experienceMatch;
        const exp: Experience = {
          id: Date.now().toString()+Math.random(),
          title: title.trim(),
          company: company.trim(),
          location: '',
          startDate: startY,
          endDate: endY && !/Sasa|Now|Present/i.test(endY) ? endY : '',
          current: /Sasa|Now|Present/i.test(endY || ''),
          description: [],
        };
        experiences.push(exp);
        lastExperience = exp;
        return;
      }

      const eduMatch = l.match(/(Bachelor|Master|Diploma|Shahada|Degree|Certificate)\s+([^,]+?)\s+(?:at|from)\s+([^,(]+)(?:[,\s]+)?(?:\((\d{4})\s*(?:-|hadi|to|mpaka)\s*(\d{4}|Sasa|Now)?\))?/i);
      if(eduMatch) {
        const [, degreeWord, field, institution, startY, endY] = eduMatch;
        const edu: Education = {
          id: Date.now().toString()+Math.random(),
          degree: `${degreeWord} ${field}`.trim(),
          institution: institution.trim(),
          location: '',
          startDate: startY || '',
          endDate: endY && !/Sasa|Now/i.test(endY) ? endY : '',
          current: endY ? /Sasa|Now/i.test(endY) : false,
          gpa: '',
        };
        education.push(edu);
        return;
      }

      if(/^[-•]/.test(l) && lastExperience) {
        const clean = l.replace(/^[-•\s]+/, '').trim();
        if(clean) {
          lastExperience.description = [...(lastExperience.description || []), clean];
        }
        return;
      }

      if(!resume.summary && /(muhtasari|summary)\s*[:\-]/i.test(l)) {
        const summary = l.split(/[:\-]/)[1]?.trim();
        if(summary && summary.length > 30) resume.summary = summary;
      }
    });

    resume.personalInfo = personal;
    resume.experience = dedupeByKey(experiences, exp => `${exp.title}|${exp.company}|${exp.startDate}`);
    resume.education = dedupeByKey(education, edu => `${edu.degree}|${edu.institution}|${edu.startDate}`);
    resume.skills = skills;
    return resume;
  }

  const handleAutoCompile = () => {
    const compiled = extractResumeFromChat(messages);
    if(!compiled){
      return;
    }
    setCurrentResume(compiled);
  };

  const compiledResume = extractResumeFromChat(messages) || currentResume;
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl animate-fadeIn">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold gradient-title mb-2">
            AI CV Chat
          </h1>
          <p className="text-muted-foreground">
            Jenga CV yako kwa mazungumzo na AI
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
        <Button
          onClick={() => router.push("/resume")}
          variant="outline"
          className="gap-2"
        >
          <FileText className="h-4 w-4" />
          Nenda CV Builder
        </Button>
        <Button
          onClick={handleAutoCompile}
          variant="outline"
          className="gap-2"
          disabled={!currentResume}
        >
          <FileUp className="h-4 w-4" />
          Jenga CV Kutoka Chat
        </Button>
          <select
            value={currentResume?.template || 'classic'}
            onChange={(e)=> currentResume && setCurrentResume({ ...currentResume, template: e.target.value as Resume['template'] })}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            aria-label="Chagua Template"
          >
            <option value="classic">Classic</option>
            <option value="modern">Modern</option>
            <option value="compact">Compact</option>
            <option value="professional">Professional</option>
            <option value="ordered">Ordered</option>
            <option value="elegant">Elegant</option>
            <option value="glass">Glass</option>
          </select>
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
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Chat column */}
        <div className="lg:col-span-2 card p-0 overflow-hidden">
        {/* Messages area */}
  <div className="h-[60vh] md:h-[500px] overflow-y-auto p-4 md:p-6 space-y-4">
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
        <div className="border-t bg-muted/30 p-3 md:p-4">
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
        {/* Live preview column */}
        <div className="space-y-4">
          <div className="bg-card border rounded-lg p-4 sticky top-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold flex items-center gap-2"><FileText className="h-4 w-4"/>Live CV Preview</h2>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-2"
                  disabled={!compiledResume || !!downloading}
                  onClick={async () => {
                    if (!compiledResume) return;
                    try {
                      setDownloading("pdf");
                      const blob = await generateResumePDF(compiledResume as Resume, {
                        template: (compiledResume as Resume).template,
                        layout: '1-column',
                      });
                      downloadPDF(blob, `${(compiledResume as Resume).personalInfo.fullName || 'Resume'}.pdf`);
                    } finally {
                      setDownloading(null);
                    }
                  }}
                  aria-label="Pakua PDF"
                >
                  {downloading === "pdf" ? <Loader2 className="h-4 w-4 animate-spin"/> : <Download className="h-4 w-4"/>}
                  <span className="hidden sm:inline">Download PDF</span>
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-2"
                  disabled={!compiledResume || !!downloading}
                  onClick={async () => {
                    if (!compiledResume) return;
                    try {
                      setDownloading("docx");
                      const blob = await generateResumeDOCX(compiledResume as Resume, {
                        template: (compiledResume as Resume).template,
                      });
                      downloadDOCX(blob, `${(compiledResume as Resume).personalInfo.fullName || 'Resume'}.docx`);
                    } finally {
                      setDownloading(null);
                    }
                  }}
                  aria-label="Pakua DOCX"
                >
                  {downloading === "docx" ? <Loader2 className="h-4 w-4 animate-spin"/> : <Download className="h-4 w-4"/>}
                  <span className="hidden sm:inline">Download DOCX</span>
                </Button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mb-2">Inasasishwa moja kwa moja kutokana na majibu ya mazungumzo. Bonyeza "Jenga CV Kutoka Chat" kuhifadhi.</p>
            <div className="h-[520px] overflow-y-auto custom-scrollbar">
              {compiledResume ? <ResumePreview resume={compiledResume as Resume} /> : <p className="text-xs">Hakuna data bado...</p>}
            </div>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="mt-8 flex flex-wrap gap-2">
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
        <Button
          variant="outline"
          size="sm"
          onClick={() => setInput("Ongeza elimu yangu: Bachelor of Science in Computer Science at UDSM (2019 - 2023)")}
          disabled={loading}
        >
          Ongeza Elimu
        </Button>
      </div>
    </div>
  );
}
