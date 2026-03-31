import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CreateRequisitionForm } from "./create-form";

const statusColors: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  under_review: "bg-chart-2/10 text-chart-2",
  ready_to_bid: "bg-chart-3/10 text-chart-3",
  transferred: "bg-primary/10 text-primary",
  cancelled: "bg-destructive/10 text-destructive",
};

export default async function RequisitionsPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const supabase = await createClient();

  const { data: requisitions } = await supabase
    .from("requisitions")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Requisitions</h2>
          <p className="text-sm text-muted-foreground">
            Organize items for procurement and bidding
          </p>
        </div>
        <CreateRequisitionForm projectId={projectId} />
      </div>

      {!requisitions || requisitions.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border bg-card py-16">
          <FileText className="h-12 w-12 text-muted-foreground/20" />
          <h3 className="mt-4 font-semibold">No requisitions yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Create a requisition to start organizing procurement items
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {requisitions.map((req) => (
            <Link
              key={req.id}
              href={`/projects/${projectId}/requisitions/${req.id}`}
              className="flex items-center justify-between rounded-xl border bg-card p-4 shadow-sm transition-all hover:shadow-md hover:border-primary/20"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-muted-foreground tabular-nums">
                    {req.requisition_number}
                  </span>
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium capitalize ${statusColors[req.status]}`}>
                    {req.status.replace("_", " ")}
                  </span>
                </div>
                <h3 className="mt-1 font-medium">{req.name}</h3>
              </div>
              <span className="text-xs text-muted-foreground">
                {new Date(req.created_at).toLocaleDateString()}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
