import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Package, DollarSign, Tag, Clock, Hash } from "lucide-react";
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
              {({ close }) => <CatalogEditForm item={item} close={close} />}
            </EditSheet>
          </div>
        </div>
      </div>

      <EntityTabs entityType="catalog_item" entityId={id} currentUserId={user.id} notes={notes ?? []} tasks={tasks ?? []}>
        <div className="space-y-6">
          {item.description && (
            <div className="rounded-xl border bg-card p-6 shadow-sm">
              <h2 className="mb-2 text-sm font-semibold">Description</h2>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{item.description}</p>
            </div>
          )}
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold">Item Specifications</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-start gap-3 rounded-lg bg-muted/30 p-3">
                <Tag className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Category</p>
                  <p className="text-sm">{item.category || <span className="text-muted-foreground/50">Uncategorized</span>}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-lg bg-muted/30 p-3">
                <Package className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Unit of Measure</p>
                  <p className="text-sm">{item.unit}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-lg bg-muted/30 p-3">
                <DollarSign className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Default Price</p>
                  {item.default_price != null ? (
                    <p className="text-sm font-mono tabular-nums">${Number(item.default_price).toFixed(2)} {item.currency}</p>
                  ) : (
                    <p className="text-sm text-muted-foreground/50">No price set</p>
                  )}
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-lg bg-muted/30 p-3">
                <Hash className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">SKU</p>
                  {item.sku ? (
                    <p className="text-sm font-mono">{item.sku}</p>
                  ) : (
                    <p className="text-sm text-muted-foreground/50">No SKU</p>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold">Record Details</h2>
            <div className="grid gap-3 sm:grid-cols-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2"><Clock className="h-3.5 w-3.5" /> Created {new Date(item.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</div>
              <div className="flex items-center gap-2"><Clock className="h-3.5 w-3.5" /> Updated {new Date(item.updated_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</div>
            </div>
          </div>
        </div>
      </EntityTabs>
    </div>
  );
}
