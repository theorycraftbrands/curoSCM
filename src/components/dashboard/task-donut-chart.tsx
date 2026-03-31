"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const data = [
  { name: "On Schedule", value: 16, color: "oklch(0.55 0.12 175)" },
  { name: "Complete", value: 6, color: "oklch(0.65 0.15 145)" },
  { name: "Overdue", value: 4, color: "oklch(0.60 0.20 25)" },
];

const total = data.reduce((sum, d) => sum + d.value, 0);

export function TaskDonutChart() {
  return (
    <div className="flex items-center gap-4">
      <div className="relative h-[120px] w-[120px] shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={38}
              outerRadius={56}
              paddingAngle={3}
              dataKey="value"
              strokeWidth={0}
            >
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-mono text-xl font-bold tabular-nums leading-none">
            {total}
          </span>
          <span className="text-[10px] text-muted-foreground">tasks</span>
        </div>
      </div>
      <div className="space-y-2.5">
        {data.map((d) => (
          <div key={d.name} className="flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: d.color }}
            />
            <span className="text-xs text-muted-foreground">{d.name}</span>
            <span className="ml-auto font-mono text-xs font-semibold tabular-nums">
              {d.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
