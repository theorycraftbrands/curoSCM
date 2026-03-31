"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { month: "Aug", planned: 4200, committed: 1200, invoiced: 0 },
  { month: "Sep", planned: 8900, committed: 3800, invoiced: 800 },
  { month: "Oct", planned: 14200, committed: 6200, invoiced: 2400 },
  { month: "Nov", planned: 19800, committed: 8100, invoiced: 4100 },
  { month: "Dec", planned: 25100, committed: 10400, invoiced: 6800 },
  { month: "Jan", planned: 30500, committed: 12900, invoiced: 9200 },
  { month: "Feb", planned: 34800, committed: 14200, invoiced: 10800 },
  { month: "Mar", planned: 38100, committed: 15400, invoiced: 12600 },
];

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number; color: string; dataKey: string }>;
  label?: string;
}) {
  if (!active || !payload) return null;
  return (
    <div className="rounded-lg border bg-card px-3 py-2 shadow-lg ring-1 ring-foreground/5">
      <p className="mb-1.5 text-xs font-medium text-muted-foreground">
        {label}
      </p>
      {payload.map((entry) => (
        <div key={entry.dataKey} className="flex items-center gap-2 text-xs">
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="capitalize text-muted-foreground">
            {entry.dataKey}
          </span>
          <span className="ml-auto font-mono font-medium tabular-nums">
            ${(entry.value / 1000).toFixed(1)}K
          </span>
        </div>
      ))}
    </div>
  );
}

export function SpendAreaChart() {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart
        data={data}
        margin={{ top: 8, right: 8, left: -12, bottom: 0 }}
      >
        <defs>
          <linearGradient id="plannedGrad" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="0%"
              stopColor="oklch(0.55 0.12 175)"
              stopOpacity={0.15}
            />
            <stop
              offset="100%"
              stopColor="oklch(0.55 0.12 175)"
              stopOpacity={0.01}
            />
          </linearGradient>
          <linearGradient id="committedGrad" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="0%"
              stopColor="oklch(0.80 0.15 85)"
              stopOpacity={0.2}
            />
            <stop
              offset="100%"
              stopColor="oklch(0.80 0.15 85)"
              stopOpacity={0.01}
            />
          </linearGradient>
          <linearGradient id="invoicedGrad" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="0%"
              stopColor="oklch(0.65 0.15 145)"
              stopOpacity={0.2}
            />
            <stop
              offset="100%"
              stopColor="oklch(0.65 0.15 145)"
              stopOpacity={0.01}
            />
          </linearGradient>
        </defs>
        <CartesianGrid
          strokeDasharray="3 3"
          vertical={false}
          stroke="oklch(0.91 0.008 210)"
        />
        <XAxis
          dataKey="month"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 11, fill: "oklch(0.50 0.01 250)" }}
          dy={8}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 11, fill: "oklch(0.50 0.01 250)" }}
          tickFormatter={(v) => `$${v / 1000}K`}
          dx={-4}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="planned"
          stroke="oklch(0.55 0.12 175)"
          strokeWidth={2}
          fill="url(#plannedGrad)"
          dot={false}
          activeDot={{ r: 4, strokeWidth: 2, fill: "white" }}
        />
        <Area
          type="monotone"
          dataKey="committed"
          stroke="oklch(0.80 0.15 85)"
          strokeWidth={2}
          fill="url(#committedGrad)"
          dot={false}
          activeDot={{ r: 4, strokeWidth: 2, fill: "white" }}
        />
        <Area
          type="monotone"
          dataKey="invoiced"
          stroke="oklch(0.65 0.15 145)"
          strokeWidth={2}
          fill="url(#invoicedGrad)"
          dot={false}
          activeDot={{ r: 4, strokeWidth: 2, fill: "white" }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
