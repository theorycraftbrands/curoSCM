import Link from "next/link";
import { Plus, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { requireOnboarded } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export default async function CatalogPage() {
  const user = await requireOnboarded();
  const supabase = await createClient();

  const { data: items } = await supabase
    .from("catalog_items")
    .select("*")
    .order("name");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Catalog</h1>
          <p className="text-sm text-muted-foreground">
            Items available for procurement
          </p>
        </div>
        <Link href="/catalog/new">
          <Button>
            <Plus className="mr-1.5 h-4 w-4" />
            Add Item
          </Button>
        </Link>
      </div>

      {!items || items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border bg-card py-16">
          <Package className="h-12 w-12 text-muted-foreground/20" />
          <h3 className="mt-4 font-semibold">Catalog is empty</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Add items your teams can procure
          </p>
          <Link href="/catalog/new" className="mt-4">
            <Button size="sm">
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Add Item
            </Button>
          </Link>
        </div>
      ) : (
        <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Item</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">SKU</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Category</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Unit</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Price</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {items.map((item) => (
                <tr key={item.id} className="group transition-colors hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <Link href={`/catalog/${item.id}`} className="font-medium hover:text-primary transition-colors">
                      {item.name}
                    </Link>
                    {item.description && (
                      <p className="text-xs text-muted-foreground truncate max-w-xs">{item.description}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{item.sku || "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{item.category || "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{item.unit}</td>
                  <td className="px-4 py-3 text-right font-mono text-xs tabular-nums">
                    {item.default_price != null
                      ? `$${Number(item.default_price).toFixed(2)} ${item.currency}`
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Badge variant={item.is_purchasable ? "secondary" : "outline"}>
                      {item.is_purchasable ? "Purchasable" : "Inactive"}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
