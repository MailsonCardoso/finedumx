import { Menu, Wallet, BookOpen, Briefcase, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { useLocation, useNavigate } from "react-router-dom";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  LayoutDashboard,
  Users,
  Calendar,
  CreditCard,
  Receipt,
  Settings,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NotificationBell } from "@/components/NotificationBell";
import { useQuery } from "@tanstack/react-query";
import { apiFetch, removeAuthToken } from "@/lib/api-client";
import { toast } from "sonner";


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
  { icon: Settings, label: "Configurações", path: "/configuracoes", roles: ["admin", "financeiro", "administrativo"] },
  { icon: LayoutDashboard, label: "Meu Portal", path: "/portal", roles: ["student"] },
  { icon: LayoutDashboard, label: "Meu Portal", path: "/professor", roles: ["teacher"] },
];

export function MobileHeader() {
  const location = useLocation();
  const navigate = useNavigate();

  const { data: user } = useQuery({
    queryKey: ['me'],
    queryFn: () => apiFetch<any>('/me'),
  });

  const handleLogout = async () => {
    try {
      await apiFetch('/logout', { method: 'POST' });
    } catch (error) {
      console.error("Erro ao deslogar:", error);
    } finally {
      removeAuthToken();
      toast.success("Sessão encerrada");
      navigate("/");
    }
  };


  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-4 lg:hidden">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
          <Wallet className="w-5 h-5 text-primary-foreground" />
        </div>
        <span className="font-bold text-lg">PlatFormX</span>
      </div>

      <div className="flex items-center gap-2">
        {user?.role === 'admin' && <NotificationBell />}
        <ThemeToggle />

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[280px] p-0 flex flex-col h-full bg-sidebar border-r border-sidebar-border">
            <SheetTitle className="sr-only">Menu de Navegação</SheetTitle>
            <SheetDescription className="sr-only">Menu principal do sistema</SheetDescription>

            <div className="h-16 flex items-center px-4 border-b border-sidebar-border shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="font-bold text-lg text-sidebar-foreground">PlatFormX</span>
              </div>
            </div>

            <nav className="flex-1 overflow-y-auto px-3 py-4">
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
                          onClick={() => {
                            navigate(item.path);
                            // O Sheet fecha automaticamente ao clicar em um Link? 
                            // Normalmente precisamos de um estado controlado para fechar o Sheet via onOpenChange, 
                            // mas este componente usa Sheet não controlado. 
                            // O comportamento padrão do radix Dialog fecha ao clicar fora, mas não no link.
                            // Mas para manter simples seguindo o padrão anterior, deixaremos assim.
                            // Se precisar fechar, o usuário clica fora ou podemos adicionar ref. 
                            // Pelo código anterior, já funcionava assim.
                          }}
                          className={cn(
                            "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                            "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                            isActive
                              ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                              : "text-sidebar-foreground"
                          )}
                        >
                          <item.icon className={cn("w-5 h-5 flex-shrink-0", isActive && "text-primary")} />
                          <span className="text-sm">{item.label}</span>
                        </button>
                      </li>
                    );
                  })}
              </ul>
            </nav>

            <div className="p-4 border-t border-sidebar-border shrink-0 mt-auto">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all"
              >
                <LogOut className="w-5 h-5" />
                <span className="text-sm">Sair</span>
              </button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
