import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { useStore, CollaborationGroup } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Users,
  MessageSquare,
  Timer,
  Plus,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Eraser,
  Circle,
  Square,
  PenTool,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/groups")({
  component: GroupsPage,
});

function GroupsPage() {
  // Store States
  const groups = useStore((s) => s.groups);
  const addGroupMessage = useStore((s) => s.addGroupMessage);
  const addGroupSharedTask = useStore((s) => s.addGroupSharedTask);
  const toggleGroupSharedTask = useStore((s) => s.toggleGroupSharedTask);
  const updateGroupWhiteboard = useStore((s) => s.updateGroupWhiteboard);

  // Local UI States
  const [selectedGroup, setSelectedGroup] = useState<CollaborationGroup | null>(groups[0] || null);
  const [chatInput, setChatInput] = useState("");
  const [taskInput, setTaskInput] = useState("");
  
  // Timer States
  const [timeLeft, setTimeLeft] = useState(1500); // 25:00
  const [timerRunning, setTimerRunning] = useState(false);

  // Canvas drawing properties
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<"pen" | "circle" | "rect">("pen");
  const [color, setColor] = useState("#6366f1");

  // Timer countdown hook
  useEffect(() => {
    let interval: any = null;
    if (timerRunning) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setTimerRunning(false);
            toast.success("Study Room Synced Pomodoro complete!");
            return 1500;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timerRunning]);

  // Canvas context setups
  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    // Clear canvas and draw border grid pattern
    ctx.fillStyle = "#1e293b";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw initial whiteboard SVGs if existing
    ctx.strokeStyle = "rgba(99, 102, 241, 0.2)";
    ctx.lineWidth = 1;
    for (let i = 0; i < canvas.width; i += 20) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, canvas.height);
      ctx.stroke();
    }
    for (let j = 0; j < canvas.height; j += 20) {
      ctx.beginPath();
      ctx.moveTo(0, j);
      ctx.lineTo(canvas.width, j);
      ctx.stroke();
    }
  }, [selectedGroup]);

  // Drawing event handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = color;
    ctx.lineWidth = tool === "pen" ? 3 : 5;
    ctx.lineCap = "round";
    
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (tool === "pen") {
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  const stopDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (tool === "circle") {
      ctx.beginPath();
      ctx.arc(x, y, 30, 0, 2 * Math.PI);
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.stroke();
    } else if (tool === "rect") {
      ctx.beginPath();
      ctx.rect(x - 30, y - 20, 60, 40);
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.stroke();
    }

    setIsDrawing(false);
    
    // Sync to store
    if (selectedGroup) {
      updateGroupWhiteboard(selectedGroup.id, canvas.toDataURL());
    }
  };

  const clearCanvas = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#1e293b";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    toast.success("Whiteboard canvas wiped clean.");
  };

  // Text message handlers
  const handleSendMessage = () => {
    if (!chatInput.trim() || !selectedGroup) return;
    addGroupMessage(selectedGroup.id, "Alex Mercer", chatInput);
    setChatInput("");

    // Simulated peer messages response
    setTimeout(() => {
      const answers = [
        "Mia Chen: Let's focus on page replacement constraints next.",
        "Ethan Hunt: I'm reviewing the virtual memory mapping segments.",
        "Priya Sharma: Synced timer is ticking down. Let's finish this block.",
      ];
      addGroupMessage(selectedGroup.id, answers[Math.floor(Math.random() * answers.length)].split(":")[0], answers[Math.floor(Math.random() * answers.length)].split(":")[1]);
    }, 1200);
  };

  const handleAddSharedTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskInput.trim() || !selectedGroup) return;
    addGroupSharedTask(selectedGroup.id, taskInput);
    setTaskInput("");
    toast.success("Shared objective added to study group dashboard!");
  };

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(mins).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  return (
    <div className="space-y-6 max-w-7xl select-none">
      
      {/* Top Header details */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Group Collaboration System</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Engage in study rooms, collaborate on whiteboards, and sync countdown clocks.</p>
        </div>

        {selectedGroup && (
          <div className="flex items-center gap-4 bg-muted/40 p-2 rounded-xl border text-xs">
            <span className="font-bold flex items-center gap-1"><Users className="h-4 w-4 text-primary" /> {selectedGroup.name}</span>
            <div className="border-l h-5 border-muted" />
            <div className="flex items-center gap-2">
              <Timer className="h-4 w-4 text-warning" />
              <span className="font-mono font-bold text-sm text-warning">{formatTimer(timeLeft)}</span>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setTimerRunning(!timerRunning)} 
                className="h-6 w-6 text-primary"
              >
                {timerRunning ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* COLLAB CHAT & MEMEBERS PANEL */}
        <div className="space-y-4 text-left">
          


          {/* Group shared tasks checklist */}
          {selectedGroup && (
            <div className="bg-card border rounded-2xl p-4 shadow-card space-y-3">
              <h3 className="font-bold text-xs uppercase text-muted-foreground tracking-wider">Team Study Objectives</h3>
              
              <div className="space-y-2 text-xs">
                {selectedGroup.sharedTasks.map((t) => (
                  <div key={t.id} className="flex items-center gap-2">
                    <Checkbox 
                      checked={t.completed} 
                      onCheckedChange={() => {
                        toggleGroupSharedTask(selectedGroup.id, t.id);
                        // Refresh state
                        const updated = useStore.getState().groups.find(g => g.id === selectedGroup.id);
                        if (updated) setSelectedGroup(updated);
                      }} 
                    />
                    <span className={t.completed ? "line-through text-muted-foreground" : ""}>{t.title}</span>
                  </div>
                ))}
              </div>

              <form onSubmit={handleAddSharedTask} className="flex gap-1.5 pt-2 border-t border-muted">
                <Input 
                  value={taskInput} 
                  onChange={(e) => setTaskInput(e.target.value)} 
                  placeholder="New shared task..." 
                  className="h-8 text-xs" 
                />
                <Button type="submit" size="sm" className="h-8 w-8 p-0"><Plus className="h-4 w-4" /></Button>
              </form>
            </div>
          )}
        </div>

        {/* REAL-TIME GROUP CHAT SYSTEM */}
        <div className="bg-card border rounded-2xl p-5 shadow-card text-left flex flex-col justify-between h-[450px]">
          <div className="border-b pb-3 flex items-center justify-between">
            <h3 className="font-bold text-sm tracking-tight text-primary flex items-center gap-1.5">
              <MessageSquare className="h-4.5 w-4.5" /> Group Chat Console
            </h3>
            <span className="text-[9px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">Realtime</span>
          </div>

          {selectedGroup ? (
            <div className="flex-1 flex flex-col justify-between space-y-3 pt-2">
              <div className="flex-1 overflow-y-auto space-y-3 p-2 bg-muted/20 border rounded-xl max-h-[300px]">
                {selectedGroup.messages.map((m) => {
                  const isMe = m.sender === "Alex Mercer";
                  return (
                    <div key={m.id} className={`p-2.5 rounded-xl border text-xs leading-normal max-w-[85%] ${
                      isMe ? "ml-auto bg-primary text-white border-primary" : "mr-auto bg-card"
                    }`}>
                      <div className="flex justify-between items-center text-[8px] font-bold uppercase opacity-80 gap-4 mb-0.5">
                        <span>{m.sender}</span>
                        <span>{m.time}</span>
                      </div>
                      {m.text}
                    </div>
                  );
                })}
              </div>

              <div className="flex gap-2">
                <Input 
                  value={chatInput} 
                  onChange={(e) => setChatInput(e.target.value)} 
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  placeholder="Messaage study room..." 
                  className="h-9 text-xs" 
                />
                <Button size="sm" onClick={handleSendMessage} className="h-9 font-bold">
                  Send
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground text-center py-20">Log in or select groups to open chat rooms.</p>
          )}
        </div>

        {/* WHITEBOARD COLLABORATION CANVAS */}
        <div className="bg-card border rounded-2xl p-5 shadow-card text-left space-y-4 h-[450px] flex flex-col justify-between">
          <div className="border-b pb-3 flex items-center justify-between">
            <h3 className="font-bold text-sm tracking-tight text-primary flex items-center gap-1.5">
              <Sparkles className="h-4.5 w-4.5 animate-pulse" /> Shared Brainstorming Canvas
            </h3>
            <span className="text-[9px] text-muted-foreground uppercase font-bold">Whiteboard</span>
          </div>

          <div className="flex-1 relative border rounded-xl overflow-hidden min-h-[220px]">
            <canvas
              ref={canvasRef}
              width={450}
              height={260}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              className="w-full h-full cursor-crosshair bg-slate-900"
            />
          </div>

          {/* Whiteboard tool actions */}
          <div className="flex justify-between items-center pt-2 border-t">
            <div className="flex gap-1.5">
              <Button 
                variant={tool === "pen" ? "primary" : "outline"} 
                size="sm" 
                onClick={() => setTool("pen")} 
                className="h-8 text-xs gap-1 font-bold"
              >
                <PenTool className="h-3.5 w-3.5" /> Pen
              </Button>
              <Button 
                variant={tool === "circle" ? "primary" : "outline"} 
                size="sm" 
                onClick={() => setTool("circle")} 
                className="h-8 text-xs gap-1 font-bold"
              >
                <Circle className="h-3.5 w-3.5" /> Circle
              </Button>
              <Button 
                variant={tool === "rect" ? "primary" : "outline"} 
                size="sm" 
                onClick={() => setTool("rect")} 
                className="h-8 text-xs gap-1 font-bold"
              >
                <Square className="h-3.5 w-3.5" /> Rect
              </Button>
            </div>
            
            <div className="flex gap-2 items-center">
              <input 
                type="color" 
                value={color} 
                onChange={(e) => setColor(e.target.value)} 
                className="h-7 w-7 rounded cursor-pointer border border-muted" 
              />
              <Button variant="ghost" size="icon" onClick={clearCanvas} className="h-8 w-8 text-destructive">
                <Eraser className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
