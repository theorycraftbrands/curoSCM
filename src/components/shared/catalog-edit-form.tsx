"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { createClient } from "@/lib/supabase/client";

interface CatalogEditFormProps {
  item: {
    id: string;
    name: string;
    description: string | null;
    sku: string | null;
    unit: string | null;
    category: string | null;
    default_price: number | null;
    currency: string | null;
    is_purchasable: boolean;
    is_active: boolean;
  };
  close: () => void;
}

export function CatalogEditForm({ item, close }: CatalogEditFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isPurchasable, setIsPurchasable] = useState(item.is_purchasable);
  const [isActive, setIsActive] = useState(item.is_active);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const supabase = createClient();
    const price = form.get("defaultPrice") as string;

    const { error: err } = await supabase.from("catalog_items").update({
      name: form.get("name") as string,
      description: (form.get("description") as string) || null,
      sku: (form.get("sku") as string) || null,
      unit: (form.get("unit") as string) || "each",
      category: (form.get("category") as string) || null,
      default_price: price ? parseFloat(price) : null,
      currency: (form.get("currency") as string) || "USD",
      is_purchasable: isPurchasable,
      is_active: isActive,
    }).eq("id", item.id);

    if (err) { setError(err.message); setLoading(false); }
    else { router.refresh(); close(); }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-3">
        <div className="flex items-center justify-between rounded-lg border p-3">
          <div><Label className="text-sm font-medium">Purchasable</Label><p className="text-xs text-muted-foreground">Available for procurement</p></div>
          <Switch checked={isPurchasable} onCheckedChange={setIsPurchasable} />
        </div>
        <div className="flex items-center justify-between rounded-lg border p-3">
          <div><Label className="text-sm font-medium">Active</Label><p className="text-xs text-muted-foreground">Visible in catalog</p></div>
          <Switch checked={isActive} onCheckedChange={setIsActive} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2"><Label>Item name *</Label><Input name="name" required defaultValue={item.name} /></div>
        <div className="space-y-2"><Label>SKU</Label><Input name="sku" defaultValue={item.sku ?? ""} className="font-mono" /></div>
      </div>
      <div className="space-y-2"><Label>Description</Label><Textarea name="description" defaultValue={item.description ?? ""} className="min-h-[80px]" /></div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2"><Label>Category</Label><Input name="category" defaultValue={item.category ?? ""} /></div>
        <div className="space-y-2"><Label>Unit</Label><Input name="unit" defaultValue={item.unit ?? "each"} /></div>
        <div className="space-y-2"><Label>Currency</Label><Input name="currency" defaultValue={item.currency ?? "USD"} /></div>
      </div>
      <div className="space-y-2"><Label>Default price</Label><Input name="defaultPrice" type="number" step="0.01" defaultValue={item.default_price?.toString() ?? ""} className="font-mono" /></div>

      {error && <div className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div>}
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={close}>Cancel</Button>
        <Button type="submit" disabled={loading}>{loading ? "Saving..." : "Save Changes"}</Button>
      </div>
    </form>
  );
}
