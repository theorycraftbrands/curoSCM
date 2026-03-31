"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { updateRequisitionStatus, transferToBid } from "@/actions/requisitions";
import { ArrowRight, Send, X, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface RequisitionActionsProps {
  requisitionId: string;
  projectId: string;
  status: string;
  hasItems: boolean;
}

export function RequisitionActions({ requisitionId, projectId, status, hasItems }: RequisitionActionsProps) {
  const [loading, setLoading] = useState(false);

  async function handleStatusChange(newStatus: string) {
    setLoading(true);
    try {
      const result = await updateRequisitionStatus(requisitionId, newStatus as "draft" | "under_review" | "ready_to_bid" | "transferred" | "cancelled", projectId);
      if (result?.error) toast.error(result.error);
    } catch (err) {
      toast.error("Network error — could not reach the server. Please try again.");
      console.error("Status update failed:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleTransfer() {
    setLoading(true);
    try {
      await transferToBid(requisitionId, projectId);
    } catch (err) {
      toast.error("Network error — could not transfer to bid. Please try again.");
      console.error("Transfer failed:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      {status === "draft" && (
        <Button size="sm" variant="outline" disabled={loading} onClick={() => handleStatusChange("under_review")}>
          {loading ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Send className="mr-1.5 h-3.5 w-3.5" />}
          Submit for Review
        </Button>
      )}
      {status === "under_review" && (
        <>
          <Button size="sm" variant="outline" disabled={loading} onClick={() => handleStatusChange("draft")}>
            Back to Draft
          </Button>
          <Button size="sm" disabled={loading} onClick={() => handleStatusChange("ready_to_bid")}>
            Mark Ready to Bid
          </Button>
        </>
      )}
      {status === "ready_to_bid" && hasItems && (
        <Button size="sm" disabled={loading} onClick={handleTransfer}>
          {loading ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <ArrowRight className="mr-1.5 h-3.5 w-3.5" />}
          Transfer to Bid
        </Button>
      )}
      {status !== "transferred" && status !== "cancelled" && (
        <Button size="sm" variant="ghost" className="text-destructive" disabled={loading} onClick={() => handleStatusChange("cancelled")}>
          <X className="mr-1.5 h-3.5 w-3.5" />
          Cancel
        </Button>
      )}
    </div>
  );
}
