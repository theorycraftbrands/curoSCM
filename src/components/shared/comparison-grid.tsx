"use client";

import { useState } from "react";
import { saveBidResponse } from "@/actions/bids";
import { Input } from "@/components/ui/input";
import { Star, Check, X } from "lucide-react";

interface Proponent {
  id: string;
  is_recommended: boolean;
  business: { id: string; name: string } | null;
}

interface BidItem {
  id: string;
  description: string;
  quantity: number;
  unit: string | null;
}

interface Response {
  id: string;
  bid_item_id: string;
  proponent_id: string;
  unit_price: number | null;
  lead_time_days: number | null;
  is_compliant: boolean | null;
  notes: string | null;
}

interface ComparisonGridProps {
  bidId: string;
  projectId: string;
  proponents: Proponent[];
  items: BidItem[];
  responses: Response[];
}

const proponentColors = [
  "border-chart-1 bg-chart-1/5",
  "border-chart-2 bg-chart-2/5",
  "border-chart-3 bg-chart-3/5",
  "border-chart-4 bg-chart-4/5",
  "border-chart-5 bg-chart-5/5",
];

const headerColors = [
  "bg-chart-1/10 text-chart-1",
  "bg-chart-2/10 text-chart-2",
  "bg-chart-3/10 text-chart-3",
  "bg-chart-4/10 text-chart-4",
  "bg-chart-5/10 text-chart-5",
];

export function ComparisonGrid({ bidId, projectId, proponents, items, responses }: ComparisonGridProps) {
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [cellValue, setCellValue] = useState("");

  // Build a lookup: responses[itemId][proponentId]
  const responseMap: Record<string, Record<string, Response>> = {};
  for (const r of responses) {
    if (!responseMap[r.bid_item_id]) responseMap[r.bid_item_id] = {};
    responseMap[r.bid_item_id][r.proponent_id] = r;
  }

  // Calculate totals per proponent
  const totals: Record<string, number> = {};
  for (const p of proponents) {
    totals[p.id] = items.reduce((sum, item) => {
      const resp = responseMap[item.id]?.[p.id];
      if (resp?.unit_price != null) {
        return sum + Number(resp.unit_price) * Number(item.quantity);
      }
      return sum;
    }, 0);
  }

  // Find lowest price per item for heatmap
  const lowestPrices: Record<string, number> = {};
  for (const item of items) {
    let min = Infinity;
    for (const p of proponents) {
      const price = responseMap[item.id]?.[p.id]?.unit_price;
      if (price != null && Number(price) < min) min = Number(price);
    }
    if (min < Infinity) lowestPrices[item.id] = min;
  }

  function getCellColor(itemId: string, price: number | null) {
    if (price == null) return "";
    const lowest = lowestPrices[itemId];
    if (lowest == null) return "";
    if (Number(price) === lowest) return "bg-chart-3/10 text-chart-3 font-semibold";
    const ratio = Number(price) / lowest;
    if (ratio > 1.2) return "bg-destructive/5 text-destructive";
    if (ratio > 1.1) return "bg-chart-2/5 text-chart-2";
    return "";
  }

  async function handleSave(itemId: string, proponentId: string) {
    const price = parseFloat(cellValue);
    if (isNaN(price)) return;
    await saveBidResponse(itemId, proponentId, { unit_price: price }, projectId, bidId);
    setEditingCell(null);
  }

  if (proponents.length === 0 || items.length === 0) {
    return (
      <div className="rounded-xl border bg-card py-16 text-center">
        <p className="text-sm text-muted-foreground">
          Add at least one vendor and one bid item to view the comparison grid.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Proponent Summary Row */}
      <div className="grid gap-3" style={{ gridTemplateColumns: `200px repeat(${proponents.length}, 1fr)` }}>
        <div className="text-sm font-medium text-muted-foreground self-end pb-2">
          Vendor Summary
        </div>
        {proponents.map((p, i) => (
          <div
            key={p.id}
            className={`rounded-lg border-l-4 p-3 ${proponentColors[i % proponentColors.length]}`}
          >
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-semibold truncate">{p.business?.name}</span>
              {p.is_recommended && <Star className="h-3.5 w-3.5 text-chart-2 fill-chart-2 shrink-0" />}
            </div>
            <div className="mt-1 font-mono text-lg font-bold tabular-nums">
              ${totals[p.id].toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </div>
            <div className="text-xs text-muted-foreground">
              {items.filter((item) => responseMap[item.id]?.[p.id]?.unit_price != null).length}/{items.length} items quoted
            </div>
          </div>
        ))}
      </div>

      {/* Comparison Table */}
      <div className="overflow-x-auto rounded-xl border shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/30">
              <th className="sticky left-0 z-10 bg-muted/30 px-3 py-2 text-left font-medium text-muted-foreground min-w-[200px]">
                Item
              </th>
              <th className="px-3 py-2 text-right font-medium text-muted-foreground w-16">Qty</th>
              {proponents.map((p, i) => (
                <th
                  key={p.id}
                  className={`px-3 py-2 text-center font-medium min-w-[140px] ${headerColors[i % headerColors.length]}`}
                >
                  {p.business?.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-muted/10 transition-colors">
                <td className="sticky left-0 z-10 bg-card px-3 py-2.5 font-medium">
                  {item.description}
                </td>
                <td className="px-3 py-2.5 text-right font-mono text-xs tabular-nums text-muted-foreground">
                  {item.quantity} {item.unit}
                </td>
                {proponents.map((p) => {
                  const resp = responseMap[item.id]?.[p.id];
                  const cellKey = `${item.id}-${p.id}`;
                  const isEditing = editingCell === cellKey;

                  return (
                    <td
                      key={p.id}
                      className={`px-2 py-1.5 text-center ${getCellColor(item.id, resp?.unit_price ?? null)}`}
                    >
                      {isEditing ? (
                        <div className="flex gap-1">
                          <Input
                            type="number"
                            step="0.01"
                            value={cellValue}
                            onChange={(e) => setCellValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleSave(item.id, p.id);
                              if (e.key === "Escape") setEditingCell(null);
                            }}
                            className="h-7 w-20 text-xs font-mono text-center"
                            autoFocus
                          />
                          <button onClick={() => handleSave(item.id, p.id)} className="text-chart-3 hover:scale-110">
                            <Check className="h-3.5 w-3.5" />
                          </button>
                          <button onClick={() => setEditingCell(null)} className="text-muted-foreground hover:text-destructive">
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setEditingCell(cellKey);
                            setCellValue(resp?.unit_price?.toString() ?? "");
                          }}
                          className="w-full rounded px-2 py-1 font-mono text-xs tabular-nums transition-colors hover:bg-muted"
                        >
                          {resp?.unit_price != null ? (
                            <>
                              ${Number(resp.unit_price).toFixed(2)}
                              {resp.lead_time_days && (
                                <span className="block text-[10px] text-muted-foreground">
                                  {resp.lead_time_days}d lead
                                </span>
                              )}
                            </>
                          ) : (
                            <span className="text-muted-foreground/40">—</span>
                          )}
                        </button>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
          {/* Totals row */}
          <tfoot>
            <tr className="border-t bg-muted/20 font-semibold">
              <td className="sticky left-0 z-10 bg-muted/20 px-3 py-2.5 text-right" colSpan={2}>
                Total
              </td>
              {proponents.map((p) => (
                <td key={p.id} className="px-3 py-2.5 text-center font-mono tabular-nums">
                  ${totals[p.id].toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </td>
              ))}
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
