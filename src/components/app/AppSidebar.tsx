import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Calendar,
  CheckSquare,
  ClipboardCheck,
  FolderOpen,
  Timer,
  Heart,
  Briefcase,
  Users,
  MessageSquare,
  BarChart3,
  Library,
  Settings,
  Brain as Logo,
  User,
  LogOut,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { useStore } from "@/lib/store";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

const items = [
  { title: "Dashboard", url: "/app", icon: LayoutDashboard },
  { title: "Assignments", url: "/app/assignments", icon: CheckSquare },
  { title: "Study Planner", url: "/app/planner", icon: Calendar },
  { title: "Attendance", url: "/app/attendance", icon: ClipboardCheck },
  { title: "Smart Notes", url: "/app/notes", icon: FolderOpen },
  { title: "Focus Mode", url: "/app/focus", icon: Timer },
  { title: "Wellness Tracker", url: "/app/wellness", icon: Heart },
  { title: "Placement Hub", url: "/app/placements", icon: Briefcase },
  { title: "Study Groups", url: "/app/groups", icon: Users },
  { title: "AI Assistant", url: "/app/assistant", icon: MessageSquare },
  { title: "Analytics", url: "/app/analytics", icon: BarChart3 },
  { title: "Resource Hub", url: "/app/resources", icon: Library },
  { title: "Settings", url: "/app/settings", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const path = useRouterState({ select: (r) => r.location.pathname });
  const profile = useStore((s) => s.profile);
  const activeWorkspace = useStore((s) => s.activeWorkspace);
  const navigate = useNavigate();
  const setUser = useStore((s) => s.setUser);

  const handleLogout = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    toast.success("Logged out successfully");
    navigate({ to: "/" });
  };

  const isActive = (url: string) => (url === "/app" ? path === "/app" : path.startsWith(url));

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b bg-card">
        <Link to="/app" className="flex items-center gap-2.5 px-2 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary text-primary-foreground shrink-0 shadow-sm">
            <Logo className="h-4 w-4" />
          </div>
          {!collapsed && (
            <div className="flex flex-col text-left">
              <span className="font-bold text-sm tracking-tight text-gradient">Syntra OS</span>
              <span className="text-[9px] text-muted-foreground font-semibold uppercase tracking-wider">{activeWorkspace} Workspace</span>
            </div>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent className="bg-card/40">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={item.title}>
                    <Link to={item.url} className="flex items-center gap-3">
                      <item.icon className="h-4 w-4 shrink-0" />
                      {!collapsed && <span className="text-xs font-medium">{item.title}</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t bg-card">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center gap-3 px-2 py-2 cursor-pointer hover:bg-muted/50 rounded-lg transition select-none">
              <div className="h-8 w-8 rounded-full bg-accent flex items-center justify-center text-accent-foreground text-sm font-medium shrink-0">
                {(profile.name || "?").charAt(0).toUpperCase()}
              </div>
              {!collapsed && (
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-xs font-semibold truncate leading-none text-foreground">{profile.name || "Guest Student"}</p>
                  <p className="text-[10px] text-muted-foreground truncate mt-0.5">{profile.college?.split(" ")[0] || "University"}</p>
                </div>
              )}
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56 ml-2 mb-2">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-semibold leading-none">{profile.name || "Guest Student"}</p>
                <p className="text-xs leading-none text-muted-foreground truncate">
                  {profile.college || "University Student"}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate({ to: "/app/settings" })} className="cursor-pointer">
              <User className="mr-2 h-4 w-4" />
              <span>My Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate({ to: "/app/settings" })} className="cursor-pointer">
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
