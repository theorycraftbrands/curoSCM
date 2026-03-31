import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireOnboarded } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { ComparisonGrid } from "@/components/shared/comparison-grid";

export default async function BidComparisonPage({
  params,
}: {
  params: Promise<{ projectId: string; id: string }>;
}) {
  const { projectId, id } = await params;
  await requireOnboarded();
  const supabase = await createClient();

  const [{ data: bid }, { data: proponents }, { data: items }, { data: responses }] = await Promise.all([
    supabase.from("bids").select("*").eq("id", id).single(),
    supabase.from("bid_proponents").select("*, business:businesses(id, name)").eq("bid_id", id),
    supabase.from("bid_items").select("*").eq("bid_id", id).order("sort_order").order("created_at"),
    supabase.from("bid_responses").select("*, proponent:bid_proponents(id, business:businesses(name))").in(
      "bid_item_id",
      (await supabase.from("bid_items").select("id").eq("bid_id", id)).data?.map((i) => i.id) ?? []
    ),
  ]);

  if (!bid) notFound();

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/projects/${projectId}/bids/${id}`}
          className="mb-2 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Bid
        </Link>
        <h2 className="text-lg font-semibold">Comparison Grid</h2>
        <p className="text-sm text-muted-foreground">
          {bid.bid_number} &mdash; {bid.name}
        </p>
      </div>

      <ComparisonGrid
        bidId={id}
        projectId={projectId}
        proponents={proponents ?? []}
        items={items ?? []}
        responses={responses ?? []}
      />
    </div>
  );
}
