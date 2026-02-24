import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AppSidebar } from "./AppSidebar";
import { MobileHeader } from "./MobileHeader";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { apiFetch, removeAuthToken } from "@/lib/api-client";
import { applyTheme } from "@/lib/theme-utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LogOut, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigate = useNavigate();

  const { data: user } = useQuery({
    queryKey: ['me'],
    queryFn: () => apiFetch<any>('/me'),
  });

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await apiFetch('/logout', { method: 'POST' });
    } catch (error) {
      console.error("Erro ao deslogar:", error);
    } finally {
      removeAuthToken();
      toast.success("Sessão encerrada");
      navigate("/");
      setIsLoggingOut(false);
    }
  };

  const { data: schoolData } = useQuery<any>({
    queryKey: ['school-settings'],
    queryFn: () => apiFetch('/settings'),
    staleTime: Infinity, // Só precisa carregar uma vez
  });

  useEffect(() => {
    // 1. Tenta carregar do localStorage primeiro para velocidade (instantâneo)
    const localTheme = localStorage.getItem('vem-cantar-theme');
    if (localTheme) {
      applyTheme(localTheme);
    }

    // 2. Limpeza residues
    localStorage.removeItem('finedu-theme');
    localStorage.removeItem('theme');
  }, []);

  // 3. Aplica o tema vindo do banco (sincronização global)
  useEffect(() => {
    if (schoolData?.theme) {
      applyTheme(schoolData.theme);
    }
  }, [schoolData]);

  return (
    <div className="min-h-screen flex w-full bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block sticky top-0 h-screen">
        <AppSidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Desktop Header */}
        <header className="hidden lg:flex h-16 items-center justify-end px-8 border-b border-border bg-card/50 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 pr-6 border-r border-border/50">
              <Avatar className="w-9 h-9 border border-primary/20">
                <AvatarFallback className="bg-primary/10 text-primary text-sm font-bold uppercase">
                  {user?.name?.substring(0, 2) || "AD"}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-foreground leading-none mb-1">
                  {user?.name || "Administrador Vem Cantar"}
                </span>
                <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                  {user?.role || "Acesso Master"}
                </span>
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="h-10 px-4 text-destructive hover:bg-destructive/10 hover:text-destructive gap-2 font-bold rounded-xl transition-all"
            >
              {isLoggingOut ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <LogOut className="w-4 h-4" />
                  <span>Sair</span>
                </>
              )}
            </Button>
          </div>
        </header>

        {/* Mobile Header */}
        <MobileHeader />

        {/* Page Content */}
        <main className={cn(
          "flex-1 overflow-y-auto p-4 md:p-6 lg:p-8",
          "transition-all duration-300"
        )}>
          {children}
        </main>
      </div>
    </div>
  );
}
