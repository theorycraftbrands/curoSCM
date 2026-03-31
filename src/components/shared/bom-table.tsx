"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { createBomItem, deleteBomItem } from "@/actions/bom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, X } from "lucide-react";
import type { Database } from "@/lib/types/database";

type BomItemType = Database["public"]["Enums"]["bom_item_type"];
type BomItem = Database["public"]["Tables"]["bom_items"]["Row"];

interface BomTableProps {
  projectId: string;
  bomType: BomItemType;
  items: BomItem[];
}

export function BomTable({ projectId, bomType, items }: BomTableProps) {
  const pathname = usePathname();
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleAdd(formData: FormData) {
    setLoading(true);
    const qty = parseFloat(formData.get("quantity") as string) || 0;
    const price = formData.get("unitPrice") as string;

    await createBomItem(projectId, {
      bom_type: bomType,
      description: formData.get("description") as string,
      quantity: qty,
      unit: (formData.get("unit") as string) || "each",
      unit_price: price ? parseFloat(price) : undefined,
      cost_code: (formData.get("costCode") as string) || undefined,
      group_name: (formData.get("groupName") as string) || undefined,
    });
    setShowForm(false);
    setLoading(false);
  }

  async function handleDelete(itemId: string) {
    await deleteBomItem(itemId, projectId);
  }

  const totalValue = items.reduce(
    (sum, item) =>
      sum + (item.quantity ?? 0) * (item.unit_price ?? 0),
    0
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {items.length} items
          {totalValue > 0 && (
            <span className="ml-2 font-mono tabular-nums">
              &middot; ${totalValue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </span>
          )}
        </div>
        <Button size="sm" variant="outline" onClick={() => setShowForm(!showForm)}>
          {showForm ? <X className="mr-1.5 h-3.5 w-3.5" /> : <Plus className="mr-1.5 h-3.5 w-3.5" />}
          {showForm ? "Cancel" : "Add Item"}
        </Button>
      </div>

      {/* Add form */}
      {showForm && (
        <form action={handleAdd} className="rounded-lg border bg-muted/30 p-4 space-y-3">
          <div className="grid gap-3 sm:grid-cols-6">
            <div className="sm:col-span-2">
              <Input name="description" placeholder="Description *" required className="text-sm" />
            </div>
            <Input name="quantity" type="number" step="0.01" placeholder="Qty" className="text-sm font-mono" />
            <Input name="unit" placeholder="Unit" defaultValue="each" className="text-sm" />
            <Input name="unitPrice" type="number" step="0.01" placeholder="Unit price" className="text-sm font-mono" />
            <Input name="costCode" placeholder="Cost code" className="text-sm font-mono" />
          </div>
          <div className="flex justify-end">
            <Button size="sm" type="submit" disabled={loading}>
              {loading ? "Adding..." : "Add"}
            </Button>
          </div>
        </form>
      )}

      {/* Table */}
      {items.length === 0 && !showForm ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-sm text-muted-foreground">
            No {bomType.replace("_", " ")} items yet
          </p>
        </div>
      ) : items.length > 0 ? (
        <div className="rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="px-3 py-2 text-left font-medium text-muted-foreground w-8">#</th>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">Description</th>
                <th className="px-3 py-2 text-right font-medium text-muted-foreground">Qty</th>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">Unit</th>
                <th className="px-3 py-2 text-right font-medium text-muted-foreground">Unit Price</th>
                <th className="px-3 py-2 text-right font-medium text-muted-foreground">Subtotal</th>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">Cost Code</th>
                <th className="px-3 py-2 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {items.map((item, i) => (
                <tr key={item.id} className="group hover:bg-muted/20 transition-colors">
                  <td className="px-3 py-2 text-muted-foreground font-mono text-xs tabular-nums">{i}</td>
                  <td className="px-3 py-2 font-medium">{item.description}</td>
                  <td className="px-3 py-2 text-right font-mono tabular-nums">{item.quantity}</td>
                  <td className="px-3 py-2 text-muted-foreground">{item.unit}</td>
                  <td className="px-3 py-2 text-right font-mono tabular-nums">
                    {item.unit_price != null ? `$${Number(item.unit_price).toFixed(2)}` : "—"}
                  </td>
                  <td className="px-3 py-2 text-right font-mono tabular-nums font-medium">
                    {item.unit_price != null
                      ? `$${((item.quantity ?? 0) * Number(item.unit_price)).toFixed(2)}`
                      : "—"}
                  </td>
                  <td className="px-3 py-2 font-mono text-xs text-muted-foreground">{item.cost_code || "—"}</td>
                  <td className="px-3 py-2">
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="rounded p-1 text-muted-foreground opacity-0 transition-opacity hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            {totalValue > 0 && (
              <tfoot>
                <tr className="border-t bg-muted/20">
                  <td colSpan={5} className="px-3 py-2 text-right text-sm font-medium">Total</td>
                  <td className="px-3 py-2 text-right font-mono tabular-nums font-bold">
                    ${totalValue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </td>
                  <td colSpan={2}></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      ) : null}
    </div>
  );
}
