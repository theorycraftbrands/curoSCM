import {
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Calendar,
  CircleDot,
  Package,
  FileText,
  DollarSign,
  Truck,
  ClipboardCheck,
  AlertTriangle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SpendAreaChart } from "@/components/dashboard/spend-area-chart";
import { BidStatusChart } from "@/components/dashboard/bid-status-chart";
import { TaskDonutChart } from "@/components/dashboard/task-donut-chart";
import { DeliverablesBar } from "@/components/dashboard/deliverables-bar";
import { KpiSparkline } from "@/components/dashboard/kpi-sparkline";

const kpis = [
  {
    label: "Planned Spend",
    value: "$38.1K",
    change: "+12.4%",
    trend: "up" as const,
    sparkData: [4, 9, 14, 20, 25, 31, 35, 38],
    color: "oklch(0.55 0.12 175)",
  },
  {
    label: "Committed",
    value: "$15.4K",
    change: "+8.2%",
    trend: "up" as const,
    sparkData: [1, 4, 6, 8, 10, 13, 14, 15],
    color: "oklch(0.80 0.15 85)",
  },
  {
    label: "Invoiced",
    value: "$12.6K",
    change: "+18.6%",
    trend: "up" as const,
    sparkData: [0, 1, 2, 4, 7, 9, 11, 13],
    color: "oklch(0.65 0.15 145)",
  },
  {
    label: "Variance",
    value: "-$2.8K",
    change: "-3.1%",
    trend: "down" as const,
    sparkData: [0, -1, -1, -2, -2, -3, -3, -3],
    color: "oklch(0.65 0.18 25)",
  },
];

const milestones = [
  {
    date: "Mar 31",
    title: "Tubing material inspection",
    project: "2021 Bikes",
    type: "inspection",
    icon: ClipboardCheck,
    urgent: true,
  },
  {
    date: "Apr 02",
    title: "Brake Components bid closes",
    project: "2021 Bikes",
    type: "bid",
    icon: FileText,
    urgent: false,
  },
  {
    date: "Apr 05",
    title: "Frame tubing release #3",
    project: "2021 Bikes",
    type: "release",
    icon: Truck,
    urgent: false,
  },
  {
    date: "Apr 08",
    title: "Shimano invoice due",
    project: "2021 Bikes",
    type: "invoice",
    icon: DollarSign,
    urgent: false,
  },
];

const activity = [
  {
    initials: "MK",
    name: "Maria K.",
    action: "issued",
    target: "PO-2021-Tubing",
    entity: "purchase order",
    time: "2m ago",
    color: "bg-chart-1",
  },
  {
    initials: "JS",
    name: "Jake S.",
    action: "submitted response to",
    target: "BID-2021-Brakes",
    entity: "bid",
    time: "18m ago",
    color: "bg-chart-2",
  },
  {
    initials: "RD",
    name: "Rachel D.",
    action: "created",
    target: "REQ-2021-Wheels",
    entity: "requisition",
    time: "1h ago",
    color: "bg-chart-3",
  },
  {
    initials: "AL",
    name: "Alex L.",
    action: "approved vendor docs for",
    target: "ORD-2021-Frames",
    entity: "order",
    time: "2h ago",
    color: "bg-chart-4",
  },
  {
    initials: "MK",
    name: "Maria K.",
    action: "released materials on",
    target: "ORD-2021-Tubing",
    entity: "order",
    time: "3h ago",
    color: "bg-chart-1",
  },
  {
    initials: "JS",
    name: "Jake S.",
    action: "added 3 items to",
    target: "REQ-2021-Grips",
    entity: "requisition",
    time: "5h ago",
    color: "bg-chart-2",
  },
];

const tasks = [
  {
    title: "Review Tubing Bid responses",
    project: "2021 Bikes",
    id: "BID-2021-Tubing",
    due: "Today",
    priority: "high" as const,
  },
  {
    title: "Approve brake components PO",
    project: "2021 Bikes",
    id: "ORD-2021-Brakes",
    due: "Tomorrow",
    priority: "medium" as const,
  },
  {
    title: "Submit material inspection report",
    project: "2021 Bikes",
    id: "ORD-2021-Tubing",
    due: "Mar 31",
    priority: "high" as const,
  },
  {
    title: "Update frame vendor contact info",
    project: "2021 Bikes",
    id: "BIZ-FrameCo",
    due: "Apr 02",
    priority: "low" as const,
  },
  {
    title: "Finalize wheel requisition grouping",
    project: "2021 Bikes",
    id: "REQ-2021-Wheels",
    due: "Apr 04",
    priority: "medium" as const,
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            2021 Bikes &mdash; Project overview
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Calendar className="h-3.5 w-3.5" />
          <span>
            Aug 15, 2020 &ndash; Jun 15, 2021
          </span>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className="group relative overflow-hidden rounded-xl border bg-card p-4 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  {kpi.label}
                </p>
                <p className="mt-1 font-mono text-2xl font-bold tabular-nums tracking-tight">
                  {kpi.value}
                </p>
              </div>
              <div
                className={`flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                  kpi.trend === "up"
                    ? "bg-chart-3/10 text-chart-3"
                    : "bg-destructive/10 text-destructive"
                }`}
              >
                {kpi.trend === "up" ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                {kpi.change}
              </div>
            </div>
            <div className="mt-2">
              <KpiSparkline data={kpi.sparkData} color={kpi.color} />
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid — Charts */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Spend Over Time — Full width chart */}
        <div className="rounded-xl border bg-card p-5 shadow-sm lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold">Spend Tracking</h2>
              <p className="text-xs text-muted-foreground">
                Planned vs committed vs invoiced
              </p>
            </div>
            <div className="flex items-center gap-4 text-[11px]">
              {[
                { label: "Planned", color: "bg-chart-1" },
                { label: "Committed", color: "bg-chart-2" },
                { label: "Invoiced", color: "bg-chart-3" },
              ].map((l) => (
                <div key={l.label} className="flex items-center gap-1.5">
                  <span className={`h-2 w-2 rounded-full ${l.color}`} />
                  <span className="text-muted-foreground">{l.label}</span>
                </div>
              ))}
            </div>
          </div>
          <SpendAreaChart />
        </div>

        {/* Right column — stacked cards */}
        <div className="flex flex-col gap-4">
          {/* Deliverable Counts */}
          <div className="rounded-xl border bg-card p-5 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold">Deliverables</h2>
            <DeliverablesBar />
          </div>

          {/* Task Status Donut */}
          <div className="rounded-xl border bg-card p-5 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold">Task Status</h2>
            <TaskDonutChart />
          </div>
        </div>
      </div>

      {/* Second Row — Bid Status + Milestones */}
      <div className="grid gap-4 lg:grid-cols-5">
        {/* Bid Status */}
        <div className="rounded-xl border bg-card p-5 shadow-sm lg:col-span-2">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-semibold">Bid Pipeline</h2>
            <span className="font-mono text-xs text-muted-foreground tabular-nums">
              12 total
            </span>
          </div>
          <BidStatusChart />
        </div>

        {/* This Week at a Glance */}
        <div className="rounded-xl border bg-card p-5 shadow-sm lg:col-span-3">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold">Upcoming Milestones</h2>
            <button className="flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 transition-colors">
              View all <ArrowRight className="h-3 w-3" />
            </button>
          </div>
          <div className="space-y-0 divide-y">
            {milestones.map((m, i) => {
              const Icon = m.icon;
              return (
                <div
                  key={i}
                  className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0"
                >
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                      m.urgent
                        ? "bg-destructive/10 text-destructive"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{m.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {m.project}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {m.urgent && (
                      <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
                    )}
                    <span
                      className={`font-mono text-xs tabular-nums ${
                        m.urgent
                          ? "font-semibold text-destructive"
                          : "text-muted-foreground"
                      }`}
                    >
                      {m.date}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Row — Tasks + Activity */}
      <div className="grid gap-4 lg:grid-cols-5">
        {/* My Tasks */}
        <div className="rounded-xl border bg-card p-5 shadow-sm lg:col-span-3">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold">My Tasks</h2>
              <Badge variant="secondary" className="font-mono text-[10px] tabular-nums">
                {tasks.length}
              </Badge>
            </div>
            <button className="flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 transition-colors">
              View all <ArrowRight className="h-3 w-3" />
            </button>
          </div>
          <div className="divide-y">
            {tasks.map((task, i) => (
              <div
                key={i}
                className="group flex items-center gap-3 py-2.5 first:pt-0 last:pb-0"
              >
                <div
                  className={`h-2 w-2 shrink-0 rounded-full ${
                    task.priority === "high"
                      ? "bg-destructive"
                      : task.priority === "medium"
                        ? "bg-chart-2"
                        : "bg-muted-foreground/30"
                  }`}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium group-hover:text-primary transition-colors">
                    {task.title}
                  </p>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span>{task.project}</span>
                    <CircleDot className="h-2.5 w-2.5" />
                    <span className="font-mono tabular-nums">{task.id}</span>
                  </div>
                </div>
                <span
                  className={`shrink-0 font-mono text-xs tabular-nums ${
                    task.due === "Today"
                      ? "font-semibold text-destructive"
                      : "text-muted-foreground"
                  }`}
                >
                  {task.due}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Team Activity */}
        <div className="rounded-xl border bg-card p-5 shadow-sm lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold">Team Activity</h2>
            <div className="flex -space-x-1.5">
              {["MK", "JS", "RD", "AL"].map((initials) => (
                <div
                  key={initials}
                  className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-card bg-muted text-[8px] font-bold text-muted-foreground"
                >
                  {initials}
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-0">
            {activity.map((a, i) => (
              <div
                key={i}
                className="group relative flex gap-3 py-2.5 first:pt-0 last:pb-0"
              >
                {/* Timeline connector */}
                {i < activity.length - 1 && (
                  <div className="absolute left-[13px] top-[32px] h-[calc(100%-20px)] w-px bg-border" />
                )}
                <div
                  className={`relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${a.color} text-[9px] font-bold text-white`}
                >
                  {a.initials}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs leading-relaxed">
                    <span className="font-medium">{a.name}</span>{" "}
                    <span className="text-muted-foreground">{a.action}</span>{" "}
                    <span className="font-mono text-[11px] font-medium tabular-nums">
                      {a.target}
                    </span>
                  </p>
                  <p className="text-[10px] text-muted-foreground">{a.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
