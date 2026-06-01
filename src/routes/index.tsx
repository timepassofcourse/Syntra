import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Brain,
  Calendar,
  CheckCircle2,
  Timer,
  BookOpen,
  Sparkles,
  ArrowRight,
  Check,
  ShieldAlert,
  Heart,
  Users,
  Compass,
  Mic,
  Search,
  Zap,
  TrendingUp,
  Briefcase,
  FolderOpen,
  MessageSquare,
  HelpCircle,
  BarChart3,
  Library,
  Settings,
  AlertTriangle,
  Play,
  RotateCcw,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Syntra — AI Student Operating System" },
      {
        name: "description",
        content:
          "The ultimate AI-powered cockpit for academic success, placement prep, mental wellness, and real-time student collaboration.",
      },
      { property: "og:title", content: "Syntra — AI Student OS" },
      {
        property: "og:description",
        content: "Centralize your studies, resume audits, safe skips, and wellness logs into one intelligent hub.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20 selection:text-primary">
      <Nav />
      <Hero />
      <HowItWorks />
      <InteractivePreview />
      <Features />
      <FAQSection />
      <Footer />
    </div>
  );
}

function Nav() {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-gradient-primary flex items-center justify-center text-primary-foreground shadow-sm">
            <Brain className="h-5 w-5" />
          </div>
          <span className="font-bold text-xl tracking-tight text-gradient">Syntra</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
          <a href="#workflow" className="hover:text-foreground transition">Workflow</a>
          <a href="#preview" className="hover:text-foreground transition">Live Preview</a>
          <a href="#features" className="hover:text-foreground transition">Core Systems</a>
          <a href="#faq" className="hover:text-foreground transition">FAQ</a>
        </nav>

        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="sm">
            <Link to="/login">Sign In</Link>
          </Button>
          <Button asChild size="sm" className="bg-gradient-primary text-primary-foreground border-0 shadow-md">
            <Link to="/login">Launch Demo <ArrowRight className="ml-1.5 h-4 w-4" /></Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden pt-24 pb-14">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(45rem_50rem_at_50%_-10rem,oklch(0.95_0.03_260),transparent)] dark:bg-[radial-gradient(45rem_50rem_at_50%_-10rem,oklch(0.25_0.05_260/30%),transparent)]" />
      <div className="mx-auto max-w-6xl px-6 text-center">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-accent/80 border border-primary/20 px-4 py-1.5 text-xs font-semibold tracking-wider text-accent-foreground uppercase dark:bg-accent/20">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          Next-Generation Student Cockpit
        </div>

        <h1 className="mt-8 text-5xl sm:text-6xl md:text-7xl font-bold leading-[1.05] tracking-tight">
          The AI-Powered Student
          <br />
          <span className="text-gradient">Operating System</span>
        </h1>

        <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto font-normal">
          Syntra centralizes your academic performance, notes, placements, study rooms, 
          and mental wellness into one beautifully connected ecosystem.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Button asChild size="lg" className="bg-gradient-primary border-0 text-primary-foreground hover:opacity-95 shadow-lg h-12 px-8 rounded-xl">
            <Link to="/login">
              Launch Guest Demo
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" className="h-12 px-8 rounded-xl" asChild>
            <Link to="/login">Sync Supabase DB</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { num: "01", title: "Complete Onboarding", detail: "Answer profile questions on subjects, target careers, and study style. Syntra initializes custom schedules immediately." },
    { num: "02", title: "Connect Backend (Optional)", detail: "Link your Supabase anon keys from Settings. Assignments, study channels, and notes folders immediately sync globally." },
    { num: "03", title: "Synthesize Notes & Code", detail: "Generate revision guides, test quizzes, and resume ATS checks using context-aware Gemini AI integrations." },
    { num: "04", title: "Study & Co-Work", detail: "Create synced study rooms with peer cursor chats, countdown timers, and visual vector whiteboards." },
  ];

  return (
    <section id="workflow" className="py-16 bg-muted/20 border-y">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-semibold tracking-wider text-primary uppercase">How it works</span>
          <h2 className="mt-3 text-3xl font-bold">Four Steps to Cockpit Control</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((st) => (
            <div key={st.num} className="bg-card border rounded-2xl p-5 shadow-sm space-y-3 relative text-left">
              <span className="text-3xl font-extrabold text-primary/10 absolute top-4 right-5">{st.num}</span>
              <h4 className="font-bold text-sm text-primary uppercase tracking-wider">{st.title}</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">{st.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function InteractivePreview() {
  const [activeTab, setActiveTab] = useState<string>("Dashboard");

  const menuItems = [
    { title: "Dashboard", icon: Zap },
    { title: "Assignments", icon: CheckCircle2 },
    { title: "Study Planner", icon: Calendar },
    { title: "Attendance", icon: BookOpen },
    { title: "Smart Notes", icon: FolderOpen },
    { title: "Focus Mode", icon: Timer },
    { title: "Wellness Tracker", icon: Heart },
    { title: "Placement Hub", icon: Briefcase },
    { title: "Study Groups", icon: Users },
    { title: "AI Assistant", icon: MessageSquare },
    { title: "Analytics", icon: BarChart3 },
    { title: "Resource Hub", icon: Library },
    { title: "Settings", icon: Settings },
  ];

  return (
    <section id="preview" className="py-20 bg-background">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center mb-10 max-w-2xl mx-auto">
          <span className="text-xs font-semibold tracking-wider text-primary uppercase">Fully Functional Mockup</span>
          <h2 className="mt-3 text-3xl font-extrabold">Explore Every Syntra Screen</h2>
          <p className="text-xs text-muted-foreground mt-2">Click any sidebar item in the mockup to inspect the high-fidelity page features.</p>
        </div>
        
        <div className="rounded-2xl border bg-card shadow-elevated overflow-hidden text-left border-muted/80">
          {/* Header Mockup */}
          <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/40">
            <div className="flex gap-2">
              <div className="h-3 w-3 rounded-full bg-destructive/60" />
              <div className="h-3 w-3 rounded-full bg-warning/60" />
              <div className="h-3 w-3 rounded-full bg-success/60" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-primary bg-primary/10 px-3 py-0.5 rounded-full">app.syntra.io/app/{activeTab.toLowerCase().replace(" ", "")}</span>
            </div>
            <div className="w-12" />
          </div>

          <div className="flex min-h-[460px]">
            {/* Sidebar Mockup */}
            <aside className="w-48 border-r bg-muted/10 p-3 space-y-1 hidden md:block shrink-0">
              <div className="flex items-center gap-2 px-2 py-1.5 mb-4">
                <div className="h-6 w-6 rounded-lg bg-gradient-primary flex items-center justify-center text-[10px] text-white">S</div>
                <span className="font-bold text-sm tracking-tight">Syntra OS</span>
              </div>
              {menuItems.map((it) => (
                <div
                  key={it.title}
                  onClick={() => setActiveTab(it.title)}
                  className={`flex items-center gap-2.5 px-3 py-1.8 rounded-lg text-xs font-medium cursor-pointer transition ${
                    activeTab === it.title 
                      ? "bg-primary text-primary-foreground shadow-sm" 
                      : "text-muted-foreground hover:bg-muted/50"
                  }`}
                >
                  <it.icon className="h-4 w-4 shrink-0" />
                  <span>{it.title}</span>
                </div>
              ))}
            </aside>

            {/* Mockup Right Panel Display content based on activeTab */}
            <div className="flex-1 p-6 space-y-6 overflow-y-auto max-h-[500px]">
              
              {/* DASHBOARD TAB PREVIEW */}
              {activeTab === "Dashboard" && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between border-b pb-4">
                    <div>
                      <h3 className="font-bold text-base">Dashboard Cockpit</h3>
                      <p className="text-xs text-muted-foreground">Alex Mercer · MIT Branch</p>
                    </div>
                    <span className="text-[10px] px-2.5 py-0.5 bg-success/15 text-success rounded-full font-bold">Academic Score: 88%</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="border rounded-xl p-4 bg-muted/5 space-y-1">
                      <p className="text-[10px] text-muted-foreground font-bold uppercase">Stress Index</p>
                      <p className="text-2xl font-black text-info">3 / 10</p>
                      <p className="text-[9px] text-muted-foreground">Stable (Crisis Mode offline)</p>
                    </div>
                    <div className="border rounded-xl p-4 bg-muted/5 space-y-1">
                      <p className="text-[10px] text-muted-foreground font-bold uppercase">Resume ATS</p>
                      <p className="text-2xl font-black text-warning">78%</p>
                      <p className="text-[9px] text-primary hover:underline cursor-pointer">Verify gaps</p>
                    </div>
                    <div className="border rounded-xl p-4 bg-muted/5 space-y-1">
                      <p className="text-[10px] text-muted-foreground font-bold uppercase">Safe Skip Predictor</p>
                      <p className="text-2xl font-black text-success">Safe to Skip</p>
                      <p className="text-[9px] text-muted-foreground">DBMS attendance is 80%</p>
                    </div>
                  </div>

                  <div className="border rounded-2xl p-4 bg-primary/5 border-primary/20 space-y-2">
                    <h4 className="text-xs font-bold text-primary flex items-center gap-1.5">
                      <Sparkles className="h-4 w-4" /> Daily AI Briefing Diagnostics
                    </h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Slight attendance decline in OS theory (70%). We recommend dedicating study planner block 2 to process thread syncing algorithms. 3 assignments pending this week.
                    </p>
                  </div>
                </div>
              )}

              {/* ASSIGNMENTS TAB PREVIEW */}
              {activeTab === "Assignments" && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between border-b pb-4">
                    <div>
                      <h3 className="font-bold text-base">Assignments Kanban</h3>
                      <p className="text-xs text-muted-foreground">Track deadlines and execute subtasks.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2 border p-3 rounded-xl bg-muted/5">
                      <h4 className="text-[10px] uppercase font-bold text-muted-foreground">To Do (2)</h4>
                      <div className="border rounded-lg p-3 bg-card space-y-2">
                        <span className="text-[8px] bg-destructive/15 text-destructive px-1.5 py-0.5 rounded font-bold uppercase">High</span>
                        <p className="text-xs font-bold">DBMS SQL Lab 5 checklist</p>
                        <p className="text-[9px] text-muted-foreground">Due in 2 days</p>
                      </div>
                    </div>

                    <div className="space-y-2 border p-3 rounded-xl bg-muted/5">
                      <h4 className="text-[10px] uppercase font-bold text-muted-foreground">Completed (1)</h4>
                      <div className="border rounded-lg p-3 bg-card opacity-70">
                        <p className="text-xs font-bold line-through">DSA Trees practice worksheet</p>
                        <p className="text-[9px] text-success mt-1">Completed ✓</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STUDY PLANNER TAB PREVIEW */}
              {activeTab === "Study Planner" && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <h3 className="font-bold text-base border-b pb-3">Study Planner Schedule</h3>
                  
                  <div className="space-y-2.5">
                    {[
                      { day: "Mon", time: "14:00 - 15:30", subject: "Operating Systems", details: "Lab scheduler function coding" },
                      { day: "Tue", time: "11:00 - 12:30", subject: "Compiler Design", details: "Write lexical grammar specs" },
                      { day: "Wed", time: "16:00 - 17:30", subject: "Placement Prep", details: "Solve 5 Tree DSA items" },
                    ].map((row, idx) => (
                      <div key={idx} className="p-3 border rounded-xl bg-muted/10 flex justify-between items-center text-xs">
                        <div>
                          <p className="font-bold text-primary">{row.subject}</p>
                          <p className="text-muted-foreground text-[10px]">{row.details}</p>
                        </div>
                        <span className="font-mono text-[9px] bg-muted px-2 py-0.5 rounded-full">{row.day} · {row.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ATTENDANCE TAB PREVIEW */}
              {activeTab === "Attendance" && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <h3 className="font-bold text-base border-b pb-3">Attendance Threshold status</h3>
                  
                  <div className="space-y-3">
                    {[
                      { subject: "Database Systems", attended: 18, total: 22, pct: 81, target: 75 },
                      { subject: "Operating Systems", attended: 14, total: 20, pct: 70, target: 75 },
                    ].map((row) => (
                      <div key={row.subject} className="p-4 border rounded-xl bg-muted/5 space-y-2">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold">{row.subject}</span>
                          <span className={row.pct < row.target ? "text-destructive font-bold" : "text-success font-bold"}>
                            {row.pct}% ({row.attended}/{row.total})
                          </span>
                        </div>
                        <Progress value={row.pct} className="h-1.5" />
                        {row.pct < row.target && (
                          <p className="text-[10px] text-destructive flex items-center gap-1.5">
                            <AlertTriangle className="h-3 w-3 shrink-0" />
                            Danger Zone. Muted skips. Must attend next 3 classes.
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SMART NOTES TAB PREVIEW */}
              {activeTab === "Smart Notes" && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <h3 className="font-bold text-base border-b pb-3">Notes & Documents</h3>
                  <div className="grid grid-cols-3 gap-4 text-xs">
                    <div className="border p-3 rounded-xl bg-muted/20">
                      <FolderOpen className="h-5 w-5 text-primary mb-2" />
                      <p className="font-bold">Lectures</p>
                      <p className="text-[10px] text-muted-foreground">3 files</p>
                    </div>
                    <div className="border p-3 rounded-xl bg-muted/20">
                      <FolderOpen className="h-5 w-5 text-primary mb-2" />
                      <p className="font-bold">Revision</p>
                      <p className="text-[10px] text-muted-foreground">2 files</p>
                    </div>
                    <div className="border p-3 rounded-xl bg-muted/20">
                      <FolderOpen className="h-5 w-5 text-primary mb-2" />
                      <p className="font-bold">Uploads</p>
                      <p className="text-[10px] text-muted-foreground">1 file</p>
                    </div>
                  </div>
                </div>
              )}

              {/* FOCUS MODE TAB PREVIEW */}
              {activeTab === "Focus Mode" && (
                <div className="space-y-6 text-center animate-in fade-in duration-200">
                  <h3 className="font-bold text-base border-b pb-3 text-left">Focus Pomodoro</h3>
                  
                  <div className="h-36 w-36 rounded-full border-4 border-primary bg-primary/5 flex flex-col items-center justify-center mx-auto">
                    <span className="text-3xl font-extrabold font-mono">25:00</span>
                    <span className="text-[9px] uppercase font-bold text-muted-foreground mt-1">Study mode ready</span>
                  </div>

                  <div className="flex gap-2 justify-center">
                    <Button size="sm" className="bg-primary text-white">Start Timer</Button>
                    <Button variant="outline" size="sm">Reset</Button>
                  </div>
                </div>
              )}

              {/* WELLNESS TRACKER TAB PREVIEW */}
              {activeTab === "Wellness Tracker" && (
                <div className="space-y-4 animate-in fade-in duration-200 text-left">
                  <h3 className="font-bold text-base border-b pb-3">Wellness Dashboard</h3>
                  <p className="text-xs text-muted-foreground">Assess daily burnout metrics.</p>

                  <div className="border rounded-xl p-4 bg-muted/5 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold">Mood check-in</p>
                      <p className="text-base font-bold mt-1">🙂 Good</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold">Sleep Quality</p>
                      <p className="text-base font-bold mt-1">💤 7.5 Hours (Good)</p>
                    </div>
                  </div>

                  <div className="border border-destructive/25 rounded-xl p-3 bg-destructive/10 text-xs text-destructive-foreground">
                    <h4 className="font-bold flex items-center gap-1.5 mb-1 text-destructive">
                      <ShieldAlert className="h-4 w-4" /> Crisis Mode Muting active?
                    </h4>
                    Toggle Crisis Mode to simplify visual widgets, enable box breathing guides, and suppress alert notifications.
                  </div>
                </div>
              )}

              {/* PLACEMENT HUB TAB PREVIEW */}
              {activeTab === "Placement Hub" && (
                <div className="space-y-4 animate-in fade-in duration-200 text-left">
                  <h3 className="font-bold text-base border-b pb-3">Placement Preparation</h3>
                  
                  <div className="space-y-3">
                    <div className="border rounded-xl p-3 bg-muted/10">
                      <p className="text-[10px] text-muted-foreground uppercase font-bold">Resume Uploaded</p>
                      <p className="text-xs font-bold mt-0.5">Alex_Mercer_Resume_V2.pdf</p>
                      <p className="text-xs text-primary font-bold mt-2 hover:underline cursor-pointer">ATS Audit Score: 78%</p>
                    </div>

                    <div className="border rounded-xl p-3 bg-muted/10 space-y-2">
                      <p className="text-[10px] text-muted-foreground uppercase font-bold">DSA Coding Progress</p>
                      <div className="flex justify-between text-xs font-bold">
                        <span>Solved: 142</span>
                        <span>Total: 300</span>
                      </div>
                      <Progress value={47} className="h-1.5" />
                    </div>
                  </div>
                </div>
              )}

              {/* STUDY GROUPS TAB PREVIEW */}
              {activeTab === "Study Groups" && (
                <div className="space-y-4 animate-in fade-in duration-200 text-left">
                  <h3 className="font-bold text-base border-b pb-3">Study Rooms</h3>
                  
                  <div className="p-3 border rounded-xl bg-muted/5 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-xs">CS Study Circle</p>
                      <p className="text-[10px] text-muted-foreground">Priya, Ethan, Mia, + You</p>
                    </div>
                    <span className="text-[9px] bg-success/15 text-success px-2 py-0.5 rounded-full font-bold">Active Chat</span>
                  </div>
                </div>
              )}

              {/* AI ASSISTANT TAB PREVIEW */}
              {activeTab === "AI Assistant" && (
                <div className="space-y-4 animate-in fade-in duration-200 text-left">
                  <h3 className="font-bold text-base border-b pb-3">Syntra Assistant Chat</h3>
                  
                  <div className="space-y-2">
                    <div className="border p-2.5 rounded-xl bg-muted/20 text-xs">
                      <p className="text-[9px] font-bold text-primary uppercase">Syntra AI</p>
                      <p className="mt-0.5">I have optimized your study scheduler blocks to prioritize Operating Systems threads. What coding concept should we practice next?</p>
                    </div>
                  </div>
                </div>
              )}

              {/* ANALYTICS TAB PREVIEW */}
              {activeTab === "Analytics" && (
                <div className="space-y-4 animate-in fade-in duration-200 text-left">
                  <h3 className="font-bold text-base border-b pb-3">GPA & Focus trends</h3>
                  
                  <div className="h-28 w-full border rounded-xl bg-muted/5 p-3 flex items-end gap-3 justify-between">
                    {[3, 5, 8, 4, 6, 9].map((val, idx) => (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                        <div className="w-full bg-gradient-primary rounded" style={{ height: `${val * 10}px` }} />
                        <span className="text-[8px] text-muted-foreground">Wk {idx + 1}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* RESOURCE HUB TAB PREVIEW */}
              {activeTab === "Resource Hub" && (
                <div className="space-y-4 animate-in fade-in duration-200 text-left">
                  <h3 className="font-bold text-base border-b pb-3">Resource Repository</h3>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 border rounded-xl bg-muted/10 space-y-1">
                      <p className="text-[8px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-bold uppercase w-fit">Textbook</p>
                      <h4 className="font-bold text-xs">DBMS - Korth (Silberschatz)</h4>
                    </div>
                    <div className="p-3 border rounded-xl bg-muted/10 space-y-1">
                      <p className="text-[8px] bg-warning/10 text-warning px-1.5 py-0.5 rounded font-bold uppercase w-fit">Past Paper</p>
                      <h4 className="font-bold text-xs">2024 Operating Systems Midterm</h4>
                    </div>
                  </div>
                </div>
              )}

              {/* SETTINGS TAB PREVIEW */}
              {activeTab === "Settings" && (
                <div className="space-y-4 animate-in fade-in duration-200 text-left">
                  <h3 className="font-bold text-base border-b pb-3">Preferences & Profiles</h3>
                  
                  <div className="space-y-3 text-xs">
                    <div className="space-y-1">
                      <Label className="text-[10px]">Academic College</Label>
                      <Input disabled value="Apex Institute of Technology" className="h-8 text-xs" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px]">Supabase Database URL</Label>
                      <Input disabled value="https://yxnfjjonbdkgfqxqqczm.supabase.co" className="h-8 text-xs" />
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Features() {
  const list = [
    { icon: Brain, title: "Smart Notes & Summaries", desc: "Upload lectures, PDFs, or images. Syntra instantly designs custom summaries, revision flashcards, and practice quizzes." },
    { icon: Compass, title: "Placement Hub & ATS Check", desc: "Scan your resume against ATS engines, complete targeted DSA progress trackers, and practice with company-specific interview simulation chats." },
    { icon: ShieldAlert, title: "Wellness & Crisis Mode", desc: "Log mood, stress, and sleep. When overwhelmed, activate Crisis Mode to simplify the UI, silence warnings, and open breathing sessions." },
    { icon: Users, title: "Study Rooms & Whiteboard", desc: "Host collaborative study rooms with shared Pomodoros, real-time cursor chats, and synced drawing whiteboards." },
    { icon: Calendar, title: "Safe Skip Attendance", desc: "Input weekly logs and calculate exactly how many classes you can skip without dipping below your target percentage." },
    { icon: Timer, title: "Focus Analytics", desc: "Leverage Pomodoro timers with distraction markers to detect your best study hours and build XP milestones." },
  ];

  return (
    <section id="features" className="py-24 bg-muted/20 border-t">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-semibold tracking-wider text-primary uppercase">Core Systems</span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight">An entire academy, automated.</h2>
          <p className="mt-4 text-muted-foreground">Every productivity tool, connected with contextual AI memory.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {list.map((f) => (
            <div key={f.title} className="group rounded-2xl border bg-card p-6 shadow-sm hover:shadow-md hover:border-primary/20 transition duration-300">
              <div className="h-10 w-10 rounded-xl bg-accent text-accent-foreground flex items-center justify-center mb-5 group-hover:bg-gradient-primary group-hover:text-primary-foreground transition duration-300">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-lg">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQSection() {
  const faqs = [
    { q: "What is Syntra?", a: "Syntra is an AI-powered student operating system designed to merge tasks, study planning, resume placement tracking, peer collaboration, and mental health checkups in a single dark-mode customized framework." },
    { q: "How does the 'Safe Skip' predictor work?", a: "It reads your current class attendance (attended vs total) and target percentage threshold, calculating exactly how many upcoming lectures you can miss before your record enters the risk margin." },
    { q: "What is Crisis Mode?", a: "Crisis Mode is a mental health feature. If logged stress spikes, toggling it changes the UI layout: it simplifies lists, hides warnings, initiates breathing cycles, and decreases notifications to mitigate burnout." },
    { q: "Can I host collaborative study rooms?", a: "Yes. The Collaboration system lets you link study rooms with shared whiteboard drawings, group Pomodoro countdowns, and real-time cursor-linked group chat channels." },
  ];

  return (
    <section id="faq" className="py-24 max-w-4xl mx-auto px-6">
      <div className="text-center mb-16">
        <span className="text-xs font-semibold tracking-wider text-primary uppercase">FAQ</span>
        <h2 className="mt-3 text-3xl font-bold">Common Queries</h2>
      </div>
      <div className="space-y-6">
        {faqs.map((f, i) => (
          <div key={i} className="border rounded-2xl p-6 bg-card shadow-sm hover:border-primary/10 transition text-left">
            <h4 className="font-bold text-base flex items-center gap-2">
              <span className="text-primary">Q.</span> {f.q}
            </h4>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed pl-6 border-l border-muted">
              {f.a}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t bg-muted/10 py-10">
      <div className="mx-auto max-w-6xl px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-primary flex items-center justify-center text-white">
            <Brain className="h-4 w-4" />
          </div>
          <span className="font-bold text-lg tracking-tight">Syntra OS</span>
        </div>
        <p className="text-sm text-muted-foreground">© 2026 Syntra. Built for SDE and placement-ready student productivity.</p>
      </div>
    </footer>
  );
}
