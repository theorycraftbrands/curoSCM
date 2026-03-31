"use client";

const deliverables = [
  { label: "Requisitions", count: 12, max: 12, color: "bg-chart-1" },
  { label: "Bids", count: 12, max: 12, color: "bg-chart-2" },
  { label: "Offers", count: 12, max: 12, color: "bg-chart-4" },
  { label: "Orders", count: 11, max: 12, color: "bg-chart-3" },
];

export function DeliverablesBar() {
  return (
    <div className="space-y-3">
      {deliverables.map((d) => (
        <div key={d.label} className="group/bar">
          <div className="mb-1 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{d.label}</span>
            <span className="font-mono text-xs font-semibold tabular-nums">
              {d.count}
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={`h-full rounded-full ${d.color} transition-all duration-500 group-hover/bar:opacity-80`}
              style={{ width: `${(d.count / d.max) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
