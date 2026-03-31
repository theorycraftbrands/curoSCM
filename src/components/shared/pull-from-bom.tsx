"use client";

import { useState, useEffect } from "react";
import { pullFromBom } from "@/actions/requisitions";
import { fetchBomItems } from "@/actions/bom";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ClipboardList, Package } from "lucide-react";

interface BomItem {
  id: string;
  description: string;
  quantity: number;
  unit: string | null;
  bom_type: string;
  cost_code: string | null;
  group_name: string | null;
}

interface PullFromBomProps {
  requisitionId: string;
  projectId: string;
}

const typeLabels: Record<string, string> = {
  purchase: "Purchase",
  client_supplied: "Client Supplied",
  vendor_supplied: "Vendor Supplied",
  feed_through: "Feed Through",
};

export function PullFromBom({ requisitionId, projectId }: PullFromBomProps) {
  const [open, setOpen] = useState(false);
  const [bomItems, setBomItems] = useState<BomItem[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    if (!open) return;
    setFetching(true);
    fetchBomItems(projectId).then((data) => {
      setBomItems(data as BomItem[]);
      setFetching(false);
    });
  }, [open, projectId]);

  function toggleItem(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (selected.size === bomItems.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(bomItems.map((b) => b.id)));
    }
  }

  async function handlePull() {
    setLoading(true);
    await pullFromBom(requisitionId, projectId, Array.from(selected));
    setSelected(new Set());
    setOpen(false);
    setLoading(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="inline-flex items-center justify-center gap-1.5 rounded-md border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground">
        <ClipboardList className="h-3.5 w-3.5" />
        Pull from BOM
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Pull Items from Bill of Materials</DialogTitle>
        </DialogHeader>

        {fetching ? (
          <div className="py-12 text-center text-sm text-muted-foreground">Loading BOM items...</div>
        ) : bomItems.length === 0 ? (
          <div className="py-12 text-center">
            <Package className="mx-auto h-8 w-8 text-muted-foreground/20" />
            <p className="mt-2 text-sm text-muted-foreground">No items in the project BOM yet</p>
          </div>
        ) : (
          <>
            {/* Select all + count */}
            <div className="flex items-center justify-between border-b pb-3">
              <label className="flex items-center gap-2 cursor-pointer text-sm">
                <Checkbox
                  checked={selected.size === bomItems.length}
                  onCheckedChange={toggleAll}
                />
                <span className="font-medium">Select All</span>
                <span className="text-muted-foreground">({bomItems.length} items)</span>
              </label>
              {selected.size > 0 && (
                <span className="text-sm text-primary font-medium">
                  {selected.size} selected
                </span>
              )}
            </div>

            {/* Item list */}
            <div className="flex-1 overflow-y-auto -mx-1 px-1">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-popover">
                  <tr className="border-b">
                    <th className="w-8 py-2"></th>
                    <th className="py-2 text-left font-medium text-muted-foreground">Description</th>
                    <th className="py-2 text-right font-medium text-muted-foreground">Qty</th>
                    <th className="py-2 text-left font-medium text-muted-foreground pl-3">Unit</th>
                    <th className="py-2 text-left font-medium text-muted-foreground">Type</th>
                    <th className="py-2 text-left font-medium text-muted-foreground">Cost Code</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {bomItems.map((item) => (
                    <tr
                      key={item.id}
                      className={`cursor-pointer transition-colors ${selected.has(item.id) ? "bg-primary/5" : "hover:bg-muted/30"}`}
                      onClick={() => toggleItem(item.id)}
                    >
                      <td className="py-2 pl-1">
                        <Checkbox checked={selected.has(item.id)} onCheckedChange={() => toggleItem(item.id)} />
                      </td>
                      <td className="py-2 font-medium">{item.description}</td>
                      <td className="py-2 text-right font-mono tabular-nums">{item.quantity}</td>
                      <td className="py-2 text-muted-foreground pl-3">{item.unit}</td>
                      <td className="py-2">
                        <Badge variant="outline" className="text-[10px] capitalize">
                          {typeLabels[item.bom_type] || item.bom_type}
                        </Badge>
                      </td>
                      <td className="py-2 font-mono text-xs text-muted-foreground">{item.cost_code || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between border-t pt-3">
              <p className="text-xs text-muted-foreground">
                Items will be copied into this requisition with their quantities, units, and cost codes.
              </p>
              <Button onClick={handlePull} disabled={loading || selected.size === 0}>
                {loading ? "Pulling..." : `Pull ${selected.size} Item${selected.size !== 1 ? "s" : ""}`}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
