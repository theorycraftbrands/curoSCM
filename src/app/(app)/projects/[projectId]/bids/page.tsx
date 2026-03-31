"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Plus, Gavel } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createBid } from "@/actions/bids";
import { createClient } from "@/lib/supabase/client";

const statusColors: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  issued: "bg-chart-4/10 text-chart-4",
  awaiting_review: "bg-chart-1/10 text-chart-1",
  awaiting_approval: "bg-chart-2/10 text-chart-2",
  ready_to_issue: "bg-chart-3/10 text-chart-3",
  awarded: "bg-primary/10 text-primary",
  cancelled: "bg-destructive/10 text-destructive",
};

export default function BidsPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const [bids, setBids] = useState<Array<{
    id: string; bid_number: string; name: string; status: string; due_date: string | null; created_at: string;
  }>>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.from("bids").select("*").eq("project_id", projectId)
      .order("created_at", { ascending: false })
      .then(({ data }) => setBids(data ?? []));
  }, [projectId]);

  async function handleCreate(formData: FormData) {
    setLoading(true);
    await createBid(projectId, formData);
    setLoading(false);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Bids</h2>
          <p className="text-sm text-muted-foreground">Competitive bidding and vendor comparison</p>
        </div>
        <Button size="sm" onClick={() => setShowForm(!showForm)}>
          <Plus className="mr-1.5 h-3.5 w-3.5" /> New Bid
        </Button>
      </div>

      {showForm && (
        <form action={handleCreate} className="rounded-xl border bg-card p-4 shadow-sm space-y-3">
          <Input name="name" placeholder="Bid name *" required />
          <div className="grid gap-3 sm:grid-cols-2">
            <Input name="description" placeholder="Description (optional)" />
            <Input name="dueDate" type="date" />
          </div>
          <div className="flex justify-end gap-2">
            <Button size="sm" variant="ghost" onClick={() => setShowForm(false)} type="button">Cancel</Button>
            <Button size="sm" type="submit" disabled={loading}>{loading ? "Creating..." : "Create"}</Button>
          </div>
        </form>
      )}

      {bids.length === 0 && !showForm ? (
        <div className="flex flex-col items-center justify-center rounded-xl border bg-card py-16">
          <Gavel className="h-12 w-12 text-muted-foreground/20" />
          <h3 className="mt-4 font-semibold">No bids yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Create a bid or transfer from a requisition
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {bids.map((bid) => (
            <Link
              key={bid.id}
              href={`/projects/${projectId}/bids/${bid.id}`}
              className="flex items-center justify-between rounded-xl border bg-card p-4 shadow-sm transition-all hover:shadow-md hover:border-primary/20"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-muted-foreground tabular-nums">{bid.bid_number}</span>
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium capitalize ${statusColors[bid.status]}`}>
                    {bid.status.replace("_", " ")}
                  </span>
                </div>
                <h3 className="mt-1 font-medium">{bid.name}</h3>
              </div>
              <div className="text-right text-xs text-muted-foreground">
                {bid.due_date && <div className="font-mono tabular-nums">Due {bid.due_date}</div>}
                <div>{new Date(bid.created_at).toLocaleDateString()}</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
