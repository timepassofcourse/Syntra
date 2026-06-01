import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useStore, MoodLog, SleepLog } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Heart, Sparkles, Smile, ShieldAlert, Check, RefreshCw, BarChart, BookOpen } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/wellness")({
  component: WellnessPage,
});

function WellnessPage() {
  // Store States
  const moodLogs = useStore((s) => s.moodLogs);
  const sleepLogs = useStore((s) => s.sleepLogs);
  const addMoodLog = useStore((s) => s.addMoodLog);
  const addSleepLog = useStore((s) => s.addSleepLog);
  const crisisMode = useStore((s) => s.crisisMode);
  const setCrisisMode = useStore((s) => s.setCrisisMode);
  const tasks = useStore((s) => s.tasks);

  // Local Form States
  const [selectedMood, setSelectedMood] = useState<MoodLog["mood"]>("good");
  const [stress, setStress] = useState(5);
  const [moodNotes, setMoodNotes] = useState("");
  
  const [sleepHours, setSleepHours] = useState("8");
  const [sleepQuality, setSleepQuality] = useState<SleepLog["quality"]>("good");

  const [breathingText, setBreathingText] = useState("Inhale...");

  // Form submit handlers
  const handleMoodSubmit = () => {
    addMoodLog({
      mood: selectedMood,
      stressLevel: stress,
      notes: moodNotes,
    });
    toast.success("Mood log registered successfully!");
    setMoodNotes("");
  };

  const handleSleepSubmit = () => {
    const hrs = parseFloat(sleepHours) || 8;
    addSleepLog({
      hours: hrs,
      quality: sleepQuality,
    });
    toast.success("Sleep stats logged!");
    setSleepHours("8");
  };

  // AI Burnout Diagnosis Calculator
  const getBurnoutDiagnosis = () => {
    const avgSleep = sleepLogs.length
      ? sleepLogs.reduce((sum, s) => sum + s.hours, 0) / sleepLogs.length
      : 7;
    const avgMoodStress = moodLogs.length
      ? moodLogs.reduce((sum, m) => sum + m.stressLevel, 0) / moodLogs.length
      : 5;
    const pendingCount = tasks.filter(t => !t.completed).length;

    let flag = "LOW";
    let message = "All behavioral indexes look stable. Your focus streaks are matching standard goals.";

    if (avgSleep < 6.5 || avgMoodStress > 6 || pendingCount > 2) {
      flag = "MEDIUM";
      message = "Moderate exhaustion detected. Reduced sleep hours (under 6.5h) and accumulating assignment workloads are placing strain on focus consistency.";
    }
    if (avgSleep < 5.5 && avgMoodStress > 7) {
      flag = "CRITICAL";
      message = "Exhaustion risk warning! Fatigue markers indicate severe sleep deficits. We highly suggest enabling Crisis Mode to mute dashboard alerts.";
    }

    return { flag, message };
  };

  // Breathing Box guide simulation loop
  const startBreathingGuideSim = () => {
    setBreathingText("Inhale (4s)...");
    setTimeout(() => setBreathingText("Hold (4s)..."), 4000);
    setTimeout(() => setBreathingText("Exhale (4s)..."), 8000);
    setTimeout(() => setBreathingText("Hold (4s)..."), 12000);
  };

  const diagnosis = getBurnoutDiagnosis();

  return (
    <div className="space-y-6 max-w-7xl select-none">
      
      {/* Upper header */}
      <div className="border-b pb-4">
        <h2 className="text-xl font-bold tracking-tight">Wellness & Burnout Tracker</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Monitor sleep deficits, stress indicators, and toggle Crisis Mode triggers.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LOGGERS SECTION */}
        <div className="lg:col-span-2 space-y-6 text-left">
          
          {/* Mood and Stress Logger */}
          <div className="bg-card border rounded-2xl p-5 shadow-card space-y-4">
            <h3 className="font-bold text-sm tracking-tight text-primary flex items-center gap-1.5">
              <Smile className="h-4.5 w-4.5" /> Log Daily Mood
            </h3>

            <div className="space-y-4">
              <div>
                <Label className="text-xs text-muted-foreground">Select Mood</Label>
                <div className="flex gap-2.5 pt-1.5">
                  {(["great", "good", "okay", "low", "bad"] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => setSelectedMood(m)}
                      className={`flex-1 py-2 text-sm rounded-xl border capitalize font-semibold transition ${
                        selectedMood === m ? "bg-primary text-white border-primary" : "bg-muted/30 hover:bg-muted/50"
                      }`}
                    >
                      {m === "great" ? "😄 Great" :
                       m === "good" ? "🙂 Good" :
                       m === "okay" ? "😐 Okay" :
                       m === "low" ? "😔 Low" : "😭 Bad"}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                <div className="md:col-span-1">
                  <Label className="text-xs text-muted-foreground">Stress Index ({stress}/10)</Label>
                  <input 
                    type="range" 
                    min="1" 
                    max="10" 
                    value={stress} 
                    onChange={(e) => setStress(parseInt(e.target.value))} 
                    className="w-full mt-2" 
                  />
                </div>
                <div className="md:col-span-2">
                  <Label className="text-xs text-muted-foreground">Note details (Optional)</Label>
                  <Input 
                    value={moodNotes} 
                    onChange={(e) => setMoodNotes(e.target.value)} 
                    placeholder="e.g. stressed about OS compilation deadlines"
                    className="h-9 mt-1"
                  />
                </div>
              </div>

              <Button onClick={handleMoodSubmit} className="bg-primary text-white h-9">
                Log Mood & Stress
              </Button>
            </div>
          </div>

          {/* Sleep Deficit Logger */}
          <div className="bg-card border rounded-2xl p-5 shadow-card space-y-4">
            <h3 className="font-bold text-sm tracking-tight text-primary flex items-center gap-1.5">
              <Heart className="h-4.5 w-4.5" /> Log Sleep Quality
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div>
                <Label>Hours Slept</Label>
                <Input 
                  type="number" 
                  step="0.5" 
                  value={sleepHours} 
                  onChange={(e) => setSleepHours(e.target.value)} 
                  className="h-9 mt-1" 
                />
              </div>
              <div>
                <Label>Sleep Quality</Label>
                <Select value={sleepQuality} onValueChange={(v: SleepLog["quality"]) => setSleepQuality(v)}>
                  <SelectTrigger className="h-9 mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="good">💤 Deep / Good Sleep</SelectItem>
                    <SelectItem value="fair">😐 Interrupted / Fair</SelectItem>
                    <SelectItem value="poor">🥱 Restless / Poor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleSleepSubmit} className="h-9 bg-primary text-white">
                Log Sleep
              </Button>
            </div>
          </div>

          {/* Wellness logs history review */}
          <div className="bg-card border rounded-2xl p-5 shadow-card space-y-3">
            <h3 className="font-bold text-xs uppercase text-muted-foreground tracking-wider">Mood Review History</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {moodLogs.slice(0, 3).map((log) => (
                <div key={log.id} className="p-3 border rounded-xl bg-muted/20 text-xs space-y-1">
                  <div className="flex justify-between font-bold">
                    <span className="capitalize">{log.mood === "great" ? "😄 Great" : log.mood === "good" ? "🙂 Good" : "😐 Okay"}</span>
                    <span className="text-destructive font-mono">Stress: {log.stressLevel}/10</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground">{log.date}</p>
                  {log.notes && <p className="text-[11px] italic mt-1 text-muted-foreground truncate">"{log.notes}"</p>}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* AI INSIGHTS & CRISIS MODULE CONTROL */}
        <div className="space-y-4 text-left">
          
          {/* AI Burnout Detection */}
          <div className="bg-card border rounded-2xl p-5 shadow-card space-y-4">
            <h3 className="font-bold text-sm text-primary flex items-center gap-1.5">
              <Sparkles className="h-4.5 w-4.5" />
              AI Burnout Diagnostics
            </h3>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                  diagnosis.flag === "CRITICAL" ? "bg-destructive/15 text-destructive animate-pulse" :
                  diagnosis.flag === "MEDIUM" ? "bg-warning/15 text-warning" : "bg-success/15 text-success"
                }`}>
                  Exhaustion Flag: {diagnosis.flag}
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {diagnosis.message}
              </p>
            </div>
          </div>

          {/* CRISIS MODE CONTROL */}
          <div className={`border rounded-2xl p-5 shadow-card space-y-4 transition-colors duration-1000 ${
            crisisMode ? "bg-emerald-600 dark:bg-emerald-900 border-emerald-400 text-white shadow-elevated" : "bg-card"
          }`}>
            <h3 className="font-bold text-sm flex items-center gap-1.5">
              <ShieldAlert className="h-4.5 w-4.5 animate-pulse text-destructive dark:text-rose-400" />
              Crisis Control Room
            </h3>
            
            <p className={`text-xs leading-relaxed ${crisisMode ? "text-emerald-50" : "text-muted-foreground"}`}>
              Activate Crisis Control to hide dashboard complexity, mute notification popups, and activate breathing guides.
            </p>

            <Button 
              onClick={() => {
                setCrisisMode(!crisisMode);
                toast.success(crisisMode ? "Crisis Mode deactivated. Resuming Standard layouts." : "Crisis mode activated! Breathe.");
              }}
              className={`w-full font-bold h-10 border-0 ${
                crisisMode ? "bg-white text-emerald-900 hover:bg-emerald-100" : "bg-gradient-primary text-white"
              }`}
            >
              {crisisMode ? "Deactivate Crisis Mode" : "Activate Crisis Mode"}
            </Button>

            {/* Visual Box breathing animation when Crisis Mode is active */}
            {crisisMode && (
              <div className="border border-emerald-400/40 p-4 rounded-xl text-center space-y-2 animate-in fade-in zoom-in-95 duration-300">
                <p className="text-xs font-bold uppercase tracking-widest text-emerald-150">Box Breathing Guide</p>
                <div 
                  onClick={startBreathingGuideSim}
                  className="h-14 w-full bg-emerald-750 rounded-lg flex items-center justify-center font-mono text-sm border border-emerald-500/30 cursor-pointer hover:bg-emerald-700 transition"
                >
                  {breathingText} (Click to start)
                </div>
              </div>
            )}
          </div>

          {/* Recuperation recommendations list */}
          <div className="bg-card border rounded-2xl p-5 shadow-card space-y-4">
            <h3 className="font-bold text-xs uppercase text-muted-foreground tracking-wider">Recuperation Tasks</h3>
            <div className="space-y-3 text-xs text-muted-foreground">
              <div className="flex gap-2">
                <Check className="h-4 w-4 text-success shrink-0" />
                <p>Mute social messaging threads during the 3 PM study hour block.</p>
              </div>
              <div className="flex gap-2">
                <Check className="h-4 w-4 text-success shrink-0" />
                <p>Log a 7.5-hour sleep cycle target tonight to offset the deficit.</p>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
