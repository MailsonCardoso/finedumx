import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface KPICardProps {
  title: string;
  value: string;
  trend?: {
    value: string;
    direction: "up" | "down" | "neutral";
  };
  icon: React.ReactNode;
  className?: string;
}

export function KPICard({ title, value, trend, icon, className }: KPICardProps) {
  return (
    <div className={cn(
      "bg-card rounded-xl p-6 shadow-card border border-border/50 animate-fade-in",
      className
    )}>
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          {trend && (
            <div className={cn(
              "flex items-center gap-1 text-xs font-medium",
              trend.direction === "up" && "text-success",
              trend.direction === "down" && "text-danger",
              trend.direction === "neutral" && "text-muted-foreground"
            )}>
              {trend.direction === "up" && <TrendingUp className="w-3 h-3" />}
              {trend.direction === "down" && <TrendingDown className="w-3 h-3" />}
              {trend.direction === "neutral" && <Minus className="w-3 h-3" />}
              <span>{trend.value}</span>
            </div>
          )}
        </div>
        <div className="p-3 rounded-lg bg-primary/10 text-primary">
          {icon}
        </div>
      </div>
    </div>
  );
}
