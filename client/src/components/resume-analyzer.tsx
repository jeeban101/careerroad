import { useState, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import type { ResumeAnalysis, ResumeSkill } from "@shared/schema";
import { Upload, FileText, Sparkles } from "lucide-react";

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

      const res = await fetch("/api/resume/analyze", {
        method: "POST",
        body: form,
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
    <Card className="bg-gray-900/80 border-purple-500/30 backdrop-blur-glass">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-white flex items-center gap-2">
          <Upload className="text-purple-400" />
          Upload Resume for Skill Analysis
        </CardTitle>
        {result && (
          <Button variant="outline" onClick={reset} className="border-gray-600 text-gray-300 hover:bg-white/10">
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
              className="w-full sm:w-auto max-w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700"
            />
            {file ? (
              <span className="text-gray-400 flex items-center gap-2 flex-1 truncate">
                <FileText size={16} /> {file.name}
              </span>
            ) : (
              <span className="text-gray-500">PDF, DOCX, or TXT (max 5MB)</span>
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
            className="w-full max-w-full px-3 py-2 rounded bg-gray-800 border border-gray-700 text-gray-200 placeholder:text-gray-500"
          />
          <input
            type="text"
            placeholder="Desired role (optional)"
            value={desiredRole}
            onChange={(e) => setDesiredRole(e.target.value)}
            className="w-full max-w-full px-3 py-2 rounded bg-gray-800 border border-gray-700 text-gray-200 placeholder:text-gray-500"
          />
        </div>

        {!result && (
          <div className="text-sm text-gray-400">
            Upload your resume to extract and assess your skills. We infer your level per skill from projects, experience, and certifications.
          </div>
        )}

        {result && (
          <div className="space-y-4">
            <div className="space-y-1">
              <div className="text-white font-semibold">Summary</div>
              <p className="text-gray-300">{result.summary}</p>
              <div className="flex flex-wrap gap-2 text-sm text-gray-400">
                {result.primaryRole && <Badge variant="outline" className="border-blue-400/30 text-blue-300 bg-blue-500/10">Role: {result.primaryRole}</Badge>}
                {typeof result.totalExperienceYears === "number" && <Badge variant="outline" className="border-emerald-400/30 text-emerald-300 bg-emerald-500/10">Exp: {result.totalExperienceYears} yrs</Badge>}
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-white font-semibold">Skills</div>
              <div className="space-y-2">
                {result.skills.map((s, idx) => (
                  <div key={idx} className="p-3 rounded border border-gray-700 bg-gray-800/60">
                    <div className="flex items-center justify-between">
                      <div className="text-gray-200 font-medium">{s.name}</div>
                      <Badge variant="outline" className={levelColor(s.level)}>{s.level}</Badge>
                    </div>
                    <div className="mt-2">
                      <Progress value={levelToPercent(s.level)} className="h-2 bg-white/10" />
                    </div>
                    <div className="mt-2 text-xs text-gray-400 flex flex-wrap gap-2">
                      {typeof s.years === "number" && <span className="px-2 py-0.5 rounded bg-gray-700/60 border border-gray-600">{s.years} yrs</span>}
                      {typeof s.confidence === "number" && <span className="px-2 py-0.5 rounded bg-gray-700/60 border border-gray-600">conf {Math.round(s.confidence * 100)}%</span>}
                      {s.category && <span className="px-2 py-0.5 rounded bg-gray-700/60 border border-gray-600">{s.category}</span>}
                    </div>
                    {s.evidence && (
                      <div className="mt-2 text-xs text-gray-400">Evidence: {s.evidence}</div>
                    )}
                    {s.keywords && s.keywords.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {s.keywords.slice(0, 8).map((k, i) => (
                          <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-purple-600/10 text-purple-300 border border-purple-500/20">{k}</span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="md:col-span-1 space-y-2">
                <div className="text-white font-semibold">Strengths</div>
                <ul className="list-disc list-inside text-gray-300 text-sm space-y-1">
                  {(result.strengths || ["Clear fundamentals", "Hands-on projects", "Good documentation"]).map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
              <div className="md:col-span-1 space-y-2">
                <div className="text-white font-semibold">Gaps</div>
                <ul className="list-disc list-inside text-gray-300 text-sm space-y-1">
                  {(result.gaps || ["Advanced system design", "End-to-end testing", "Cloud deployment"]).map((g, i) => (
                    <li key={i}>{g}</li>
                  ))}
                </ul>
              </div>
              <div className="md:col-span-1 space-y-2">
                <div className="text-white font-semibold">Recommendations</div>
                <ul className="list-disc list-inside text-gray-300 text-sm space-y-1">
                  {(result.recommendations || ["Build a full-stack project with tests", "Learn Docker basics", "Contribute to OSS"]).map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default ResumeAnalyzer;
