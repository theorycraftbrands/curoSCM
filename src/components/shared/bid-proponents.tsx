"use client";

import { useState } from "react";
import { addProponent, toggleRecommended } from "@/actions/bids";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Star, StarOff, Building2 } from "lucide-react";

interface Proponent {
  id: string;
  status: string;
  is_recommended: boolean;
  business: { id: string; name: string; business_type: string } | null;
}

interface BidProponentsProps {
  bidId: string;
  projectId: string;
  proponents: Proponent[];
  availableBusinesses: Array<{ id: string; name: string }>;
}

export function BidProponents({ bidId, projectId, proponents, availableBusinesses }: BidProponentsProps) {
  const [showAdd, setShowAdd] = useState(false);
  const [selectedBiz, setSelectedBiz] = useState("");

  const existingIds = new Set(proponents.map((p) => p.business?.id));
  const available = availableBusinesses.filter((b) => !existingIds.has(b.id));

  async function handleAdd() {
    if (!selectedBiz) return;
    await addProponent(bidId, selectedBiz, projectId);
    setSelectedBiz("");
    setShowAdd(false);
  }

  async function handleToggleRecommend(proponentId: string, current: boolean) {
    await toggleRecommended(proponentId, !current, projectId, bidId);
  }

  const proponentColors = ["bg-chart-1", "bg-chart-2", "bg-chart-3", "bg-chart-4", "bg-chart-5"];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">
          Proponents <span className="font-mono text-muted-foreground">({proponents.length})</span>
        </h3>
        <Button size="sm" variant="outline" onClick={() => setShowAdd(!showAdd)}>
          <Plus className="mr-1.5 h-3.5 w-3.5" /> Add Vendor
        </Button>
      </div>

      {showAdd && (
        <div className="flex gap-2 rounded-lg border bg-muted/30 p-3">
          <select
            value={selectedBiz}
            onChange={(e) => setSelectedBiz(e.target.value)}
            className="flex-1 rounded-md border bg-background px-3 py-1.5 text-sm"
          >
            <option value="">Select a vendor...</option>
            {available.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
          <Button size="sm" onClick={handleAdd} disabled={!selectedBiz}>Add</Button>
          <Button size="sm" variant="ghost" onClick={() => setShowAdd(false)}>Cancel</Button>
        </div>
      )}

      {proponents.length === 0 ? (
        <div className="rounded-xl border bg-card py-8 text-center">
          <Building2 className="mx-auto h-8 w-8 text-muted-foreground/20" />
          <p className="mt-2 text-sm text-muted-foreground">No vendors added yet</p>
        </div>
      ) : (
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {proponents.map((p, i) => (
            <div
              key={p.id}
              className="flex items-center gap-3 rounded-lg border bg-card p-3 shadow-sm"
            >
              <div className={`h-3 w-3 rounded-full ${proponentColors[i % proponentColors.length]}`} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{p.business?.name}</p>
                <p className="text-xs text-muted-foreground capitalize">{p.status.replace("_", " ")}</p>
              </div>
              <button
                onClick={() => handleToggleRecommend(p.id, p.is_recommended)}
                className="shrink-0"
                title={p.is_recommended ? "Remove recommendation" : "Recommend"}
              >
                {p.is_recommended ? (
                  <Star className="h-4 w-4 text-chart-2 fill-chart-2" />
                ) : (
                  <StarOff className="h-4 w-4 text-muted-foreground/40 hover:text-chart-2 transition-colors" />
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
