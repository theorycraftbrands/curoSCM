import { notFound } from "next/navigation";
import { requireOnboarded } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { RequisitionItems } from "@/components/shared/requisition-items";
import { RequisitionActions } from "@/components/shared/requisition-actions";

const statusColors: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  under_review: "bg-chart-2/10 text-chart-2",
  ready_to_bid: "bg-chart-3/10 text-chart-3",
  transferred: "bg-primary/10 text-primary",
  cancelled: "bg-destructive/10 text-destructive",
};

export default async function RequisitionDetailPage({
  params,
}: {
  params: Promise<{ projectId: string; id: string }>;
}) {
  const { projectId, id } = await params;
  await requireOnboarded();
  const supabase = await createClient();

  const [{ data: req }, { data: items }] = await Promise.all([
    supabase.from("requisitions").select("*").eq("id", id).single(),
    supabase.from("requisition_items").select("*").eq("requisition_id", id).order("sort_order").order("created_at"),
  ]);

  if (!req) notFound();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-muted-foreground tabular-nums">
              {req.requisition_number}
            </span>
            <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium capitalize ${statusColors[req.status]}`}>
              {req.status.replace("_", " ")}
            </span>
          </div>
          <h2 className="mt-1 text-lg font-semibold">{req.name}</h2>
          {req.description && (
            <p className="mt-1 text-sm text-muted-foreground">{req.description}</p>
          )}
        </div>
        <RequisitionActions
          requisitionId={id}
          projectId={projectId}
          status={req.status}
          hasItems={(items?.length ?? 0) > 0}
        />
      </div>

      {/* Items */}
      <RequisitionItems
        requisitionId={id}
        projectId={projectId}
        items={items ?? []}
        isEditable={req.status === "draft" || req.status === "under_review"}
      />
    </div>
  );
}
