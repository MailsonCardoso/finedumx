import { useState, useEffect } from "react";
import { AppSidebar } from "./AppSidebar";
import { MobileHeader } from "./MobileHeader";
import { cn } from "@/lib/utils";

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    // Remove old theme residues that might interfere
    localStorage.removeItem('finedu-theme');
    localStorage.removeItem('theme');

    const savedTheme = localStorage.getItem('vem-cantar-theme');
    if (savedTheme) {
      try {
        const theme = JSON.parse(savedTheme);
        const root = document.documentElement;
        root.style.setProperty('--primary', theme.primary);
        root.style.setProperty('--ring', theme.primary);
        root.style.setProperty('--sidebar', theme.sidebar);
        root.style.setProperty('--sidebar-foreground', '0 0% 100%');
        root.style.setProperty('--sidebar-primary', theme.primary);
        root.style.setProperty('--sidebar-accent', 'hsl(var(--sidebar) / 0.8)');
        root.style.setProperty('--sidebar-accent-foreground', '0 0% 100%');
      } catch (e) {
        console.error("Erro ao carregar tema:", e);
      }
    }
  }, []);

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
