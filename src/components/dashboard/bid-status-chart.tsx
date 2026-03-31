"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const data = [
  { status: "Draft", count: 4, color: "oklch(0.50 0.01 250)" },
  { status: "Review", count: 3, color: "oklch(0.55 0.12 175)" },
  { status: "Approval", count: 1, color: "oklch(0.80 0.15 85)" },
  { status: "Ready", count: 2, color: "oklch(0.65 0.15 145)" },
  { status: "Issued", count: 2, color: "oklch(0.55 0.15 260)" },
];

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: { status: string; count: number } }>;
}) {
  if (!active || !payload?.[0]) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-lg border bg-card px-3 py-2 shadow-lg ring-1 ring-foreground/5">
      <p className="text-xs text-muted-foreground">{d.status}</p>
      <p className="font-mono text-sm font-semibold tabular-nums">
        {d.count} bids
      </p>
    </div>
  );
}

export function BidStatusChart() {
  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart
        data={data}
        margin={{ top: 4, right: 4, left: -24, bottom: 0 }}
        barCategoryGap="25%"
      >
        <XAxis
          dataKey="status"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 10, fill: "oklch(0.50 0.01 250)" }}
          dy={4}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 10, fill: "oklch(0.50 0.01 250)" }}
          allowDecimals={false}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "oklch(0.96 0.006 210)" }} />
        <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={36}>
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
