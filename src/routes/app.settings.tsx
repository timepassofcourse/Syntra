import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Settings, Save, Trash2, ShieldAlert, Sparkles, KeyRound } from "lucide-react";
import { isSupabaseConfigured } from "@/lib/supabase";

export const Route = createFileRoute("/app/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  // Store States
  const profile = useStore((s) => s.profile);
  const setProfile = useStore((s) => s.setProfile);
  const resetStore = useStore((s) => s.reset);
  
  // Local Form States
  const [name, setName] = useState(profile.name || "");
  const [college, setCollege] = useState(profile.college || "");
  const [semester, setSemester] = useState(profile.semester || "");
  const [branch, setBranch] = useState(profile.branch || "");
  
  const [skills, setSkills] = useState(profile.skills?.join(", ") || "");
  const [goals, setGoals] = useState(profile.placementGoals?.join(", ") || "");
  
  // Notification options
  const [deadlineAlerts, setDeadlineAlerts] = useState(true);
  const [attendanceAlerts, setAttendanceAlerts] = useState(true);
  
  // Supabase Local Keys
  const [localUrl, setLocalUrl] = useState(localStorage.getItem("VITE_SUPABASE_URL") || "");
  const [localKey, setLocalKey] = useState(localStorage.getItem("VITE_SUPABASE_ANON_KEY") || "");

  const handleSaveProfile = () => {
    setProfile({
      name,
      college,
      semester,
      branch,
      skills: skills.split(",").map((s) => s.trim()).filter(Boolean),
      placementGoals: goals.split(",").map((g) => g.trim()).filter(Boolean),
    });
    toast.success("Profile settings updated!");
  };

  const handleSaveSupabaseKeys = () => {
    if (localUrl.trim() && localKey.trim()) {
      localStorage.setItem("VITE_SUPABASE_URL", localUrl.trim());
      localStorage.setItem("VITE_SUPABASE_ANON_KEY", localKey.trim());
      toast.success("Supabase API keys saved locally! Reload the page to connect your backend database.");
    } else {
      localStorage.removeItem("VITE_SUPABASE_URL");
      localStorage.removeItem("VITE_SUPABASE_ANON_KEY");
      toast.info("Cleared local Supabase keys. System will fall back to local storage.");
    }
  };

  const handleResetData = () => {
    if (confirm("Are you sure you want to delete all locally stored study statistics? This action is permanent.")) {
      resetStore();
      toast.success("Zustand store cleared. Onboarding wizard initialized.");
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto select-none text-left">
      
      {/* Top headers */}
      <div className="border-b pb-4">
        <h2 className="text-xl font-bold tracking-tight">System Settings</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Customize academic identities, notification triggers, and API database parameters.</p>
      </div>

      <div className="space-y-6">
        
        {/* PROFILE SETTINGS */}
        <div className="bg-card border rounded-2xl p-5 shadow-card space-y-4">
          <h3 className="font-bold text-sm text-primary flex items-center gap-1.5">
            <Settings className="h-4.5 w-4.5" /> Profile Settings
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Full Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>College / University</Label>
              <Input value={college} onChange={(e) => setCollege(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Branch / Course Stream</Label>
              <Input value={branch} onChange={(e) => setBranch(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Current Semester</Label>
              <Input value={semester} onChange={(e) => setSemester(e.target.value)} />
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div className="space-y-1.5">
              <Label>Placement Skills (comma separated)</Label>
              <Input value={skills} onChange={(e) => setSkills(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Placement Milestones (comma separated)</Label>
              <Input value={goals} onChange={(e) => setGoals(e.target.value)} />
            </div>
          </div>

          <Button onClick={handleSaveProfile} className="h-9 gap-1.5">
            <Save className="h-4 w-4" /> Save Profile Details
          </Button>
        </div>

        {/* SUPABASE BACKEND CREDENTIALS */}
        <div className="bg-card border rounded-2xl p-5 shadow-card space-y-4">
          <h3 className="font-bold text-sm text-primary flex items-center gap-1.5">
            <KeyRound className="h-4.5 w-4.5" /> Supabase Connection Manager
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Provide your live Supabase API keys below to sync assignments, notes folders, study schedules, and wellness logs.
          </p>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Supabase URL</Label>
              <Input 
                type="text" 
                value={localUrl} 
                onChange={(e) => setLocalUrl(e.target.value)} 
                placeholder="https://yourproject.supabase.co" 
                className="h-9" 
              />
            </div>
            <div className="space-y-1.5">
              <Label>Supabase Anon Key</Label>
              <Input 
                type="password" 
                value={localKey} 
                onChange={(e) => setLocalKey(e.target.value)} 
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." 
                className="h-9" 
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSaveSupabaseKeys} variant="outline" className="h-9 gap-1.5">
                Save Connection Credentials
              </Button>
            </div>

            <div className="bg-muted/40 rounded-xl p-3 border text-[11px]">
              <span className="font-bold">Database Status:</span>{" "}
              {isSupabaseConfigured 
                ? "Live server synchronization active (Keys loaded from project build)." 
                : localUrl 
                  ? "Local override credentials saved. Ready to reload."
                  : "Offline fallback mode. Utilizing local storage Zustand structures."}
            </div>
          </div>
        </div>

        {/* SYSTEM PREFERENCES */}
        <div className="bg-card border rounded-2xl p-5 shadow-card space-y-4">
          <h3 className="font-bold text-sm text-primary flex items-center gap-1.5">
            <Sparkles className="h-4.5 w-4.5" /> System Preferences
          </h3>

          <div className="space-y-3.5">
            <div className="flex items-center justify-between text-xs">
              <div>
                <p className="font-bold">Deadline Risk Warnings</p>
                <p className="text-muted-foreground mt-0.5">Toggle alert notifications for impending assignments.</p>
              </div>
              <Switch checked={deadlineAlerts} onCheckedChange={setDeadlineAlerts} />
            </div>
            
            <div className="flex items-center justify-between text-xs">
              <div>
                <p className="font-bold">Attendance Skip Notifications</p>
                <p className="text-muted-foreground mt-0.5">Alert when subject logs fall below 75% thresholds.</p>
              </div>
              <Switch checked={attendanceAlerts} onCheckedChange={setAttendanceAlerts} />
            </div>
          </div>
        </div>

        {/* PRIVACY CONTROLS */}
        <div className="bg-card border border-destructive/20 rounded-2xl p-5 shadow-card space-y-4">
          <h3 className="font-bold text-sm text-destructive flex items-center gap-1.5">
            <ShieldAlert className="h-4.5 w-4.5" /> Danger Zone
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Erase local browser storage cache and reset onboarding parameters.
          </p>

          <Button variant="outline" size="sm" onClick={handleResetData} className="border-destructive text-destructive hover:bg-destructive/10 h-9 gap-1.5">
            <Trash2 className="h-4 w-4" /> Reset Local OS Storage
          </Button>
        </div>

      </div>
    </div>
  );
}
