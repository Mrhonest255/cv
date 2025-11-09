"use client";

import { useState, useEffect } from "react";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toaster";
import { Sparkles, Download, Save, RefreshCw } from "lucide-react";
import { generateCoverLetterPDF, downloadPDF } from "@/lib/pdf";
import { generateCoverLetterDOCX, downloadDOCX } from "@/lib/docx";
import { generateFilename } from "@/lib/utils";
import type { GeminiRequest, CoverLetter } from "@/lib/types";

export default function LetterPage() {
  const { currentLetter, setCurrentLetter, currentResume, saveCurrentLetter, createNewLetter, loadAllResumes } = useAppStore();
  const [isGenerating, setIsGenerating] = useState(false);
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [tone, setTone] = useState<"Friendly" | "Technical" | "Leadership">("Friendly");
  const [language, setLanguage] = useState<"sw" | "en">("sw");
  const [model, setModel] = useState<"gemini-2.0-flash-exp" | "gemini-exp-1206">("gemini-2.0-flash-exp");
  const [keywords, setKeywords] = useState<string>("");
  // Contact overrides for letter header/footer
  const [fullName, setFullName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [linkedin, setLinkedin] = useState<string>("");
  const [portfolio, setPortfolio] = useState<string>("");

  useEffect(() => {
    loadAllResumes();
    if (!currentLetter) {
      createNewLetter();
    }
  }, []);

  const handleGenerate = async () => {
    if (!jobDescription || !currentResume) {
      toast({
        title: "Taarifa Zimekosekana",
        description: "Tafadhali weka maelezo ya kazi na uhakikishe una CV iliyohifadhiwa",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      const request: GeminiRequest = {
        jobText: `${jobTitle}\n${company}\n\n${jobDescription}`,
        resumeSnapshot: {
          personalInfo: currentResume.personalInfo,
          summary: currentResume.summary,
          skills: currentResume.skills,
          experience: currentResume.experience,
          education: currentResume.education,
        },
        tone,
        lang: language,
        model,
        keywords: keywords.split(",").map((k) => k.trim()).filter(Boolean),
      };

      const response = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Imeshindwa kutengeneza barua");
      }

      const content = await response.json();

      const newLetter: CoverLetter = {
        id: currentLetter?.id || Date.now().toString(),
        createdAt: currentLetter?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        jobTitle,
        company,
        jobDescription,
        tone,
        language,
        keywords: request.keywords,
        content,
        resumeId: currentResume.id,
      };

      setCurrentLetter(newLetter);
      await saveCurrentLetter();

      toast({
        title: "Imekamilika!",
        description: "Barua yako imetengenezwa kikamilifu",
      });
    } catch (error: any) {
      toast({
        title: "Hitilafu",
        description: error.message || "Imeshindwa kutengeneza barua",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExportPDF = async () => {
    if (!currentLetter || !currentResume) {
      toast({ title: "Kosa", description: "Hakuna barua ya ku-export", variant: "destructive" });
      return;
    }

    try {
      const personalInfo = {
        fullName: fullName || currentResume.personalInfo.fullName,
        email: email || currentResume.personalInfo.email,
        phone: phone || currentResume.personalInfo.phone,
        location: location || currentResume.personalInfo.location,
      };
      const blob = await generateCoverLetterPDF(currentLetter, personalInfo, false);
      const filename = generateFilename("letter", currentResume.personalInfo.fullName, "pdf", jobTitle);
      downloadPDF(blob, filename);
      toast({ title: "Imefanikiwa!", description: "Barua imepakiwa kwa PDF" });
    } catch (error) {
      toast({ title: "Kosa", description: "Imeshindwa kupakua PDF", variant: "destructive" });
    }
  };

  const handleExportDOCX = async () => {
    if (!currentLetter || !currentResume) {
      toast({ title: "Kosa", description: "Hakuna barua ya ku-export", variant: "destructive" });
      return;
    }

    try {
      const personalInfo = {
        fullName: fullName || currentResume.personalInfo.fullName,
        email: email || currentResume.personalInfo.email,
        phone: phone || currentResume.personalInfo.phone,
        location: location || currentResume.personalInfo.location,
      };
      const blob = await generateCoverLetterDOCX(currentLetter, personalInfo);
      const filename = generateFilename("letter", currentResume.personalInfo.fullName, "docx", jobTitle);
      downloadDOCX(blob, filename);
      toast({ title: "Imefanikiwa!", description: "Barua imepakiwa kwa DOCX" });
    } catch (error) {
      toast({ title: "Kosa", description: "Imeshindwa kupakua DOCX", variant: "destructive" });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-3xl font-bold mb-8">Smart Cover Letter Studio</h1>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="space-y-4">
          <div className="bg-card border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Taarifa za Kazi</h2>
            
            <div className="space-y-4">
              <div>
                <Label>Kazi Unayotaka</Label>
                <Input
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="Mfanyakazi wa Huduma kwa Wateja"
                />
              </div>

              <div>
                <Label>Kampuni</Label>
                <Input
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="XYZ Company Ltd"
                />
              </div>

              <div>
                <Label>Maelezo ya Kazi (Paste job description hapa)</Label>
                <Textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="We are looking for a customer service representative..."
                  rows={8}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Tone (Mtindo)</Label>
                  <select
                    value={tone}
                    onChange={(e) => setTone(e.target.value as any)}
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="Friendly">Rafiki (Friendly)</option>
                    <option value="Technical">Kitaalamu (Technical)</option>
                    <option value="Leadership">Uongozi (Leadership)</option>
                  </select>
                </div>

                <div>
                  <Label>Lugha (Language)</Label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value as any)}
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="sw">Kiswahili</option>
                    <option value="en">English</option>
                  </select>
                </div>
              </div>

              <div>
                <Label>Model (Optional)</Label>
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value as any)}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="gemini-2.0-flash-exp">Gemini 2.0 Flash (Haraka)</option>
                  <option value="gemini-exp-1206">Gemini Exp 1206 (Bora)</option>
                </select>
              </div>

              <div>
                <Label>Keywords (Optional, comma separated)</Label>
                <Input
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  placeholder="customer service, communication, team"
                />
              </div>

              <Button
                onClick={handleGenerate}
                disabled={isGenerating || !currentResume}
                className="w-full"
                size="lg"
              >
                {isGenerating ? (
                  <span key="loading" className="inline-flex items-center">
                    <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                    Inatengeneza...
                  </span>
                ) : (
                  <span key="ready" className="inline-flex items-center">
                    <Sparkles className="h-5 w-5 mr-2" />
                    Tengeneza Barua ya Maombi
                  </span>
                )}
              </Button>

              {!currentResume && (
                <p className="text-sm text-destructive">
                  Tafadhali tengeneza CV kwanza kabla ya kutengeneza barua
                </p>
              )}
            </div>
          </div>

          <div className="bg-card border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Taarifa za Mwombaji (kwa barua)</h2>
            <p className="text-sm text-muted-foreground mb-4">Hii itatumika kwenye kichwa na chini ya barua. Ukiacha wazi, tutatumia taarifa kutoka kwenye CV yako.</p>
            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <Label>Jina Kamili</Label>
                <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder={currentResume?.personalInfo.fullName || ""} />
              </div>
              <div>
                <Label>Barua Pepe</Label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={currentResume?.personalInfo.email || ""} />
              </div>
              <div>
                <Label>Simu</Label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder={currentResume?.personalInfo.phone || ""} />
              </div>
              <div>
                <Label>Mahali</Label>
                <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder={currentResume?.personalInfo.location || ""} />
              </div>
              <div>
                <Label>LinkedIn (hiari)</Label>
                <Input value={linkedin} onChange={(e) => setLinkedin(e.target.value)} placeholder={currentResume?.personalInfo.linkedin || ""} />
              </div>
              <div>
                <Label>Portfolio/Website (hiari)</Label>
                <Input value={portfolio} onChange={(e) => setPortfolio(e.target.value)} placeholder={currentResume?.personalInfo.portfolio || ""} />
              </div>
            </div>
          </div>
        </div>

        {/* Output Section */}
        <div className="space-y-4">
          <div className="bg-card border rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Barua Yako</h2>
              {currentLetter?.content.intro && (
                <div className="flex gap-2">
                  <Button onClick={handleExportPDF} size="sm" variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    PDF
                  </Button>
                  <Button onClick={handleExportDOCX} size="sm" variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    DOCX
                  </Button>
                </div>
              )}
            </div>

            {currentLetter?.content.intro ? (
              <div className="space-y-4 prose max-w-none">
                {/* Greeting */}
                <div>
                  <Label className="text-sm text-muted-foreground">Salamu</Label>
                  <Textarea
                    value={currentLetter.content.greeting}
                    onChange={(e) =>
                      setCurrentLetter({
                        ...currentLetter,
                        content: { ...currentLetter.content, greeting: e.target.value },
                      })
                    }
                    rows={1}
                    className="mt-1"
                  />
                </div>

                {/* Intro */}
                <div>
                  <Label className="text-sm text-muted-foreground">Utangulizi</Label>
                  <Textarea
                    value={currentLetter.content.intro}
                    onChange={(e) =>
                      setCurrentLetter({
                        ...currentLetter,
                        content: { ...currentLetter.content, intro: e.target.value },
                      })
                    }
                    rows={3}
                    className="mt-1"
                  />
                </div>

                {/* Body Paragraphs */}
                {currentLetter.content.body_paragraphs.map((para, index) => (
                  <div key={index}>
                    <Label className="text-sm text-muted-foreground">Aya {index + 1}</Label>
                    <Textarea
                      value={para}
                      onChange={(e) => {
                        const newParas = [...currentLetter.content.body_paragraphs];
                        newParas[index] = e.target.value;
                        setCurrentLetter({
                          ...currentLetter,
                          content: { ...currentLetter.content, body_paragraphs: newParas },
                        });
                      }}
                      rows={4}
                      className="mt-1"
                    />
                  </div>
                ))}

                {/* Closing */}
                <div>
                  <Label className="text-sm text-muted-foreground">Hitimisho</Label>
                  <Textarea
                    value={currentLetter.content.closing}
                    onChange={(e) =>
                      setCurrentLetter({
                        ...currentLetter,
                        content: { ...currentLetter.content, closing: e.target.value },
                      })
                    }
                    rows={3}
                    className="mt-1"
                  />
                </div>

                {/* Signature */}
                <div>
                  <Label className="text-sm text-muted-foreground">Saini</Label>
                  <Textarea
                    value={currentLetter.content.signature}
                    onChange={(e) =>
                      setCurrentLetter({
                        ...currentLetter,
                        content: { ...currentLetter.content, signature: e.target.value },
                      })
                    }
                    rows={1}
                    className="mt-1"
                  />
                </div>

                {/* Keywords Used */}
                {currentLetter.content.target_keywords?.length > 0 && (
                  <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950 rounded">
                    <Label className="text-sm font-medium">Keywords Zilizotumika:</Label>
                    <p className="text-sm mt-1">
                      {currentLetter.content.target_keywords.join(", ")}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Weka taarifa za kazi na ubonyeze "Tengeneza Barua"</p>
                <p className="text-sm mt-2">AI itakusaidia kuandika barua nzuri kwa muda mfupi</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
