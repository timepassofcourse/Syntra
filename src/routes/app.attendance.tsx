import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useStore, AttendanceItem } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Sparkles,
  AlertTriangle,
  GraduationCap,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";

export const Route = createFileRoute("/app/attendance")({
  component: AttendancePage,
});

function AttendancePage() {
  // Store States
  const attendance = useStore((s) => s.attendance);
  const addAttendanceSubject = useStore((s) => s.addAttendanceSubject);
  const logAttendanceClass = useStore((s) => s.logAttendanceClass);
  const deleteAttendanceSubject = useStore((s) => s.deleteAttendanceSubject);

  // Local UI States
  const [open, setOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<AttendanceItem | null>(attendance[0] || null);
  const [newSubjName, setNewSubjName] = useState("");
  const [newSubjTarget, setNewSubjTarget] = useState("75");
  const [newSubjTotalLectures, setNewSubjTotalLectures] = useState("40");

  const handleAddSubject = () => {
    if (!newSubjName.trim()) {
      toast.error("Enter a subject name");
      return;
    }
    const target = parseInt(newSubjTarget) || 75;
    const totalLectures = parseInt(newSubjTotalLectures) || 40;
    addAttendanceSubject(newSubjName, target, totalLectures);
    toast.success("Subject tracked!");
    setNewSubjName("");
    setNewSubjTotalLectures("40");
    setOpen(false);
    
    // Select newly added subject if not selected
    const updated = useStore.getState().attendance;
    if (updated.length > 0) setSelectedSubject(updated[updated.length - 1]);
  };

  const handleLogClass = (subjectId: string, status: "present" | "absent") => {
    logAttendanceClass(subjectId, status);
    toast.success(`Logged class as ${status}`);
    
    // Refresh selected subject
    const updated = useStore.getState().attendance.find(a => a.id === subjectId);
    if (updated) setSelectedSubject(updated);
  };

  // Safe Skip calculation details
  const getSafeSkipDetails = (item: AttendanceItem) => {
    const { attended, total, target } = item;
    
    if (total === 0) {
      return {
        safeSkips: 0,
        pctIfSkipped: 0,
        classesToRecover: 0,
        text: "No classes logged yet. Cannot calculate skip limits.",
        risk: "low",
      };
    }

    const currentPct = (attended / total) * 100;
    
    // 1. How many classes can be skipped safely?
    // Formula: (attended) / (total + skipCount) >= target/100
    // => skipCount <= (attended * 100 / target) - total
    const maxSkips = Math.floor((attended * 100) / target) - total;
    const safeSkips = Math.max(0, maxSkips);
    const pctIfSkipped = ((attended) / (total + 1)) * 100;

    // 2. How many classes needed to recover?
    // Formula: (attended + recoverCount) / (total + recoverCount) >= target/100
    // => recoverCount * (1 - target/100) >= (target/100 * total) - attended
    // => recoverCount >= (target * total/100 - attended) / (1 - target/100)
    let classesToRecover = 0;
    if (currentPct < target) {
      const targetRatio = target / 100;
      classesToRecover = Math.ceil((targetRatio * total - attended) / (1 - targetRatio));
    }

    let text = "";
    let risk: "low" | "medium" | "high" = "low";

    if (currentPct < target) {
      risk = "high";
      text = `Danger Zone! You are below your ${target}% target. Do not skip. You must attend the next ${classesToRecover} consecutive classes to recover your attendance standing.`;
    } else if (safeSkips === 0) {
      risk = "medium";
      text = `On the margin. Your attendance is ${currentPct.toFixed(1)}%. Skipping 1 class will drop your attendance to ${pctIfSkipped.toFixed(1)}%, which violates your ${target}% threshold.`;
    } else {
      risk = "low";
      const nextPct = ((attended) / (total + safeSkips)) * 100;
      text = `Safe to skip! You can skip up to ${safeSkips} upcoming classes. Skipping ${safeSkips} classes will bring your attendance exactly to ${nextPct.toFixed(1)}%.`;
    }

    return {
      safeSkips,
      pctIfSkipped,
      classesToRecover,
      text,
      risk,
    };
  };

  return (
    <div className="space-y-6 max-w-7xl select-none">
      
      {/* Warning Alert Banner for Danger Attendance */}
      {attendance.some(a => a.total > 0 && (a.attended / a.total) * 100 < a.target) && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold px-4 py-3 rounded-2xl flex items-center gap-2.5 animate-bounce">
          <AlertTriangle className="h-4.5 w-4.5 shrink-0" />
          <span>Attendance Danger Alert: One or more subjects have fallen below the required threshold target. Skip predictor restricted.</span>
        </div>
      )}

      {/* Header controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Attendance System</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Log class markers and compute automated safe skip limits.</p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-white border-0 shadow">
              <Plus className="h-4 w-4 mr-1" /> Track Subject
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-2xl">
            <DialogHeader>
              <DialogTitle>Track New Subject</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div>
                <Label>Subject Name</Label>
                <Input value={newSubjName} onChange={(e) => setNewSubjName(e.target.value)} placeholder="e.g. Operating Systems" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Target Percentage (%)</Label>
                  <Input type="number" value={newSubjTarget} onChange={(e) => setNewSubjTarget(e.target.value)} placeholder="75" />
                </div>
                <div>
                  <Label>Total Semester Lectures</Label>
                  <Input type="number" value={newSubjTotalLectures} onChange={(e) => setNewSubjTotalLectures(e.target.value)} placeholder="40" />
                </div>
              </div>
            </div>
            <DialogFooter className="mt-6">
              <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={handleAddSubject}>Begin Tracking</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Body grids split list & analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* SUBJECTS LIST */}
        <div className="lg:col-span-2 space-y-4 text-left">
          <div className="bg-card border rounded-2xl p-5 shadow-card space-y-4">
            <h3 className="font-bold text-sm tracking-tight text-muted-foreground uppercase">Subjects Status</h3>
            
            {attendance.length === 0 ? (
              <p className="text-xs text-muted-foreground py-8 text-center border border-dashed rounded-xl">No subjects added. Add subjects to begin tracking.</p>
            ) : (
              <div className="space-y-4">
                {attendance.map((a) => {
                  const pct = a.total > 0 ? (a.attended / a.total) * 100 : 100;
                  const isBelow = pct < a.target;

                  return (
                    <div 
                      key={a.id} 
                      onClick={() => setSelectedSubject(a)}
                      className={`p-4 rounded-xl border bg-muted/20 cursor-pointer hover:border-primary/30 transition space-y-3 ${
                        selectedSubject?.id === a.id ? "border-primary ring-1 ring-primary/20 bg-primary/5" : ""
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-sm">{a.subject}</h4>
                          <p className="text-[10px] text-muted-foreground uppercase font-bold mt-0.5">Target: {a.target}% · Limit: {a.totalLectures || 40} lectures</p>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isBelow ? "bg-destructive/10 text-destructive animate-pulse" : "bg-success/10 text-success"
                          }`}>
                            {pct.toFixed(0)}%
                          </span>
                          <span className="text-[10px] text-muted-foreground font-mono">({a.attended}/{a.total})</span>
                        </div>
                      </div>

                      {/* Percentage progress bar */}
                      <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-500 ${
                            isBelow ? "bg-destructive" : "bg-success"
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>

                      {/* Log buttons */}
                      <div className="flex justify-end items-center gap-2 pt-1 border-t border-muted">
                        {a.total >= (a.totalLectures || 40) && (
                          <span className="text-[9px] text-muted-foreground mr-auto font-semibold italic">Semester complete (Limit reached: {a.totalLectures || 40})</span>
                        )}
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          disabled={a.total >= (a.totalLectures || 40)}
                          onClick={(e) => { e.stopPropagation(); handleLogClass(a.id, "present"); }}
                          className="h-7 text-[10px] text-success hover:bg-success/10 gap-1 font-bold"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" /> Log Present
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          disabled={a.total >= (a.totalLectures || 40)}
                          onClick={(e) => { e.stopPropagation(); handleLogClass(a.id, "absent"); }}
                          className="h-7 text-[10px] text-destructive hover:bg-destructive/10 gap-1 font-bold"
                        >
                          <XCircle className="h-3.5 w-3.5" /> Log Absent
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* AI SAFE SKIP PREDICTOR DETAILS */}
        <div className="space-y-4 text-left">
          <div className="bg-card border rounded-2xl p-5 shadow-card space-y-4 h-fit">
            {selectedSubject ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-3">
                  <div>
                    <h3 className="font-bold text-xs uppercase text-muted-foreground">Safe Skip Predictor</h3>
                    <h4 className="font-bold text-sm mt-0.5">{selectedSubject.subject}</h4>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => deleteAttendanceSubject(selectedSubject.id)}>
                    <Trash2 className="h-4.5 w-4.5 text-muted-foreground hover:text-destructive" />
                  </Button>
                </div>

                {/* Math calculation display cards */}
                {(() => {
                  const details = getSafeSkipDetails(selectedSubject);
                  return (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center bg-muted/40 p-4 rounded-xl border text-center">
                        <div className="flex-1">
                          <p className="text-[10px] text-muted-foreground font-bold uppercase">Safe Skips</p>
                          <p className="text-3xl font-extrabold text-primary mt-1">{details.safeSkips}</p>
                        </div>
                        <div className="border-l h-10 border-muted" />
                        <div className="flex-1">
                          <p className="text-[10px] text-muted-foreground font-bold uppercase">Recovery Days</p>
                          <p className="text-3xl font-extrabold text-warning mt-1">{details.classesToRecover}</p>
                        </div>
                      </div>

                      <div className={`p-4 rounded-xl border text-xs leading-relaxed ${
                        details.risk === "high" ? "bg-destructive/10 border-destructive/20 text-destructive-foreground" :
                        details.risk === "medium" ? "bg-warning/10 border-warning/20 text-warning-foreground" :
                        "bg-success/10 border-success/20 text-success-foreground"
                      }`}>
                        <span className="font-bold flex items-center gap-1.5 mb-1.5 uppercase tracking-wider text-[10px]">
                          <Sparkles className="h-3.5 w-3.5 shrink-0" />
                          Syntra Skip recommendation
                        </span>
                        {details.text}
                      </div>

                      {/* Subject Class Logs lists */}
                      <div className="space-y-2 pt-2 border-t border-muted">
                        <Label className="text-[10px] uppercase text-muted-foreground font-bold">Class History logs</Label>
                        {selectedSubject.logs.length === 0 ? (
                          <p className="text-[11px] text-muted-foreground italic py-1">No logs on record.</p>
                        ) : (
                          <div className="max-h-[140px] overflow-y-auto space-y-1.5 pr-1">
                            {selectedSubject.logs.map((log) => (
                              <div key={log.id} className="text-[11px] flex justify-between items-center py-1 border-b last:border-0 border-muted/50">
                                <span className="text-muted-foreground">{log.date}</span>
                                <span className={`font-bold ${log.status === "present" ? "text-success" : "text-destructive"}`}>
                                  {log.status.toUpperCase()}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}

              </div>
            ) : (
              <p className="text-xs text-muted-foreground text-center py-10">Select a tracked subject to activate skip calculators.</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
