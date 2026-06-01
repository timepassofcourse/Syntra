import { createFileRoute, Link } from "@tanstack/react-router";
import { useStore } from "@/lib/store";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Calendar,
  CheckCircle2,
  Timer,
  BookOpen,
  Sparkles,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Heart,
  Settings2,
  Briefcase,
  Zap,
  BellRing,
} from "lucide-react";
import { format, parseISO, isToday, startOfWeek, addDays } from "date-fns";

export const Route = createFileRoute("/app/")({
  component: Dashboard,
});

function Dashboard() {
  // Store states
  const tasks = useStore((s) => s.tasks);
  const studySessions = useStore((s) => s.studySessions);
  const attendance = useStore((s) => s.attendance);
  const profile = useStore((s) => s.profile);
  const crisisMode = useStore((s) => s.crisisMode);
  const moodLogs = useStore((s) => s.moodLogs);
  const placementProfile = useStore((s) => s.placementProfile);

  // Widget visibility customization state
  const [showHealth, setShowHealth] = useState(true);
  const [showBriefing, setShowBriefing] = useState(true);
  const [showAnalytics, setShowAnalytics] = useState(true);
  const [showNotifications, setShowNotifications] = useState(true);
  const [isCustomizing, setIsCustomizing] = useState(false);

  // 1. Math for Academic Health Score
  // Attendance score
  const avgAttendance = attendance.length 
    ? attendance.reduce((sum, a) => sum + (a.total ? (a.attended / a.total) * 100 : 100), 0) / attendance.length 
    : 80;
  // Assignment completion rate
  const pendingTasks = tasks.filter((t) => !t.completed).length;
  const completedTasks = tasks.filter((t) => t.completed).length;
  const taskCompletionRate = (completedTasks + pendingTasks) > 0 
    ? (completedTasks / (completedTasks + pendingTasks)) * 100 
    : 100;
  // Burnout Risk calculation based on stress levels logged
  const avgStress = moodLogs.length
    ? moodLogs.reduce((sum, m) => sum + m.stressLevel, 0) / moodLogs.length
    : 4;
  const burnoutRisk = avgStress > 6 ? "High" : avgStress > 4 ? "Medium" : "Low";
  
  // Overall Health Score formula
  const healthScore = Math.round(
    (avgAttendance * 0.4) + (taskCompletionRate * 0.4) + ((10 - avgStress) * 10) * 0.2
  );

  // AI recommendations based on metrics
  const getAiRecommendation = () => {
    if (burnoutRisk === "High") {
      return "Critical Burnout Detected. Enable Crisis Mode, reduce your elective study hours by 20% this week, and focus on physical recovery.";
    }
    if (avgAttendance < 75) {
      return "Attendance Warning. You have critical subjects below 75%. Prioritize your Operating Systems lectures to avoid exam bar list.";
    }
    if (pendingTasks > 2) {
      return "Syllabus Accumulation. You have 3 pending assignments due soon. Let Syntra generate subtasks to divide and conquer.";
    }
    return "Excellent Pace! Keep up the focus streak. We recommend doing a placement DSA review mock worksheet today.";
  };

  // 2. Daily AI Briefing Points
  const getBriefingPoints = () => {
    const points = [];
    if (pendingTasks > 0) {
      points.push({
        type: "deadline",
        text: `You have ${pendingTasks} pending assignment deadlines this week.`,
        color: "text-warning",
      });
    }
    const lowAtt = attendance.filter((a) => a.total > 0 && (a.attended / a.total) * 100 < 75);
    if (lowAtt.length > 0) {
      points.push({
        type: "attendance",
        text: `Attendance danger: ${lowAtt.map((l) => l.subject).join(", ")} is below threshold.`,
        color: "text-destructive",
      });
    }
    if (burnoutRisk === "High" || burnoutRisk === "Medium") {
      points.push({
        type: "burnout",
        text: "Elevated stress trends detected. Consider taking a 15-minute breather session.",
        color: "text-info",
      });
    }
    if (placementProfile.atsScore && placementProfile.atsScore < 80) {
      points.push({
        type: "placement",
        text: `Your resume ATS score is at ${placementProfile.atsScore}%. We suggest solving TypeScript gaps for Google readiness.`,
        color: "text-primary",
      });
    }
    if (points.length === 0) {
      points.push({
        type: "general",
        text: "Timetable schedule is clear. Ideal day to log focus sessions or review notes folder.",
        color: "text-success",
      });
    }
    return points;
  };

  // 3. Productivity Analytics Math
  const today = new Date();
  const focusToday = studySessions
    .filter((s) => isToday(parseISO(s.date)))
    .reduce((sum, s) => sum + s.duration, 0);

  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weeklyHours = Array.from({ length: 7 }).map((_, i) => {
    const day = addDays(weekStart, i);
    const mins = studySessions
      .filter((s) => format(parseISO(s.date), "yyyy-MM-dd") === format(day, "yyyy-MM-dd"))
      .reduce((sum, s) => sum + s.duration, 0);
    return { day: format(day, "EEE"), hours: mins / 60 };
  });
  const maxH = Math.max(...weeklyHours.map((w) => w.hours), 1);

  // 4. Smart Notifications List
  const notifications = [
    { id: "n-1", type: "warning", text: "Low Attendance: Operating Systems class attendance fell to 70%. Can skip 0 classes.", time: "2h ago" },
    { id: "n-2", type: "deadline", text: "Upcoming Deadline: DBMS Lab Assignment 4 is due in 48 hours.", time: "4h ago" },
    { id: "n-3", type: "placement", text: "Resume GAP: Skill gap analysis reports missing Node/TypeScript skills for Target Roles.", time: "1d ago" },
  ];

  return (
    <div className="space-y-6 max-w-7xl select-none">
      {/* Greetings Block */}
      <div className={`rounded-2xl border p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-card transition-all duration-1000 ${
        crisisMode ? "bg-emerald-100/50 dark:bg-emerald-950/20 border-emerald-500/20" : "bg-card"
      }`}>
        <div>
          <p className="text-xs text-muted-foreground">{format(new Date(), "EEEE, MMMM d, yyyy")}</p>
          <h2 className="text-2xl font-bold mt-1 tracking-tight">
            Welcome to Syntra, {profile.name?.split(" ")[0] || "Student"} ✨
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            {crisisMode 
              ? "Dashboard simplified for wellness recovery. Take it easy today." 
              : `Active Workspace: ${useStore((s) => s.activeWorkspace)}. System diagnostics normal.`}
          </p>
        </div>
        
        <div className="flex gap-2">
          {/* Customize Widgets Button */}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setIsCustomizing(!isCustomizing)}
            className="h-9 gap-1.5"
          >
            <Settings2 className="h-4 w-4" />
            Customize Modules
          </Button>

          <Button asChild size="sm" className="bg-gradient-primary text-white border-0 shadow">
            <Link to="/app/focus">
              Start Focus Session <Zap className="ml-1 h-3.5 w-3.5 fill-white" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Widget customization drawer control */}
      {isCustomizing && (
        <div className="border rounded-2xl p-4 bg-muted/40 grid grid-cols-2 md:grid-cols-4 gap-4 animate-in fade-in slide-in-from-top-3 duration-200">
          <div className="flex items-center gap-2">
            <input type="checkbox" id="w-health" checked={showHealth} onChange={(e) => setShowHealth(e.target.checked)} />
            <Label htmlFor="w-health" className="text-xs">Academic Health Score</Label>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="w-briefing" checked={showBriefing} onChange={(e) => setShowBriefing(e.target.checked)} />
            <Label htmlFor="w-briefing" className="text-xs">Daily AI Briefing</Label>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="w-analytics" checked={showAnalytics} onChange={(e) => setShowAnalytics(e.target.checked)} />
            <Label htmlFor="w-analytics" className="text-xs">Productivity Analytics</Label>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="w-notify" checked={showNotifications} onChange={(e) => setShowNotifications(e.target.checked)} />
            <Label htmlFor="w-notify" className="text-xs">Smart Notifications</Label>
          </div>
        </div>
      )}

      {/* Grid of Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* WIDGET 1: ACADEMIC HEALTH SCORE */}
        {showHealth && (
          <div className="rounded-2xl border bg-card p-5 shadow-card space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm tracking-tight text-muted-foreground uppercase">Academic Health Score</h3>
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            
            <div className="flex items-center gap-4">
              <div className="relative flex items-center justify-center">
                {/* Simulated circle graphic */}
                <div className="h-20 w-20 rounded-full border-4 border-muted flex items-center justify-center">
                  <span className="text-2xl font-extrabold">{healthScore}%</span>
                </div>
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Attendance:</span>
                  <span className="font-semibold">{Math.round(avgAttendance)}%</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Assignment Rate:</span>
                  <span className="font-semibold">{Math.round(taskCompletionRate)}%</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Burnout Risk:</span>
                  <span className={`font-semibold ${burnoutRisk === "High" ? "text-destructive" : burnoutRisk === "Medium" ? "text-warning" : "text-success"}`}>
                    {burnoutRisk}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-accent/40 rounded-xl p-3 border text-xs leading-relaxed text-accent-foreground">
              <span className="font-bold">AI Diagnosis:</span> {getAiRecommendation()}
            </div>
          </div>
        )}

        {/* WIDGET 2: DAILY AI BRIEFING */}
        {showBriefing && (
          <div className="rounded-2xl border bg-card p-5 shadow-card space-y-3 lg:col-span-2">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-bold text-sm tracking-tight text-muted-foreground uppercase">Daily AI Briefing</h3>
              <span className="text-[10px] bg-primary/10 text-primary px-2.5 py-0.5 rounded-full font-bold">Syntra Engine V1.2</span>
            </div>
            
            <ul className="space-y-3">
              {getBriefingPoints().map((p, idx) => (
                <li key={idx} className="flex items-start gap-3 p-2 rounded-xl hover:bg-muted/40 transition">
                  <div className="h-7 w-7 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    {p.type === "deadline" ? <Calendar className="h-4 w-4 text-warning" /> :
                     p.type === "attendance" ? <AlertTriangle className="h-4 w-4 text-destructive" /> :
                     p.type === "burnout" ? <Heart className="h-4 w-4 text-info" /> :
                     p.type === "placement" ? <Briefcase className="h-4 w-4 text-primary" /> :
                     <Sparkles className="h-4 w-4 text-success" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold">{p.type.toUpperCase()}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{p.text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* WIDGET 3: PRODUCTIVITY ANALYTICS */}
        {showAnalytics && !crisisMode && (
          <div className="rounded-2xl border bg-card p-5 shadow-card lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm tracking-tight text-muted-foreground uppercase">Productivity Analytics</h3>
              <div className="flex items-center gap-1.5 text-xs text-success font-semibold">
                <TrendingUp className="h-3.5 w-3.5" />
                {weeklyHours.reduce((s, w) => s + w.hours, 0).toFixed(1)}h total
              </div>
            </div>

            <div className="h-36 flex items-end gap-3.5 pt-2">
              {weeklyHours.map((w) => (
                <div key={w.day} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full flex-1 flex items-end">
                    <div
                      className="w-full rounded-lg bg-gradient-primary transition-all duration-500"
                      style={{ height: `${(w.hours / maxH) * 100}%`, minHeight: "4px" }}
                    />
                  </div>
                  <span className="text-[10px] text-muted-foreground font-semibold">{w.day}</span>
                </div>
              ))}
            </div>
            
            <div className="flex items-center justify-between text-xs border-t pt-3">
              <span className="text-muted-foreground">Focus hours today:</span>
              <span className="font-bold text-primary">{Math.floor(focusToday / 60)}h {focusToday % 60}m</span>
            </div>
          </div>
        )}

        {/* WIDGET 4: SMART NOTIFICATIONS */}
        {showNotifications && (
          <div className="rounded-2xl border bg-card p-5 shadow-card space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm tracking-tight text-muted-foreground uppercase">Smart Notifications</h3>
              <BellRing className="h-4 w-4 text-primary" />
            </div>

            <div className="space-y-3.5">
              {notifications.map((n) => (
                <div key={n.id} className="text-xs p-3 rounded-xl bg-muted/40 border space-y-1">
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                      n.type === "warning" ? "bg-destructive/10 text-destructive" :
                      n.type === "deadline" ? "bg-warning/10 text-warning" : "bg-primary/10 text-primary"
                    }`}>
                      {n.type}
                    </span>
                    <span className="text-[9px] text-muted-foreground">{n.time}</span>
                  </div>
                  <p className="text-muted-foreground leading-normal mt-1">{n.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
