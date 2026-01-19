import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { motion } from "framer-motion";

interface KPICardProps {
  title: string;
  value: string;
  trend?: {
    value: string;
    direction: "up" | "down" | "neutral";
  };
  subText?: string;
  icon: React.ReactNode;
  className?: string;
  index?: number;
}

export function KPICard({ title, value, trend, subText, icon, className, index = 0 }: KPICardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={cn(
        "relative overflow-hidden bg-card rounded-2xl p-6 shadow-soft border border-border/50 group transition-all",
        "hover:shadow-card hover:border-primary/20",
        className
      )}
    >
      {/* Decorative Gradient Glow */}
      <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors" />

      <div className="relative flex items-start justify-between">
        <div className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
          <p className="text-3xl font-bold text-foreground tracking-tight">{value}</p>

          <div className="flex flex-col gap-1">
            {trend && (
              <div className={cn(
                "flex items-center gap-1.5 text-xs font-semibold px-2 py-1 rounded-full w-fit",
                trend.direction === "up" && "bg-success/10 text-success",
                trend.direction === "down" && "bg-danger/10 text-danger",
                trend.direction === "neutral" && "bg-muted/10 text-muted-foreground"
              )}>
                {trend.direction === "up" && <TrendingUp className="w-3 h-3" />}
                {trend.direction === "down" && <TrendingDown className="w-3 h-3" />}
                {trend.direction === "neutral" && <Minus className="w-3 h-3" />}
                <span>{trend.value}</span>
              </div>
            )}
            {subText && (
              <p className="text-xs text-muted-foreground/80 font-medium ml-1">
                {subText}
              </p>
            )}
          </div>
        </div>
        <div className="p-3.5 rounded-xl bg-primary/10 text-primary shadow-sm group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
          {icon}
        </div>
      </div>
    </motion.div>
  );
}
