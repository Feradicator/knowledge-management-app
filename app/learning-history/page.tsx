"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useLearningStore } from "@/lib/store/learning-store";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Modal } from "@/components/ui/modal";
import { StudyHeatmap } from "@/components/dashboard/study-heatmap";
import {
  History,
  Clock,
  Plus,
  Calendar,
  Trash2,
  TrendingUp,
  PieChart as PieIcon,
  BarChart3,
  Flame,
  Award,
} from "lucide-react";
import { formatMinutes, formatDateString, formatRelativeDate } from "@/lib/utils";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";
import { format, subDays, startOfWeek, startOfMonth, parseISO, isAfter } from "date-fns";

export default function LearningHistoryPage() {
  const { learningSessions, technologies, topics, addLearningSession, deleteLearningSession, isOwner } =
    useLearningStore();

  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [sessionTitle, setSessionTitle] = useState("");
  const [sessionDuration, setSessionDuration] = useState(60);
  const [sessionDate, setSessionDate] = useState(new Date().toISOString().split("T")[0]);
  const [sessionTechId, setSessionTechId] = useState("");
  const [sessionTopicId, setSessionTopicId] = useState("");
  const [sessionDesc, setSessionDesc] = useState("");

  // Calculate Metrics
  const metrics = useMemo(() => {
    const totalMinutes = learningSessions.reduce((acc, s) => acc + (s.duration_minutes || 0), 0);

    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const monthStart = startOfMonth(now);

    const thisWeekMinutes = learningSessions
      .filter((s) => isAfter(parseISO(s.date), weekStart) || s.date === format(weekStart, "yyyy-MM-dd"))
      .reduce((acc, s) => acc + s.duration_minutes, 0);

    const thisMonthMinutes = learningSessions
      .filter((s) => isAfter(parseISO(s.date), monthStart) || s.date === format(monthStart, "yyyy-MM-dd"))
      .reduce((acc, s) => acc + s.duration_minutes, 0);

    return {
      allTime: totalMinutes,
      thisWeek: thisWeekMinutes,
      thisMonth: thisMonthMinutes,
      sessionCount: learningSessions.length,
    };
  }, [learningSessions]);

  // Daily study chart data for the last 14 days
  const dailyChartData = useMemo(() => {
    const today = new Date();
    const data = [];
    for (let i = 13; i >= 0; i--) {
      const d = subDays(today, i);
      const dateStr = format(d, "yyyy-MM-dd");
      const label = format(d, "MMM d");
      const dayMinutes = learningSessions
        .filter((s) => s.date === dateStr)
        .reduce((acc, s) => acc + s.duration_minutes, 0);

      data.push({
        date: label,
        hours: Number((dayMinutes / 60).toFixed(1)),
        minutes: dayMinutes,
      });
    }
    return data;
  }, [learningSessions]);

  // Technology time breakdown pie chart data
  const techPieData = useMemo(() => {
    const techMap = new Map<string, number>();

    learningSessions.forEach((s) => {
      const tech = technologies.find((t) => t.id === s.technology_id);
      const name = tech?.name || "General Tech";
      const current = techMap.get(name) || 0;
      techMap.set(name, current + s.duration_minutes);
    });

    const colors = ["#6366f1", "#2a9d8f", "#e76f51", "#0077b6", "#9d4edd", "#e63946", "#f4a261"];

    return Array.from(techMap.entries()).map(([name, minutes], idx) => ({
      name,
      value: Number((minutes / 60).toFixed(1)),
      minutes,
      color: colors[idx % colors.length],
    }));
  }, [learningSessions, technologies]);

  const handleLogSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionTitle.trim()) return;

    addLearningSession({
      title: sessionTitle.trim(),
      duration_minutes: Number(sessionDuration),
      date: sessionDate,
      technology_id: sessionTechId || null,
      topic_id: sessionTopicId || null,
      description: sessionDesc.trim(),
    });

    setSessionTitle("");
    setSessionDesc("");
    setIsLogModalOpen(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            <History className="h-7 w-7 text-primary" /> Learning History & Analytics
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track study hours, visualize learning trends over time, and inspect session logs.
          </p>
        </div>
        {isOwner && (
          <Button onClick={() => setIsLogModalOpen(true)} className="gap-2 shadow-sm shadow-primary/25">
            <Plus className="h-4 w-4" /> Log Study Session
          </Button>
        )}
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">This Week</p>
          <p className="text-2xl sm:text-3xl font-bold text-foreground mt-1">{formatMinutes(metrics.thisWeek)}</p>
          <p className="text-xs text-muted-foreground mt-1">Study time since Monday</p>
        </Card>
        <Card className="p-5">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">This Month</p>
          <p className="text-2xl sm:text-3xl font-bold text-foreground mt-1">{formatMinutes(metrics.thisMonth)}</p>
          <p className="text-xs text-muted-foreground mt-1">Study time this month</p>
        </Card>
        <Card className="p-5">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">All-Time Total</p>
          <p className="text-2xl sm:text-3xl font-bold text-primary mt-1">{formatMinutes(metrics.allTime)}</p>
          <p className="text-xs text-muted-foreground mt-1">Total technical study</p>
        </Card>
        <Card className="p-5">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Sessions</p>
          <p className="text-2xl sm:text-3xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{metrics.sessionCount}</p>
          <p className="text-xs text-muted-foreground mt-1">Logged study activities</p>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Study Time Bar Chart */}
        <Card className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-foreground flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" /> Daily Study Time (Last 14 Days)
            </h3>
            <span className="text-xs text-muted-foreground">Hours / Day</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.5)" vertical={false} />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    borderColor: "hsl(var(--border))",
                    borderRadius: "0.75rem",
                    fontSize: "0.75rem",
                  }}
                  formatter={(value: any) => [`${value} hrs`, "Study Duration"]}
                />
                <Bar dataKey="hours" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Technology Time Distribution Pie Chart */}
        <Card className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-foreground flex items-center gap-2">
              <PieIcon className="h-5 w-5 text-purple-500" /> Study Distribution by Technology
            </h3>
            <span className="text-xs text-muted-foreground">Hours</span>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            {techPieData.length === 0 ? (
              <p className="text-xs text-muted-foreground">No technology study data recorded.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={techPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                    nameKey="name"
                  >
                    {techPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      borderColor: "hsl(var(--border))",
                      borderRadius: "0.75rem",
                      fontSize: "0.75rem",
                    }}
                    formatter={(value: any, name: any) => [`${value} hrs`, name]}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>
      </div>

      {/* Heatmap */}
      <StudyHeatmap />

      {/* Historical Sessions Log Table */}
      <Card className="overflow-hidden">
        <CardHeader className="p-5 border-b border-border/50 flex flex-row items-center justify-between">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" /> Session Activity Log
          </CardTitle>
          <span className="text-xs text-muted-foreground">{learningSessions.length} total entries</span>
        </CardHeader>

        <div className="divide-y divide-border/40">
          {learningSessions.length === 0 ? (
            <div className="p-8 text-center text-xs text-muted-foreground">
              No learning sessions logged yet. Log your first session to start charting your progress!
            </div>
          ) : (
            learningSessions
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .map((sess) => {
                const tech = technologies.find((t) => t.id === sess.technology_id);
                const topic = topics.find((t) => t.id === sess.topic_id);

                return (
                  <div
                    key={sess.id}
                    className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-secondary/30 transition-colors"
                  >
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-foreground">
                          {formatDateString(sess.date)}
                        </span>
                        {tech && (
                          <span
                            className="px-2 py-0.5 rounded text-[10px] font-bold text-white shadow-xs"
                            style={{ backgroundColor: tech.color || "#6366f1" }}
                          >
                            {tech.name}
                          </span>
                        )}
                        {topic && (
                          <Badge variant="secondary" className="text-[10px]">
                            {topic.name}
                          </Badge>
                        )}
                      </div>

                      <p className="font-bold text-sm text-foreground">{sess.title}</p>

                      {sess.description && (
                        <p className="text-xs text-muted-foreground">{sess.description}</p>
                      )}
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                      <span className="font-extrabold text-sm text-primary px-2.5 py-1 rounded-lg bg-primary/10">
                        {formatMinutes(sess.duration_minutes)}
                      </span>
                      {isOwner && (
                        <button
                          onClick={() => {
                            if (confirm(`Delete session '${sess.title}'?`)) deleteLearningSession(sess.id);
                          }}
                          className="text-muted-foreground hover:text-destructive p-1 rounded transition-colors"
                          title="Delete session"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
          )}
        </div>
      </Card>

      {/* Log Session Modal */}
      <Modal isOpen={isLogModalOpen} onClose={() => setIsLogModalOpen(false)} title="Log Technical Study Session">
        <form onSubmit={handleLogSession} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-foreground mb-1 block">Session Title / Topic Studied</label>
            <Input
              placeholder="e.g. Studied JWT authentication filter chain and tokens"
              value={sessionTitle}
              onChange={(e) => setSessionTitle(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">Study Date</label>
              <Input
                type="date"
                value={sessionDate}
                onChange={(e) => setSessionDate(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">Duration (minutes)</label>
              <Input
                type="number"
                min="5"
                max="720"
                step="5"
                value={sessionDuration}
                onChange={(e) => setSessionDuration(Number(e.target.value))}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">Technology</label>
              <select
                value={sessionTechId}
                onChange={(e) => setSessionTechId(e.target.value)}
                className="w-full h-9 rounded-lg border border-input bg-transparent px-3 text-sm"
              >
                <option value="" className="bg-card">General</option>
                {technologies.map((t) => (
                  <option key={t.id} value={t.id} className="bg-card">
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">Topic (Optional)</label>
              <select
                value={sessionTopicId}
                onChange={(e) => setSessionTopicId(e.target.value)}
                className="w-full h-9 rounded-lg border border-input bg-transparent px-3 text-sm"
              >
                <option value="" className="bg-card">None</option>
                {topics
                  .filter((t) => !sessionTechId || t.technology_id === sessionTechId)
                  .map((t) => (
                    <option key={t.id} value={t.id} className="bg-card">
                      {t.name}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground mb-1 block">Notes / Key Takeaways</label>
            <Textarea
              placeholder="What breakthroughs or concepts did you master today?"
              value={sessionDesc}
              onChange={(e) => setSessionDesc(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsLogModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Log Session</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
