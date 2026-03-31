"use client";

import { useState } from "react";
import { addRequisitionItem, deleteRequisitionItem } from "@/actions/requisitions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, X } from "lucide-react";
import { CatalogPicker } from "./catalog-picker";
import type { Database } from "@/lib/types/database";

type RequisitionItem = Database["public"]["Tables"]["requisition_items"]["Row"];

interface RequisitionItemsProps {
  requisitionId: string;
  projectId: string;
  items: RequisitionItem[];
  isEditable: boolean;
}

export function RequisitionItems({ requisitionId, projectId, items, isEditable }: RequisitionItemsProps) {
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [catalogItem, setCatalogItem] = useState<{ id: string; name: string; sku: string | null; unit: string | null; default_price: number | null; currency: string | null; category: string | null } | null>(null);

  async function handleAdd(formData: FormData) {
    setLoading(true);
    await addRequisitionItem(requisitionId, {
      description: formData.get("description") as string,
      quantity: parseFloat(formData.get("quantity") as string) || 0,
      unit: (formData.get("unit") as string) || "each",
      cost_code: (formData.get("costCode") as string) || undefined,
      group_name: (formData.get("groupName") as string) || undefined,
    }, projectId);
    setShowForm(false);
    setLoading(false);
  }

  async function handleDelete(itemId: string) {
    await deleteRequisitionItem(itemId, projectId, requisitionId);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">
          Items <span className="font-mono text-muted-foreground">({items.length})</span>
        </h3>
        {isEditable && (
          <Button size="sm" variant="outline" onClick={() => setShowForm(!showForm)}>
            {showForm ? <X className="mr-1.5 h-3.5 w-3.5" /> : <Plus className="mr-1.5 h-3.5 w-3.5" />}
            {showForm ? "Cancel" : "Add Item"}
          </Button>
        )}
      </div>

      {showForm && (
        <form action={handleAdd} className="rounded-lg border bg-muted/30 p-4 space-y-3">
          <div>
            <p className="mb-1.5 text-xs font-medium text-muted-foreground">From Catalog (optional)</p>
            <CatalogPicker selected={catalogItem} onSelect={setCatalogItem} onClear={() => setCatalogItem(null)} />
          </div>
          <div className="grid gap-3 sm:grid-cols-5">
            <div className="sm:col-span-2">
              <Input name="description" placeholder="Description *" required className="text-sm" defaultValue={catalogItem?.name ?? ""} key={catalogItem?.id ?? "manual"} />
            </div>
            <Input name="quantity" type="number" step="0.01" placeholder="Qty" className="text-sm font-mono" />
            <Input name="unit" placeholder="Unit" defaultValue={catalogItem?.unit ?? "each"} key={`u-${catalogItem?.id ?? "m"}`} className="text-sm" />
            <Input name="costCode" placeholder="Cost code" className="text-sm font-mono" />
          </div>
          <div className="flex justify-end">
            <Button size="sm" type="submit" disabled={loading}>
              {loading ? "Adding..." : "Add"}
            </Button>
          </div>
        </form>
      )}

      {items.length === 0 ? (
        <div className="rounded-xl border bg-card py-12 text-center">
          <p className="text-sm text-muted-foreground">No items yet. Add items to this requisition.</p>
        </div>
      ) : (
        <div className="rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="px-3 py-2 text-left font-medium text-muted-foreground w-8">#</th>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">Description</th>
                <th className="px-3 py-2 text-right font-medium text-muted-foreground">Qty</th>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">Unit</th>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">Cost Code</th>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">Group</th>
                {isEditable && <th className="px-3 py-2 w-10"></th>}
              </tr>
            </thead>
            <tbody className="divide-y">
              {items.map((item, i) => (
                <tr key={item.id} className="group hover:bg-muted/20 transition-colors">
                  <td className="px-3 py-2 font-mono text-xs text-muted-foreground tabular-nums">{i + 1}</td>
                  <td className="px-3 py-2 font-medium">{item.description}</td>
                  <td className="px-3 py-2 text-right font-mono tabular-nums">{item.quantity}</td>
                  <td className="px-3 py-2 text-muted-foreground">{item.unit}</td>
                  <td className="px-3 py-2 font-mono text-xs text-muted-foreground">{item.cost_code || "—"}</td>
                  <td className="px-3 py-2 text-muted-foreground">{item.group_name || "—"}</td>
                  {isEditable && (
                    <td className="px-3 py-2">
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="rounded p-1 text-muted-foreground opacity-0 transition-opacity hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
