import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useStore, Task, AttendanceItem } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Sparkles, Calendar, Clock, RefreshCw, AlertTriangle, ArrowRight, ShieldAlert } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/app/planner")({
  component: PlannerPage,
});

type TimetableBlock = {
  day: string;
  time: string;
  subject: string;
  activity: string;
  isAiOptimized?: boolean;
};

const initialWeeklyBlocks: TimetableBlock[] = [
  { day: "Mon", time: "09:00 – 10:30", subject: "Database Systems", activity: "Lecture review" },
  { day: "Mon", time: "14:00 – 15:30", subject: "Operating Systems", activity: "Lab coding" },
  { day: "Tue", time: "11:00 – 12:30", subject: "Compiler Design", activity: "Lexical analysis notes" },
  { day: "Wed", time: "09:00 – 10:30", subject: "Database Systems", activity: "SQL exercises" },
  { day: "Wed", time: "16:00 – 17:30", subject: "Placement Prep", activity: "DSA Stack/Queue" },
  { day: "Thu", time: "14:00 – 15:30", subject: "Operating Systems", activity: "Review thread syncing" },
  { day: "Fri", time: "11:00 – 12:30", subject: "Compiler Design", activity: "Parser trees" },
  { day: "Fri", time: "18:30 – 20:00", subject: "Placement Prep", activity: "Mock resume reviews" },
];

function PlannerPage() {
  const tasks = useStore((s) => s.tasks);
  const attendance = useStore((s) => s.attendance);
  const crisisMode = useStore((s) => s.crisisMode);
  const addTask = useStore((s) => s.addTask);
  const exams = useStore((s) => s.exams);

  // Local UI States
  const [plannerMode, setPlannerMode] = useState<"weekly" | "monthly">("weekly");
  const [timetable, setTimetable] = useState<TimetableBlock[]>(initialWeeklyBlocks);
  const [isGenerating, setIsGenerating] = useState(false);
  const [adaptiveFactor, setAdaptiveFactor] = useState<string | null>(null);

  // Calendar states
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(5); // June
  const [selectedDay, setSelectedDay] = useState<number | null>(1);
  const [newCalendarTaskTitle, setNewCalendarTaskTitle] = useState("");

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
    setSelectedDay(null);
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
    setSelectedDay(null);
  };

  const handleAddCalendarTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCalendarTaskTitle.trim() || !selectedDay) return;
    const selectedIsoDate = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(selectedDay).padStart(2, "0")}`;
    addTask({
      title: newCalendarTaskTitle,
      subject: "Self Study",
      dueDate: selectedIsoDate,
      priority: "medium",
    });
    setNewCalendarTaskTitle("");
    toast.success("Assignment added to this date!");
  };

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay(); // 0 is Sunday
  const startPadding = (firstDayOfWeek + 6) % 7;
  const paddingArray = Array.from({ length: startPadding });
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const selectedIsoDate = selectedDay
    ? `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(selectedDay).padStart(2, "0")}`
    : "";
  const dayTasks = tasks.filter(t => t.dueDate === selectedIsoDate);
  const dayExams = exams.filter(e => e.date === selectedIsoDate);

  // 1. AI Timetable Generator
  const handleGenerateAiTimetable = () => {
    setIsGenerating(true);
    toast.info("Syntra AI: Fetching attendance risks and syllabus goals...");
    
    setTimeout(() => {
      // Create optimized timetable blocks prioritizing OS (weak subject)
      const optimized: TimetableBlock[] = [
        { day: "Mon", time: "09:00 – 10:30", subject: "Database Systems", activity: "Index query tests", isAiOptimized: true },
        { day: "Mon", time: "14:00 – 15:30", subject: "Operating Systems", activity: "Deep Focus Thread syncs", isAiOptimized: true },
        { day: "Tue", time: "11:00 – 12:30", subject: "Compiler Design", activity: "Syntax compilation", isAiOptimized: true },
        { day: "Tue", time: "16:00 – 17:30", subject: "Operating Systems", activity: "Review skips & attendance logs", isAiOptimized: true },
        { day: "Wed", time: "09:00 – 10:30", subject: "Database Systems", activity: "SQL Normalization", isAiOptimized: true },
        { day: "Wed", time: "16:00 – 17:30", subject: "Placement Prep", activity: "DSA Trees & Graphs study", isAiOptimized: true },
        { day: "Thu", time: "14:00 – 15:30", subject: "Operating Systems", activity: "Lab scheduling algorithm", isAiOptimized: true },
        { day: "Fri", time: "11:00 – 12:30", subject: "Compiler Design", activity: "Parse tree generation", isAiOptimized: true },
        { day: "Fri", time: "18:30 – 20:00", subject: "Placement Prep", activity: "Mock resume feedback edits", isAiOptimized: true },
      ];
      setTimetable(optimized);
      setAdaptiveFactor(null);
      toast.success("AI optimized timetable compiled! Highlighted blocks in purple.");
      setIsGenerating(false);
    }, 1800);
  };

  // 2. Adaptive Planning Simulator
  const triggerAdaptiveAdjustment = (scenario: "missed-tasks" | "burnout-spike" | "attendance-drop") => {
    setIsGenerating(true);
    
    setTimeout(() => {
      if (scenario === "missed-tasks") {
        setAdaptiveFactor("Missed Assignments");
        // Shift study blocks to provide emergency task resolution periods
        const adjusted = timetable.map(block => 
          block.subject === "Placement Prep"
            ? { ...block, subject: "Emergency Task", activity: "DBMS/OS Pending lab checklists", isAiOptimized: true }
            : block
        );
        setTimetable(adjusted);
        toast.warning("Adaptive Planning: Rescheduled placement blocks to resolve overdue tasks.");
      } else if (scenario === "burnout-spike") {
        setAdaptiveFactor("High Burnout Score");
        // Reduce study blocks, replace with breathing intervals
        const adjusted = timetable.map(block => 
          block.time.includes("18:30") || block.time.includes("16:00")
            ? { ...block, subject: "Wellness Recharge", activity: "Guided Box Breathing & mood reviews", isAiOptimized: true }
            : block
        );
        setTimetable(adjusted);
        toast.info("Adaptive Planning: High stress levels detected. Inserted Wellness Recharge slots.");
      } else if (scenario === "attendance-drop") {
        setAdaptiveFactor("Low Attendance");
        // Increase classes and attendance monitoring blocks
        const adjusted = timetable.map(block => 
          block.subject === "Database Systems"
            ? { ...block, subject: "Operating Systems", activity: "Critical skip review attendance safety", isAiOptimized: true }
            : block
        );
        setTimetable(adjusted);
        toast.error("Adaptive Planning: Operating Systems attendance is critical. Increased OS blocks.");
      }
      setIsGenerating(false);
    }, 1200);
  };

  const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri"];

  return (
    <div className="space-y-6 max-w-7xl select-none">
      
      {/* Top Header Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Study Timetable Planner</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Adapt study sessions to academic deadlines and focus behavior.</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Planner Toggle */}
          <div className="flex gap-1 rounded-lg border bg-card p-1">
            <button
              onClick={() => setPlannerMode("weekly")}
              className={`px-3 py-1 text-xs rounded-md font-medium transition ${
                plannerMode === "weekly" ? "bg-primary text-white" : "text-muted-foreground"
              }`}
            >
              Weekly
            </button>
            <button
              onClick={() => setPlannerMode("monthly")}
              className={`px-3 py-1 text-xs rounded-md font-medium transition ${
                plannerMode === "monthly" ? "bg-primary text-white" : "text-muted-foreground"
              }`}
            >
              Monthly Calendar
            </button>
          </div>

          <Button 
            onClick={handleGenerateAiTimetable} 
            disabled={isGenerating}
            className="bg-gradient-primary text-white border-0 shadow"
          >
            <Sparkles className="h-4 w-4 mr-1.5 animate-pulse" />
            AI Timetable Generator
          </Button>
        </div>
      </div>

      {/* Main layout grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* TIMETABLE VIEW */}
        <div className="lg:col-span-2 space-y-4 text-left">
          {plannerMode === "weekly" ? (
            <div className="bg-card border rounded-2xl p-5 shadow-card space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm tracking-tight text-muted-foreground uppercase">Weekly Blocks Schedule</h3>
                {adaptiveFactor && (
                  <span className="text-[10px] bg-warning/15 text-warning-foreground px-2.5 py-0.5 rounded-full font-bold">
                    Adapted for: {adaptiveFactor}
                  </span>
                )}
              </div>

              <div className="space-y-4">
                {daysOfWeek.map((day) => {
                  const dayBlocks = timetable.filter((t) => t.day === day);
                  return (
                    <div key={day} className="grid grid-cols-1 md:grid-cols-4 gap-2 items-start py-2 border-b last:border-0">
                      <div className="font-bold text-xs text-primary pt-1 md:col-span-1">{day}</div>
                      <div className="md:col-span-3 space-y-2">
                        {dayBlocks.length === 0 ? (
                          <p className="text-[11px] text-muted-foreground italic">No study blocks planned.</p>
                        ) : (
                          dayBlocks.map((b, i) => (
                            <div 
                              key={i} 
                              className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2 transition ${
                                b.isAiOptimized 
                                  ? "bg-primary/5 border-primary/20 hover:bg-primary/10" 
                                  : "bg-muted/30 border-muted hover:bg-muted/50"
                              }`}
                            >
                              <div className="space-y-0.5">
                                <p className="text-xs font-bold flex items-center gap-1.5">
                                  {b.subject}
                                  {b.isAiOptimized && (
                                    <span className="text-[8px] bg-primary/20 text-primary px-1.5 py-0.5 rounded font-bold uppercase">AI</span>
                                  )}
                                </p>
                                <p className="text-[11px] text-muted-foreground">{b.activity}</p>
                              </div>
                              <div className="flex items-center text-[10px] text-muted-foreground gap-1 font-mono">
                                <Clock className="h-3 w-3 shrink-0" /> {b.time}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            // Simple Monthly Mock Calendar list
            <div className="bg-card border rounded-2xl p-5 shadow-card min-h-[420px] space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-sm tracking-tight text-muted-foreground uppercase">
                  {monthNames[currentMonth]} {currentYear}
                </h3>
                <div className="flex gap-1.5">
                  <Button variant="outline" size="xs" onClick={prevMonth} className="h-7 w-7 p-0 text-[10px]">◀</Button>
                  <Button variant="outline" size="xs" onClick={nextMonth} className="h-7 w-7 p-0 text-[10px]">▶</Button>
                </div>
              </div>
              
              <div className="grid grid-cols-7 gap-2 text-center text-[11px] font-bold border-b pb-2">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(d => <span key={d}>{d}</span>)}
              </div>
              
              <div className="grid grid-cols-7 gap-2">
                {paddingArray.map((_, idx) => (
                  <div key={`pad-${idx}`} className="h-11 rounded opacity-25" />
                ))}
                {daysArray.map((d) => {
                  const dayIsoDate = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
                  const isSelected = selectedDay === d;
                  const hasTasks = tasks.some(t => t.dueDate === dayIsoDate);
                  const hasExams = exams.some(e => e.date === dayIsoDate);
                  
                  return (
                    <button
                      key={d}
                      onClick={() => setSelectedDay(d)}
                      className={`h-11 border rounded p-1 text-[10px] text-left hover:bg-muted/30 transition flex flex-col justify-between items-start relative ${
                        isSelected ? "border-primary ring-1 ring-primary bg-primary/5" : ""
                      }`}
                    >
                      <span className="font-mono font-bold">{d}</span>
                      <div className="flex gap-1 mt-0.5 justify-start w-full">
                        {hasTasks && <span className="h-1.5 w-1.5 rounded-full bg-primary" title="Task Due" />}
                        {hasExams && <span className="h-1.5 w-1.5 rounded-full bg-destructive" title="Exam Scheduled" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              {selectedDay && (
                <div className="mt-4 p-4 border rounded-xl bg-muted/20 text-xs text-left space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="font-bold text-primary">
                      Deadlines on {monthNames[currentMonth]} {selectedDay}, {currentYear}
                    </h4>
                  </div>
                  
                  {dayTasks.length === 0 && dayExams.length === 0 ? (
                    <p className="text-muted-foreground italic">No tasks or exams due on this date.</p>
                  ) : (
                    <div className="space-y-2">
                      {dayExams.map(ex => (
                        <div key={ex.id} className="p-2 rounded bg-destructive/10 border border-destructive/25 flex justify-between items-center">
                          <span className="font-semibold text-destructive-foreground">🚨 Exam: {ex.title}</span>
                          <span className="text-[10px] bg-destructive/20 px-2 py-0.5 rounded font-bold uppercase text-destructive-foreground">{ex.subject}</span>
                        </div>
                      ))}
                      {dayTasks.map(tk => (
                        <div key={tk.id} className="p-2 rounded bg-primary/10 border border-primary/25 flex justify-between items-center">
                          <span className="font-medium text-primary-foreground">🎯 {tk.title}</span>
                          <span className="text-[10px] bg-primary/20 px-2 py-0.5 rounded font-bold uppercase text-primary-foreground">{tk.subject}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <form onSubmit={handleAddCalendarTask} className="flex gap-1.5 pt-2 border-t border-muted">
                    <Input 
                      value={newCalendarTaskTitle}
                      onChange={(e) => setNewCalendarTaskTitle(e.target.value)}
                      placeholder="Add task for this date..." 
                      className="h-8 text-xs flex-1"
                    />
                    <Button type="submit" size="sm" className="h-8 font-bold">Add Task</Button>
                  </form>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ADAPTIVE DECISION MATRIX SIMULATOR */}
        <div className="space-y-4 text-left">
          <div className="bg-card border rounded-2xl p-5 shadow-card space-y-4">
            <h3 className="font-bold text-sm text-primary flex items-center gap-1.5">
              <RefreshCw className="h-4 w-4" />
              Adaptive Plan Trigger
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              When study scenarios alter (e.g. stress increases, exams draw near), Syntra automatically repositions time blocks. Simulate triggers:
            </p>

            <div className="space-y-2.5 pt-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => triggerAdaptiveAdjustment("missed-tasks")}
                disabled={isGenerating}
                className="w-full justify-start text-xs h-9 gap-2 border-warning text-warning hover:bg-warning/10"
              >
                <AlertTriangle className="h-4 w-4 shrink-0" />
                Overdue Assignment Trigger
              </Button>

              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => triggerAdaptiveAdjustment("burnout-spike")}
                disabled={isGenerating}
                className="w-full justify-start text-xs h-9 gap-2 border-info text-info hover:bg-info/10"
              >
                <ShieldAlert className="h-4 w-4 shrink-0" />
                Burnout Risk Spike Trigger
              </Button>

              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => triggerAdaptiveAdjustment("attendance-drop")}
                disabled={isGenerating}
                className="w-full justify-start text-xs h-9 gap-2 border-destructive text-destructive hover:bg-destructive/10"
              >
                <AlertTriangle className="h-4 w-4 shrink-0" />
                Attendance Decline Alert Trigger
              </Button>
            </div>

            {adaptiveFactor && (
              <Button 
                variant="ghost" 
                size="xs" 
                onClick={() => { setTimetable(initialWeeklyBlocks); setAdaptiveFactor(null); }}
                className="text-[10px] text-muted-foreground w-full hover:underline mt-2"
              >
                Reset Planner to Default
              </Button>
            )}
          </div>

          {/* Academic notifications / reminders */}
          <div className="bg-card border rounded-2xl p-5 shadow-card space-y-3">
            <h3 className="font-bold text-xs uppercase text-muted-foreground tracking-wider">Calendar Integrations</h3>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Google Calendar is synchronized. ICS export exports weekly planner blocks automatically.
            </p>
            <Button variant="secondary" size="sm" className="w-full text-xs h-8">
              Sync Google Calendar
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
}
