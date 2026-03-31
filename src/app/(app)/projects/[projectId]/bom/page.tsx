import { requireOnboarded } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { BomTabs } from "@/components/shared/bom-tabs";

export default async function ProjectBomPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  await requireOnboarded();
  const supabase = await createClient();

  const { data: items } = await supabase
    .from("bom_items")
    .select("*")
    .eq("project_id", projectId)
    .order("sort_order")
    .order("created_at");

  const bomItems = items ?? [];

  const counts = {
    purchase: bomItems.filter((i) => i.bom_type === "purchase").length,
    client_supplied: bomItems.filter((i) => i.bom_type === "client_supplied").length,
    vendor_supplied: bomItems.filter((i) => i.bom_type === "vendor_supplied").length,
    feed_through: bomItems.filter((i) => i.bom_type === "feed_through").length,
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Bill of Materials</h2>
        <p className="text-sm text-muted-foreground">
          Manage items across all four BOM categories
        </p>
      </div>

      <BomTabs projectId={projectId} items={bomItems} counts={counts} />
    </div>
  );
}
