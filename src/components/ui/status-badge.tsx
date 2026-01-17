import { cn } from "@/lib/utils";

type StatusType = "success" | "warning" | "danger";

interface StatusBadgeProps {
  status: StatusType;
  children: React.ReactNode;
  className?: string;
}

const statusStyles: Record<StatusType, string> = {
  success: "bg-success-light text-success",
  warning: "bg-warning-light text-warning-foreground",
  danger: "bg-danger-light text-danger",
};

export function StatusBadge({ status, children, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
        statusStyles[status],
        className
      )}
    >
      <span className={cn(
        "w-1.5 h-1.5 rounded-full",
        status === "success" && "bg-success",
        status === "warning" && "bg-warning",
        status === "danger" && "bg-danger"
      )} />
      {children}
    </span>
  );
}
