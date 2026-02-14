import { useState, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import type { ResumeAnalysis, ResumeSkill } from "@shared/schema";
import { Upload, FileText, Sparkles, AlertTriangle, TrendingUp, Lightbulb } from "lucide-react";

export function ResumeAnalyzer() {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [currentCourse, setCurrentCourse] = useState("");
  const [desiredRole, setDesiredRole] = useState("");
  const [result, setResult] = useState<ResumeAnalysis | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const mutation = useMutation({
    mutationFn: async () => {
      if (!file) throw new Error("No file selected");
      const form = new FormData();
      form.append("file", file);
      if (currentCourse) form.append("currentCourse", currentCourse);
      if (desiredRole) form.append("desiredRole", desiredRole);

      const API_BASE = import.meta.env.VITE_APP_BACKEND_URL || (typeof window !== "undefined" && window.location.port === "5173" ? "http://localhost:8005" : window.location.origin);
      const res = await fetch(`${API_BASE}/api/resume/analyze`, {
        method: "POST",
        body: form,
        credentials: "include",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Failed to analyze resume");
      }
      return (await res.json()) as ResumeAnalysis;
    },
    onSuccess: (data) => {
      setResult(data);
      toast({ title: "Analysis complete", description: "Your resume was analyzed successfully." });
    },
    onError: (err: any) => {
      toast({ title: "Analysis failed", description: err?.message || "Please try again.", variant: "destructive" });
    },
  });

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    setFile(f);
  };

  const levelColor = (level: ResumeSkill["level"]) => {
    switch (level) {
      case "Novice":
      case "Beginner":
        return "bg-rose-500/20 text-rose-300 border-rose-400/30";
      case "Intermediate":
        return "bg-amber-500/20 text-amber-300 border-amber-400/30";
      case "Advanced":
        return "bg-emerald-500/20 text-emerald-300 border-emerald-400/30";
      case "Expert":
        return "bg-indigo-500/20 text-indigo-300 border-indigo-400/30";
      default:
        return "bg-gray-700/40 text-gray-300 border-gray-600";
    }
  };

  const levelToPercent = (level: ResumeSkill["level"]) => {
    switch (level) {
      case "Novice": return 10;
      case "Beginner": return 30;
      case "Intermediate": return 55;
      case "Advanced": return 80;
      case "Expert": return 95;
      default: return 0;
    }
  };

  const reset = () => {
    setResult(null);
    setFile(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <Card className="bg-card border border-border backdrop-blur-glass">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-foreground flex items-center gap-2">
          <Upload className="text-purple-400" />
          Upload Resume for Skill Analysis
        </CardTitle>
        {result && (
          <Button variant="outline" onClick={reset} className="border-border text-foreground/80 hover:bg-secondary/50">
            Reset
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="md:col-span-2 flex flex-wrap items-center gap-3 min-w-0">
            <input
              ref={inputRef}
              type="file"
              accept=".pdf,application/pdf,.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.txt,text/plain"
              onChange={onFileChange}
              className="w-full sm:w-auto max-w-full text-sm text-foreground file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700"
            />
            {file ? (
              <span className="text-muted-foreground flex items-center gap-2 flex-1 truncate">
                <FileText size={16} /> {file.name}
              </span>
            ) : (
              <span className="text-muted-foreground">PDF, DOCX, or TXT (max 5MB)</span>
            )}
          </div>
          <div className="flex gap-2 justify-end">
            <Button
              onClick={() => mutation.mutate()}
              disabled={!file || mutation.isPending}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              {mutation.isPending ? "Analyzing..." : "Analyze"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input
            type="text"
            placeholder="Current course (optional)"
            value={currentCourse}
            onChange={(e) => setCurrentCourse(e.target.value)}
            className="w-full max-w-full px-3 py-2 rounded bg-secondary border border-border text-foreground placeholder:text-muted-foreground"
          />
          <input
            type="text"
            placeholder="Desired role (optional)"
            value={desiredRole}
            onChange={(e) => setDesiredRole(e.target.value)}
            className="w-full max-w-full px-3 py-2 rounded bg-secondary border border-border text-foreground placeholder:text-muted-foreground"
          />
        </div>

        {!result && (
          <div className="text-sm text-muted-foreground">
            Upload your resume to extract and assess your skills. We infer your level per skill from projects, experience, and certifications.
          </div>
        )}

        {result && (
          <div className="space-y-4">
            <div className="space-y-1">
              <div className="text-foreground font-semibold">Summary</div>
              <p className="text-foreground/90">{result.summary}</p>
              <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                {result.primaryRole && <Badge variant="outline" className="border-blue-400/30 text-blue-300 bg-blue-500/10">Role: {result.primaryRole}</Badge>}
                {typeof result.totalExperienceYears === "number" && <Badge variant="outline" className="border-emerald-400/30 text-emerald-300 bg-emerald-500/10">Exp: {result.totalExperienceYears} yrs</Badge>}
              </div>
            </div>

            {/* Where It Feels Generic */}
            {((result as any).genericPoints || []).length > 0 && (
              <div className="p-4 rounded-lg border border-orange-500/20 bg-orange-500/5">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-orange-400" />
                  <div className="text-foreground font-semibold text-sm">Where It Feels Generic</div>
                </div>
                <ul className="space-y-1.5">
                  {((result as any).genericPoints as string[]).map((pt, i) => (
                    <li key={i} className="text-sm text-orange-200/80 flex gap-2">
                      <span className="text-orange-400 mt-0.5">•</span>
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Top Skills — Card Grid */}
            {(() => {
              const advancedSkills = result.skills.filter(s => s.level === "Advanced" || s.level === "Expert");
              const groupedByCategory = advancedSkills.reduce((acc, skill) => {
                const cat = skill.category || "Other";
                if (!acc[cat]) acc[cat] = [];
                acc[cat].push(skill);
                return acc;
              }, {} as Record<string, typeof advancedSkills>);

              return advancedSkills.length > 0 ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-foreground font-semibold">Top Skills</div>
                    <span className="text-xs text-muted-foreground">
                      {advancedSkills.length} advanced/expert skills
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {Object.entries(groupedByCategory).map(([category, skills]) => (
                      <div key={category} className="p-4 rounded-lg border border-border bg-secondary/40 flex flex-col gap-3">
                        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{category}</div>
                        <div className="flex flex-wrap gap-2">
                          {skills.map((s, idx) => (
                            <div
                              key={idx}
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs ${levelColor(s.level)}`}
                              title={s.evidence || `${s.years ? s.years + ' years' : ''}`}
                            >
                              <span className="font-medium">{s.name}</span>
                              {s.level === "Expert" && (
                                <Sparkles className="h-3 w-3 text-indigo-400" />
                              )}
                              {typeof s.years === "number" && (
                                <span className="opacity-60">{s.years}y</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground p-3 rounded border border-border bg-secondary/30">
                  No advanced or expert skills detected. Continue building experience to unlock your top skills.
                </div>
              );
            })()}

            {/* Gaps — Prominent Section */}
            {(result.gaps || []).length > 0 && (
              <div className="p-4 rounded-lg border border-amber-500/30 bg-amber-500/5">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="h-4 w-4 text-amber-400" />
                  <div className="text-foreground font-semibold text-sm">Areas to Improve</div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(result.gaps || []).map((g, i) => (
                    <div key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-400/30 bg-amber-500/10 text-amber-300 text-sm font-medium">
                      {g}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Strengths & Recommendations */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-4 rounded-lg border border-emerald-500/20 bg-emerald-500/5">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="h-4 w-4 text-emerald-400" />
                  <div className="text-foreground font-semibold text-sm">Strengths</div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(result.strengths || []).map((s, i) => (
                    <Badge key={i} variant="outline" className="border-emerald-400/30 text-emerald-300 bg-emerald-500/10 text-xs font-medium">{s}</Badge>
                  ))}
                </div>
              </div>
              <div className="p-4 rounded-lg border border-blue-500/20 bg-blue-500/5">
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb className="h-4 w-4 text-blue-400" />
                  <div className="text-foreground font-semibold text-sm">Recommendations</div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(result.recommendations || []).map((r, i) => (
                    <Badge key={i} variant="outline" className="border-blue-400/30 text-blue-300 bg-blue-500/10 text-xs font-medium">{r}</Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default ResumeAnalyzer;
