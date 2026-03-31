"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Info, ClipboardList, Building2, MessageSquare, Paperclip, CheckCircle2 } from "lucide-react";
import { RequisitionActions } from "./requisition-actions";
import { RequisitionItems } from "./requisition-items";
import { NotesPanel } from "./notes-panel";
import { TasksPanel } from "./tasks-panel";
import type { Database } from "@/lib/types/database";

type Requisition = Database["public"]["Tables"]["requisitions"]["Row"];
type RequisitionItem = Database["public"]["Tables"]["requisition_items"]["Row"];

const statusColors: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  under_review: "bg-chart-2/10 text-chart-2",
  ready_to_bid: "bg-chart-3/10 text-chart-3",
  transferred: "bg-primary/10 text-primary",
  cancelled: "bg-destructive/10 text-destructive",
};

interface RequisitionDetailProps {
  requisition: Requisition;
  items: RequisitionItem[];
  notes: Array<{ id: string; content: string; created_by: string; created_at: string; profile?: { full_name: string | null } | null }>;
  tasks: Array<{ id: string; title: string; description: string | null; status: "open" | "in_progress" | "complete" | "cancelled"; priority: "low" | "medium" | "high" | "urgent"; due_date: string | null; assigned_to: string | null; created_at: string; profile?: { full_name: string | null } | null }>;
  businesses: Array<{ id: string; name: string }>;
  projectId: string;
  currentUserId: string;
}

export function RequisitionDetail({ requisition, items, notes, tasks, businesses, projectId, currentUserId }: RequisitionDetailProps) {
  const isEditable = requisition.status === "draft" || requisition.status === "under_review";

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-muted-foreground tabular-nums">{requisition.requisition_number}</span>
            <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium capitalize ${statusColors[requisition.status]}`}>
              {requisition.status.replace("_", " ")}
            </span>
          </div>
          <h2 className="mt-1 text-lg font-semibold">{requisition.name}</h2>
          {requisition.description && <p className="mt-1 text-sm text-muted-foreground">{requisition.description}</p>}
        </div>
        <RequisitionActions requisitionId={requisition.id} projectId={projectId} status={requisition.status} hasItems={items.length > 0} />
      </div>

      {/* Main Tabs — matching Current SCM: Information, Bill of Materials, Recommended Vendors, Notes, Files, Tasks */}
      <Tabs defaultValue="information" className="w-full">
        <TabsList>
          <TabsTrigger value="information" className="gap-1.5"><Info className="h-3.5 w-3.5" /> Information</TabsTrigger>
          <TabsTrigger value="bom" className="gap-1.5">
            <ClipboardList className="h-3.5 w-3.5" /> Bill of Materials
            <span className="ml-1 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-mono tabular-nums">{items.length}</span>
          </TabsTrigger>
          <TabsTrigger value="vendors" className="gap-1.5"><Building2 className="h-3.5 w-3.5" /> Recommended Vendors</TabsTrigger>
          <TabsTrigger value="notes" className="gap-1.5">
            <MessageSquare className="h-3.5 w-3.5" /> Notes
            {notes.length > 0 && <span className="ml-1 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-mono tabular-nums">{notes.length}</span>}
          </TabsTrigger>
          <TabsTrigger value="files" className="gap-1.5"><Paperclip className="h-3.5 w-3.5" /> Files</TabsTrigger>
          <TabsTrigger value="tasks" className="gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5" /> Tasks
            {tasks.filter((t) => t.status === "open" || t.status === "in_progress").length > 0 && (
              <span className="ml-1 rounded-full bg-primary/10 text-primary px-1.5 py-0.5 text-[10px] font-mono tabular-nums">
                {tasks.filter((t) => t.status === "open" || t.status === "in_progress").length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Information Tab with sub-tabs */}
        <TabsContent value="information" className="mt-4">
          <Tabs defaultValue="info-details" className="w-full">
            <TabsList>
              <TabsTrigger value="info-details">Information</TabsTrigger>
              <TabsTrigger value="info-dates">Key Dates</TabsTrigger>
              <TabsTrigger value="info-grouping">Grouping</TabsTrigger>
              <TabsTrigger value="info-costcoding">Cost Coding</TabsTrigger>
            </TabsList>

            <TabsContent value="info-details" className="mt-4">
              <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                  <tbody className="divide-y">
                    <tr>
                      <td className="px-4 py-2.5 w-44 text-muted-foreground bg-muted/30 font-medium">Requisition Number</td>
                      <td className="px-4 py-2.5 font-mono text-xs tabular-nums">{requisition.requisition_number}</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2.5 text-muted-foreground bg-muted/30 font-medium">Name</td>
                      <td className="px-4 py-2.5">{requisition.name}</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2.5 text-muted-foreground bg-muted/30 font-medium">Status</td>
                      <td className="px-4 py-2.5">
                        <Badge variant="secondary" className="capitalize">{requisition.status.replace("_", " ")}</Badge>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2.5 text-muted-foreground bg-muted/30 font-medium">Description</td>
                      <td className="px-4 py-2.5">{requisition.description || <span className="text-muted-foreground/40">—</span>}</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2.5 text-muted-foreground bg-muted/30 font-medium">Items</td>
                      <td className="px-4 py-2.5 font-mono tabular-nums">{items.length}</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2.5 text-muted-foreground bg-muted/30 font-medium">Created</td>
                      <td className="px-4 py-2.5 font-mono text-xs tabular-nums text-muted-foreground">{new Date(requisition.created_at).toLocaleString()}</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2.5 text-muted-foreground bg-muted/30 font-medium">Last Updated</td>
                      <td className="px-4 py-2.5 font-mono text-xs tabular-nums text-muted-foreground">{new Date(requisition.updated_at).toLocaleString()}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </TabsContent>

            <TabsContent value="info-dates" className="mt-4">
              <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
                <div className="px-4 py-3 bg-muted/30 border-b flex items-center justify-between">
                  <h3 className="text-sm font-semibold">Key Dates</h3>
                  <span className="text-xs text-muted-foreground">Original / Planned / Completed</span>
                </div>
                <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                  No key dates configured yet. Add custom dates to track milestones.
                </div>
              </div>
            </TabsContent>

            <TabsContent value="info-grouping" className="mt-4">
              <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
                <div className="px-4 py-3 bg-muted/30 border-b">
                  <h3 className="text-sm font-semibold">Grouping</h3>
                </div>
                {(() => {
                  const groups = [...new Set(items.map((i) => i.group_name).filter(Boolean))];
                  return groups.length === 0 ? (
                    <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                      No groups defined. Assign group names to items to organize them.
                    </div>
                  ) : (
                    <table className="w-full text-sm">
                      <thead><tr className="border-b bg-muted/15">
                        <th className="px-4 py-2 text-left font-medium text-muted-foreground">Group</th>
                        <th className="px-4 py-2 text-right font-medium text-muted-foreground">Items</th>
                      </tr></thead>
                      <tbody className="divide-y">
                        {groups.map((g) => (
                          <tr key={g} className="hover:bg-muted/10">
                            <td className="px-4 py-2">{g}</td>
                            <td className="px-4 py-2 text-right font-mono tabular-nums">{items.filter((i) => i.group_name === g).length}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  );
                })()}
              </div>
            </TabsContent>

            <TabsContent value="info-costcoding" className="mt-4">
              <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
                <div className="px-4 py-3 bg-muted/30 border-b">
                  <h3 className="text-sm font-semibold">Cost Coding</h3>
                </div>
                {(() => {
                  const codes = [...new Set(items.map((i) => i.cost_code).filter(Boolean))];
                  return codes.length === 0 ? (
                    <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                      No cost codes assigned. Assign cost codes to items for financial tracking.
                    </div>
                  ) : (
                    <table className="w-full text-sm">
                      <thead><tr className="border-b bg-muted/15">
                        <th className="px-4 py-2 text-left font-medium text-muted-foreground">Cost Code</th>
                        <th className="px-4 py-2 text-right font-medium text-muted-foreground">Items</th>
                      </tr></thead>
                      <tbody className="divide-y">
                        {codes.map((c) => (
                          <tr key={c} className="hover:bg-muted/10">
                            <td className="px-4 py-2 font-mono text-xs">{c}</td>
                            <td className="px-4 py-2 text-right font-mono tabular-nums">{items.filter((i) => i.cost_code === c).length}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  );
                })()}
              </div>
            </TabsContent>
          </Tabs>
        </TabsContent>

        {/* Bill of Materials Tab */}
        <TabsContent value="bom" className="mt-4">
          <RequisitionItems requisitionId={requisition.id} projectId={projectId} items={items} isEditable={isEditable} />
        </TabsContent>

        {/* Recommended Vendors Tab */}
        <TabsContent value="vendors" className="mt-4">
          <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
            <div className="px-4 py-3 bg-muted/30 border-b">
              <h3 className="text-sm font-semibold">Recommended Vendors</h3>
            </div>
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              Suggest vendors for this requisition before transferring to bid.
            </div>
          </div>
        </TabsContent>

        {/* Notes Tab */}
        <TabsContent value="notes" className="mt-4">
          <NotesPanel entityType="requisition" entityId={requisition.id} notes={notes} currentUserId={currentUserId} />
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
          <TasksPanel entityType="requisition" entityId={requisition.id} tasks={tasks} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
