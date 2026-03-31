import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Package, DollarSign, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { requireOnboarded } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { EntityTabs } from "@/components/shared/entity-tabs";

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
          <Badge variant={item.is_purchasable ? "secondary" : "outline"}>
            {item.is_purchasable ? "Purchasable" : "Inactive"}
          </Badge>
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
            <h2 className="mb-4 text-sm font-semibold">Item Details</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {item.category && (
                <div className="flex items-center gap-2 text-sm">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Category:</span>
                  <span>{item.category}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm">
                <Package className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Unit:</span>
                <span>{item.unit}</span>
              </div>
              {item.default_price != null && (
                <div className="flex items-center gap-2 text-sm">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Price:</span>
                  <span className="font-mono tabular-nums">${Number(item.default_price).toFixed(2)} {item.currency}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </EntityTabs>
    </div>
  );
}
