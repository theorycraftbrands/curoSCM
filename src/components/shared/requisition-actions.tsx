"use client";

import { Button } from "@/components/ui/button";
import { updateRequisitionStatus, transferToBid } from "@/actions/requisitions";
import { ArrowRight, Send, X } from "lucide-react";

interface RequisitionActionsProps {
  requisitionId: string;
  projectId: string;
  status: string;
  hasItems: boolean;
}

export function RequisitionActions({ requisitionId, projectId, status, hasItems }: RequisitionActionsProps) {
  async function handleStatusChange(newStatus: string) {
    await updateRequisitionStatus(requisitionId, newStatus as "draft" | "under_review" | "ready_to_bid" | "transferred" | "cancelled", projectId);
  }

  async function handleTransfer() {
    await transferToBid(requisitionId, projectId);
  }

  return (
    <div className="flex items-center gap-2">
      {status === "draft" && (
        <Button size="sm" variant="outline" onClick={() => handleStatusChange("under_review")}>
          <Send className="mr-1.5 h-3.5 w-3.5" />
          Submit for Review
        </Button>
      )}
      {status === "under_review" && (
        <>
          <Button size="sm" variant="outline" onClick={() => handleStatusChange("draft")}>
            Back to Draft
          </Button>
          <Button size="sm" onClick={() => handleStatusChange("ready_to_bid")}>
            Mark Ready to Bid
          </Button>
        </>
      )}
      {status === "ready_to_bid" && hasItems && (
        <Button size="sm" onClick={handleTransfer}>
          <ArrowRight className="mr-1.5 h-3.5 w-3.5" />
          Transfer to Bid
        </Button>
      )}
      {status !== "transferred" && status !== "cancelled" && (
        <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleStatusChange("cancelled")}>
          <X className="mr-1.5 h-3.5 w-3.5" />
          Cancel
        </Button>
      )}
    </div>
  );
}
