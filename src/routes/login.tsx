import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, Chrome, Github, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const user = useStore((s) => s.user);
  const setUser = useStore((s) => s.setUser);
  const setOnboarded = useStore((s) => s.setOnboarded);
  const loadSupabaseData = useStore((s) => s.loadSupabaseData);
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  // If already logged in, redirect to app
  useEffect(() => {
    if (user) {
      navigate({ to: "/app" });
    }
  }, [user, navigate]);

  const handleEmailAuth = async (isSignUp: boolean) => {
    if (!email.trim() || !password.trim()) {
      toast.error("Please enter email and password");
      return;
    }
    if (isSignUp && !name.trim()) {
      toast.error("Please enter your name");
      return;
    }

    setIsLoading(true);
    if (isSupabaseConfigured && supabase) {
      try {
        if (isSignUp) {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                full_name: name,
              },
            },
          });
          if (error) throw error;
          toast.success("Registration successful! Check your email or try logging in.");
        } else {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          if (error) throw error;
          if (data.user) {
            setUser({ id: data.user.id, email: data.user.email || "" });
            toast.success("Successfully logged in!");
            await loadSupabaseData();
            navigate({ to: "/app" });
          }
        }
      } catch (err: any) {
        let msg = err.message || "Authentication failed";
        if (msg.includes("provider is not enabled") || msg.includes("Unsupported provider")) {
          msg = "Email/Password provider is disabled in Supabase. Enable it in your Supabase Console (Auth -> Providers -> Email), or use 'Login as Guest Demo' below!";
          toast.error(msg, { duration: 10000 });
        } else if (msg.toLowerCase().includes("rate limit") || msg.toLowerCase().includes("too many requests") || err.status === 429) {
          msg = "Supabase signup rate limit exceeded (Too Many Requests). Please wait a few minutes, or bypass this instantly by clicking 'Login as Guest Demo' below!";
          toast.error(msg, { duration: 10000 });
        } else {
          toast.error(msg + ". (Tip: Try 'Login as Guest Demo' below to bypass database constraints!)", { duration: 6000 });
        }
      } finally {
        setIsLoading(false);
      }
    } else {
      // Simulation mode
      setTimeout(() => {
        setUser({ id: "simulated-user-1", email });
        setOnboarded(false); // Trigger setup wizard for new users
        toast.success(isSignUp ? "Account registered (Demo mode)!" : "Successfully logged in (Demo mode)!");
        setIsLoading(false);
        navigate({ to: "/app" });
      }, 1000);
    }
  };

  const handleOAuth = async (provider: "google" | "github") => {
    if (isSupabaseConfigured && supabase) {
      setIsLoading(true);
      try {
        const { error } = await supabase.auth.signInWithOAuth({
          provider,
          options: {
            redirectTo: window.location.origin + "/app",
          },
        });
        if (error) throw error;
      } catch (err: any) {
        let msg = err.message || `Failed to redirect to ${provider} sign-in`;
        if (msg.includes("provider is not enabled") || msg.includes("Unsupported provider")) {
          msg = `${provider.toUpperCase()} provider is disabled in Supabase. Enable it in your Supabase Console (Auth -> Providers), or use 'Login as Guest Demo' below!`;
          toast.error(msg, { duration: 10000 });
        } else if (msg.toLowerCase().includes("rate limit") || msg.toLowerCase().includes("too many requests") || err.status === 429) {
          msg = `Supabase request rate limit exceeded (Too Many Requests). Please try 'Login as Guest Demo' below to bypass this!`;
          toast.error(msg, { duration: 10000 });
        } else {
          toast.error(msg + ". (Tip: Try 'Login as Guest Demo' below to bypass database constraints!)", { duration: 6000 });
        }
        setIsLoading(false);
      }
    } else {
      toast.info(`Redirecting to simulated ${provider} auth...`);
      setIsLoading(true);
      setTimeout(() => {
        setUser({ id: `oauth-${provider}-user`, email: `student@${provider}.com` });
        setOnboarded(false); // Trigger setup wizard
        toast.success(`Signed in with ${provider}!`);
        setIsLoading(false);
        navigate({ to: "/app" });
      }, 1200);
    }
  };

  const handleGuestDemo = () => {
    setIsLoading(true);
    toast.success("Initializing guest session...");
    setTimeout(() => {
      setUser({ id: "guest-user", email: "guest@syntra.io" });
      setOnboarded(false); // Make sure setup wizard triggers for full feature demo!
      setIsLoading(false);
      navigate({ to: "/app" });
    }, 800);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12 relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(30rem_30rem_at_50%_30%,oklch(0.95_0.03_260),transparent)] dark:bg-[radial-gradient(30rem_30rem_at_50%_30%,oklch(0.25_0.05_260/20%),transparent)]" />
      
      <Card className="w-full max-w-md border-muted/80 shadow-elevated">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2">
            <div className="h-10 w-10 rounded-xl bg-gradient-primary flex items-center justify-center text-white shadow-sm">
              <Brain className="h-5 w-5" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Welcome to Syntra</CardTitle>
          <CardDescription>AI Student Operating System</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signin-email">Email Address</Label>
                <Input
                  id="signin-email"
                  type="email"
                  placeholder="name@university.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signin-password">Password</Label>
                <Input
                  id="signin-password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <Button 
                onClick={() => handleEmailAuth(false)} 
                className="w-full bg-gradient-primary border-0 text-white shadow"
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign In with Email"}
              </Button>
            </TabsContent>
            
            <TabsContent value="signup" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signup-name">Full Name</Label>
                <Input
                  id="signup-name"
                  type="text"
                  placeholder="Alex Mercer"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-email">Email Address</Label>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="name@university.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-password">Password</Label>
                <Input
                  id="signup-password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <Button 
                onClick={() => handleEmailAuth(true)} 
                className="w-full bg-gradient-primary border-0 text-white shadow"
                disabled={isLoading}
              >
                {isLoading ? "Creating account..." : "Sign Up with Email"}
              </Button>
            </TabsContent>
          </Tabs>

          <div className="relative flex py-5 items-center">
            <div className="flex-grow border-t border-muted" />
            <span className="flex-shrink mx-4 text-[10px] text-muted-foreground uppercase tracking-widest">Or Continue With</span>
            <div className="flex-grow border-t border-muted" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="w-full" onClick={() => handleOAuth("google")} disabled={isLoading}>
              <Chrome className="h-4 w-4 mr-2" /> Google
            </Button>
            <Button variant="outline" className="w-full" onClick={() => handleOAuth("github")} disabled={isLoading}>
              <Github className="h-4 w-4 mr-2" /> GitHub
            </Button>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-3 pt-2">
          <Button 
            variant="secondary" 
            className="w-full flex items-center justify-center gap-1.5 border-dashed border hover:border-primary/45 transition" 
            onClick={handleGuestDemo}
            disabled={isLoading}
          >
            <Sparkles className="h-4 w-4 text-primary" />
            Login as Guest Demo
          </Button>
          <p className="text-[10px] text-center text-muted-foreground px-4">
            {!isSupabaseConfigured 
              ? "Running in standalone demo environment. No database credentials needed." 
              : "Connected to Supabase live server environment."}
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
