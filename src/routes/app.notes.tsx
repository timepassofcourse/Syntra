import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useStore, SmartNote } from "@/lib/store";
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
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Plus,
  Trash2,
  Sparkles,
  FileText,
  Upload,
  Brain,
  MessageSquare,
  HelpCircle,
  FolderClosed,
  ChevronRight,
  Search,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { callGemini, extractJsonFromMarkdown } from "@/lib/gemini";

export const Route = createFileRoute("/app/notes")({
  component: NotesPage,
});

function NotesPage() {
  // Store States
  const notes = useStore((s) => s.notes);
  const addNote = useStore((s) => s.addNote);
  const updateNote = useStore((s) => s.updateNote);
  const deleteNote = useStore((s) => s.deleteNote);

  // Local UI States
  const [selectedNote, setSelectedNote] = useState<SmartNote | null>(notes[0] || null);
  const [searchQuery, setSearchQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiActiveTab, setAiActiveTab] = useState<"summary" | "flashcards" | "quiz" | "chat">("summary");
  
  // Flashcard flipping state
  const [flippedCardIdx, setFlippedCardIdx] = useState<number | null>(null);
  
  // Quiz answering state
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  
  // Note-specific chat state
  const [noteChatInput, setNoteChatInput] = useState("");
  const [noteChatLogs, setNoteChatLogs] = useState<{ sender: "user" | "ai"; text: string }[]>([]);

  // Form states
  const [form, setForm] = useState({
    title: "",
    subject: "",
    folder: "General",
    content: "",
  });

  const handleAddNote = () => {
    if (!form.title.trim() || !form.content.trim()) {
      toast.error("Enter a note title and content");
      return;
    }
    addNote({
      title: form.title,
      subject: form.subject,
      folder: form.folder,
      content: form.content,
    });
    toast.success("Note added!");
    setForm({ title: "", subject: "", folder: "General", content: "" });
    setOpen(false);
    
    // Select newly added note
    const updated = useStore.getState().notes;
    if (updated.length > 0) setSelectedNote(updated[0]);
  };

  // Mock Upload zone action
  const handleFileUploadMock = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    toast.info(`Uploading document: ${file.name}...`);
    setTimeout(() => {
      // Create a notes entry based on upload
      addNote({
        title: file.name.replace(/\.[^/.]+$/, ""), // strip extension
        subject: "Uploaded Doc",
        folder: "Uploads",
        content: `Transcribed text content from file: ${file.name}. This document covers syllabus lecture outlines, key definitions, and practice questions for reference during final exam preparations.`,
      });
      toast.success("Document uploaded and scanned!");
      
      const updated = useStore.getState().notes;
      if (updated.length > 0) setSelectedNote(updated[0]);
    }, 1500);
  };

  // AI note processors
  const runAiSummarizer = async (note: SmartNote) => {
    setAiGenerating(true);
    toast.info("Syntra AI: Extracting core concepts...");
    try {
      const prompt = `Summarize the following note titled "${note.title}" for subject "${note.subject}". Focus on core concepts, definitions, and key takeaways. Keep it clear, concise, and structured in bullet points.\n\nNote Content:\n${note.content}`;
      const summaryText = await callGemini(prompt);
      updateNote(note.id, { summary: summaryText });
      
      const updated = useStore.getState().notes.find(n => n.id === note.id);
      if (updated) setSelectedNote(updated);

      toast.success("Summary compiled!");
    } catch (e) {
      console.error(e);
      toast.error("Failed to generate note summary from AI");
    } finally {
      setAiGenerating(false);
    }
  };

  const runAiFlashcards = async (note: SmartNote) => {
    setAiGenerating(true);
    toast.info("Syntra AI: Generating flashcards...");
    try {
      const prompt = `Generate a JSON array of 3-5 high-quality revision flashcards based on the following student note titled "${note.title}".
Each flashcard must have "front" (the question or term) and "back" (the answer or definition) fields.
Return ONLY a valid JSON array block with no additional commentary.

Note Content:
${note.content}`;
      const response = await callGemini(prompt);
      const cards = extractJsonFromMarkdown(response);
      if (cards && Array.isArray(cards)) {
        updateNote(note.id, { flashcards: cards });
        const updated = useStore.getState().notes.find(n => n.id === note.id);
        if (updated) setSelectedNote(updated);
        toast.success("Flashcards compiled!");
      } else {
        throw new Error("Invalid JSON format from AI");
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to compile flashcards");
    } finally {
      setAiGenerating(false);
    }
  };

  const runAiQuiz = async (note: SmartNote) => {
    setAiGenerating(true);
    toast.info("Syntra AI: Formulating practice questions...");
    try {
      const prompt = `Generate a JSON array of 3 multiple-choice practice quiz questions based on the following student note titled "${note.title}".
Each quiz question must have:
- "question": string
- "options": array of 4 strings
- "answer": integer index of the correct option (0, 1, 2, or 3)
Return ONLY a valid JSON array block with no additional text or explanations.

Note Content:
${note.content}`;
      const response = await callGemini(prompt);
      const quizItems = extractJsonFromMarkdown(response);
      if (quizItems && Array.isArray(quizItems)) {
        updateNote(note.id, { quiz: quizItems });
        setSelectedAnswers({}); // Reset scores

        const updated = useStore.getState().notes.find(n => n.id === note.id);
        if (updated) setSelectedNote(updated);

        toast.success("Quiz compiled!");
      } else {
        throw new Error("Invalid JSON format from AI");
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to compile quiz");
    } finally {
      setAiGenerating(false);
    }
  };

  // Ask AI Chatbot
  const handleAskNoteChat = async () => {
    if (!noteChatInput.trim() || !selectedNote) return;
    
    const userMsg = { sender: "user" as const, text: noteChatInput };
    setNoteChatLogs((prev) => [...prev, userMsg]);
    const currentInput = noteChatInput;
    setNoteChatInput("");
    setAiGenerating(true);

    try {
      const chatHistory = noteChatLogs.map(l => `${l.sender === "user" ? "Student" : "AI"}: ${l.text}`).join("\n");
      const prompt = `You are a helpful study buddy. The student is asking a question about their note titled "${selectedNote.title}".
Note content:
${selectedNote.content}

Conversation history:
${chatHistory}
Student: ${currentInput}
AI:`;
      const answer = await callGemini(prompt);
      const answerMsg = { sender: "ai" as const, text: answer };
      setNoteChatLogs((prev) => [...prev, answerMsg]);
    } catch (e) {
      console.error(e);
      toast.error("Failed to get AI response for notes chat");
    } finally {
      setAiGenerating(false);
    }
  };

  // Semantic note filtration
  const filteredNotes = notes.filter((n) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    
    // Semantic queries simulation mapping:
    if (query.includes("acid") || query.includes("database") || query.includes("sql")) {
      return n.title.includes("SQL") || n.subject?.includes("Database");
    }
    if (query.includes("cpu") || query.includes("scheduling") || query.includes("thread")) {
      return n.title.includes("CPU") || n.subject?.includes("Operating");
    }
    
    return (
      n.title.toLowerCase().includes(query) ||
      n.content.toLowerCase().includes(query) ||
      n.subject?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-6 max-w-7xl select-none">
      
      {/* Top action row */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-4">
        <div className="flex-1 max-w-md relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Semantic Search (e.g. 'explain SQL ACID' or 'CPU time')"
            className="pl-9 h-9"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* File Upload zone */}
          <div className="relative">
            <input 
              type="file" 
              id="file-upload" 
              accept=".pdf,.png,.jpg,.jpeg,.docx" 
              onChange={handleFileUploadMock}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
            <Button variant="outline" size="sm" className="h-9 gap-1.5">
              <Upload className="h-4 w-4" /> Upload Document
            </Button>
          </div>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary text-white border-0 shadow h-9">
                <Plus className="h-4 w-4 mr-1" /> New Note
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-2xl max-w-lg">
              <DialogHeader>
                <DialogTitle>New Note</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Title</Label>
                    <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="DBMS Normalization" />
                  </div>
                  <div>
                    <Label>Subject Tag</Label>
                    <Input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="Database Systems" />
                  </div>
                </div>
                <div>
                  <Label>Folder Location</Label>
                  <Select value={form.folder} onValueChange={(v) => setForm({ ...form, folder: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="General">General</SelectItem>
                      <SelectItem value="Lectures">Lectures</SelectItem>
                      <SelectItem value="Revision">Revision</SelectItem>
                      <SelectItem value="Uploads">Uploads</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Content Details</Label>
                  <Textarea rows={6} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder="Write your notes here..." />
                </div>
              </div>
              <DialogFooter className="mt-6">
                <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
                <Button onClick={handleAddNote}>Save Note</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Workspace columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* SIDE PANELS: NOTES & FOLDERS */}
        <div className="space-y-4 text-left">
          <div className="bg-card border rounded-2xl p-4 shadow-card space-y-3">
            <h3 className="font-bold text-xs uppercase text-muted-foreground tracking-wider">Note Folders</h3>
            <div className="space-y-1.5 text-xs">
              {["General", "Lectures", "Revision", "Uploads"].map((fold) => {
                const count = notes.filter(n => n.folder === fold).length;
                return (
                  <div key={fold} className="flex justify-between items-center px-3 py-2 hover:bg-muted/50 rounded-lg cursor-pointer">
                    <span className="flex items-center gap-2 font-medium">
                      <FolderClosed className="h-4 w-4 text-primary" /> {fold}
                    </span>
                    <span className="text-[10px] bg-muted px-2 py-0.5 rounded-full font-bold">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-card border rounded-2xl p-4 shadow-card space-y-3">
            <h3 className="font-bold text-xs uppercase text-muted-foreground tracking-wider">Documents List ({filteredNotes.length})</h3>
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {filteredNotes.map((note) => (
                <div
                  key={note.id}
                  onClick={() => { setSelectedNote(note); setFlippedCardIdx(null); setNoteChatLogs([]); }}
                  className={`p-3 rounded-xl border bg-muted/20 hover:border-primary/30 transition text-left cursor-pointer space-y-1 ${
                    selectedNote?.id === note.id ? "border-primary ring-1 ring-primary/20 bg-primary/5" : ""
                  }`}
                >
                  <h4 className="font-bold text-xs truncate">{note.title}</h4>
                  <div className="flex justify-between items-center text-[9px] text-muted-foreground">
                    <span className="uppercase font-bold">{note.subject || "General"}</span>
                    <span>{note.content.split(" ").length} words</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* EDITOR AREA */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-5 gap-4">
          
          {/* Note details / content editor */}
          <div className="md:col-span-3 bg-card border rounded-2xl p-5 shadow-card text-left space-y-4">
            {selectedNote ? (
              <div className="space-y-3">
                <div className="flex justify-between items-start border-b pb-3">
                  <div>
                    <h3 className="font-bold text-sm leading-tight">{selectedNote.title}</h3>
                    <p className="text-[9px] text-muted-foreground uppercase font-bold mt-1">
                      {selectedNote.subject} · {selectedNote.folder}
                    </p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => deleteNote(selectedNote.id)}>
                    <Trash2 className="h-4.5 w-4.5 text-muted-foreground hover:text-destructive" />
                  </Button>
                </div>

                <Textarea 
                  className="min-h-[250px] text-xs font-mono bg-muted/10 border-muted focus-visible:ring-primary leading-relaxed" 
                  value={selectedNote.content}
                  onChange={(e) => {
                    updateNote(selectedNote.id, { content: e.target.value });
                    // update selected local state
                    const updated = useStore.getState().notes.find(n => n.id === selectedNote.id);
                    if (updated) setSelectedNote(updated);
                  }}
                />
              </div>
            ) : (
              <p className="text-xs text-muted-foreground text-center py-20">Select or write a note to begin editing.</p>
            )}
          </div>

          {/* AI OPERATIONS MATRIX */}
          <div className="md:col-span-2 bg-card border rounded-2xl p-4 shadow-card text-left flex flex-col justify-between min-h-[300px]">
            {selectedNote ? (
              <div className="space-y-3 flex-1 flex flex-col justify-between">
                
                {/* AI tabs header */}
                <div>
                  <div className="flex border-b mb-3 text-xs">
                    {(["summary", "flashcards", "quiz", "chat"] as const).map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setAiActiveTab(tab)}
                        className={`flex-1 pb-1.5 font-bold capitalize border-b-2 text-center text-[10px] transition ${
                          aiActiveTab === tab ? "border-primary text-primary" : "border-transparent text-muted-foreground"
                        }`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>

                  {/* AI TAB CONTENT: SUMMARIZER */}
                  {aiActiveTab === "summary" && (
                    <div className="space-y-3 text-xs">
                      {selectedNote.summary ? (
                        <div className="space-y-2">
                          <p className="leading-relaxed bg-muted/40 p-3 rounded-xl border border-muted-foreground/10 text-muted-foreground max-h-[200px] overflow-y-auto">
                            {selectedNote.summary}
                          </p>
                          <Button size="xs" variant="outline" onClick={() => runAiSummarizer(selectedNote)} disabled={aiGenerating} className="w-full text-[10px] h-7 font-bold">
                            🔄 Regenerate Summary
                          </Button>
                        </div>
                      ) : (
                        <div className="text-center py-10 space-y-3">
                          <FileText className="h-8 w-8 mx-auto text-primary opacity-40" />
                          <p className="text-muted-foreground">Run AI compiler to summarize notes.</p>
                          <Button size="sm" onClick={() => runAiSummarizer(selectedNote)} disabled={aiGenerating}>
                            Compile Summary
                          </Button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* AI TAB CONTENT: FLASHCARDS */}
                  {aiActiveTab === "flashcards" && (
                    <div className="space-y-3 text-xs">
                      {selectedNote.flashcards && selectedNote.flashcards.length > 0 ? (
                        <div className="space-y-3">
                          {selectedNote.flashcards.map((card, i) => {
                            const isFlipped = flippedCardIdx === i;
                            return (
                              <div 
                                key={i}
                                onClick={() => setFlippedCardIdx(isFlipped ? null : i)}
                                className={`border p-4 rounded-xl cursor-pointer text-center min-h-[90px] flex items-center justify-center transition-all ${
                                  isFlipped ? "bg-primary/5 border-primary/30" : "bg-muted/30"
                                }`}
                              >
                                <div>
                                  <p className="text-[9px] uppercase font-bold text-primary mb-1">{isFlipped ? "Answer" : "Question"}</p>
                                  <p className="font-semibold">{isFlipped ? card.back : card.front}</p>
                                </div>
                              </div>
                            );
                          })}
                          <Button size="xs" variant="outline" onClick={() => runAiFlashcards(selectedNote)} disabled={aiGenerating} className="w-full text-[10px] h-7 font-bold">
                            🔄 Regenerate Flashcards
                          </Button>
                        </div>
                      ) : (
                        <div className="text-center py-10 space-y-3">
                          <Brain className="h-8 w-8 mx-auto text-primary opacity-40" />
                          <p className="text-muted-foreground">Generate revision flashcard deck.</p>
                          <Button size="sm" onClick={() => runAiFlashcards(selectedNote)} disabled={aiGenerating}>
                            Generate Cards
                          </Button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* AI TAB CONTENT: QUIZ */}
                  {aiActiveTab === "quiz" && (
                    <div className="space-y-3 text-xs max-h-[250px] overflow-y-auto pr-1">
                      {selectedNote.quiz && selectedNote.quiz.length > 0 ? (
                        <div className="space-y-4">
                          {selectedNote.quiz.map((q, idx) => (
                            <div key={idx} className="space-y-2 border-b pb-3 last:border-0">
                              <p className="font-bold flex gap-1.5"><HelpCircle className="h-4 w-4 text-primary shrink-0" /> {q.question}</p>
                              <div className="space-y-1.5 pl-5">
                                {q.options.map((opt, optIdx) => {
                                  const answered = selectedAnswers[idx] !== undefined;
                                  const isSelected = selectedAnswers[idx] === optIdx;
                                  const isCorrect = optIdx === q.answer;

                                  let optClass = "border bg-muted/10 hover:bg-muted/40";
                                  if (answered) {
                                    if (isSelected) {
                                      optClass = isCorrect ? "border-success bg-success/15 text-success-foreground" : "border-destructive bg-destructive/15 text-destructive-foreground";
                                    } else if (isCorrect) {
                                      optClass = "border-success bg-success/5 text-success-foreground";
                                    }
                                  }

                                  return (
                                    <button
                                      key={optIdx}
                                      disabled={answered}
                                      onClick={() => {
                                        setSelectedAnswers(prev => ({ ...prev, [idx]: optIdx }));
                                        if (optIdx === q.answer) toast.success("Correct Answer!");
                                        else toast.error("Incorrect Answer.");
                                      }}
                                      className={`w-full text-left p-2 rounded-lg transition ${optClass}`}
                                    >
                                      {opt}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                          <Button size="xs" variant="outline" onClick={() => runAiQuiz(selectedNote)} disabled={aiGenerating} className="w-full text-[10px] h-7 font-bold animate-in fade-in duration-200">
                            🔄 Regenerate Quiz
                          </Button>
                        </div>
                      ) : (
                        <div className="text-center py-10 space-y-3">
                          <HelpCircle className="h-8 w-8 mx-auto text-primary opacity-40" />
                          <p className="text-muted-foreground">Synthesize academic revision multiple-choice quiz.</p>
                          <Button size="sm" onClick={() => runAiQuiz(selectedNote)} disabled={aiGenerating}>
                            Generate Quiz
                          </Button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* AI TAB CONTENT: NOTE CHAT */}
                  {aiActiveTab === "chat" && (
                    <div className="space-y-3 text-xs flex flex-col h-[240px] justify-between">
                      <div className="flex-1 overflow-y-auto space-y-2 p-2 border rounded-xl bg-muted/20">
                        {noteChatLogs.length === 0 ? (
                          <p className="text-muted-foreground italic text-center py-8">Ask AI about facts contained in this note.</p>
                        ) : (
                          noteChatLogs.map((m, idx) => (
                            <div key={idx} className={`p-2 rounded-xl border max-w-[85%] ${
                              m.sender === "user" ? "ml-auto bg-primary text-white border-primary" : "mr-auto bg-card"
                            }`}>
                              {m.text}
                            </div>
                          ))
                        )}
                      </div>
                      
                      <div className="flex gap-1.5 pt-2">
                        <Input 
                          value={noteChatInput} 
                          onChange={(e) => setNoteChatInput(e.target.value)} 
                          onKeyDown={(e) => e.key === "Enter" && handleAskNoteChat()}
                          placeholder="Ask AI about notes..." 
                          className="h-8 text-xs" 
                        />
                        <Button size="sm" onClick={handleAskNoteChat} className="h-8 w-8 p-0"><MessageSquare className="h-4 w-4" /></Button>
                      </div>
                    </div>
                  )}

                </div>

                {aiGenerating && (
                  <div className="text-center text-[10px] text-primary animate-pulse font-bold mt-2">
                    Invoking Gemini AI processors...
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground text-center py-10">Select notes to invoke AI Summarizer or revision tools.</p>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
