import React from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: string;
  color?: string;
}

export function StatCard({ title, value, subtitle, icon, color = "text-primary" }: StatCardProps) {
  return (
    <Card className="p-4 sm:p-5 relative overflow-hidden group hover:border-primary/40 transition-all hover:shadow-md">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {title}
          </p>
          <div className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mt-1">
            {value}
          </div>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>
        <div className={cn("flex h-11 w-11 items-center justify-center rounded-xl bg-secondary/80 p-2.5 transition-transform group-hover:scale-110", color)}>
          {icon}
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    </Card>
  );
}
