"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createCatalogItem } from "@/actions/catalog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function NewCatalogItemPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    const result = await createCatalogItem(formData);
    if (result?.error) { setError(result.error); setLoading(false); }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link href="/catalog" className="mb-2 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Catalog
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight">Add Catalog Item</h1>
      </div>
      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <form action={handleSubmit} className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Item name *</Label>
              <Input id="name" name="name" required placeholder="29&quot; Mountain Bike Tire" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sku">SKU</Label>
              <Input id="sku" name="sku" placeholder="MBT-29-001" className="font-mono" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" placeholder="29 inch tubeless-ready mountain bike tire, 2.25&quot; width..." className="min-h-[80px]" />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input id="category" name="category" placeholder="Tires" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unit">Unit</Label>
              <Input id="unit" name="unit" defaultValue="each" placeholder="each, ft, kg..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Input id="currency" name="currency" defaultValue="CAD" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="defaultPrice">Default price</Label>
            <Input id="defaultPrice" name="defaultPrice" type="number" step="0.01" placeholder="0.00" className="font-mono" />
          </div>
          {error && <div className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div>}
          <div className="flex justify-end">
            <Button type="submit" disabled={loading}>{loading ? "Creating..." : "Create Item"}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
