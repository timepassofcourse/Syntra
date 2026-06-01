import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useStore, Task } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  KanbanSquare,
  CalendarDays,
  ListOrdered,
  Sparkles,
  AlertTriangle,
  RotateCcw,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";

export const Route = createFileRoute("/app/assignments")({
  component: AssignmentsPage,
});

function AssignmentsPage() {
  // Store States
  const tasks = useStore((s) => s.tasks);
  const addTask = useStore((s) => s.addTask);
  const toggleTask = useStore((s) => s.toggleTask);
  const toggleSubtask = useStore((s) => s.toggleSubtask);
  const deleteTask = useStore((s) => s.deleteTask);
  const updateNote = useStore((s) => s.updateNote); // not used here but store is active
  
  // Local UI States
  const [view, setView] = useState<"kanban" | "calendar" | "timeline">("kanban");
  const [open, setOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(tasks[0] || null);
  const [aiGenerating, setAiGenerating] = useState(false);
  
  const [form, setForm] = useState({
    title: "",
    subject: "",
    dueDate: "",
    priority: "medium" as "low" | "medium" | "high",
  });

  const handleAddTaskSubmit = () => {
    if (!form.title.trim()) {
      toast.error("Please insert a title");
      return;
    }
    addTask(form);
    toast.success("Assignment registered successfully");
    setForm({ title: "", subject: "", dueDate: "", priority: "medium" });
    setOpen(false);
  };

  // AI features simulation
  const runAiSubtaskGenerator = (task: Task) => {
    setAiGenerating(true);
    toast.info("Generating logical subtasks via Syntra AI...");
    setTimeout(() => {
      const generated = [
        { id: Math.random().toString(36).substring(7), title: `Read syllabus material for ${task.subject || "assignment"}`, completed: false },
        { id: Math.random().toString(36).substring(7), title: "Draft core solution algorithm", completed: false },
        { id: Math.random().toString(36).substring(7), title: "Verify edge test cases & syntax checks", completed: false },
      ];
      
      // Update local state and sync store
      useStore.setState((state) => ({
        tasks: state.tasks.map((t) =>
          t.id === task.id ? { ...t, subtasks: generated } : t
        )
      }));
      
      // Re-select updated task
      const updated = useStore.getState().tasks.find((t) => t.id === task.id);
      if (updated) setSelectedTask(updated);

      toast.success("Subtasks compiled!");
      setAiGenerating(false);
    }, 1500);
  };

  const runAiDeadlineRiskPredictor = (task: Task) => {
    setAiGenerating(true);
    toast.info("Analyzing student productivity trends...");
    setTimeout(() => {
      const risks = ["low", "medium", "high"] as const;
      const computedRisk = task.priority === "high" ? "high" : risks[Math.floor(Math.random() * risks.length)];
      const plans = {
        high: "High Threat. Postpone elective project review, block out 2 hours of focused study rooms with CS peers immediately.",
        medium: "Moderate risk. Switch off notification logs during study sessions and track progress using Pomodoro timers.",
        low: "Low Risk. Keep current pace. Everything is aligned for timely upload.",
      };

      useStore.setState((state) => ({
        tasks: state.tasks.map((t) =>
          t.id === task.id ? { ...t, deadlineRisk: computedRisk, recoveryPlan: plans[computedRisk] } : t
        )
      }));

      const updated = useStore.getState().tasks.find((t) => t.id === task.id);
      if (updated) setSelectedTask(updated);

      toast.success("Risk indicators updated!");
      setAiGenerating(false);
    }, 1200);
  };

  // Kanban groupings
  const todoList = tasks.filter((t) => !t.completed);
  const inProgressList = tasks.filter((t) => !t.completed && t.subtasks && t.subtasks.some(s => s.completed));
  const completedList = tasks.filter((t) => t.completed);

  return (
    <div className="space-y-6 max-w-7xl select-none">
      
      {/* Upper header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Toggle view tabs */}
        <div className="flex gap-1.5 rounded-xl border bg-card p-1">
          <Button variant={view === "kanban" ? "primary" : "ghost"} size="sm" onClick={() => setView("kanban")} className="h-8">
            <KanbanSquare className="h-4 w-4 mr-1.5" /> Kanban
          </Button>
          <Button variant={view === "calendar" ? "primary" : "ghost"} size="sm" onClick={() => setView("calendar")} className="h-8">
            <CalendarDays className="h-4 w-4 mr-1.5" /> Calendar
          </Button>
          <Button variant={view === "timeline" ? "primary" : "ghost"} size="sm" onClick={() => setView("timeline")} className="h-8">
            <ListOrdered className="h-4 w-4 mr-1.5" /> Timeline
          </Button>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-white border-0 shadow">
              <Plus className="h-4 w-4 mr-1" /> Add Assignment
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-2xl">
            <DialogHeader>
              <DialogTitle>New Assignment</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div>
                <Label>Title</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="DBMS SQL Lab 5" />
              </div>
              <div>
                <Label>Subject Tag</Label>
                <Input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="Database Systems" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Due Date</Label>
                  <Input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
                </div>
                <div>
                  <Label>Priority</Label>
                  <Select value={form.priority} onValueChange={(v: "low" | "medium" | "high") => setForm({ ...form, priority: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low Priority</SelectItem>
                      <SelectItem value="medium">Medium Priority</SelectItem>
                      <SelectItem value="high">High Priority</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter className="mt-6">
              <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={handleAddTaskSubmit}>Register Assignment</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Main Section split: lists & AI panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* VIEW 1: KANBAN BOARD */}
        {view === "kanban" && (
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Open / To Do */}
            <div className="space-y-3">
              <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground">Pending Assignments ({todoList.length})</h4>
              <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
                {todoList.map((t) => (
                  <div 
                    key={t.id} 
                    onClick={() => setSelectedTask(t)}
                    className={`p-4 rounded-xl border bg-card shadow-sm cursor-pointer hover:border-primary/40 transition text-left space-y-2 ${
                      selectedTask?.id === t.id ? "border-primary ring-1 ring-primary/20" : ""
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground">{t.subject || "General"}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                        t.priority === "high" ? "bg-destructive/10 text-destructive" :
                        t.priority === "medium" ? "bg-warning/10 text-warning" : "bg-info/10 text-info"
                      }`}>{t.priority}</span>
                    </div>
                    <p className="text-xs font-bold leading-snug">{t.title}</p>
                    <div className="flex justify-between items-center text-[10px] text-muted-foreground pt-1">
                      <span>Due {t.dueDate ? format(parseISO(t.dueDate), "MMM d") : "None"}</span>
                      <span>{t.subtasks?.length || 0} subtasks</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Completed */}
            <div className="space-y-3">
              <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground">Completed ({completedList.length})</h4>
              <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
                {completedList.map((t) => (
                  <div 
                    key={t.id}
                    onClick={() => setSelectedTask(t)}
                    className={`p-4 rounded-xl border bg-card shadow-sm opacity-70 cursor-pointer hover:border-primary/25 transition text-left space-y-2 ${
                      selectedTask?.id === t.id ? "border-primary" : ""
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground">{t.subject || "General"}</span>
                      <span className="h-4.5 w-4.5 rounded-full bg-success/10 text-success flex items-center justify-center"><CheckCircle2 className="h-3 w-3" /></span>
                    </div>
                    <p className="text-xs font-bold leading-snug line-through text-muted-foreground">{t.title}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: CALENDAR LIST */}
        {view === "calendar" && (
          <div className="lg:col-span-2 space-y-3 bg-card border rounded-2xl p-5 shadow-card min-h-[300px]">
            <h3 className="font-bold text-sm">Deadlines Calendar List</h3>
            <div className="divide-y text-left">
              {tasks.filter(t => t.dueDate).map((t) => (
                <div key={t.id} className="py-3 flex justify-between items-center text-xs">
                  <div className="space-y-1">
                    <p className="font-bold">{t.title}</p>
                    <span className="text-[10px] text-muted-foreground uppercase font-bold">{t.subject}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-primary">{format(parseISO(t.dueDate!), "eeee, MMM d")}</p>
                    <span className="text-[10px] text-muted-foreground">Remaining: {Math.max(0, Math.round((new Date(t.dueDate!).getTime() - Date.now()) / 86400000))} days</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW 3: TIMELINE */}
        {view === "timeline" && (
          <div className="lg:col-span-2 space-y-4 text-left">
            <h3 className="font-bold text-sm">Task Execution Timeline</h3>
            <div className="relative border-l pl-6 space-y-6">
              {tasks.map((t, idx) => (
                <div key={t.id} className="relative">
                  <div className="absolute -left-[31px] top-0 h-5 w-5 rounded-full bg-background border-2 border-primary flex items-center justify-center text-[10px] font-bold">
                    {idx + 1}
                  </div>
                  <div className="bg-card border p-4 rounded-xl shadow-sm space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-xs">{t.title}</h4>
                        <span className="text-[9px] uppercase font-bold text-muted-foreground">{t.subject}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                        t.priority === "high" ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground"
                      }`}>{t.priority}</span>
                    </div>
                    {t.dueDate && (
                      <p className="text-[10px] text-muted-foreground">Complete by: {format(parseISO(t.dueDate), "MMM d, yyyy")}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI PANEL DETAIL SECTION */}
        <div className="rounded-2xl border bg-card p-5 shadow-card space-y-5 h-fit text-left">
          {selectedTask ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <div>
                  <h3 className="font-bold text-xs uppercase text-muted-foreground">Selected Assignment</h3>
                  <h4 className="font-bold text-sm mt-0.5">{selectedTask.title}</h4>
                </div>
                <Button variant="ghost" size="icon" onClick={() => deleteTask(selectedTask.id)}>
                  <Trash2 className="h-4.5 w-4.5 text-muted-foreground hover:text-destructive" />
                </Button>
              </div>

              {/* Assignment complete checkbox */}
              <div className="flex items-center gap-3 bg-muted/40 p-3 rounded-xl border">
                <Checkbox 
                  checked={selectedTask.completed} 
                  onCheckedChange={() => {
                    toggleTask(selectedTask.id);
                    // refresh state
                    const updated = useStore.getState().tasks.find((t) => t.id === selectedTask.id);
                    if (updated) setSelectedTask(updated);
                  }} 
                />
                <span className="text-xs font-semibold">Mark assignment completed</span>
              </div>

              {/* Subtasks Block */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold uppercase text-muted-foreground">AI Subtask list</Label>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => runAiSubtaskGenerator(selectedTask)}
                    disabled={aiGenerating}
                    className="h-6 text-[10px] text-primary gap-1 font-bold"
                  >
                    <Sparkles className="h-3 w-3" /> Auto-generate
                  </Button>
                </div>

                {selectedTask.subtasks && selectedTask.subtasks.length > 0 ? (
                  <div className="space-y-2 bg-muted/30 p-3 rounded-xl border">
                    {selectedTask.subtasks.map((sub) => (
                      <div key={sub.id} className="flex items-center gap-2.5 text-xs">
                        <Checkbox 
                          checked={sub.completed} 
                          onCheckedChange={() => {
                            toggleSubtask(selectedTask.id, sub.id);
                            const updated = useStore.getState().tasks.find((t) => t.id === selectedTask.id);
                            if (updated) setSelectedTask(updated);
                          }}
                        />
                        <span className={sub.completed ? "line-through text-muted-foreground" : ""}>{sub.title}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-muted-foreground py-2 text-center border border-dashed rounded-xl">
                    No subtasks. Run AI Subtask Generator to break this down.
                  </p>
                )}
              </div>

              {/* Risk predictor & recovery suggestions */}
              <div className="space-y-3 pt-2 border-t">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold uppercase text-muted-foreground">Deadline Risk Analytics</Label>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => runAiDeadlineRiskPredictor(selectedTask)}
                    disabled={aiGenerating}
                    className="h-6 text-[10px] text-primary gap-1 font-bold"
                  >
                    <AlertTriangle className="h-3 w-3" /> Analyze Risk
                  </Button>
                </div>

                {selectedTask.deadlineRisk ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        selectedTask.deadlineRisk === "high" ? "bg-destructive/15 text-destructive" :
                        selectedTask.deadlineRisk === "medium" ? "bg-warning/15 text-warning" : "bg-success/15 text-success"
                      }`}>
                        Risk level: {selectedTask.deadlineRisk.toUpperCase()}
                      </span>
                    </div>

                    {selectedTask.recoveryPlan && (
                      <div className="bg-warning/10 rounded-xl p-3 border border-warning/25 text-[11px] leading-relaxed text-warning-foreground">
                        <span className="font-bold flex items-center gap-1.5 mb-1 text-warning">
                          <RotateCcw className="h-3.5 w-3.5" /> AI Recovery Suggestion:
                        </span>
                        {selectedTask.recoveryPlan}
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-[11px] text-muted-foreground py-2 text-center border border-dashed rounded-xl">
                    No risk statistics checked yet.
                  </p>
                )}
              </div>

            </div>
          ) : (
            <p className="text-xs text-muted-foreground text-center py-10">Select an assignment to view details and invoke Syntra AI actions.</p>
          )}
        </div>

      </div>
    </div>
  );
}
