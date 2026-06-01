import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Briefcase,
  Sparkles,
  Upload,
  Brain,
  MessageSquare,
  ChevronRight,
  TrendingUp,
  AlertTriangle,
  Play,
  Award,
} from "lucide-react";
import { toast } from "sonner";
import { callGemini } from "@/lib/gemini";

export const Route = createFileRoute("/app/placements")({
  component: PlacementsPage,
});

function PlacementsPage() {
  // Store States
  const placement = useStore((s) => s.placementProfile);
  const uploadResume = useStore((s) => s.uploadResumeMock);
  const updateSkills = useStore((s) => s.updatePlacementSkills);
  const incrementDsa = useStore((s) => s.incrementDsa);
  const profile = useStore((s) => s.profile);
  const updateAtsResult = useStore((s) => s.updateAtsResult);

  // Local UI States
  const [selectedCompany, setSelectedCompany] = useState<string>("Google");
  const [atsAuditing, setAtsAuditing] = useState(false);
  
  // Interview Simulator States
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [interviewText, setInterviewText] = useState("");
  const [interviewLogs, setInterviewLogs] = useState<{ sender: "interviewer" | "student"; text: string }[]>([]);
  const [interviewLoading, setInterviewLoading] = useState(false);

  // Mock Resume file upload action
  const handleResumeSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    toast.info("Uploading resume doc...");
    setTimeout(() => {
      uploadResume(file.name);
      toast.success("Resume uploaded and parsed!");
    }, 1200);
  };

  const runAtsAudit = async () => {
    setAtsAuditing(true);
    toast.info("Auditing resume semantics against ATS guidelines...");
    try {
      const prompt = `Perform a comprehensive ATS compatibility audit of a student's SDE resume.
Candidate details:
- Target Role: SDE
- Selected Prep Target: ${selectedCompany}
- Resume uploaded filename: ${placement.resumeName || "Alex_Mercer_Resume_V2.pdf"}
- Target skills profile gaps: ${placement.skills.filter(s => s.level < 50).map(s => s.name).join(", ")}

Write your evaluation in the following exact format:
SCORE: [a number from 40 to 98]
FEEDBACK: [Provide a brief, clear bulleted list of 2-3 actionable steps to increase the score. Focus on missing keywords, bullet layout structure, or programming languages.]

Return ONLY the response matching this format.`;

      const result = await callGemini(prompt);
      
      let score = 75;
      let feedback = "Structure sections using bullet points. Include missing languages like TypeScript and Node.js.";
      
      const scoreMatch = result.match(/SCORE:\s*(\d+)/i);
      if (scoreMatch) {
        score = parseInt(scoreMatch[1], 10);
      }
      
      const feedbackMatch = result.match(/FEEDBACK:\s*([\s\S]*)/i);
      if (feedbackMatch) {
        feedback = feedbackMatch[1].trim();
      }
      
      updateAtsResult(score, feedback);
      toast.success(`ATS Audit completed! Score: ${score}%`);
    } catch (e) {
      console.error(e);
      toast.error("Failed to run real ATS audit. Using simulated defaults.");
      updateAtsResult(78, "Check formatting and include keywords like Node.js and TypeScript.");
    } finally {
      setAtsAuditing(false);
    }
  };

  // Interview simulator loops
  const startMockInterview = async () => {
    setInterviewStarted(true);
    setInterviewLoading(true);
    try {
      const prompt = `You are a technical recruiter conducting a mock interview for SDE at ${selectedCompany} for target role SDE.
Introduce yourself, welcome the student, and ask an initial relevant technical SDE question based on database index design or CPU scheduling or system programming. Keep it brief.`;
      const welcome = await callGemini(prompt);
      setInterviewLogs([
        {
          sender: "interviewer",
          text: welcome || "Welcome. Let's start the mock SDE interview. Explain the difference between process and thread in Operating Systems, and how thread scheduling works.",
        },
      ]);
    } catch (e) {
      setInterviewLogs([
        {
          sender: "interviewer",
          text: "Welcome. Let's start the mock SDE interview. Explain the difference between process and thread in Operating Systems, and how thread scheduling works.",
        },
      ]);
    } finally {
      setInterviewLoading(false);
    }
  };

  const handleInterviewMessageSubmit = async () => {
    if (!interviewText.trim()) return;

    const userMsg = { sender: "student" as const, text: interviewText };
    setInterviewLogs((prev) => [...prev, userMsg]);
    const currentMsgText = interviewText;
    setInterviewText("");
    setInterviewLoading(true);

    try {
      const historyContext = interviewLogs.map(l => `${l.sender === "student" ? "Candidate" : "Interviewer"}: ${l.text}`).join("\n");
      const prompt = `You are a technical recruiter conducting a mock interview for target role SDE at ${selectedCompany}.
Here is the conversation history:
${historyContext}
Candidate's response: ${currentMsgText}

Briefly evaluate the candidate's answer, provide constructive feedback, and then ask the next relevant follow-up technical question (covering topics like DSA, threading, DB transactions, or simple distributed system design). Keep your response professional, engaging, and under 2-3 paragraphs.`;

      const responseText = await callGemini(prompt);
      setInterviewLogs((prev) => [...prev, { sender: "interviewer", text: responseText }]);
    } catch (e) {
      console.error(e);
      toast.error("Failed to connect to simulator backend");
      setInterviewLogs((prev) => [...prev, { sender: "interviewer", text: "I apologize, there was a connection glitch. Let's continue. Can you describe how virtual memory paging handles frames?" }]);
    } finally {
      setInterviewLoading(false);
    }
  };

  const getCompanyRoadmap = () => {
    if (selectedCompany === "Google") {
      return [
        { topic: "Data Structures & Algorithms", detail: "Focus on Trees, Graph DFS/BFS, topological sorting, and heap problems." },
        { topic: "System Design", detail: "Review rate limiters, load balancers, and cache invalidation policies." },
        { topic: "Behavioral interview", detail: "Draft 3 instances of conflict resolution and tech leadership logs." },
      ];
    }
    if (selectedCompany === "Microsoft") {
      return [
        { topic: "System Programming & OS", detail: "Review multithreading syntax, memory segmentation, virtual address translation." },
        { topic: "DSA worksheets", detail: "Practice double-pointer linked lists, binary searches, heap maps." },
        { topic: "Core Dev", detail: "Focus on REST architectures, relational schemas, indexing rules." },
      ];
    }
    // Amazon
    return [
      { topic: "Leadership Principles", detail: "Memorize Customer Obsession, Ownership, and Bias for Action models." },
      { topic: "DSA practice", detail: "Practice sliding window arrays, dynamic programming recursion, stack queues." },
      { topic: "Object Oriented Design", detail: "Study class diagram abstractions, design patterns, polymorphism." },
    ];
  };

  return (
    <div className="space-y-6 max-w-7xl select-none">
      
      {/* Page upper headers */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Placement Hub</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Scrutinize resumes for ATS matching, review DSA progress, and simulate mock SDE interviews.</p>
        </div>

        <div className="flex gap-2">
          {/* Resume Upload trigger */}
          <div className="relative">
            <input 
              type="file" 
              accept=".pdf,.doc,.docx"
              onChange={handleResumeSelect}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" 
            />
            <Button variant="outline" size="sm" className="h-9 gap-1.5">
              <Upload className="h-4 w-4" /> Upload Resume
            </Button>
          </div>
          
          <Button onClick={runAtsAudit} disabled={atsAuditing || !placement.resumeUploaded} className="h-9">
            {atsAuditing ? "Auditing..." : "Audit Resume ATS"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* RESUME & DSA METRICS COLUMN */}
        <div className="space-y-6 text-left">
          
          {/* Resume ATS Details */}
          <div className="bg-card border rounded-2xl p-5 shadow-card space-y-4">
            <h3 className="font-bold text-sm tracking-tight text-primary flex items-center gap-1.5">
              <Award className="h-4.5 w-4.5" /> Resume ATS Score
            </h3>

            {placement.resumeUploaded ? (
              <div className="space-y-3">
                <div className="flex justify-between items-center bg-muted/40 p-4 rounded-xl border">
                  <div>
                    <p className="text-xs font-bold truncate max-w-[150px]">{placement.resumeName}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Uploaded PDF format</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black text-primary">{placement.atsScore}%</p>
                    <span className="text-[9px] text-muted-foreground font-semibold uppercase">Compatibility</span>
                  </div>
                </div>
                
                {placement.atsFeedback ? (
                  <div className="bg-primary/5 rounded-xl p-3 border border-primary/20 text-[11px] leading-relaxed text-muted-foreground whitespace-pre-line text-left">
                    <span className="font-bold flex items-center gap-1 mb-1 text-primary">
                      <Sparkles className="h-3.5 w-3.5" /> ATS Evaluation:
                    </span>
                    {placement.atsFeedback}
                  </div>
                ) : (
                  placement.atsScore && placement.atsScore < 80 && (
                    <div className="bg-warning/10 rounded-xl p-3 border border-warning/25 text-[11px] leading-relaxed text-warning-foreground">
                      <span className="font-bold flex items-center gap-1 mb-1 text-warning">
                        <AlertTriangle className="h-3.5 w-3.5" /> ATS Warnings:
                      </span>
                      Missing standard keywords like 'TypeScript' or 'System Design'. Structure resume sections using bullet points.
                    </div>
                  )
                )}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground py-8 text-center border border-dashed rounded-xl">
                No resume on record. Upload resume PDF to unlock ATS evaluations.
              </p>
            )}
          </div>

          {/* DSA solved statistics */}
          <div className="bg-card border rounded-2xl p-5 shadow-card space-y-4">
            <h3 className="font-bold text-sm tracking-tight text-primary flex items-center gap-1.5">
              <TrendingUp className="h-4.5 w-4.5" /> DSA Progress Tracker
            </h3>

            <div className="space-y-3">
              <div className="flex justify-between text-xs font-bold font-mono">
                <span>Solved: {placement.dsaSolved}</span>
                <span>Goal: {placement.dsaTotal}</span>
              </div>
              <Progress value={(placement.dsaSolved / placement.dsaTotal) * 100} className="h-2" />

              <div className="flex gap-2 justify-end pt-1">
                <Button size="xs" onClick={incrementDsa} className="text-[10px] font-bold">
                  +1 Problem Solved
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* SKILL GAP & COMPANY SPECIFIC ROADMAPS */}
        <div className="bg-card border rounded-2xl p-5 shadow-card text-left space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <h3 className="font-bold text-sm tracking-tight text-primary flex items-center gap-1.5">
              <Brain className="h-4.5 w-4.5" /> Target Role Skill Gaps
            </h3>
            <span className="text-[10px] bg-primary/10 text-primary px-2.5 py-0.5 rounded-full font-bold">
              {profile.targetRoles?.[0] || "SDE"}
            </span>
          </div>

          <div className="space-y-3 text-xs">
            {placement.skills.map((skill) => {
              const isGap = skill.level < 50;
              return (
                <div key={skill.name} className="space-y-1">
                  <div className="flex justify-between font-medium">
                    <span className="flex items-center gap-1.5">
                      {skill.name}
                      {isGap && <span className="text-[8px] bg-destructive/15 text-destructive px-1 rounded font-bold uppercase">Gap</span>}
                    </span>
                    <span className="font-semibold text-muted-foreground">{skill.level}%</span>
                  </div>
                  <Progress value={skill.level} className={`h-1.5 ${isGap ? "bg-destructive/10" : ""}`} />
                </div>
              );
            })}
          </div>

          {/* Company-specific tracks */}
          <div className="pt-4 border-t space-y-3">
            <Label className="text-xs font-bold uppercase text-muted-foreground">Select Preparation Track</Label>
            <div className="flex gap-1.5">
              {["Google", "Microsoft", "Amazon"].map((comp) => (
                <button
                  key={comp}
                  onClick={() => setSelectedCompany(comp)}
                  className={`flex-1 py-1.5 text-[10px] rounded-lg border font-bold capitalize transition ${
                    selectedCompany === comp ? "bg-primary text-white border-primary" : "bg-muted/30 hover:bg-muted/50"
                  }`}
                >
                  {comp}
                </button>
              ))}
            </div>

            <div className="space-y-2 pt-1.5">
              {getCompanyRoadmap().map((step, idx) => (
                <div key={idx} className="p-2.5 rounded-lg bg-muted/20 border text-xs">
                  <p className="font-bold text-primary">{step.topic}</p>
                  <p className="text-muted-foreground mt-0.5 text-[11px] leading-relaxed">{step.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* MOCK INTERVIEW SIMULATOR */}
        <div className="bg-card border rounded-2xl p-5 shadow-card text-left space-y-4 h-fit flex flex-col justify-between">
          <div className="border-b pb-3 flex items-center justify-between">
            <h3 className="font-bold text-sm tracking-tight text-primary flex items-center gap-1.5">
              <MessageSquare className="h-4.5 w-4.5 animate-pulse" /> Interview Simulator
            </h3>
            <span className="text-[9px] text-muted-foreground uppercase font-bold">Mock chat</span>
          </div>

          {!interviewStarted ? (
            <div className="text-center py-20 space-y-3">
              <Brain className="h-10 w-10 mx-auto text-primary opacity-40 animate-pulse" />
              <p className="text-xs text-muted-foreground">Practice real technical SDE prompts and receive grading reviews.</p>
              <Button size="sm" onClick={startMockInterview} className="gap-1.5">
                <Play className="h-3.5 w-3.5 fill-white" /> Start Mock Interview
              </Button>
            </div>
          ) : (
            <div className="space-y-3 flex-grow flex flex-col justify-between h-[340px]">
              <div className="flex-1 overflow-y-auto space-y-2.5 p-2 bg-muted/20 border rounded-xl max-h-[280px]">
                {interviewLogs.map((m, idx) => (
                  <div key={idx} className={`p-2.5 rounded-xl border text-xs leading-normal max-w-[85%] ${
                    m.sender === "student" ? "ml-auto bg-primary text-white border-primary" : "mr-auto bg-card"
                  }`}>
                    <p className="text-[8px] font-bold uppercase opacity-80 mb-0.5">
                      {m.sender === "student" ? "You" : "Syntra Interviewer"}
                    </p>
                    {m.text}
                  </div>
                ))}
                {interviewLoading && (
                  <div className="text-[10px] text-primary animate-pulse font-bold pl-2 pt-1 text-left">
                    Syntra interviewer is generating question...
                  </div>
                )}
              </div>
              
              <div className="flex gap-2 pt-2 border-t">
                <Input 
                  value={interviewText}
                  onChange={(e) => setInterviewText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleInterviewMessageSubmit()}
                  placeholder="Type your explanation..." 
                  className="h-8.5 text-xs" 
                />
                <Button size="sm" onClick={handleInterviewMessageSubmit} className="h-8.5 font-bold">
                  Send
                </Button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
