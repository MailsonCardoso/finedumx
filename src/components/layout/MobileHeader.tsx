import { Menu, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
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

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: Users, label: "Alunos", path: "/alunos" },
  { icon: Calendar, label: "Mensalidades", path: "/mensalidades" },
  { icon: CreditCard, label: "Pagamentos", path: "/pagamentos" },
  { icon: Receipt, label: "Recibos", path: "/recibos" },
  { icon: Settings, label: "Configurações", path: "/configuracoes" },
];

export function MobileHeader() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-4 lg:hidden">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
          <GraduationCap className="w-5 h-5 text-primary-foreground" />
        </div>
        <span className="font-bold text-lg">FinEdu</span>
      </div>

      <div className="flex items-center gap-2">
        <NotificationBell />
        <ThemeToggle />
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[280px] p-0">
            <div className="h-16 flex items-center px-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="font-bold text-lg">FinEdu</span>
              </div>
            </div>
            <nav className="p-4">
              <ul className="space-y-1">
                {menuItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <li key={item.path}>
                      <button
                        onClick={() => navigate(item.path)}
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                          "hover:bg-accent",
                          isActive
                            ? "bg-accent text-primary font-medium"
                            : "text-muted-foreground"
                        )}
                      >
                        <item.icon className="w-5 h-5" />
                        <span className="text-sm">{item.label}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
              <div className="mt-6 pt-6 border-t border-border">
                <button
                  onClick={() => navigate("/")}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-accent transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="text-sm">Sair</span>
                </button>
              </div>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
