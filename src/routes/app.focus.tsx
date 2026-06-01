import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Timer, Play, Pause, RotateCcw, AlertTriangle, Sparkles, Brain, Zap, LineChart } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/focus")({
  component: FocusPage,
});

function FocusPage() {
  const studySessions = useStore((s) => s.studySessions);
  const addStudySession = useStore((s) => s.addStudySession);
  const attendance = useStore((s) => s.attendance);

  // Focus Timer States
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(attendance[0]?.subject || "General Study");
  const [focusStreak, setFocusStreak] = useState(4); // Mock streak
  const [distractionCount, setDistractionCount] = useState(0);

  // Pomodoro Countdown Logic
  useEffect(() => {
    let interval: any = null;

    if (isActive) {
      interval = setInterval(() => {
        if (seconds > 0) {
          setSeconds(seconds - 1);
        } else if (minutes > 0) {
          setMinutes(minutes - 1);
          setSeconds(59);
        } else {
          // Timer finished!
          setIsActive(false);
          addStudySession({
            subject: selectedSubject,
            duration: 25,
            date: new Date().toISOString(),
          });
          toast.success(`Great job! Completed 25-minute deep focus on ${selectedSubject}. Streak updated.`);
          setFocusStreak(prev => prev + 1);
          setMinutes(25);
          setSeconds(0);
        }
      }, 1000);
    } else {
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [isActive, minutes, seconds, selectedSubject, addStudySession]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setMinutes(25);
    setSeconds(0);
  };

  // Mock Distraction Logger
  const logDistraction = () => {
    setDistractionCount(prev => prev + 1);
    toast.warning("Distraction marked. Syntra OS is tracking focus fatigue trends.");
  };

  // Safe subject rotation getter
  const subjects = attendance.length ? attendance.map(a => a.subject) : ["Database Systems", "Operating Systems", "Compiler Design"];

  return (
    <div className="space-y-6 max-w-7xl select-none">
      
      {/* Top headers */}
      <div className="border-b pb-4">
        <h2 className="text-xl font-bold tracking-tight">Focus Mode</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Utilize Pomodoro deep work timers to detect and optimize distraction patterns.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* TIMER DISPLAY */}
        <div className="lg:col-span-2 bg-card border rounded-2xl p-6 shadow-card flex flex-col items-center justify-center text-center space-y-6 min-h-[400px]">
          <div className="w-full max-w-xs text-left">
            <Label className="text-xs text-muted-foreground uppercase font-bold">Focus Target Subject</Label>
            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger className="h-9 mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((subj) => (
                  <SelectItem key={subj} value={subj}>{subj}</SelectItem>
                ))}
                <SelectItem value="Placement Prep">💼 Placement Prep</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Big timer circle */}
          <div className="relative h-48 w-48 rounded-full border-4 border-primary flex flex-col items-center justify-center bg-primary/5 shadow-inner">
            <span className="text-5xl font-extrabold font-mono tracking-tight text-foreground">
              {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
            </span>
            <span className="text-[10px] uppercase font-bold text-muted-foreground mt-1.5 tracking-wider">
              {isActive ? "Deep Focus active" : "Timer Paused"}
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 justify-center">
            <Button 
              onClick={toggleTimer} 
              size="lg" 
              className={`h-11 px-6 rounded-xl font-bold gap-1.5 border-0 ${
                isActive ? "bg-warning hover:bg-warning/90 text-warning-foreground" : "bg-gradient-primary text-white shadow-md"
              }`}
            >
              {isActive ? <Pause className="h-4 w-4 fill-white" /> : <Play className="h-4 w-4 fill-white" />}
              {isActive ? "Pause Focus" : "Start Pomodoro"}
            </Button>

            <Button variant="outline" size="lg" onClick={resetTimer} className="h-11 w-11 p-0 rounded-xl">
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>

          {/* Distraction marking button */}
          <div className="pt-4 border-t w-full flex justify-between items-center text-xs">
            <span className="text-muted-foreground">Distraction spikes: <span className="font-bold text-warning">{distractionCount}</span> logged</span>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={logDistraction}
              className="h-8 text-[11px] text-destructive hover:bg-destructive/15 gap-1.5 border border-dashed border-destructive/35 font-bold"
            >
              <AlertTriangle className="h-3.5 w-3.5" /> Mark Distracted
            </Button>
          </div>
        </div>

        {/* AI FOCUS METRICS SIDEBAR */}
        <div className="space-y-4 text-left">
          {/* Focus patterns insights */}
          <div className="bg-card border rounded-2xl p-5 shadow-card space-y-4">
            <h3 className="font-bold text-sm text-primary flex items-center gap-1.5">
              <Brain className="h-4.5 w-4.5" />
              Focus Pattern Detection
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Syntra monitors your Pomodoro history to isolate cognitive productivity windows:
            </p>

            <div className="space-y-3 bg-muted/30 p-3 rounded-xl border text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Peak Focus Hours:</span>
                <span className="font-semibold text-success">3:00 PM – 5:30 PM</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Fatigue Threshold:</span>
                <span className="font-semibold text-warning">After 45 mins deep work</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Distraction Risk Window:</span>
                <span className="font-semibold text-destructive">8:00 PM – 10:00 PM</span>
              </div>
            </div>
          </div>

          {/* AI Focus Recommendations */}
          <div className="bg-card border rounded-2xl p-5 shadow-card space-y-4">
            <h3 className="font-bold text-sm text-primary flex items-center gap-1.5">
              <Sparkles className="h-4.5 w-4.5 animate-pulse" />
              Smart Focus Recs
            </h3>
            
            <div className="space-y-3 text-xs leading-relaxed text-muted-foreground">
              <div className="flex gap-2">
                <div className="h-5 w-5 rounded bg-primary/10 text-primary flex items-center justify-center shrink-0 font-bold">1</div>
                <p><strong>Subject Rotations:</strong> Swap Database query work with Operating Systems threads scheduler tasks when distraction spikes count reaches 3.</p>
              </div>
              <div className="flex gap-2">
                <div className="h-5 w-5 rounded bg-primary/10 text-primary flex items-center justify-center shrink-0 font-bold">2</div>
                <p><strong>Smart Breaks:</strong> Take a 5-minute deep breathing break rather than checking messages to reset cognitive load indices.</p>
              </div>
            </div>
          </div>

          {/* Gamification focus stats */}
          <div className="bg-card border rounded-2xl p-5 shadow-card flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-warning fill-warning animate-bounce" />
              <div>
                <p className="font-bold">Current Focus Streak</p>
                <p className="text-[10px] text-muted-foreground">Study days in a row</p>
              </div>
            </div>
            <span className="text-lg font-black text-primary">{focusStreak} Days</span>
          </div>
        </div>

      </div>
    </div>
  );
}
