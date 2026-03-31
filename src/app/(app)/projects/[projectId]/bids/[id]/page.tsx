import { notFound } from "next/navigation";
import { requireOnboarded } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { BidDetail } from "@/components/shared/bid-detail";

export default async function BidDetailPage({
  params,
}: {
  params: Promise<{ projectId: string; id: string }>;
}) {
  const { projectId, id } = await params;
  const user = await requireOnboarded();
  const supabase = await createClient();

  const [{ data: bid }, { data: proponents }, { data: items }, { data: businesses }, { data: notes }, { data: tasks }] = await Promise.all([
    supabase.from("bids").select("*, requisition:requisitions(id, requisition_number, name)").eq("id", id).single(),
    supabase.from("bid_proponents").select("*, business:businesses(id, name, business_type)").eq("bid_id", id),
    supabase.from("bid_items").select("*").eq("bid_id", id).order("sort_order").order("created_at"),
    supabase.from("businesses").select("id, name").eq("business_type", "vendor").order("name"),
    supabase.from("notes").select("*, profile:profiles(full_name)").eq("entity_type", "bid").eq("entity_id", id).order("created_at", { ascending: false }),
    supabase.from("tasks").select("*, profile:profiles(full_name)").eq("entity_type", "bid").eq("entity_id", id).order("created_at", { ascending: false }),
  ]);

  if (!bid) notFound();

  // Fetch responses for all bid items
  const itemIds = (items ?? []).map((i) => i.id);
  const { data: responses } = itemIds.length > 0
    ? await supabase.from("bid_responses").select("*").in("bid_item_id", itemIds)
    : { data: [] };

  return (
    <BidDetail
      bid={bid}
      proponents={proponents ?? []}
      items={items ?? []}
      responses={responses ?? []}
      availableBusinesses={businesses ?? []}
      notes={notes ?? []}
      tasks={tasks ?? []}
      projectId={projectId}
      currentUserId={user.id}
    />
  );
}
