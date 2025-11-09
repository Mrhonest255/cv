"use client";

import { useState, useEffect } from "react";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toaster";
import { Target, TrendingUp, AlertCircle } from "lucide-react";
import { calculateJobMatch, extractJobKeywords } from "@/lib/scoring";
import type { JobMatch } from "@/lib/types";

export default function MatchPage() {
  const { currentResume, resumes, loadAllResumes } = useAppStore();
  const [jobDescription, setJobDescription] = useState("");
  const [match, setMatch] = useState<JobMatch | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedResumeId, setSelectedResumeId] = useState<string>("");

  useEffect(() => {
    loadAllResumes();
  }, []);

  useEffect(() => {
    if (currentResume && !selectedResumeId) {
      setSelectedResumeId(currentResume.id);
    }
  }, [currentResume]);

  const handleAnalyze = () => {
  const resume = resumes.find((r: any) => r.id === selectedResumeId) || currentResume;

    if (!resume) {
      toast({
        title: "Kosa",
        description: "Tafadhali chagua CV kwanza",
        variant: "destructive",
      });
      return;
    }

    if (!jobDescription.trim()) {
      toast({
        title: "Kosa",
        description: "Tafadhali weka maelezo ya kazi",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);

    // Simulate analysis (add slight delay for UX)
    setTimeout(() => {
      const result = calculateJobMatch(resume, jobDescription);
      setMatch(result);
      setIsAnalyzing(false);

      toast({
        title: "Uchambuzi Umekamilika!",
        description: `Alama yako: ${result.score}%`,
      });
    }, 500);
  };

  const getScoreColor = (score: number) => {
    if (score >= 75) return "text-green-600 dark:text-green-400";
    if (score >= 50) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 75) return "bg-green-100 dark:bg-green-950";
    if (score >= 50) return "bg-yellow-100 dark:bg-yellow-950";
    return "bg-red-100 dark:bg-red-950";
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <h1 className="text-3xl font-bold mb-8">Smart Job Match</h1>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="space-y-4">
          <div className="bg-card border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Taarifa za Kazi</h2>

            {resumes.length > 0 && (
              <div className="mb-4">
                <Label>Chagua CV</Label>
                <select
                  value={selectedResumeId}
                  onChange={(e) => setSelectedResumeId(e.target.value)}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  {resumes.map((resume: any) => (
                    <option key={resume.id} value={resume.id}>
                      {resume.personalInfo.fullName || `CV ${resume.id}`}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <Label>Maelezo ya Kazi (Paste job description)</Label>
              <Textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="We are looking for a talented professional..."
                rows={12}
                className="mt-2"
              />
            </div>

            <Button
              onClick={handleAnalyze}
              disabled={isAnalyzing || !selectedResumeId}
              className="w-full mt-4"
              size="lg"
            >
              {isAnalyzing ? (
                <>
                  <Target className="h-5 w-5 mr-2 animate-pulse" />
                  Inachambuza...
                </>
              ) : (
                <>
                  <Target className="h-5 w-5 mr-2" />
                  Changanua Ulinganifu
                </>
              )}
            </Button>

            {resumes.length === 0 && (
              <p className="text-sm text-destructive mt-2">
                Tafadhali tengeneza CV kwanza
              </p>
            )}
          </div>
        </div>

        {/* Results Section */}
        <div className="space-y-4">
          {match ? (
            <>
              {/* Score Card */}
              <div className={`${getScoreBgColor(match.score)} border rounded-lg p-6`}>
                <div className="text-center">
                  <TrendingUp className={`h-12 w-12 mx-auto mb-2 ${getScoreColor(match.score)}`} />
                  <h3 className="text-2xl font-bold mb-1">Match Score</h3>
                  <div className={`text-6xl font-bold ${getScoreColor(match.score)}`}>
                    {match.score}%
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    {match.score >= 75 && "Umefanana vizuri sana!"}
                    {match.score >= 50 && match.score < 75 && "Umefanana kiasi, endelea!"}
                    {match.score < 50 && "Ongeza ujuzi zaidi"}
                  </p>
                </div>
              </div>

              {/* Matched Keywords */}
              {match.matchedKeywords.length > 0 && (
                <div className="bg-card border rounded-lg p-6">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    Keywords Unazofanana ({match.matchedKeywords.length})
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {match.matchedKeywords.map((keyword, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300 rounded-full text-sm"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Missing Keywords */}
              {match.missingKeywords.length > 0 && (
                <div className="bg-card border rounded-lg p-6">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                    Keywords Zinazokosekana ({match.missingKeywords.length})
                  </h3>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {match.missingKeywords.map((keyword, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-yellow-100 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-300 rounded-full text-sm"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    💡 Tumia keywords hizi kwenye barua yako ya maombi ili kuongeza nafasi zako
                  </p>
                </div>
              )}

              {/* Suggestions */}
              {match.suggestions.length > 0 && (
                <div className="bg-card border rounded-lg p-6">
                  <h3 className="font-semibold mb-3">Mapendekezo</h3>
                  <ul className="space-y-2">
                    {match.suggestions.map((suggestion, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-blue-600 dark:text-blue-400 mt-1">•</span>
                        <span className="text-sm">{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Action Button */}
              <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
                <h3 className="font-semibold mb-2">Hatua Inayofuata</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Tumia matokeo haya kutengeneza barua ya maombi yenye keywords sahihi
                </p>
                <Button
                  onClick={() => {
                    // Copy missing keywords to clipboard
                    const keywordsText = match.missingKeywords.join(", ");
                    navigator.clipboard.writeText(keywordsText);
                    toast({
                      title: "Imenakiliwa!",
                      description: "Keywords zimewekwa kwenye clipboard",
                    });
                  }}
                  variant="outline"
                  className="w-full"
                >
                  Nakili Keywords Zinazokosekana
                </Button>
              </div>
            </>
          ) : (
            <div className="bg-card border rounded-lg p-12 text-center text-muted-foreground">
              <Target className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">Tayari kuchambuwa?</p>
              <p className="text-sm">
                Weka maelezo ya kazi na ubonyeze "Changanua Ulinganifu"
              </p>
              <p className="text-sm mt-4">
                Tutakuambia umefanana kiasi gani na kazi hiyo na keywords
                unazozihitaji
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
