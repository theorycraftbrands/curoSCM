import { notFound } from "next/navigation";
import Link from "next/link";
import { requireOnboarded } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BarChart3 } from "lucide-react";
import { BidProponents } from "@/components/shared/bid-proponents";
import { BidItemsList } from "@/components/shared/bid-items-list";

const statusColors: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  issued: "bg-chart-4/10 text-chart-4",
  awaiting_review: "bg-chart-1/10 text-chart-1",
  awaiting_approval: "bg-chart-2/10 text-chart-2",
  ready_to_issue: "bg-chart-3/10 text-chart-3",
  awarded: "bg-primary/10 text-primary",
  cancelled: "bg-destructive/10 text-destructive",
};

export default async function BidDetailPage({
  params,
}: {
  params: Promise<{ projectId: string; id: string }>;
}) {
  const { projectId, id } = await params;
  await requireOnboarded();
  const supabase = await createClient();

  const [{ data: bid }, { data: proponents }, { data: items }, { data: businesses }] = await Promise.all([
    supabase.from("bids").select("*, requisition:requisitions(id, requisition_number, name)").eq("id", id).single(),
    supabase.from("bid_proponents").select("*, business:businesses(id, name, business_type)").eq("bid_id", id),
    supabase.from("bid_items").select("*").eq("bid_id", id).order("sort_order").order("created_at"),
    supabase.from("businesses").select("id, name").eq("business_type", "vendor").order("name"),
  ]);

  if (!bid) notFound();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-muted-foreground tabular-nums">{bid.bid_number}</span>
            <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium capitalize ${statusColors[bid.status]}`}>
              {bid.status.replace("_", " ")}
            </span>
            {bid.requisition && (
              <span className="text-xs text-muted-foreground">
                from {bid.requisition.requisition_number}
              </span>
            )}
          </div>
          <h2 className="mt-1 text-lg font-semibold">{bid.name}</h2>
          {bid.description && <p className="mt-1 text-sm text-muted-foreground">{bid.description}</p>}
          {bid.due_date && (
            <p className="mt-1 font-mono text-xs text-muted-foreground tabular-nums">
              Due: {bid.due_date}
            </p>
          )}
        </div>
        {(proponents?.length ?? 0) > 0 && (items?.length ?? 0) > 0 && (
          <Link href={`/projects/${projectId}/bids/${id}/comparison`}>
            <Button size="sm">
              <BarChart3 className="mr-1.5 h-3.5 w-3.5" />
              Comparison Grid
            </Button>
          </Link>
        )}
      </div>

      {/* Proponents */}
      <BidProponents
        bidId={id}
        projectId={projectId}
        proponents={proponents ?? []}
        availableBusinesses={businesses ?? []}
      />

      {/* Items */}
      <BidItemsList
        bidId={id}
        projectId={projectId}
        items={items ?? []}
      />
    </div>
  );
}
