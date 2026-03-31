import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { requireOnboarded } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { EntityTabs } from "@/components/shared/entity-tabs";
import { EditSheet } from "@/components/shared/edit-sheet";
import { CatalogEditForm } from "@/components/shared/catalog-edit-form";

export default async function CatalogItemDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireOnboarded();
  const supabase = await createClient();

  const { data: item } = await supabase.from("catalog_items").select("*").eq("id", id).single();
  if (!item) notFound();

  const [{ data: notes }, { data: tasks }] = await Promise.all([
    supabase.from("notes").select("*, profile:profiles(full_name)").eq("entity_type", "catalog_item").eq("entity_id", id).order("created_at", { ascending: false }),
    supabase.from("tasks").select("*, profile:profiles(full_name)").eq("entity_type", "catalog_item").eq("entity_id", id).order("created_at", { ascending: false }),
  ]);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link href="/catalog" className="mb-2 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Catalog
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{item.name}</h1>
            {item.sku && <p className="mt-0.5 font-mono text-sm text-muted-foreground">{item.sku}</p>}
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={item.is_purchasable ? "secondary" : "outline"}>
              {item.is_purchasable ? "Purchasable" : "Not Purchasable"}
            </Badge>
            {!item.is_active && <Badge variant="outline">Inactive</Badge>}
            <EditSheet title="Edit Catalog Item">
              <CatalogEditForm item={item} />
            </EditSheet>
          </div>
        </div>
      </div>

      <EntityTabs entityType="catalog_item" entityId={id} currentUserId={user.id} notes={notes ?? []} tasks={tasks ?? []}>
        <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <tbody className="divide-y">
              <tr><td className="px-4 py-2.5 w-40 text-muted-foreground bg-muted/30 font-medium">Item Name</td><td className="px-4 py-2.5">{item.name}</td></tr>
              <tr><td className="px-4 py-2.5 text-muted-foreground bg-muted/30 font-medium">SKU</td><td className="px-4 py-2.5 font-mono text-xs">{item.sku || <span className="text-muted-foreground/40">—</span>}</td></tr>
              <tr><td className="px-4 py-2.5 text-muted-foreground bg-muted/30 font-medium">Description</td><td className="px-4 py-2.5">{item.description || <span className="text-muted-foreground/40">—</span>}</td></tr>
              <tr><td className="px-4 py-2.5 text-muted-foreground bg-muted/30 font-medium">Category</td><td className="px-4 py-2.5">{item.category || <span className="text-muted-foreground/40">—</span>}</td></tr>
              <tr><td className="px-4 py-2.5 text-muted-foreground bg-muted/30 font-medium">Unit of Measure</td><td className="px-4 py-2.5">{item.unit}</td></tr>
              <tr><td className="px-4 py-2.5 text-muted-foreground bg-muted/30 font-medium">Default Price</td><td className="px-4 py-2.5 font-mono text-xs tabular-nums">{item.default_price != null ? `$${Number(item.default_price).toFixed(2)} ${item.currency}` : <span className="text-muted-foreground/40">—</span>}</td></tr>
              <tr><td className="px-4 py-2.5 text-muted-foreground bg-muted/30 font-medium">Currency</td><td className="px-4 py-2.5 font-mono">{item.currency}</td></tr>
              <tr><td className="px-4 py-2.5 text-muted-foreground bg-muted/30 font-medium">Purchasable</td><td className="px-4 py-2.5"><Badge variant={item.is_purchasable ? "secondary" : "outline"}>{item.is_purchasable ? "Yes" : "No"}</Badge></td></tr>
              <tr><td className="px-4 py-2.5 text-muted-foreground bg-muted/30 font-medium">Status</td><td className="px-4 py-2.5"><Badge variant={item.is_active ? "secondary" : "outline"}>{item.is_active ? "Active" : "Inactive"}</Badge></td></tr>
              <tr><td className="px-4 py-2.5 text-muted-foreground bg-muted/30 font-medium">Created</td><td className="px-4 py-2.5 font-mono text-xs tabular-nums text-muted-foreground">{new Date(item.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</td></tr>
              <tr><td className="px-4 py-2.5 text-muted-foreground bg-muted/30 font-medium">Last Updated</td><td className="px-4 py-2.5 font-mono text-xs tabular-nums text-muted-foreground">{new Date(item.updated_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</td></tr>
            </tbody>
          </table>
        </div>
      </EntityTabs>
    </div>
  );
}
