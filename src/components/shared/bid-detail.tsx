"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Info, ClipboardList, FileText, Users, BarChart3, Star, MessageSquare, Paperclip, CheckCircle2 } from "lucide-react";
import type { Database } from "@/lib/types/database";

type BidItem = Database["public"]["Tables"]["bid_items"]["Row"];
import { BidProponents } from "./bid-proponents";
import { BidItemsList } from "./bid-items-list";
import { ComparisonGrid } from "./comparison-grid";
import { NotesPanel } from "./notes-panel";
import { TasksPanel } from "./tasks-panel";

const statusColors: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  issued: "bg-chart-4/10 text-chart-4",
  awaiting_review: "bg-chart-1/10 text-chart-1",
  awaiting_approval: "bg-chart-2/10 text-chart-2",
  ready_to_issue: "bg-chart-3/10 text-chart-3",
  awarded: "bg-primary/10 text-primary",
  cancelled: "bg-destructive/10 text-destructive",
};

interface BidDetailProps {
  bid: {
    id: string;
    bid_number: string | null;
    name: string;
    description: string | null;
    status: string;
    due_date: string | null;
    created_at: string;
    updated_at: string;
    requisition?: { id: string; requisition_number: string | null; name: string } | null;
  };
  proponents: Array<{ id: string; status: string; is_recommended: boolean; business: { id: string; name: string; business_type: string } | null }>;
  items: BidItem[];
  responses: Array<{ id: string; bid_item_id: string; proponent_id: string; unit_price: number | null; lead_time_days: number | null; is_compliant: boolean | null; notes: string | null }>;
  availableBusinesses: Array<{ id: string; name: string }>;
  notes: Array<{ id: string; content: string; created_by: string; created_at: string; profile?: { full_name: string | null } | null }>;
  tasks: Array<{ id: string; title: string; description: string | null; status: "open" | "in_progress" | "complete" | "cancelled"; priority: "low" | "medium" | "high" | "urgent"; due_date: string | null; assigned_to: string | null; created_at: string; profile?: { full_name: string | null } | null }>;
  projectId: string;
  currentUserId: string;
}

export function BidDetail({ bid, proponents, items, responses, availableBusinesses, notes, tasks, projectId, currentUserId }: BidDetailProps) {
  const openTasks = tasks.filter((t) => t.status === "open" || t.status === "in_progress").length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-muted-foreground tabular-nums">{bid.bid_number}</span>
            <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium capitalize ${statusColors[bid.status]}`}>
              {bid.status.replace("_", " ")}
            </span>
            {bid.requisition && (
              <span className="text-xs text-muted-foreground">from {bid.requisition.requisition_number}</span>
            )}
          </div>
          <h2 className="mt-1 text-lg font-semibold">{bid.name}</h2>
          {bid.description && <p className="mt-1 text-sm text-muted-foreground">{bid.description}</p>}
        </div>
        {bid.due_date && (
          <div className="text-right">
            <span className="text-xs text-muted-foreground">Due</span>
            <p className="font-mono text-sm tabular-nums">{bid.due_date}</p>
          </div>
        )}
      </div>

      {/* Main Tabs — matching Current SCM */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="flex-wrap">
          <TabsTrigger value="overview" className="gap-1.5"><Info className="h-3.5 w-3.5" /> Overview</TabsTrigger>
          <TabsTrigger value="bom" className="gap-1.5">
            <ClipboardList className="h-3.5 w-3.5" /> BOM
            <span className="ml-1 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-mono tabular-nums">{items.length}</span>
          </TabsTrigger>
          <TabsTrigger value="document" className="gap-1.5"><FileText className="h-3.5 w-3.5" /> Bid Document</TabsTrigger>
          <TabsTrigger value="recipients" className="gap-1.5">
            <Users className="h-3.5 w-3.5" /> Recipients
            <span className="ml-1 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-mono tabular-nums">{proponents.length}</span>
          </TabsTrigger>
          <TabsTrigger value="evaluation" className="gap-1.5"><Star className="h-3.5 w-3.5" /> Evaluation</TabsTrigger>
          <TabsTrigger value="comparison" className="gap-1.5"><BarChart3 className="h-3.5 w-3.5" /> Comparison Grid</TabsTrigger>
          <TabsTrigger value="notes" className="gap-1.5">
            <MessageSquare className="h-3.5 w-3.5" /> Notes
            {notes.length > 0 && <span className="ml-1 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-mono tabular-nums">{notes.length}</span>}
          </TabsTrigger>
          <TabsTrigger value="files" className="gap-1.5"><Paperclip className="h-3.5 w-3.5" /> Files</TabsTrigger>
          <TabsTrigger value="tasks" className="gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5" /> Tasks
            {openTasks > 0 && <span className="ml-1 rounded-full bg-primary/10 text-primary px-1.5 py-0.5 text-[10px] font-mono tabular-nums">{openTasks}</span>}
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab with sub-tabs */}
        <TabsContent value="overview" className="mt-4">
          <Tabs defaultValue="ov-info" className="w-full">
            <TabsList>
              <TabsTrigger value="ov-info">Information</TabsTrigger>
              <TabsTrigger value="ov-locations">Locations</TabsTrigger>
              <TabsTrigger value="ov-dates">Key Dates</TabsTrigger>
              <TabsTrigger value="ov-grouping">Grouping</TabsTrigger>
              <TabsTrigger value="ov-costcoding">Cost Coding</TabsTrigger>
              <TabsTrigger value="ov-terms">Terms</TabsTrigger>
            </TabsList>

            <TabsContent value="ov-info" className="mt-4">
              <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                  <tbody className="divide-y">
                    <tr><td className="px-4 py-2.5 w-44 text-muted-foreground bg-muted/30 font-medium">Bid Number</td><td className="px-4 py-2.5 font-mono text-xs tabular-nums">{bid.bid_number}</td></tr>
                    <tr><td className="px-4 py-2.5 text-muted-foreground bg-muted/30 font-medium">Name</td><td className="px-4 py-2.5">{bid.name}</td></tr>
                    <tr><td className="px-4 py-2.5 text-muted-foreground bg-muted/30 font-medium">Status</td><td className="px-4 py-2.5"><Badge variant="secondary" className="capitalize">{bid.status.replace("_", " ")}</Badge></td></tr>
                    {bid.requisition && (
                      <tr><td className="px-4 py-2.5 text-muted-foreground bg-muted/30 font-medium">Source Requisition</td><td className="px-4 py-2.5"><span className="font-mono text-xs">{bid.requisition.requisition_number}</span> — {bid.requisition.name}</td></tr>
                    )}
                    <tr><td className="px-4 py-2.5 text-muted-foreground bg-muted/30 font-medium">Due Date</td><td className="px-4 py-2.5 font-mono text-xs tabular-nums">{bid.due_date || <span className="text-muted-foreground/40">—</span>}</td></tr>
                    <tr><td className="px-4 py-2.5 text-muted-foreground bg-muted/30 font-medium">Description</td><td className="px-4 py-2.5">{bid.description || <span className="text-muted-foreground/40">—</span>}</td></tr>
                    <tr><td className="px-4 py-2.5 text-muted-foreground bg-muted/30 font-medium">Recipients</td><td className="px-4 py-2.5 font-mono tabular-nums">{proponents.length}</td></tr>
                    <tr><td className="px-4 py-2.5 text-muted-foreground bg-muted/30 font-medium">Items</td><td className="px-4 py-2.5 font-mono tabular-nums">{items.length}</td></tr>
                    <tr><td className="px-4 py-2.5 text-muted-foreground bg-muted/30 font-medium">Created</td><td className="px-4 py-2.5 font-mono text-xs tabular-nums text-muted-foreground">{new Date(bid.created_at).toLocaleString()}</td></tr>
                    <tr><td className="px-4 py-2.5 text-muted-foreground bg-muted/30 font-medium">Last Updated</td><td className="px-4 py-2.5 font-mono text-xs tabular-nums text-muted-foreground">{new Date(bid.updated_at).toLocaleString()}</td></tr>
                  </tbody>
                </table>
              </div>
            </TabsContent>

            <TabsContent value="ov-locations" className="mt-4">
              <div className="rounded-xl border bg-card py-8 text-center text-sm text-muted-foreground">Bid delivery and pickup locations</div>
            </TabsContent>
            <TabsContent value="ov-dates" className="mt-4">
              <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
                <div className="px-4 py-3 bg-muted/30 border-b"><h3 className="text-sm font-semibold">Key Dates</h3></div>
                <div className="px-4 py-8 text-center text-sm text-muted-foreground">No key dates configured</div>
              </div>
            </TabsContent>
            <TabsContent value="ov-grouping" className="mt-4">
              <div className="rounded-xl border bg-card py-8 text-center text-sm text-muted-foreground">Item grouping configuration</div>
            </TabsContent>
            <TabsContent value="ov-costcoding" className="mt-4">
              <div className="rounded-xl border bg-card py-8 text-center text-sm text-muted-foreground">Cost coding assignments</div>
            </TabsContent>
            <TabsContent value="ov-terms" className="mt-4">
              <div className="rounded-xl border bg-card py-8 text-center text-sm text-muted-foreground">Payment terms, delivery terms, and conditions</div>
            </TabsContent>
          </Tabs>
        </TabsContent>

        {/* BOM Tab */}
        <TabsContent value="bom" className="mt-4">
          <BidItemsList bidId={bid.id} projectId={projectId} items={items} />
        </TabsContent>

        {/* Bid Document Tab */}
        <TabsContent value="document" className="mt-4">
          <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
            <div className="px-4 py-3 bg-muted/30 border-b flex items-center justify-between">
              <h3 className="text-sm font-semibold">Bid Document</h3>
            </div>
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              System-generated bid document and attachments
            </div>
          </div>
        </TabsContent>

        {/* Recipients Tab */}
        <TabsContent value="recipients" className="mt-4">
          <BidProponents bidId={bid.id} projectId={projectId} proponents={proponents} availableBusinesses={availableBusinesses} />
        </TabsContent>

        {/* Evaluation Tab */}
        <TabsContent value="evaluation" className="mt-4">
          <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
            <div className="px-4 py-3 bg-muted/30 border-b">
              <h3 className="text-sm font-semibold">Bid Evaluation</h3>
            </div>
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              Custom evaluation criteria and scoring matrix
            </div>
          </div>
        </TabsContent>

        {/* Comparison Grid Tab */}
        <TabsContent value="comparison" className="mt-4">
          <ComparisonGrid bidId={bid.id} projectId={projectId} proponents={proponents} items={items} responses={responses} />
        </TabsContent>

        {/* Notes Tab */}
        <TabsContent value="notes" className="mt-4">
          <NotesPanel entityType="bid" entityId={bid.id} notes={notes} currentUserId={currentUserId} />
        </TabsContent>

        {/* Files Tab */}
        <TabsContent value="files" className="mt-4">
          <div className="rounded-xl border bg-card py-8 text-center">
            <Paperclip className="mx-auto h-8 w-8 text-muted-foreground/20" />
            <p className="mt-2 text-sm text-muted-foreground">File uploads coming soon</p>
          </div>
        </TabsContent>

        {/* Tasks Tab */}
        <TabsContent value="tasks" className="mt-4">
          <TasksPanel entityType="bid" entityId={bid.id} tasks={tasks} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
