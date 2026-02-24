import { useState, useEffect } from "react";
import { AppSidebar } from "./AppSidebar";
import { MobileHeader } from "./MobileHeader";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { applyTheme } from "@/lib/theme-utils";

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

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
