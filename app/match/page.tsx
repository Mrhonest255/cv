"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useAppStore } from "@/lib/store";
import { calculateJobMatch } from "@/lib/scoring";
import { JobMatch, Resume } from "@/lib/types";
import { Target, TrendingUp, AlertCircle, Loader2 } from "lucide-react";

const getScoreColor = (score: number) => {
  if (score >= 75) return "text-green-500";
  if (score >= 50) return "text-yellow-500";
  return "text-destructive";
};

const getScoreBgColor = (score: number) => {
  if (score >= 75) return "bg-green-500/10 border-green-500/20";
  if (score >= 50) return "bg-yellow-500/10 border-yellow-500/20";
  return "bg-red-500/10 border-red-500/20";
};

export default function MatchPage() {
  const { resumes } = useAppStore();
  const [selectedResumeId, setSelectedResumeId] = useState<string>("");
  const [jobDescription, setJobDescription] = useState("");
  const [match, setMatch] = useState<JobMatch | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    if (resumes.length > 0) {
      setSelectedResumeId(resumes[0].id);
    }
  }, [resumes]);

  const handleAnalyze = async () => {
    const selectedResume = resumes.find(
      (resume: Resume) => resume.id === selectedResumeId
    );
    if (!selectedResume || !jobDescription) return;

    setIsAnalyzing(true);
    setMatch(null);

    try {
      const result = await calculateJobMatch(selectedResume, jobDescription);
      setMatch(result);
    } catch (error) {
      console.error("Error analyzing job match:", error);
      // You might want to show an error message to the user here
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl animate-fadeIn">
      <h1 className="text-2xl md:text-3xl font-bold mb-2 gradient-title">Smart Job Match</h1>
      <p className="text-muted-foreground mb-6 md:mb-8">
        Pima ulinganifu wa CV yako na tangazo la kazi.
      </p>

      <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
        {/* Input Section */}
        <div className="space-y-4">
          <div className="card p-4 md:p-6">
            <h2 className="text-xl font-semibold mb-4">Taarifa za Kazi</h2>

            {resumes.length > 0 && (
              <div className="mb-4">
                <Label>Chagua CV</Label>
                <select
                  value={selectedResumeId}
                  onChange={(e) => setSelectedResumeId(e.target.value)}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  {resumes.map((resume: Resume) => (
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
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
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
          {isAnalyzing && (
            <div className="card p-6 text-center">
              <Loader2 className="h-12 w-12 mx-auto animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Inatafuta maneno muhimu na kupima alama...</p>
            </div>
          )}
          {match && !isAnalyzing && (
            <>
              {/* Score Card */}
              <div className={`${getScoreBgColor(match.score)} border rounded-lg p-6 animate-scaleUp`}>
                <div className="text-center">
                  <TrendingUp className={`h-12 w-12 mx-auto mb-2 ${getScoreColor(match.score)}`} />
                  <h3 className="text-2xl font-bold mb-1">Match Score</h3>
                  <div className={`text-5xl md:text-6xl font-bold ${getScoreColor(match.score)}`}>
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
                <div className="card p-4 md:p-6 animate-fadeIn">
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
                <div className="card p-4 md:p-6 animate-fadeIn">
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
                    Ongeza maneno haya kwenye CV yako ili kuongeza alama.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
