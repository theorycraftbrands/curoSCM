"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { createBomItem, updateBomItem, deleteBomItem } from "@/actions/bom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, X, Pencil, Check } from "lucide-react";
import { CatalogPicker } from "./catalog-picker";
import type { Database } from "@/lib/types/database";

type BomItemType = Database["public"]["Enums"]["bom_item_type"];
type BomItem = Database["public"]["Tables"]["bom_items"]["Row"];

interface BomTableProps {
  projectId: string;
  bomType: BomItemType;
  items: BomItem[];
}

interface SelectedCatalogItem {
  id: string;
  name: string;
  sku: string | null;
  unit: string | null;
  default_price: number | null;
  currency: string | null;
  category: string | null;
}

export function BomTable({ projectId, bomType, items }: BomTableProps) {
  const pathname = usePathname();
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [catalogItem, setCatalogItem] = useState<SelectedCatalogItem | null>(null);

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
      catalog_item_id: catalogItem?.id,
    });
    setCatalogItem(null);
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
          {/* Catalog search */}
          <div>
            <p className="mb-1.5 text-xs font-medium text-muted-foreground">From Catalog (optional)</p>
            <CatalogPicker
              selected={catalogItem}
              onSelect={(item) => {
                setCatalogItem(item);
              }}
              onClear={() => setCatalogItem(null)}
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-6">
            <div className="sm:col-span-2">
              <Input
                name="description"
                placeholder="Description *"
                required
                className="text-sm"
                defaultValue={catalogItem?.name ?? ""}
                key={catalogItem?.id ?? "manual"}
              />
            </div>
            <Input name="quantity" type="number" step="0.01" placeholder="Qty" className="text-sm font-mono" />
            <Input
              name="unit"
              placeholder="Unit"
              defaultValue={catalogItem?.unit ?? "each"}
              key={`unit-${catalogItem?.id ?? "manual"}`}
              className="text-sm"
            />
            <Input
              name="unitPrice"
              type="number"
              step="0.01"
              placeholder="Unit price"
              defaultValue={catalogItem?.default_price?.toString() ?? ""}
              key={`price-${catalogItem?.id ?? "manual"}`}
              className="text-sm font-mono"
            />
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
                <BomRow key={item.id} item={item} index={i} projectId={projectId} onDelete={handleDelete} />
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

// Inline-editable row component
function BomRow({
  item,
  index,
  projectId,
  onDelete,
}: {
  item: BomItem;
  index: number;
  projectId: string;
  onDelete: (id: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [desc, setDesc] = useState(item.description);
  const [qty, setQty] = useState(String(item.quantity));
  const [unit, setUnit] = useState(item.unit || "each");
  const [price, setPrice] = useState(item.unit_price != null ? String(item.unit_price) : "");
  const [costCode, setCostCode] = useState(item.cost_code || "");

  async function handleSave() {
    setSaving(true);
    await updateBomItem(item.id, projectId, {
      description: desc,
      quantity: parseFloat(qty) || 0,
      unit,
      unit_price: price ? parseFloat(price) : null,
      cost_code: costCode || null,
    });
    setEditing(false);
    setSaving(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") handleSave();
    if (e.key === "Escape") setEditing(false);
  }

  const subtotal = (parseFloat(qty) || 0) * (parseFloat(price) || 0);

  if (editing) {
    return (
      <tr className="bg-primary/5">
        <td className="px-3 py-1.5 text-muted-foreground font-mono text-xs tabular-nums">{index}</td>
        <td className="px-1 py-1.5">
          <Input value={desc} onChange={(e) => setDesc(e.target.value)} onKeyDown={handleKeyDown} className="h-7 text-sm" autoFocus />
        </td>
        <td className="px-1 py-1.5">
          <Input value={qty} onChange={(e) => setQty(e.target.value)} onKeyDown={handleKeyDown} type="number" step="0.01" className="h-7 text-sm font-mono text-right w-20" />
        </td>
        <td className="px-1 py-1.5">
          <Input value={unit} onChange={(e) => setUnit(e.target.value)} onKeyDown={handleKeyDown} className="h-7 text-sm w-16" />
        </td>
        <td className="px-1 py-1.5">
          <Input value={price} onChange={(e) => setPrice(e.target.value)} onKeyDown={handleKeyDown} type="number" step="0.01" className="h-7 text-sm font-mono text-right w-24" />
        </td>
        <td className="px-3 py-1.5 text-right font-mono tabular-nums text-xs text-muted-foreground">
          {subtotal > 0 ? `$${subtotal.toFixed(2)}` : "—"}
        </td>
        <td className="px-1 py-1.5">
          <Input value={costCode} onChange={(e) => setCostCode(e.target.value)} onKeyDown={handleKeyDown} className="h-7 text-sm font-mono w-24" />
        </td>
        <td className="px-2 py-1.5">
          <button onClick={handleSave} disabled={saving} className="rounded p-1 text-primary hover:bg-primary/10 transition-colors">
            <Check className="h-3.5 w-3.5" />
          </button>
        </td>
      </tr>
    );
  }

  return (
    <tr className="group hover:bg-muted/20 transition-colors">
      <td className="px-3 py-2 text-muted-foreground font-mono text-xs tabular-nums">{index}</td>
      <td className="px-3 py-2 font-medium cursor-pointer" onClick={() => setEditing(true)}>{item.description}</td>
      <td className="px-3 py-2 text-right font-mono tabular-nums cursor-pointer" onClick={() => setEditing(true)}>{item.quantity}</td>
      <td className="px-3 py-2 text-muted-foreground cursor-pointer" onClick={() => setEditing(true)}>{item.unit}</td>
      <td className="px-3 py-2 text-right font-mono tabular-nums cursor-pointer" onClick={() => setEditing(true)}>
        {item.unit_price != null ? `$${Number(item.unit_price).toFixed(2)}` : "—"}
      </td>
      <td className="px-3 py-2 text-right font-mono tabular-nums font-medium">
        {item.unit_price != null ? `$${((item.quantity ?? 0) * Number(item.unit_price)).toFixed(2)}` : "—"}
      </td>
      <td className="px-3 py-2 font-mono text-xs text-muted-foreground cursor-pointer" onClick={() => setEditing(true)}>{item.cost_code || "—"}</td>
      <td className="px-3 py-2">
        <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => setEditing(true)} className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground">
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button onClick={() => onDelete(item.id)} className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </td>
    </tr>
  );
}
