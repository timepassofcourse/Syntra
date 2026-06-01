import { create } from "zustand";
import { persist } from "zustand/middleware";
import { supabase, isSupabaseConfigured } from "./supabase";

export type Task = {
  id: string;
  title: string;
  subject?: string;
  dueDate?: string;
  priority: "low" | "medium" | "high";
  completed: boolean;
  subtasks?: { id: string; title: string; completed: boolean }[];
  deadlineRisk?: "low" | "medium" | "high";
  recoveryPlan?: string;
  createdAt: string;
};

export type AttendanceItem = {
  id: string;
  subject: string;
  attended: number;
  total: number;
  target: number; // e.g. 75
  totalLectures?: number; // max lectures in semester
  logs: { id: string; date: string; status: "present" | "absent" }[];
};

export type SmartNote = {
  id: string;
  title: string;
  subject?: string;
  folder?: string;
  content: string;
  summary?: string;
  flashcards?: { front: string; back: string }[];
  quiz?: { question: string; options: string[]; answer: number }[];
  createdAt: string;
};

export type StudySession = {
  id: string;
  subject: string;
  duration: number; // minutes
  date: string;
};

export type Exam = {
  id: string;
  title: string;
  subject: string;
  date: string;
  prepared: number;
  syllabus?: string;
};

export type MoodLog = {
  id: string;
  date: string;
  mood: "great" | "good" | "okay" | "low" | "bad";
  stressLevel: number; // 1-10
  notes?: string;
};

export type SleepLog = {
  id: string;
  date: string;
  hours: number;
  quality: "good" | "fair" | "poor";
};

export type PlacementProfile = {
  resumeUploaded: boolean;
  resumeName?: string;
  atsScore?: number;
  atsFeedback?: string;
  skills: { name: string; level: number; required: boolean }[];
  dsaSolved: number;
  dsaTotal: number;
  readinessScore?: number;
  companyPrep: { company: string; readyPercentage: number }[];
};

export type CollaborationGroup = {
  id: string;
  name: string;
  members: string[];
  messages: { id: string; sender: string; text: string; time: string }[];
  sharedTasks: { id: string; title: string; completed: boolean }[];
  whiteboardData?: string; // SVG elements path markup or JSON representation
  timerRemaining?: number; // Pomodoro remaining secs
};

export type ResourceItem = {
  id: string;
  title: string;
  category: "Syllabus" | "Past Paper" | "Book" | "Link";
  subject: string;
  url?: string;
  date?: string;
};

export type Profile = {
  name: string;
  email: string;
  college: string;
  semester: string;
  branch: string;
  avatar?: string;
  targetRoles?: string[];
  skills?: string[];
  placementGoals?: string[];
  dreamCompanies?: string[];
  focusHours?: number;
  sleepTargets?: number;
  studyStyle?: string;
  breakPreferences?: string;
};

export type UserSession = {
  id: string;
  email: string;
};

export type Achievement = {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
};

type State = {
  user: UserSession | null;
  profile: Profile;
  onboarded: boolean;
  activeWorkspace: string;
  theme: "light" | "dark";
  
  // Data arrays
  tasks: Task[]; // assignments
  attendance: AttendanceItem[];
  notes: SmartNote[];
  studySessions: StudySession[];
  exams: Exam[];
  moodLogs: MoodLog[];
  sleepLogs: SleepLog[];
  crisisMode: boolean;
  placementProfile: PlacementProfile;
  groups: CollaborationGroup[];
  resources: ResourceItem[];
  aiMemory: string[];
  achievements: Achievement[];

  // Action methods
  setUser: (u: UserSession | null) => void;
  setProfile: (p: Partial<Profile>) => void;
  setOnboarded: (v: boolean) => void;
  setActiveWorkspace: (w: string) => void;
  toggleTheme: () => void;
  setCrisisMode: (v: boolean) => void;

  // Assignments / Tasks CRUD
  addTask: (t: Omit<Task, "id" | "createdAt" | "completed"> & { subtasks?: { id: string; title: string; completed: boolean }[], deadlineRisk?: "low" | "medium" | "high", recoveryPlan?: string }) => void;
  toggleTask: (id: string) => void;
  toggleSubtask: (taskId: string, subtaskId: string) => void;
  deleteTask: (id: string) => void;

  // Attendance CRUD
  addAttendanceSubject: (subject: string, target: number, totalLectures?: number) => void;
  logAttendanceClass: (subjectId: string, status: "present" | "absent", date?: string) => void;
  deleteAttendanceSubject: (id: string) => void;

  // Notes CRUD
  addNote: (note: Omit<SmartNote, "id" | "createdAt">) => void;
  updateNote: (id: string, updates: Partial<SmartNote>) => void;
  deleteNote: (id: string) => void;

  // Focus
  addStudySession: (s: Omit<StudySession, "id">) => void;

  // Exams
  addExam: (e: Omit<Exam, "id" | "prepared">) => void;
  updateExamProgress: (id: string, prepared: number) => void;
  deleteExam: (id: string) => void;

  // Wellness Log CRUD
  addMoodLog: (l: Omit<MoodLog, "id" | "date">) => void;
  addSleepLog: (l: Omit<SleepLog, "id" | "date">) => void;

  // Placements
  uploadResumeMock: (fileName: string) => void;
  updatePlacementSkills: (skills: { name: string; level: number; required: boolean }[]) => void;
  updateAtsResult: (score: number, feedback: string) => void;
  incrementDsa: () => void;

  // Groups / Collab
  addGroupMessage: (groupId: string, sender: string, text: string) => void;
  updateGroupWhiteboard: (groupId: string, data: string) => void;
  addGroupSharedTask: (groupId: string, title: string) => void;
  toggleGroupSharedTask: (groupId: string, taskId: string) => void;

  // Resources CRUD
  addResource: (r: Omit<ResourceItem, "id">) => void;
  deleteResource: (id: string) => void;

  // AI assistant memory
  addAiMemory: (fact: string) => void;
  clearAiMemory: () => void;

  unlockAchievement: (id: string) => void;
  reset: () => void;
  loadSupabaseData: () => Promise<void>;
};

const defaultAchievements: Achievement[] = [
  { id: "first-task", title: "First Step", description: "Complete your first assignment subtask", icon: "🎯", unlocked: false },
  { id: "streak-3", title: "Study Engine", description: "Log study sessions across 3 days", icon: "🔥", unlocked: false },
  { id: "focus-master", title: "Focus Master", description: "Complete 5 Pomodoro sessions", icon: "🧘", unlocked: false },
  { id: "resume-ats", title: "Resume Ready", description: "Upload a resume and receive ATS feedback", icon: "📄", unlocked: false },
  { id: "wellness-pro", title: "Mindful Student", description: "Keep your mood logged for wellness reviews", icon: "💚", unlocked: false },
  { id: "collab-champ", title: "Collab Champ", description: "Brainstorm on the group whiteboard", icon: "🎨", unlocked: false },
];

const uid = () => Math.random().toString(36).slice(2, 10);

const initialMockProfile: Profile = {
  name: "Alex Mercer",
  email: "alex.mercer@syntra.edu",
  college: "Apex Institute of Technology",
  semester: "6th Semester",
  branch: "Computer Science & Engineering",
  targetRoles: ["Software Development Engineer (SDE)", "Frontend Engineer"],
  skills: ["React", "JavaScript", "Python", "Data Structures"],
  placementGoals: ["Secure Summer Internship", "Mock 3 Coding Interviews"],
  dreamCompanies: ["Google", "Microsoft", "Stripe", "Startups"],
  focusHours: 25,
  sleepTargets: 8,
  studyStyle: "Visual Learner",
  breakPreferences: "5 mins every 25 mins",
};

const initialMockTasks: Task[] = [
  {
    id: "task-1",
    title: "Database Systems - Lab Assignment 4",
    subject: "Database Systems",
    dueDate: new Date(Date.now() + 86400000 * 2).toISOString().split("T")[0],
    priority: "high",
    completed: false,
    createdAt: new Date().toISOString(),
    subtasks: [
      { id: "sub-1-1", title: "Write SQL DDL commands", completed: true },
      { id: "sub-1-2", title: "Draft ER diagrams", completed: false },
      { id: "sub-1-3", title: "Optimize index queries", completed: false },
    ],
    deadlineRisk: "high",
    recoveryPlan: "Focus 45 minutes on query writing tonight; skip one elective study hour.",
  },
  {
    id: "task-2",
    title: "Operating Systems - Implement CPU Scheduler",
    subject: "Operating Systems",
    dueDate: new Date(Date.now() + 86400000 * 5).toISOString().split("T")[0],
    priority: "medium",
    completed: false,
    createdAt: new Date().toISOString(),
    subtasks: [
      { id: "sub-2-1", title: "Implement Round Robin function", completed: false },
      { id: "sub-2-2", title: "Implement Shortest Job First", completed: false },
    ],
    deadlineRisk: "medium",
    recoveryPlan: "Utilize study room focus timers tomorrow afternoon with CS Group.",
  },
  {
    id: "task-3",
    title: "DSA Practice - 5 Tree Problems",
    subject: "Placement Prep",
    dueDate: new Date().toISOString().split("T")[0],
    priority: "low",
    completed: true,
    createdAt: new Date().toISOString(),
    subtasks: [
      { id: "sub-3-1", title: "Invert Binary Tree", completed: true },
      { id: "sub-3-2", title: "Lowest Common Ancestor", completed: true },
    ],
    deadlineRisk: "low",
  },
];

const initialMockAttendance: AttendanceItem[] = [
  {
    id: "att-1",
    subject: "Database Systems",
    attended: 18,
    total: 22,
    target: 75,
    totalLectures: 40,
    logs: [
      { id: "log-1-1", date: new Date(Date.now() - 86400000 * 3).toISOString().split("T")[0], status: "present" },
      { id: "log-1-2", date: new Date(Date.now() - 86400000 * 2).toISOString().split("T")[0], status: "present" },
      { id: "log-1-3", date: new Date(Date.now() - 86400000 * 1).toISOString().split("T")[0], status: "absent" },
    ],
  },
  {
    id: "att-2",
    subject: "Operating Systems",
    attended: 14,
    total: 20,
    target: 75,
    totalLectures: 40,
    logs: [
      { id: "log-2-1", date: new Date(Date.now() - 86400000 * 4).toISOString().split("T")[0], status: "present" },
      { id: "log-2-2", date: new Date(Date.now() - 86400000 * 2).toISOString().split("T")[0], status: "absent" },
      { id: "log-2-3", date: new Date(Date.now() - 86400000 * 1).toISOString().split("T")[0], status: "absent" },
    ],
  },
  {
    id: "att-3",
    subject: "Compiler Design",
    attended: 15,
    total: 16,
    target: 80,
    totalLectures: 30,
    logs: [
      { id: "log-3-1", date: new Date(Date.now() - 86400000 * 3).toISOString().split("T")[0], status: "present" },
    ],
  },
];

const initialMockNotes: SmartNote[] = [
  {
    id: "note-1",
    title: "SQL Transactions and ACID Properties",
    subject: "Database Systems",
    folder: "Unit 3",
    content: "A transaction is a single logical unit of work. ACID stands for Atomicity (all or nothing), Consistency (preserves database rules), Isolation (independent execution), and Durability (permanence). Isolation levels include Read Uncommitted, Read Committed, Repeatable Read, and Serializable.",
    summary: "ACID properties govern transaction integrity. Atomicity guarantees full execution or rollback. Consistency maintains database invariants. Isolation separates simultaneous transactions to avoid dirty/non-repeatable reads. Durability persists completed edits.",
    flashcards: [
      { front: "What does Atomicity in ACID mean?", back: "It guarantees that either all database modifications in a transaction are saved, or none are (all-or-nothing)." },
      { front: "Name the 4 SQL Transaction Isolation levels.", back: "Read Uncommitted, Read Committed, Repeatable Read, and Serializable." },
    ],
    quiz: [
      {
        question: "Which isolation level is the most strict?",
        options: ["Read Committed", "Repeatable Read", "Serializable", "Read Uncommitted"],
        answer: 2,
      },
      {
        question: "What does 'D' in ACID represent?",
        options: ["De-normalization", "Durability", "Dependency", "Direct Access"],
        answer: 1,
      },
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: "note-2",
    title: "CPU Scheduling Algorithms Overview",
    subject: "Operating Systems",
    folder: "Lectures",
    content: "CPU scheduling handles assigning processes to the CPU. Algorithms include FCFS (non-preemptive, suffers Convoy effect), Shortest Job First (provably optimal average waiting time), Round Robin (preemptive, time slice driven), and Multilevel Queue. Turnaround Time = Completion Time - Arrival Time.",
    createdAt: new Date().toISOString(),
  },
];

const initialMockMoods: MoodLog[] = [
  { id: "mood-1", date: new Date(Date.now() - 86400000 * 3).toISOString().split("T")[0], mood: "great", stressLevel: 3, notes: "Finished all tasks early" },
  { id: "mood-2", date: new Date(Date.now() - 86400000 * 2).toISOString().split("T")[0], mood: "okay", stressLevel: 5, notes: "Exams dates announced, feeling slightly stressed" },
  { id: "mood-3", date: new Date(Date.now() - 86400000 * 1).toISOString().split("T")[0], mood: "low", stressLevel: 7, notes: "Missed two OS classes. Burnout is kicking in." },
];

const initialMockSleep: SleepLog[] = [
  { id: "sleep-1", date: new Date(Date.now() - 86400000 * 3).toISOString().split("T")[0], hours: 7.5, quality: "good" },
  { id: "sleep-2", date: new Date(Date.now() - 86400000 * 2).toISOString().split("T")[0], hours: 6, quality: "fair" },
  { id: "sleep-3", date: new Date(Date.now() - 86400000 * 1).toISOString().split("T")[0], hours: 5.5, quality: "poor" },
];

const initialMockPlacement: PlacementProfile = {
  resumeUploaded: true,
  resumeName: "Alex_Mercer_Resume_V2.pdf",
  atsScore: 78,
  skills: [
    { name: "React", level: 80, required: true },
    { name: "Node.js", level: 65, required: true },
    { name: "TypeScript", level: 40, required: true }, // gap!
    { name: "Data Structures", level: 75, required: true },
    { name: "System Design", level: 25, required: false }, // low!
  ],
  dsaSolved: 142,
  dsaTotal: 300,
  readinessScore: 68,
  companyPrep: [
    { company: "Google", readyPercentage: 55 },
    { company: "Microsoft", readyPercentage: 62 },
    { company: "Amazon", readyPercentage: 70 },
  ],
};

const initialMockGroups: CollaborationGroup[] = [
  {
    id: "group-1",
    name: "CS Study Circle",
    members: ["Alex Mercer", "Priya Sharma", "Ethan Hunt", "Mia Chen"],
    messages: [],
    sharedTasks: [
      { id: "st-1", title: "Review page replacement algorithms", completed: false },
      { id: "st-2", title: "Solve 2025 DBMS past paper questions", completed: true },
    ],
    whiteboardData: `<svg width="100%" height="100%" viewBox="0 0 800 500"><rect x="10" y="10" width="780" height="480" rx="10" fill="none" stroke="currentColor" stroke-dasharray="5 5" opacity="0.3"/><circle cx="200" cy="200" r="50" fill="none" stroke="#6366f1" stroke-width="4"/><text x="175" y="205" font-family="sans-serif" font-weight="bold" fill="currentColor">DBMS</text><circle cx="400" cy="200" r="50" fill="none" stroke="#f43f5e" stroke-width="4"/><text x="385" y="205" font-family="sans-serif" font-weight="bold" fill="currentColor">OS</text><path d="M 250 200 L 350 200" stroke="currentColor" stroke-width="3" marker-end="url(#arrow)"/><text x="280" y="190" font-size="12" fill="currentColor">Sync</text></svg>`,
    timerRemaining: 1500,
  },
];

const initialMockResources: ResourceItem[] = [
  { id: "res-1", title: "DBMS Textbook - Korth (Silberschatz)", category: "Book", subject: "Database Systems", url: "https://db-book.com" },
  { id: "res-2", date: new Date().toISOString(), title: "2024 End-Semester OS Question Paper", category: "Past Paper", subject: "Operating Systems", url: "#" },
  { id: "res-3", title: "Official React Docs & Reference Guide", category: "Link", subject: "Placement Prep", url: "https://react.dev" },
];

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      user: null,
      profile: initialMockProfile,
      onboarded: false,
      activeWorkspace: "Academic",
      theme: "dark",

      tasks: initialMockTasks,
      attendance: initialMockAttendance,
      notes: initialMockNotes,
      studySessions: [],
      exams: [
        { id: "ex-1", title: "Database Mid-Term", subject: "Database Systems", date: new Date(Date.now() + 86400000 * 10).toISOString().split("T")[0], prepared: 80 },
        { id: "ex-2", title: "Operating Systems Theory", subject: "Operating Systems", date: new Date(Date.now() + 86400000 * 14).toISOString().split("T")[0], prepared: 55 },
      ],
      moodLogs: initialMockMoods,
      sleepLogs: initialMockSleep,
      crisisMode: false,
      placementProfile: initialMockPlacement,
      groups: initialMockGroups,
      resources: initialMockResources,
      aiMemory: [
        "Prefers starting study sessions around 4 PM",
        "Weak subject identified: Operating Systems (recent skips)",
        "Career Focus: Frontend Developer, target roles at Google/Microsoft",
        "Stresses easily when exam schedules clash with deadlines",
      ],
      achievements: defaultAchievements,

      setUser: (u) => set({ user: u }),
      setProfile: (p) => set((s) => ({ profile: { ...s.profile, ...p } })),
      setOnboarded: (v) => set({ onboarded: v }),
      setActiveWorkspace: (w) => set({ activeWorkspace: w }),
      setCrisisMode: (v) => set({ crisisMode: v }),
      toggleTheme: () => {
        const next = get().theme === "light" ? "dark" : "light";
        set({ theme: next });
        if (typeof document !== "undefined") {
          document.documentElement.classList.toggle("dark", next === "dark");
        }
      },

      // Assignments / Tasks CRUD
      addTask: (t) => set((s) => {
        const newTask: Task = {
          ...t,
          id: uid(),
          completed: false,
          createdAt: new Date().toISOString(),
          subtasks: t.subtasks || [],
          deadlineRisk: t.deadlineRisk || "low",
        };
        return { tasks: [newTask, ...s.tasks] };
      }),
      toggleTask: (id) => set((s) => {
        const tasks = s.tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t));
        const achievements = s.achievements.map((a) => {
          if (a.id === "first-task" && !a.unlocked) {
            return { ...a, unlocked: true, unlockedAt: new Date().toISOString() };
          }
          return a;
        });
        return { tasks, achievements };
      }),
      toggleSubtask: (taskId, subtaskId) => set((s) => {
        const tasks = s.tasks.map((t) => {
          if (t.id === taskId) {
            const subtasks = t.subtasks?.map((sub) =>
              sub.id === subtaskId ? { ...sub, completed: !sub.completed } : sub
            );
            return { ...t, subtasks };
          }
          return t;
        });
        return { tasks };
      }),
      deleteTask: (id) => set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) })),

      // Attendance CRUD
      addAttendanceSubject: (subj, target, totalLectures) => set((s) => {
        const newItem: AttendanceItem = {
          id: uid(),
          subject: subj,
          attended: 0,
          total: 0,
          target,
          totalLectures: totalLectures || 40,
          logs: [],
        };
        return { attendance: [...s.attendance, newItem] };
      }),
      logAttendanceClass: (subjectId, status, date) => set((s) => {
        let isLimitReached = false;
        const attendance = s.attendance.map((att) => {
          if (att.id === subjectId) {
            const limit = att.totalLectures || 40;
            if (att.total >= limit) {
              isLimitReached = true;
              return att;
            }
            const isPresent = status === "present";
            const newLog = {
              id: uid(),
              date: date || new Date().toISOString().split("T")[0],
              status,
            };
            return {
              ...att,
              attended: isPresent ? att.attended + 1 : att.attended,
              total: att.total + 1,
              logs: [newLog, ...att.logs],
            };
          }
          return att;
        });
        if (isLimitReached) {
          return {}; // no change if limit reached
        }
        return { attendance };
      }),
      deleteAttendanceSubject: (id) => set((s) => ({
        attendance: s.attendance.filter((att) => att.id !== id),
      })),

      // Notes CRUD
      addNote: (note) => set((s) => {
        const newNote: SmartNote = {
          ...note,
          id: uid(),
          createdAt: new Date().toISOString(),
        };
        return { notes: [newNote, ...s.notes] };
      }),
      updateNote: (id, updates) => set((s) => ({
        notes: s.notes.map((n) => (n.id === id ? { ...n, ...updates } : n)),
      })),
      deleteNote: (id) => set((s) => ({ notes: s.notes.filter((n) => n.id !== id) })),

      // Focus
      addStudySession: (sess) => set((s) => {
        const studySessions = [{ ...sess, id: uid() }, ...s.studySessions];
        const achievements = s.achievements.map((a) => {
          if (a.id === "focus-master" && !a.unlocked && studySessions.length >= 5) {
            return { ...a, unlocked: true, unlockedAt: new Date().toISOString() };
          }
          if (a.id === "streak-3" && !a.unlocked && studySessions.length >= 3) {
            return { ...a, unlocked: true, unlockedAt: new Date().toISOString() };
          }
          return a;
        });
        return { studySessions, achievements };
      }),

      // Exams
      addExam: (e) => set((s) => ({ exams: [...s.exams, { ...e, id: uid(), prepared: 0 }] })),
      updateExamProgress: (id, prepared) => set((s) => ({
        exams: s.exams.map((e) => (e.id === id ? { ...e, prepared } : e)),
      })),
      deleteExam: (id) => set((s) => ({ exams: s.exams.filter((e) => e.id !== id) })),

      // Wellness logs
      addMoodLog: (l) => set((s) => {
        const moodLogs = [{ ...l, id: uid(), date: new Date().toISOString().split("T")[0] }, ...s.moodLogs];
        const achievements = s.achievements.map((a) =>
          a.id === "wellness-pro" && !a.unlocked ? { ...a, unlocked: true, unlockedAt: new Date().toISOString() } : a
        );
        return { moodLogs, achievements };
      }),
      addSleepLog: (l) => set((s) => ({
        sleepLogs: [{ ...l, id: uid(), date: new Date().toISOString().split("T")[0] }, ...s.sleepLogs],
      })),

      // Placements
      uploadResumeMock: (fileName) => set((s) => {
        const achievements = s.achievements.map((a) =>
          a.id === "resume-ats" && !a.unlocked ? { ...a, unlocked: true, unlockedAt: new Date().toISOString() } : a
        );
        return {
          placementProfile: {
            ...s.placementProfile,
            resumeUploaded: true,
            resumeName: fileName,
            atsScore: Math.floor(Math.random() * 20) + 70, // 70-90 score simulation
          },
          achievements,
        };
      }),
      updatePlacementSkills: (skills) => set((s) => ({
        placementProfile: { ...s.placementProfile, skills },
      })),
      updateAtsResult: (score, feedback) => set((s) => ({
        placementProfile: {
          ...s.placementProfile,
          atsScore: score,
          atsFeedback: feedback,
        },
      })),
      incrementDsa: () => set((s) => ({
        placementProfile: {
          ...s.placementProfile,
          dsaSolved: Math.min(s.placementProfile.dsaSolved + 1, s.placementProfile.dsaTotal),
        },
      })),

      // Groups / Whiteboard / Sync
      addGroupMessage: (groupId, sender, text) => set((s) => ({
        groups: s.groups.map((g) => {
          if (g.id === groupId) {
            const time = new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
            return {
              ...g,
              messages: [...g.messages, { id: uid(), sender, text, time }],
            };
          }
          return g;
        }),
      })),
      updateGroupWhiteboard: (groupId, data) => set((s) => {
        const achievements = s.achievements.map((a) =>
          a.id === "collab-champ" && !a.unlocked ? { ...a, unlocked: true, unlockedAt: new Date().toISOString() } : a
        );
        return {
          groups: s.groups.map((g) => (g.id === groupId ? { ...g, whiteboardData: data } : g)),
          achievements,
        };
      }),
      addGroupSharedTask: (groupId, title) => set((s) => ({
        groups: s.groups.map((g) => {
          if (g.id === groupId) {
            return {
              ...g,
              sharedTasks: [...g.sharedTasks, { id: uid(), title, completed: false }],
            };
          }
          return g;
        }),
      })),
      toggleGroupSharedTask: (groupId, taskId) => set((s) => ({
        groups: s.groups.map((g) => {
          if (g.id === groupId) {
            return {
              ...g,
              sharedTasks: g.sharedTasks.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t)),
            };
          }
          return g;
        }),
      })),

      // Resources
      addResource: (r) => set((s) => ({ resources: [...s.resources, { ...r, id: uid() }] })),
      deleteResource: (id) => set((s) => ({ resources: s.resources.filter((r) => r.id !== id) })),

      // AI Memory details
      addAiMemory: (fact) => set((s) => ({ aiMemory: [fact, ...s.aiMemory] })),
      clearAiMemory: () => set({ aiMemory: [] }),

      unlockAchievement: (id) => set((s) => ({
        achievements: s.achievements.map((a) =>
          a.id === id && !a.unlocked ? { ...a, unlocked: true, unlockedAt: new Date().toISOString() } : a
        ),
      })),

      reset: () => set({
        tasks: [],
        attendance: [],
        notes: [],
        studySessions: [],
        exams: [],
        moodLogs: [],
        sleepLogs: [],
        crisisMode: false,
        placementProfile: {
          resumeUploaded: false,
          skills: [],
          dsaSolved: 0,
          dsaTotal: 300,
          companyPrep: [],
        },
        groups: [],
        resources: [],
        aiMemory: [],
        achievements: defaultAchievements,
        onboarded: false,
      }),

      loadSupabaseData: async () => {
        if (!isSupabaseConfigured || !supabase) return;
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (!session) return;
          
          const userId = session.user.id;
          
          // Profiles
          const { data: profData } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", userId)
            .single();

          if (profData) {
            set({
              profile: {
                name: profData.name || "",
                email: profData.email || "",
                college: profData.college || "",
                semester: profData.semester || "",
                branch: profData.branch || "",
                avatar: profData.avatar || "",
                targetRoles: profData.target_roles || [],
                skills: profData.skills || [],
                placementGoals: profData.placement_goals || [],
                dreamCompanies: profData.dream_companies || [],
                focusHours: profData.focus_hours || 25,
                sleepTargets: profData.sleep_targets || 8,
                studyStyle: profData.study_style || "",
                breakPreferences: profData.break_preferences || "",
              },
              onboarded: profData.onboarded ?? false,
            });
          }

          // Assignments
          const { data: assignData } = await supabase
            .from("assignments")
            .select("*")
            .eq("user_id", userId);
          
          if (assignData) {
            const mappedTasks: Task[] = assignData.map((a: any) => ({
              id: a.id,
              title: a.title,
              subject: a.subject,
              dueDate: a.due_date,
              priority: a.priority,
              completed: a.completed,
              subtasks: a.subtasks || [],
              deadlineRisk: a.deadline_risk,
              recoveryPlan: a.recovery_plan,
              createdAt: a.created_at,
            }));
            set({ tasks: mappedTasks });
          }

          // Attendance
          const { data: attData } = await supabase
            .from("attendance")
            .select("*")
            .eq("user_id", userId);
          if (attData) {
            set({
              attendance: attData.map((att: any) => ({
                id: att.id,
                subject: att.subject,
                attended: att.attended,
                total: att.total,
                target: att.target,
                logs: att.logs || [],
              })),
            });
          }

          // Notes
          const { data: notesData } = await supabase
            .from("notes")
            .select("*")
            .eq("user_id", userId);
          if (notesData) {
            set({
              notes: notesData.map((n: any) => ({
                id: n.id,
                title: n.title,
                subject: n.subject,
                folder: n.folder,
                content: n.content,
                summary: n.summary,
                flashcards: n.flashcards,
                quiz: n.quiz,
                createdAt: n.created_at,
              })),
            });
          }
        } catch (err) {
          console.error("Failed to load Supabase data:", err);
        }
      },
    }),
    { name: "syntra-store-v2" }
  )
);
