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
    const savedColor = localStorage.getItem('vem-cantar-color');
    if (savedColor) {
      document.documentElement.style.setProperty('--primary', savedColor);
      document.documentElement.style.setProperty('--ring', savedColor);
    }
  }, []);

  return (
    <div className="min-h-screen flex w-full bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
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
