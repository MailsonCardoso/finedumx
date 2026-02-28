import { useLocation, useNavigate } from "react-router-dom";

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
  Wallet,
  Loader2,
  MessageCircle,
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
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard", roles: ["admin", "financeiro", "administrativo"] },
  { icon: CalendarDays, label: "Agenda", path: "/agenda", roles: ["admin", "administrativo"] },
  { icon: Users, label: "Alunos", path: "/alunos", roles: ["admin", "administrativo"] },
  { icon: BookOpen, label: "Cursos", path: "/cursos", roles: ["admin", "administrativo"] },
  { icon: Wallet, label: "Turmas", path: "/turmas", roles: ["admin", "administrativo"] },
  { icon: Briefcase, label: "Funcionários", path: "/funcionarios", roles: ["admin", "administrativo"] },
  { icon: Calendar, label: "Mensalidades", path: "/mensalidades", roles: ["admin", "financeiro"] },
  { icon: CreditCard, label: "Pagamentos", path: "/pagamentos", roles: ["admin", "financeiro"] },
  { icon: Receipt, label: "Recibos", path: "/recibos", roles: ["admin", "financeiro"] },
  { icon: MessageCircle, label: "WhatsApp", path: "/whatsapp", roles: ["admin", "financeiro", "administrativo"] },
  { icon: Settings, label: "Configurações", path: "/configuracoes", roles: ["admin", "financeiro", "administrativo"] },
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
        "min-h-screen bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300 ease-in-out",
        collapsed ? "w-[72px]" : "w-[260px]"
      )}
    >
      <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
            <Wallet className="w-5 h-5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <span className="font-bold text-lg text-sidebar-foreground">Vem Cantar</span>
          )}
        </div>
        {!collapsed && user?.role === 'admin' && <NotificationBell />}
      </div>

      {/* Menu */}
      <nav className="flex-1 py-4 px-3 overflow-y-auto">
        <ul className="space-y-1">
          {menuItems
            .filter(item => {
              const userRole = (user?.role || "admin").toLowerCase();
              return item.roles.some(role => role.toLowerCase() === userRole);
            })
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

      {/* Footer - Only Toggle */}
      <div className="p-3 border-t border-sidebar-border mt-auto">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className={cn(
            "w-full h-11 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground flex items-center gap-3 transition-all",
            collapsed ? "justify-center px-0" : "px-3"
          )}
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5 flex-shrink-0" />
          ) : (
            <>
              <ChevronLeft className="w-5 h-5 flex-shrink-0" />
              <span className="font-medium">Recolher</span>
            </>
          )}
        </Button>
      </div>
    </aside>
  );
}
