import { createFileRoute, Outlet, useRouterState, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app/AppSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Moon, Sun, Bell, Sparkles, Brain, CheckCircle2, ShieldAlert, Mic, Heart, Plus, Search, Calendar, ChevronRight, GraduationCap, User, LogOut, Settings as SettingsIcon } from "lucide-react";
import { useStore } from "@/lib/store";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export const Route = createFileRoute("/app")({
  component: AppLayout,
});

const TITLES: Record<string, string> = {
  "/app": "Dashboard",
  "/app/assignments": "Assignments",
  "/app/planner": "Study Planner",
  "/app/attendance": "Attendance",
  "/app/notes": "Smart Notes",
  "/app/focus": "Focus Mode",
  "/app/wellness": "Wellness Tracker",
  "/app/placements": "Placement Hub",
  "/app/groups": "Group Collaboration",
  "/app/assistant": "Syntra AI Assistant",
  "/app/analytics": "Analytics",
  "/app/resources": "Resource Hub",
  "/app/settings": "Settings",
};

function AppLayout() {
  const path = useRouterState({ select: (r) => r.location.pathname });
  const navigate = useNavigate();
  
  // Store States
  const user = useStore((s) => s.user);
  const setUser = useStore((s) => s.setUser);
  const profile = useStore((s) => s.profile);
  const setProfile = useStore((s) => s.setProfile);
  const onboarded = useStore((s) => s.onboarded);
  const setOnboarded = useStore((s) => s.setOnboarded);
  const theme = useStore((s) => s.theme);
  const toggleTheme = useStore((s) => s.toggleTheme);
  const crisisMode = useStore((s) => s.crisisMode);
  const setCrisisMode = useStore((s) => s.setCrisisMode);
  const activeWorkspace = useStore((s) => s.activeWorkspace);
  const setActiveWorkspace = useStore((s) => s.setActiveWorkspace);
  const addTask = useStore((s) => s.addTask);
  const addNote = useStore((s) => s.addNote);
  const addMoodLog = useStore((s) => s.addMoodLog);

  // Local UI States
  const [commandOpen, setCommandOpen] = useState(false);
  const [quickCaptureOpen, setQuickCaptureOpen] = useState(false);
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcribedText, setTranscribedText] = useState("");
  const [quickTab, setQuickTab] = useState<"task" | "note" | "mood">("task");
  
  // Onboarding Wizard local state
  const [step, setStep] = useState(1);
  const [onboardForm, setOnboardForm] = useState({
    name: profile.name || "",
    college: profile.college || "",
    degree: "B.Tech",
    semester: profile.semester || "6th Semester",
    branch: profile.branch || "Computer Science",
    subjects: "Database Systems, Operating Systems, Computer Networks",
    weeklyClasses: "15",
    attendanceTarget: "75",
    weakSubjects: "Operating Systems",
    targetRoles: "Software Development Engineer (SDE)",
    skills: "React, JavaScript, Python",
    placementGoals: "Secure Internships",
    dreamCompanies: "Google, Microsoft",
    focusHours: "20",
    sleepTargets: "8",
    studyStyle: "Visual",
    breakPreferences: "5 mins every 25 mins",
  });

  const [aiInitSteps, setAiInitSteps] = useState<string[]>([]);
  const [aiInitProgress, setAiInitProgress] = useState(0);

  // Auth gate
  useEffect(() => {
    if (!user) {
      navigate({ to: "/login" });
    }
  }, [user, navigate]);

  // Theme configuration
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  // Command palette keystroke list
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCommandOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  if (!user) {
    return null;
  }

  // ONBOARDING WIZARD COMPONENT
  if (!onboarded) {
    const handleNextStep = () => {
      if (step < 4) {
        setStep(step + 1);
      } else if (step === 4) {
        setStep(5);
        // AI Initialization loading sequence
        setAiInitProgress(10);
        setAiInitSteps(["Analyzing cognitive focus preferences..."]);
        
        setTimeout(() => {
          setAiInitProgress(40);
          setAiInitSteps((prev) => [...prev, "Structuring weak subject recovery roadmaps..."]);
        }, 1000);

        setTimeout(() => {
          setAiInitProgress(70);
          setAiInitSteps((prev) => [...prev, "Assembling personalized study timetables..."]);
        }, 2000);

        setTimeout(() => {
          setAiInitProgress(100);
          setAiInitSteps((prev) => [...prev, "Syntra OS initialized successfully."]);
        }, 3200);
      }
    };

    const handleFinishOnboarding = () => {
      setProfile({
        name: onboardForm.name,
        college: onboardForm.college,
        semester: onboardForm.semester,
        branch: `${onboardForm.degree} in ${onboardForm.branch}`,
        targetRoles: onboardForm.targetRoles.split(",").map(s => s.trim()),
        skills: onboardForm.skills.split(",").map(s => s.trim()),
        placementGoals: onboardForm.placementGoals.split(",").map(s => s.trim()),
        dreamCompanies: onboardForm.dreamCompanies.split(",").map(s => s.trim()),
        focusHours: parseInt(onboardForm.focusHours) || 20,
        sleepTargets: parseInt(onboardForm.sleepTargets) || 8,
        studyStyle: onboardForm.studyStyle,
        breakPreferences: onboardForm.breakPreferences,
      });
      setOnboarded(true);
      toast.success("Welcome aboard! Syntra OS is ready.");
    };

    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden select-none">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(35rem_35rem_at_50%_40%,oklch(0.95_0.03_260),transparent)] dark:bg-[radial-gradient(35rem_35rem_at_50%_40%,oklch(0.25_0.05_260/15%),transparent)]" />
        
        <div className="w-full max-w-xl bg-card border rounded-2xl p-6 md:p-8 shadow-elevated">
          {/* Header */}
          <div className="flex items-center justify-between border-b pb-4 mb-6">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              <span className="font-bold text-lg tracking-tight">Syntra OS Config Wizard</span>
            </div>
            <span className="text-xs font-semibold bg-accent px-2.5 py-1 rounded-full text-accent-foreground">
              Step {step} of 5
            </span>
          </div>

          {/* STEP 1: IDENTITY */}
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <h3 className="text-lg font-semibold">Student Identity</h3>
              <p className="text-xs text-muted-foreground">Let's configure your profile details.</p>
              <div className="space-y-3 pt-2">
                <div>
                  <Label>Full Name</Label>
                  <Input value={onboardForm.name} onChange={(e) => setOnboardForm({...onboardForm, name: e.target.value})} placeholder="Alex Mercer" />
                </div>
                <div>
                  <Label>College / University</Label>
                  <Input value={onboardForm.college} onChange={(e) => setOnboardForm({...onboardForm, college: e.target.value})} placeholder="Apex Institute of Technology" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Degree / Course</Label>
                    <Input value={onboardForm.degree} onChange={(e) => setOnboardForm({...onboardForm, degree: e.target.value})} placeholder="B.Tech" />
                  </div>
                  <div>
                    <Label>Branch / Stream</Label>
                    <Input value={onboardForm.branch} onChange={(e) => setOnboardForm({...onboardForm, branch: e.target.value})} placeholder="Computer Science" />
                  </div>
                </div>
                <div>
                  <Label>Current Semester</Label>
                  <Select value={onboardForm.semester} onValueChange={(v) => setOnboardForm({...onboardForm, semester: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1st Semester">1st Semester</SelectItem>
                      <SelectItem value="3rd Semester">3rd Semester</SelectItem>
                      <SelectItem value="5th Semester">5th Semester</SelectItem>
                      <SelectItem value="6th Semester">6th Semester</SelectItem>
                      <SelectItem value="7th Semester">7th Semester</SelectItem>
                      <SelectItem value="8th Semester">8th Semester</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: ACADEMICS */}
          {step === 2 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <h3 className="text-lg font-semibold">Academic Setup</h3>
              <p className="text-xs text-muted-foreground">List your subjects and attendance targets.</p>
              <div className="space-y-3 pt-2">
                <div>
                  <Label>Enrolled Subjects (comma separated)</Label>
                  <Input value={onboardForm.subjects} onChange={(e) => setOnboardForm({...onboardForm, subjects: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Classes Per Week</Label>
                    <Input type="number" value={onboardForm.weeklyClasses} onChange={(e) => setOnboardForm({...onboardForm, weeklyClasses: e.target.value})} />
                  </div>
                  <div>
                    <Label>Attendance Threshold (%)</Label>
                    <Input type="number" value={onboardForm.attendanceTarget} onChange={(e) => setOnboardForm({...onboardForm, attendanceTarget: e.target.value})} />
                  </div>
                </div>
                <div>
                  <Label>Weak / Tough Subjects</Label>
                  <Input value={onboardForm.weakSubjects} onChange={(e) => setOnboardForm({...onboardForm, weakSubjects: e.target.value})} placeholder="e.g. Operating Systems" />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: CAREER */}
          {step === 3 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <h3 className="text-lg font-semibold">Career Goals</h3>
              <p className="text-xs text-muted-foreground">Specify your target placement metrics.</p>
              <div className="space-y-3 pt-2">
                <div>
                  <Label>Target Career Roles (comma separated)</Label>
                  <Input value={onboardForm.targetRoles} onChange={(e) => setOnboardForm({...onboardForm, targetRoles: e.target.value})} placeholder="SDE, Frontend Engineer" />
                </div>
                <div>
                  <Label>Current Skills (comma separated)</Label>
                  <Input value={onboardForm.skills} onChange={(e) => setOnboardForm({...onboardForm, skills: e.target.value})} />
                </div>
                <div>
                  <Label>Dream Companies (comma separated)</Label>
                  <Input value={onboardForm.dreamCompanies} onChange={(e) => setOnboardForm({...onboardForm, dreamCompanies: e.target.value})} placeholder="Google, Stripe" />
                </div>
                <div>
                  <Label>Placement Milestones</Label>
                  <Input value={onboardForm.placementGoals} onChange={(e) => setOnboardForm({...onboardForm, placementGoals: e.target.value})} placeholder="Secure SDE Internship" />
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: PRODUCTIVITY */}
          {step === 4 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <h3 className="text-lg font-semibold">Productivity Preferences</h3>
              <p className="text-xs text-muted-foreground">Set your targets for study and stress control.</p>
              <div className="space-y-3 pt-2">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Weekly Focus (hours)</Label>
                    <Input type="number" value={onboardForm.focusHours} onChange={(e) => setOnboardForm({...onboardForm, focusHours: e.target.value})} />
                  </div>
                  <div>
                    <Label>Sleep Target (hours)</Label>
                    <Input type="number" value={onboardForm.sleepTargets} onChange={(e) => setOnboardForm({...onboardForm, sleepTargets: e.target.value})} />
                  </div>
                </div>
                <div>
                  <Label>Study Style Preference</Label>
                  <Select value={onboardForm.studyStyle} onValueChange={(v) => setOnboardForm({...onboardForm, studyStyle: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Visual">Visual Learner (Notes/Whiteboard)</SelectItem>
                      <SelectItem value="Auditory">Auditory Learner (Lectures/Spoken)</SelectItem>
                      <SelectItem value="Hands-on">Hands-on (DSA problems/Coding)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Break Style Preference</Label>
                  <Input value={onboardForm.breakPreferences} onChange={(e) => setOnboardForm({...onboardForm, breakPreferences: e.target.value})} placeholder="e.g. 5 mins every 25 mins" />
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: AI INITIALIZATION */}
          {step === 5 && (
            <div className="space-y-6 text-center animate-in fade-in duration-200">
              <h3 className="text-lg font-semibold flex items-center justify-center gap-1.5">
                <Sparkles className="h-5 w-5 text-primary animate-pulse" />
                Initializing Syntra AI Engines
              </h3>
              
              <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-gradient-primary h-full transition-all duration-500" 
                  style={{ width: `${aiInitProgress}%` }}
                />
              </div>

              <div className="space-y-2 text-left bg-muted/30 p-4 rounded-xl max-h-[160px] overflow-y-auto border">
                {aiInitSteps.map((line, idx) => (
                  <p key={idx} className="text-xs font-mono text-muted-foreground flex items-center gap-2">
                    <span className="text-success">✓</span> {line}
                  </p>
                ))}
              </div>

              {aiInitProgress === 100 ? (
                <Button onClick={handleFinishOnboarding} className="w-full bg-gradient-primary border-0 text-white shadow-lg animate-bounce">
                  Enter Syntra OS Cockpit <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              ) : (
                <div className="text-xs text-muted-foreground animate-pulse">Running cognitive calculations...</div>
              )}
            </div>
          )}

          {/* Footer buttons */}
          {step < 5 && (
            <div className="flex justify-between items-center mt-8 pt-4 border-t">
              <Button variant="ghost" disabled={step === 1} onClick={() => setStep(step - 1)}>
                Back
              </Button>
              <Button onClick={handleNextStep}>
                Next <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // QUICK CAPTURE FORM SUBMISSION
  const handleQuickCapture = (e: React.FormEvent) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget as HTMLFormElement);
    const text = (data.get("text") as string) || "";
    const subject = (data.get("subject") as string) || "";

    if (!text.trim()) {
      toast.error("Input text is required");
      return;
    }

    if (quickTab === "task") {
      addTask({
        title: text,
        subject,
        priority: "medium",
      });
      toast.success("Assignment added via Quick Capture");
    } else if (quickTab === "note") {
      addNote({
        title: text.split("\n")[0] || "Quick Note",
        content: text,
        subject,
      });
      toast.success("Note added via Quick Capture");
    } else if (quickTab === "mood") {
      addMoodLog({
        mood: "okay",
        stressLevel: 5,
        notes: text,
      });
      toast.success("Mood logged via Quick Capture");
    }

    setQuickCaptureOpen(false);
  };

  // SPEECH TRANSCRIPTION SIMULATION
  const triggerVoiceListen = () => {
    setIsListening(true);
    setTranscribedText("Listening...");
    toast.info("Microphone input active (simulated)");

    setTimeout(() => {
      setTranscribedText("Add task prepare database mid-term by friday");
      toast.success("Speech captured!");
    }, 2000);

    setTimeout(() => {
      setIsListening(false);
    }, 2300);
  };

  const handleVoiceCommandSubmit = () => {
    if (!transcribedText.trim() || transcribedText === "Listening...") return;
    
    // Parse voice commands
    const lowercase = transcribedText.toLowerCase();
    if (lowercase.includes("add task") || lowercase.includes("add assignment")) {
      const title = transcribedText.replace(/add task|add assignment/gi, "").trim();
      addTask({
        title: title || "Voice Assignment",
        subject: "Voice Capture",
        priority: "medium",
      });
      toast.success("Assignment created from voice!");
    } else if (lowercase.includes("add note")) {
      const content = transcribedText.replace(/add note/gi, "").trim();
      addNote({
        title: "Voice Note",
        content: content || "Transcribed note details.",
        subject: "Voice Capture",
      });
      toast.success("Note created from voice!");
    } else {
      toast.info(`Command interpreted: "${transcribedText}". Routing to AI assistant...`);
      navigate({ to: "/app/assistant" });
    }
    setVoiceOpen(false);
    setTranscribedText("");
  };

  const handleLogout = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    toast.success("Logged out successfully");
    navigate({ to: "/" });
  };

  const title = TITLES[path] || "Syntra";

  return (
    <SidebarProvider>
      {/* Calm Crisis Mode visual overlay */}
      <div className={`min-h-screen flex w-full transition-colors duration-1000 ${
        crisisMode ? "bg-teal-50/50 dark:bg-emerald-950/20 text-teal-900 dark:text-emerald-50" : "bg-muted/20"
      }`}>
        
        <AppSidebar />

        <div className="flex-1 flex flex-col min-w-0">
          <header className={`h-14 flex items-center justify-between border-b px-4 sticky top-0 z-30 transition-colors duration-1000 ${
            crisisMode ? "bg-teal-100/90 dark:bg-emerald-950/90 backdrop-blur-md" : "bg-background/95 backdrop-blur-sm"
          }`}>
            <div className="flex items-center gap-3">
              <SidebarTrigger />
              <h1 className="font-bold text-lg tracking-tight hidden sm:block">
                {crisisMode ? "Syntra OS (Crisis Control)" : title}
              </h1>
              
              {/* Workspace Selector Dropdown */}
              <div className="ml-2">
                <Select value={activeWorkspace} onValueChange={setActiveWorkspace}>
                  <SelectTrigger className="h-8 w-[140px] text-xs bg-muted/40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Personal">🏠 Personal</SelectItem>
                    <SelectItem value="Academic">🏫 Academic</SelectItem>
                    <SelectItem value="Placement">💼 Placement</SelectItem>
                    <SelectItem value="Group Study">👥 Group Study</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Command Palette Button */}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setCommandOpen(true)}
                className="h-8 text-xs text-muted-foreground gap-1.5 hidden md:flex"
              >
                <Search className="h-3.5 w-3.5" />
                <span>Search Notes...</span>
                <kbd className="pointer-events-none inline-flex h-4 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[9px] font-medium text-muted-foreground opacity-100">
                  <span className="text-[10px]">Ctrl+</span>K
                </kbd>
              </Button>

              {/* Spoken Query Header Shortcut */}
              <Button variant="ghost" size="icon" onClick={() => setVoiceOpen(true)} className="h-8 w-8 text-primary">
                <Mic className="h-4.5 w-4.5" />
              </Button>

              {/* Crisis Mode Quick Toggle Indicator */}
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setCrisisMode(!crisisMode)} 
                className={`h-8 w-8 rounded-full ${crisisMode ? "bg-emerald-200/50 dark:bg-emerald-900/50 text-success" : "text-muted-foreground"}`}
                title="Toggle Wellness Crisis Mode"
              >
                <Heart className={`h-4.5 w-4.5 ${crisisMode ? "animate-pulse fill-success" : ""}`} />
              </Button>

              <Button variant="ghost" size="icon" onClick={toggleTheme}>
                {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="flex items-center gap-2 ml-2 pl-3 border-l cursor-pointer group select-none">
                    <div 
                      className="h-8 w-8 rounded-full bg-accent group-hover:bg-accent/80 flex items-center justify-center text-accent-foreground text-sm font-medium transition"
                      title="Account Options"
                    >
                      {(profile.name || "?").charAt(0).toUpperCase()}
                    </div>
                    <div className="hidden lg:block text-left">
                      <p className="text-xs font-semibold leading-none group-hover:text-primary transition">{profile.name || "Guest Student"}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{profile.college?.split(" ")[0] || "University"}</p>
                    </div>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 mt-2">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-semibold leading-none">{profile.name || "Guest Student"}</p>
                      <p className="text-xs leading-none text-muted-foreground truncate">
                        {profile.college || "University Student"}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate({ to: "/app/settings" })} className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    <span>My Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate({ to: "/app/settings" })} className="cursor-pointer">
                    <SettingsIcon className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          {/* Breathing Cycle banner in Crisis Mode */}
          {crisisMode && (
            <div className="bg-emerald-600 dark:bg-emerald-900 text-white px-4 py-2 text-xs font-medium text-center flex items-center justify-center gap-2 select-none animate-pulse">
              <ShieldAlert className="h-4 w-4 shrink-0" />
              <span>Crisis mode active. Let's practice box breathing: Inhale 4s · Hold 4s · Exhale 4s. Muted alerts.</span>
            </div>
          )}

          <main className="flex-1 p-4 md:p-6 overflow-x-hidden relative">
            <Outlet />
          </main>
        </div>
      </div>

      {/* COMMAND PALETTE DIALOG */}
      <CommandDialog open={commandOpen} onOpenChange={setCommandOpen}>
        <CommandInput placeholder="Type a command or note name..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Quick Navigations">
            <CommandItem onSelect={() => { navigate({ to: "/app" }); setCommandOpen(false); }}>
              <Brain className="mr-2 h-4 w-4" /> Dashboard
            </CommandItem>
            <CommandItem onSelect={() => { navigate({ to: "/app/assignments" }); setCommandOpen(false); }}>
              <Plus className="mr-2 h-4 w-4" /> Assignments Manager
            </CommandItem>
            <CommandItem onSelect={() => { navigate({ to: "/app/planner" }); setCommandOpen(false); }}>
              <Calendar className="mr-2 h-4 w-4" /> Timetable Study Planner
            </CommandItem>
            <CommandItem onSelect={() => { navigate({ to: "/app/focus" }); setCommandOpen(false); }}>
              <Sparkles className="mr-2 h-4 w-4" /> Focus Pomodoro timer
            </CommandItem>
            <CommandItem onSelect={() => { navigate({ to: "/app/wellness" }); setCommandOpen(false); }}>
              <Heart className="mr-2 h-4 w-4" /> Wellness & Burnout Analytics
            </CommandItem>
          </CommandGroup>
          <CommandGroup heading="System Controls">
            <CommandItem onSelect={() => { setCrisisMode(!crisisMode); setCommandOpen(false); }}>
              <ShieldAlert className="mr-2 h-4 w-4" /> Toggle Crisis Control Mode
            </CommandItem>
            <CommandItem onSelect={() => { toggleTheme(); setCommandOpen(false); }}>
              {theme === "light" ? <Moon className="mr-2 h-4 w-4" /> : <Sun className="mr-2 h-4 w-4" />}
              Switch Appearance theme
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>

      {/* QUICK CAPTURE FLOATING POPUP */}
      <div className="fixed bottom-6 right-6 z-50 flex items-center justify-center">
        <Popover open={quickCaptureOpen} onOpenChange={setQuickCaptureOpen}>
          <PopoverTrigger asChild>
            <Button size="icon" className="h-12 w-12 rounded-full bg-gradient-primary text-white shadow-elevated border-0 hover:scale-105 transition-all">
              <Plus className="h-6 w-6" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-4 border rounded-xl shadow-elevated bg-card" align="end">
            <h4 className="font-bold text-sm mb-2 flex items-center gap-1.5 text-primary">
              <Sparkles className="h-4 w-4" />
              Quick Capture
            </h4>
            <div className="flex border-b mb-3">
              {(["task", "note", "mood"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setQuickTab(t)}
                  className={`flex-1 pb-1.5 text-xs font-semibold capitalize border-b-2 transition ${
                    quickTab === t ? "border-primary text-primary" : "border-transparent text-muted-foreground"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            <form onSubmit={handleQuickCapture} className="space-y-3">
              <div>
                <Label className="text-[10px] uppercase text-muted-foreground font-bold">Details</Label>
                <Textarea 
                  name="text" 
                  rows={3} 
                  placeholder={
                    quickTab === "task" ? "e.g. DBMS SQL query checklist" :
                    quickTab === "note" ? "Type summary points..." : "Log feeling or burnout factors..."
                  }
                  className="text-xs"
                />
              </div>
              {quickTab !== "mood" && (
                <div>
                  <Label className="text-[10px] uppercase text-muted-foreground font-bold">Subject Tag (Optional)</Label>
                  <Input name="subject" placeholder="e.g. Database Systems" className="text-xs h-8" />
                </div>
              )}
              <Button type="submit" size="sm" className="w-full bg-primary text-white h-8">
                Confirm Capture
              </Button>
            </form>
          </PopoverContent>
        </Popover>
      </div>

      {/* VOICE COMMAND DIALOG */}
      <Dialog open={voiceOpen} onOpenChange={setVoiceOpen}>
        <DialogContent className="max-w-sm rounded-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mic className="h-5 w-5 text-primary animate-pulse" />
              Voice Command System
            </DialogTitle>
            <DialogDescription>
              Say commands like "Add task Study round robin scheduler" or "Add note transaction locks".
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center py-6 space-y-4">
            <div 
              onClick={triggerVoiceListen}
              className={`h-16 w-16 rounded-full flex items-center justify-center cursor-pointer transition ${
                isListening ? "bg-destructive/15 text-destructive scale-105" : "bg-primary/10 text-primary hover:bg-primary/20"
              }`}
            >
              <Mic className={`h-8 w-8 ${isListening ? "animate-pulse" : ""}`} />
            </div>
            
            <div className="text-center w-full min-h-[40px] px-2 py-1 bg-muted/40 rounded-lg text-xs font-mono">
              {transcribedText || 'Click the mic and say "Add task DBMS Lab"'}
            </div>
          </div>
          <DialogFooter className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm" onClick={() => setVoiceOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={handleVoiceCommandSubmit} disabled={!transcribedText.trim() || transcribedText === "Listening..."}>
              Execute Command
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Toaster />
    </SidebarProvider>
  );
}
