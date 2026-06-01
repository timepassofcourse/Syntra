import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { LineChart, BarChart, TrendingUp, Sparkles, Heart, Briefcase, GraduationCap } from "lucide-react";

export const Route = createFileRoute("/app/analytics")({
  component: AnalyticsPage,
});

function AnalyticsPage() {
  // Store States
  const tasks = useStore((s) => s.tasks);
  const attendance = useStore((s) => s.attendance);
  const moodLogs = useStore((s) => s.moodLogs);
  const sleepLogs = useStore((s) => s.sleepLogs);
  const placement = useStore((s) => s.placementProfile);

  // Local UI States
  const [activeTab, setActiveTab] = useState<"academic" | "wellness" | "placement">("academic");

  // Calculations
  const completedTasks = tasks.filter(t => t.completed).length;
  const pendingTasks = tasks.filter(t => !t.completed).length;
  const totalTasks = completedTasks + pendingTasks;
  const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 100;

  const avgAttendance = attendance.length
    ? Math.round(attendance.reduce((sum, a) => sum + (a.total ? (a.attended / a.total) * 100 : 100), 0) / attendance.length)
    : 80;

  const avgStress = moodLogs.length
    ? (moodLogs.reduce((sum, m) => sum + m.stressLevel, 0) / moodLogs.length).toFixed(1)
    : "4.5";

  const avgSleep = sleepLogs.length
    ? (sleepLogs.reduce((sum, s) => sum + s.hours, 0) / sleepLogs.length).toFixed(1)
    : "7.0";

  return (
    <div className="space-y-6 max-w-7xl select-none">
      
      {/* Upper header controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Academic & Personal Analytics</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Explore focus trends, grades averages, burnout indicators, and placement ratings.</p>
        </div>

        <div className="flex gap-1 bg-card border p-1 rounded-xl">
          <Button variant={activeTab === "academic" ? "primary" : "ghost"} size="sm" onClick={() => setActiveTab("academic")} className="h-8">
            <GraduationCap className="h-4 w-4 mr-1.5" /> Academic & Focus
          </Button>
          <Button variant={activeTab === "wellness" ? "primary" : "ghost"} size="sm" onClick={() => setActiveTab("wellness")} className="h-8">
            <Heart className="h-4 w-4 mr-1.5" /> Wellness & Mood
          </Button>
          <Button variant={activeTab === "placement" ? "primary" : "ghost"} size="sm" onClick={() => setActiveTab("placement")} className="h-8">
            <Briefcase className="h-4 w-4 mr-1.5" /> Placements Readiness
          </Button>
        </div>
      </div>

      {/* Main Tab details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* VIEW 1: ACADEMIC & FOCUS */}
        {activeTab === "academic" && (
          <>
            <div className="lg:col-span-2 bg-card border rounded-2xl p-5 shadow-card space-y-6 text-left">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-sm tracking-tight text-muted-foreground uppercase">Study Hours & GPA Trends</h3>
                <TrendingUp className="h-4.5 w-4.5 text-primary" />
              </div>

              {/* Responsive SVG line graph */}
              <div className="h-56 w-full bg-slate-900/10 dark:bg-slate-950/20 rounded-xl relative p-4 border border-muted/50">
                <svg width="100%" height="100%" viewBox="0 0 500 200" preserveAspectRatio="none">
                  {/* Grid Lines */}
                  <line x1="0" y1="50" x2="500" y2="50" stroke="rgba(148, 163, 184, 0.1)" strokeWidth="1" />
                  <line x1="0" y1="100" x2="500" y2="100" stroke="rgba(148, 163, 184, 0.1)" strokeWidth="1" />
                  <line x1="0" y1="150" x2="500" y2="150" stroke="rgba(148, 163, 184, 0.1)" strokeWidth="1" />

                  {/* Area fill gradient */}
                  <defs>
                    <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  
                  {/* Focus line path */}
                  <path 
                    d="M 20 180 Q 100 130 180 140 T 340 70 T 480 50" 
                    fill="none" 
                    stroke="#6366f1" 
                    strokeWidth="3.5" 
                  />
                  <path 
                    d="M 20 180 Q 100 130 180 140 T 340 70 T 480 50 L 480 190 L 20 190 Z" 
                    fill="url(#areaGrad)" 
                  />

                  {/* Nodes */}
                  <circle cx="20" cy="180" r="4.5" fill="#6366f1" />
                  <circle cx="120" cy="142" r="4.5" fill="#6366f1" />
                  <circle cx="250" cy="110" r="4.5" fill="#6366f1" />
                  <circle cx="360" cy="65" r="4.5" fill="#6366f1" />
                  <circle cx="480" cy="50" r="4.5" fill="#6366f1" />
                </svg>

                {/* X Axis tags */}
                <div className="flex justify-between text-[9px] text-muted-foreground font-mono font-bold pt-1.5 px-2">
                  <span>Semester 2</span>
                  <span>Semester 3</span>
                  <span>Semester 4</span>
                  <span>Semester 5</span>
                  <span>Current Semester</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border bg-muted/20">
                  <p className="text-[10px] text-muted-foreground font-bold uppercase">Average GPA</p>
                  <p className="text-2xl font-black text-primary mt-0.5">8.92 / 10</p>
                  <p className="text-[9px] text-muted-foreground mt-1">Weighted performance trends</p>
                </div>
                <div className="p-4 rounded-xl border bg-muted/20">
                  <p className="text-[10px] text-muted-foreground font-bold uppercase">Focus Consistency</p>
                  <p className="text-2xl font-black text-success mt-0.5">High</p>
                  <p className="text-[9px] text-muted-foreground mt-1">Daily study routines stable</p>
                </div>
              </div>
            </div>

            {/* Side stats */}
            <div className="bg-card border rounded-2xl p-5 shadow-card text-left space-y-4 h-fit">
              <h3 className="font-bold text-xs uppercase text-muted-foreground tracking-wider">Metrics Diagnostics</h3>
              <div className="space-y-3.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Class Attendance Rate:</span>
                  <span className="font-bold">{avgAttendance}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Assignment Completion:</span>
                  <span className="font-bold">{taskCompletionRate}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Completed Tasks:</span>
                  <span className="font-bold text-success">{completedTasks}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Overdue Deadlines:</span>
                  <span className="font-bold text-destructive">{pendingTasks}</span>
                </div>
              </div>
            </div>
          </>
        )}

        {/* VIEW 2: WELLNESS & MOOD */}
        {activeTab === "wellness" && (
          <>
            <div className="lg:col-span-2 bg-card border rounded-2xl p-5 shadow-card space-y-6 text-left">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-sm tracking-tight text-muted-foreground uppercase">Burnout & Mood History</h3>
                <Heart className="h-4.5 w-4.5 text-primary" />
              </div>

              {/* Stress vs sleep deficit area chart */}
              <div className="h-56 w-full bg-slate-900/10 dark:bg-slate-950/20 rounded-xl relative p-4 border border-muted/50">
                <svg width="100%" height="100%" viewBox="0 0 500 200" preserveAspectRatio="none">
                  {/* Grid Lines */}
                  <line x1="0" y1="50" x2="500" y2="50" stroke="rgba(148, 163, 184, 0.08)" strokeWidth="1" />
                  <line x1="0" y1="100" x2="500" y2="100" stroke="rgba(148, 163, 184, 0.08)" strokeWidth="1" />
                  <line x1="0" y1="150" x2="500" y2="150" stroke="rgba(148, 163, 184, 0.08)" strokeWidth="1" />

                  {/* Stress curve (Red) */}
                  <path 
                    d="M 20 120 C 100 160, 180 80, 300 150 S 420 50, 480 80" 
                    fill="none" 
                    stroke="#f43f5e" 
                    strokeWidth="3" 
                  />
                  {/* Sleep curve (Teal) */}
                  <path 
                    d="M 20 80 C 120 70, 220 140, 320 80 S 420 120, 480 60" 
                    fill="none" 
                    stroke="#0d9488" 
                    strokeWidth="3.5" 
                  />
                </svg>

                {/* Legend logs */}
                <div className="flex justify-center gap-6 text-[10px] pt-1">
                  <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded bg-rose-500" /> Stress Indices</span>
                  <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded bg-teal-500" /> Sleep Hours</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border bg-muted/20">
                  <p className="text-[10px] text-muted-foreground font-bold uppercase">Stress Index Average</p>
                  <p className="text-2xl font-black text-info mt-0.5">{avgStress} / 10</p>
                </div>
                <div className="p-4 rounded-xl border bg-muted/20">
                  <p className="text-[10px] text-muted-foreground font-bold uppercase">Sleep Hours Average</p>
                  <p className="text-2xl font-black text-success mt-0.5">{avgSleep} Hours</p>
                </div>
              </div>
            </div>

            <div className="bg-card border rounded-2xl p-5 shadow-card text-left space-y-4 h-fit">
              <h3 className="font-bold text-xs uppercase text-muted-foreground tracking-wider">Burnout Diagnostics</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Mood logs indicate stable emotional trends. Cognitive load is balanced. Muting study room alerts is currently not required.
              </p>
            </div>
          </>
        )}

        {/* VIEW 3: PLACEMENT READINESS */}
        {activeTab === "placement" && (
          <>
            <div className="lg:col-span-2 bg-card border rounded-2xl p-5 shadow-card space-y-6 text-left">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-sm tracking-tight text-muted-foreground uppercase">Placement Skill progress</h3>
                <Briefcase className="h-4.5 w-4.5 text-primary" />
              </div>

              {/* Skills vertical progress bars */}
              <div className="space-y-4">
                {placement.skills.map((skill) => (
                  <div key={skill.name} className="space-y-1.5 text-xs">
                    <div className="flex justify-between font-bold">
                      <span>{skill.name}</span>
                      <span>{skill.level}% Ready</span>
                    </div>
                    <div className="w-full bg-muted h-3 rounded-full overflow-hidden">
                      <div 
                        className="bg-gradient-primary h-full transition-all" 
                        style={{ width: `${skill.level}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-card border rounded-2xl p-5 shadow-card text-left space-y-4 h-fit">
              <h3 className="font-bold text-xs uppercase text-muted-foreground tracking-wider">Job Readiness</h3>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ATS Resume Score:</span>
                  <span className="font-bold">{placement.atsScore || 0}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">DSA Problems Solved:</span>
                  <span className="font-bold text-primary">{placement.dsaSolved}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Interview Practice count:</span>
                  <span className="font-bold text-success">3 mock interviews</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Readiness Factor:</span>
                  <span className="font-bold text-warning">{placement.readinessScore}%</span>
                </div>
              </div>
            </div>
          </>
        )}

      </div>
    </div>
  );
}
