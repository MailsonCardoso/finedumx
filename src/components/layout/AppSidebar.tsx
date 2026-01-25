import { useLocation, useNavigate } from "react-router-dom";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  BookOpen,
  Calendar,
  CalendarDays,
  CreditCard,
  Receipt,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  GraduationCap,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { removeAuthToken, apiFetch } from "@/lib/api-client";
import { useState } from "react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { NotificationBell } from "@/components/NotificationBell";

interface AppSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard", roles: ["admin"] },
  { icon: CalendarDays, label: "Agenda", path: "/agenda", roles: ["admin"] },
  { icon: Users, label: "Alunos", path: "/alunos", roles: ["admin"] },
  { icon: BookOpen, label: "Cursos", path: "/cursos", roles: ["admin"] },
  { icon: GraduationCap, label: "Turmas", path: "/turmas", roles: ["admin"] },
  { icon: Briefcase, label: "Funcionários", path: "/funcionarios", roles: ["admin"] },
  { icon: Calendar, label: "Mensalidades", path: "/mensalidades", roles: ["admin"] },
  { icon: CreditCard, label: "Pagamentos", path: "/pagamentos", roles: ["admin"] },
  { icon: Receipt, label: "Recibos", path: "/recibos", roles: ["admin"] },
  { icon: Settings, label: "Configurações", path: "/configuracoes", roles: ["admin"] },
  { icon: LayoutDashboard, label: "Meu Portal", path: "/portal", roles: ["student"] },
  { icon: LayoutDashboard, label: "Meu Portal", path: "/professor", roles: ["teacher"] },
];

export function AppSidebar({ collapsed, onToggle }: AppSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await apiFetch('/logout', { method: 'POST' });
    } catch (error) {
      console.error("Erro ao deslogar no servidor:", error);
    } finally {
      removeAuthToken();
      toast.success("Sessão encerrada");
      navigate("/");
      setIsLoggingOut(false);
    }
  };

  const { data: user } = useQuery({
    queryKey: ['me'],
    queryFn: () => apiFetch<any>('/me'),
  });

  return (
    <aside
      className={cn(
        "h-screen bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300 ease-in-out",
        collapsed ? "w-[72px]" : "w-[260px]"
      )}
    >
      <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
            <GraduationCap className="w-5 h-5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <span className="font-bold text-lg text-foreground">FinEdu</span>
          )}
        </div>
        {!collapsed && user?.role === 'admin' && <NotificationBell />}
      </div>

      {/* Menu */}
      <nav className="flex-1 py-4 px-3 overflow-y-auto">
        <ul className="space-y-1">
          {menuItems
            .filter(item => item.roles.includes(user?.role || "admin"))
            .map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <li key={item.path}>
                  <button
                    onClick={() => navigate(item.path)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                      "hover:bg-sidebar-accent",
                      isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                        : "text-sidebar-foreground"
                    )}
                  >
                    <item.icon className={cn("w-5 h-5 flex-shrink-0", isActive && "text-primary")} />
                    {!collapsed && <span className="text-sm">{item.label}</span>}
                  </button>
                </li>
              );
            })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-sidebar-border">
        <div className={cn(
          "flex items-center gap-3 p-2 rounded-lg",
          collapsed ? "justify-center" : ""
        )}>
          <Avatar className="w-9 h-9">
            <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
              {user?.name?.substring(0, 2).toUpperCase() || "AD"}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{user?.name || "Admin"}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email || "admin@finedu.com"}</p>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 mt-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className={cn(
              "flex-1 h-9",
              collapsed && "w-9"
            )}
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <>
                <ChevronLeft className="w-4 h-4 mr-2" />
                <span>Recolher</span>
              </>
            )}
          </Button>
          {!collapsed && (
            <>
              <ThemeToggle />
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="h-9 px-3 text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                {isLoggingOut ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <LogOut className="w-4 h-4" />
                )}
              </Button>
            </>
          )}
          {collapsed && (
            <div className="flex flex-col gap-2 mt-2">
              <ThemeToggle />
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
