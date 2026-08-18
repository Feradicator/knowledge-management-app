"use client";

import React, { useMemo, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useLearningStore } from "@/lib/store/learning-store";
import { formatMinutes } from "@/lib/utils";
import { Flame, Calendar, Info } from "lucide-react";
import { format, subDays, eachDayOfInterval, isSameDay, parseISO } from "date-fns";

export function StudyHeatmap() {
  const { learningSessions, stats } = useLearningStore();
  const [hoveredDay, setHoveredDay] = useState<{ date: string; minutes: number } | null>(null);

  // Generate the last 16 weeks of days (112 days) for a clean, dense grid
  const days = useMemo(() => {
    const today = new Date();
    const startDate = subDays(today, 119); // 17 weeks * 7 days
    const interval = eachDayOfInterval({ start: startDate, end: today });

    // Map sessions to date string
    const sessionMap = new Map<string, number>();
    learningSessions.forEach((s) => {
      const current = sessionMap.get(s.date) || 0;
      sessionMap.set(s.date, current + s.duration_minutes);
    });

    return interval.map((date) => {
      const dateStr = format(date, "yyyy-MM-dd");
      const minutes = sessionMap.get(dateStr) || 0;
      return {
        date,
        dateStr,
        minutes,
      };
    });
  }, [learningSessions]);

  const getIntensityColor = (minutes: number) => {
    if (minutes === 0) return "bg-secondary/70 hover:border-foreground/30";
    if (minutes < 30) return "bg-emerald-500/30 dark:bg-emerald-500/30 border border-emerald-500/40";
    if (minutes < 60) return "bg-emerald-500/60 dark:bg-emerald-500/60 border border-emerald-500/50";
    if (minutes < 120) return "bg-emerald-500/80 dark:bg-emerald-500/80 border border-emerald-400";
    return "bg-emerald-500 dark:bg-emerald-400 text-black shadow-sm shadow-emerald-500/30";
  };

  return (
    <Card className="p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-primary" />
          <h3 className="font-semibold text-foreground text-sm sm:text-base">Study Activity Heatmap</h3>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5 font-medium text-muted-foreground">
            <Flame className="h-4 w-4 text-amber-500" />
            <span className="font-bold text-foreground">{stats.streakDays} Day Streak</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <span>Less</span>
            <div className="h-2.5 w-2.5 rounded-sm bg-secondary/70" />
            <div className="h-2.5 w-2.5 rounded-sm bg-emerald-500/30" />
            <div className="h-2.5 w-2.5 rounded-sm bg-emerald-500/60" />
            <div className="h-2.5 w-2.5 rounded-sm bg-emerald-500" />
            <span>More</span>
          </div>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="overflow-x-auto pb-2">
        <div className="grid grid-rows-7 grid-flow-col gap-1.5 min-w-[500px]">
          {days.map((d) => (
            <div
              key={d.dateStr}
              onMouseEnter={() => setHoveredDay({ date: d.dateStr, minutes: d.minutes })}
              onMouseLeave={() => setHoveredDay(null)}
              className={`h-3 w-3 sm:h-3.5 sm:w-3.5 rounded-sm transition-all cursor-pointer ${getIntensityColor(
                d.minutes
              )}`}
              title={`${format(d.date, "EEE, MMM d, yyyy")}: ${formatMinutes(d.minutes)} studied`}
            />
          ))}
        </div>
      </div>

      {/* Dynamic Hover Status */}
      <div className="mt-3 text-xs text-muted-foreground flex items-center justify-between border-t border-border/40 pt-2">
        <div>
          {hoveredDay ? (
            <span>
              <strong className="text-foreground">{format(parseISO(hoveredDay.date), "MMMM d, yyyy")}</strong>:{" "}
              {hoveredDay.minutes > 0 ? `${formatMinutes(hoveredDay.minutes)} logged` : "No activity recorded"}
            </span>
          ) : (
            <span>Hover over any day square to inspect study time</span>
          )}
        </div>
        <span className="text-[11px]">Last 17 Weeks</span>
      </div>
    </Card>
  );
}
