import React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?:
    | "default"
    | "success"
    | "warning"
    | "danger"
    | "info"
    | "purple"
    | "outline";
  className?: string;
  size?: "sm" | "md";
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "default",
  className,
  size = "md",
}) => {
  const variantStyles = {
    default: "bg-slate-100 text-slate-800 border-slate-200",
    success: "bg-emerald-50 text-emerald-700 border-emerald-200",
    warning: "bg-amber-50 text-amber-700 border-amber-200",
    danger: "bg-rose-50 text-rose-700 border-rose-200",
    info: "bg-teal-50 text-teal-700 border-teal-200",
    purple: "bg-purple-50 text-purple-700 border-purple-200",
    outline: "border-slate-300 text-slate-600 bg-transparent",
  };

  const sizeStyles = {
    sm: "px-2 py-0.5 text-xs font-medium",
    md: "px-2.5 py-1 text-xs font-semibold",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border leading-none transition-colors",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {children}
    </span>
  );
};

export function getStatusBadge(status: string) {
  switch (status) {
    case "Approved":
    case "Completed":
    case "Paid":
    case "Normal":
      return <Badge variant="success">{status}</Badge>;
    case "Pending Collection":
    case "Booked":
    case "Unpaid":
      return <Badge variant="warning">{status}</Badge>;
    case "Partial":
    case "In Progress":
    case "Processing":
    case "Collected":
    case "Received":
      return <Badge variant="info">{status}</Badge>;
    case "Pending Approval":
      return <Badge variant="purple">{status}</Badge>;
    case "Rejected":
    case "Critical":
      return <Badge variant="danger">{status}</Badge>;
    case "High":
      return <Badge variant="danger">HIGH</Badge>;
    case "Low":
      return <Badge variant="warning">LOW</Badge>;
    default:
      return <Badge variant="default">{status}</Badge>;
  }
}

