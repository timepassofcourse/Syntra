import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Brain, MessageSquare, Send, Sparkles, Database, ShieldAlert, Trash2, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { callGemini } from "@/lib/gemini";

export const Route = createFileRoute("/app/assistant")({
  component: AssistantPage,
});

function AssistantPage() {
  // Store States
  const aiMemory = useStore((s) => s.aiMemory);
  const addAiMemory = useStore((s) => s.addAiMemory);
  const clearAiMemory = useStore((s) => s.clearAiMemory);

  // Local UI States
  const [messages, setMessages] = useState<{ sender: "user" | "ai"; text: string }[]>([
    {
      sender: "ai",
      text: "Hello! I am Syntra, your cognitive student cockpit assistant. I remember your academic goals, weak subjects, and focus habits to guide your scheduling. Ask me to formulate study roadmaps, summarize notes, or suggest stress recovery options.",
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [newMemoryFact, setNewMemoryFact] = useState("");
  const [aiResponding, setAiResponding] = useState(false);

  // Chat message submission
  const handleSendMessage = async (customText?: string) => {
    const query = customText || chatInput;
    if (!query.trim()) return;

    const userMsg = { sender: "user" as const, text: query };
    setMessages((prev) => [...prev, userMsg]);
    setChatInput("");
    setAiResponding(true);

    try {
      const memoryPrompt = aiMemory.length > 0 
        ? `Here are facts about the student from their Syntra profile memory database:\n${aiMemory.map(f => `- ${f}`).join("\n")}`
        : "There are no memory facts recorded yet for this student.";
        
      const systemInstructions = `You are Syntra, the cognitive Student Operating System AI assistant.
Your task is to answer the student's request in a helpful, friendly, and structured manner.
Keep your responses relatively concise (1-2 paragraphs if possible, or a nice bulleted list if formatting a plan/schedule).
Use markdown styling to present key terms in bold or format lists.
${memoryPrompt}`;

      const historyContext = messages.map(m => `${m.sender === "user" ? "Student" : "Syntra AI"}: ${m.text}`).join("\n");
      const fullPrompt = `${systemInstructions}\n\nChat History:\n${historyContext}\nStudent: ${query}\nSyntra AI:`;

      const responseText = await callGemini(fullPrompt);
      setMessages((prev) => [...prev, { sender: "ai", text: responseText }]);
    } catch (err) {
      console.error(err);
      toast.error("Failed to connect to Syntra AI backend. Check internet or API key.");
      setMessages((prev) => [...prev, { sender: "ai", text: "I encountered an error connecting to the Gemini backend. Please check your connection and configuration." }]);
    } finally {
      setAiResponding(false);
    }
  };

  const handleAddMemoryFact = () => {
    if (!newMemoryFact.trim()) return;
    addAiMemory(newMemoryFact);
    setNewMemoryFact("");
    toast.success("Cognitive memory parameter updated!");
  };

  return (
    <div className="space-y-6 max-w-7xl select-none">
      
      {/* Upper header */}
      <div className="border-b pb-4">
        <h2 className="text-xl font-bold tracking-tight">Syntra AI Assistant</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Interact with the core chat assistant and inspect personalized study memories.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* AI MEMORY ENGINE VIEW */}
        <div className="space-y-4 text-left">
          <div className="bg-card border rounded-2xl p-5 shadow-card space-y-4">
            <h3 className="font-bold text-sm text-primary flex items-center gap-1.5">
              <Brain className="h-4.5 w-4.5" />
              AI Memory Engine
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Syntra remembers key student attributes dynamically to customize planning algorithms:
            </p>

            <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
              {aiMemory.map((fact, idx) => (
                <div key={idx} className="p-2.5 rounded-xl border bg-muted/20 text-xs font-mono flex items-start gap-2 leading-normal">
                  <span className="text-primary mt-0.5">•</span>
                  <span>{fact}</span>
                </div>
              ))}
            </div>

            {/* Clear memory trigger */}
            <div className="flex justify-between items-center pt-2 border-t border-muted">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearAiMemory} 
                className="h-7 text-[10px] text-destructive hover:bg-destructive/10 gap-1 font-bold"
              >
                <Trash2 className="h-3.5 w-3.5" /> Clear Memories
              </Button>
            </div>
          </div>

          {/* Inject new memory fact manually */}
          <div className="bg-card border rounded-2xl p-4 shadow-card space-y-3">
            <Label className="text-xs font-bold text-muted-foreground">Add Custom Memory Fact</Label>
            <div className="flex gap-2">
              <Input 
                value={newMemoryFact} 
                onChange={(e) => setNewMemoryFact(e.target.value)}
                placeholder="e.g. Focus drops when studying alone" 
                className="h-8.5 text-xs" 
              />
              <Button size="sm" onClick={handleAddMemoryFact} className="h-8.5 text-xs font-bold">Add</Button>
            </div>
          </div>
        </div>

        {/* CHAT INTERFACE CONSOLE */}
        <div className="lg:col-span-2 bg-card border rounded-2xl p-5 shadow-card text-left flex flex-col justify-between h-[450px]">
          <div className="border-b pb-3 flex items-center justify-between">
            <h3 className="font-bold text-sm tracking-tight text-primary flex items-center gap-1.5">
              <MessageSquare className="h-4.5 w-4.5" /> Syntra Chat Console
            </h3>
            <span className="text-[10px] bg-primary/10 text-primary px-2.5 py-0.5 rounded-full font-bold">Gemini 1.5 Flash</span>
          </div>

          {/* Quick-start queries pills */}
          <div className="flex flex-wrap gap-1.5 py-2 border-b">
            {[
              { label: "OS Study Plan", query: "Generate a study plan for Operating Systems" },
              { label: "Explain ACID", query: "Explain DBMS SQL ACID transactions simply" },
              { label: "Stress recovery", query: "What recovery plan is suggested for burnout risk?" },
            ].map((pill) => (
              <button
                key={pill.label}
                onClick={() => handleSendMessage(pill.query)}
                className="text-[10px] bg-muted/40 border border-muted hover:border-primary/20 px-2.5 py-1 rounded-full text-muted-foreground transition font-medium"
              >
                {pill.label} <ArrowRight className="h-2.5 w-2.5 inline ml-0.5" />
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto space-y-3.5 p-3 bg-muted/20 border rounded-xl my-3 max-h-[250px]">
            {messages.map((m, idx) => (
              <div key={idx} className={`p-2.5 rounded-xl border text-xs leading-normal max-w-[85%] ${
                m.sender === "user" ? "ml-auto bg-primary text-white border-primary" : "mr-auto bg-card"
              }`}>
                <p className="text-[8px] font-bold uppercase opacity-80 mb-0.5">
                  {m.sender === "user" ? "Student" : "Syntra AI"}
                </p>
                {m.text}
              </div>
            ))}
            {aiResponding && (
              <div className="text-[10px] text-primary animate-pulse font-bold pl-2">
                Syntra AI is typing cognitive response...
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Input 
              value={chatInput} 
              onChange={(e) => setChatInput(e.target.value)} 
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder="Ask Syntra to generate study plans, review notes, etc..." 
              className="h-9.5 text-xs" 
            />
            <Button size="sm" onClick={() => handleSendMessage()} className="h-9.5 font-bold px-4">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
}
