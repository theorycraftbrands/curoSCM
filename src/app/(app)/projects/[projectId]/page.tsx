import { createClient } from "@/lib/supabase/server";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Info, MapPin, Calendar, Activity } from "lucide-react";

export default async function ProjectOverviewPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const supabase = await createClient();

  const [{ data: project }, { data: members }] = await Promise.all([
    supabase.from("projects").select("*").eq("id", projectId).single(),
    supabase.from("project_memberships").select("*, profile:profiles(full_name)").eq("project_id", projectId),
  ]);

  if (!project) return <div className="py-16 text-center text-muted-foreground">Project not found</div>;

  return (
    <Tabs defaultValue="information" className="w-full">
      <TabsList>
        <TabsTrigger value="information" className="gap-1.5"><Info className="h-3.5 w-3.5" /> Information</TabsTrigger>
        <TabsTrigger value="locations" className="gap-1.5"><MapPin className="h-3.5 w-3.5" /> Locations</TabsTrigger>
        <TabsTrigger value="keydates" className="gap-1.5"><Calendar className="h-3.5 w-3.5" /> Key Dates</TabsTrigger>
        <TabsTrigger value="activity" className="gap-1.5"><Activity className="h-3.5 w-3.5" /> Activity</TabsTrigger>
      </TabsList>

      {/* Information Tab */}
      <TabsContent value="information" className="mt-4">
        <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <tbody className="divide-y">
              <tr>
                <td className="px-4 py-2.5 w-44 text-muted-foreground bg-muted/30 font-medium">Project Name</td>
                <td className="px-4 py-2.5">{project.name}</td>
              </tr>
              <tr>
                <td className="px-4 py-2.5 text-muted-foreground bg-muted/30 font-medium">Project Number</td>
                <td className="px-4 py-2.5 font-mono text-xs tabular-nums">{project.project_number}</td>
              </tr>
              <tr>
                <td className="px-4 py-2.5 text-muted-foreground bg-muted/30 font-medium">Status</td>
                <td className="px-4 py-2.5">
                  <Badge variant="secondary" className="capitalize">{project.status.replace("_", " ")}</Badge>
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2.5 text-muted-foreground bg-muted/30 font-medium">Currency</td>
                <td className="px-4 py-2.5 font-mono">{project.currency}</td>
              </tr>
              <tr>
                <td className="px-4 py-2.5 text-muted-foreground bg-muted/30 font-medium">Description</td>
                <td className="px-4 py-2.5">{project.description || <span className="text-muted-foreground/40">—</span>}</td>
              </tr>
              <tr>
                <td className="px-4 py-2.5 text-muted-foreground bg-muted/30 font-medium">Created</td>
                <td className="px-4 py-2.5 font-mono text-xs tabular-nums text-muted-foreground">{new Date(project.created_at).toLocaleString()}</td>
              </tr>
              <tr>
                <td className="px-4 py-2.5 text-muted-foreground bg-muted/30 font-medium">Last Updated</td>
                <td className="px-4 py-2.5 font-mono text-xs tabular-nums text-muted-foreground">{new Date(project.updated_at).toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Team Members */}
        <div className="mt-6 rounded-xl border bg-card shadow-sm overflow-hidden">
          <div className="px-4 py-3 bg-muted/30 border-b">
            <h3 className="text-sm font-semibold">Team Members ({members?.length ?? 0})</h3>
          </div>
          {!members || members.length === 0 ? (
            <div className="px-4 py-6 text-center text-sm text-muted-foreground">No team members assigned</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/15">
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">Name</th>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">Role</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {members.map((m: { id: string; role: string; profile: { full_name: string | null } | null }) => (
                  <tr key={m.id} className="hover:bg-muted/10">
                    <td className="px-4 py-2">{m.profile?.full_name || "Unknown"}</td>
                    <td className="px-4 py-2"><Badge variant="outline" className="capitalize text-xs">{m.role}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </TabsContent>

      {/* Locations Tab */}
      <TabsContent value="locations" className="mt-4">
        <div className="rounded-xl border bg-card py-12 text-center">
          <MapPin className="mx-auto h-8 w-8 text-muted-foreground/20" />
          <p className="mt-2 text-sm text-muted-foreground">Project locations — link shipping, fabrication, and delivery sites</p>
          <p className="mt-1 text-xs text-muted-foreground/60">Coming in a future update</p>
        </div>
      </TabsContent>

      {/* Key Dates Tab */}
      <TabsContent value="keydates" className="mt-4">
        <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
          <div className="px-4 py-3 bg-muted/30 border-b flex items-center justify-between">
            <h3 className="text-sm font-semibold">Key Dates</h3>
            <span className="text-xs text-muted-foreground">All dates displayed in project timezone</span>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/15">
                <th className="px-4 py-2 text-left font-medium text-muted-foreground">Date</th>
                <th className="px-4 py-2 text-left font-medium text-muted-foreground">Original Date</th>
                <th className="px-4 py-2 text-left font-medium text-muted-foreground">Planned Date</th>
                <th className="px-4 py-2 text-left font-medium text-muted-foreground">Completed Date</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              <tr className="hover:bg-muted/10">
                <td className="px-4 py-2.5 font-medium">Project Start</td>
                <td className="px-4 py-2.5 font-mono text-xs tabular-nums">
                  {project.start_date ? new Date(project.start_date).toLocaleDateString() : <span className="text-muted-foreground/40">—</span>}
                </td>
                <td className="px-4 py-2.5 font-mono text-xs tabular-nums">
                  {project.start_date ? new Date(project.start_date).toLocaleDateString() : <span className="text-muted-foreground/40">—</span>}
                </td>
                <td className="px-4 py-2.5 font-mono text-xs tabular-nums text-muted-foreground/40">—</td>
              </tr>
              <tr className="hover:bg-muted/10">
                <td className="px-4 py-2.5 font-medium">Project End</td>
                <td className="px-4 py-2.5 font-mono text-xs tabular-nums">
                  {project.end_date ? new Date(project.end_date).toLocaleDateString() : <span className="text-muted-foreground/40">—</span>}
                </td>
                <td className="px-4 py-2.5 font-mono text-xs tabular-nums">
                  {project.end_date ? new Date(project.end_date).toLocaleDateString() : <span className="text-muted-foreground/40">—</span>}
                </td>
                <td className="px-4 py-2.5 font-mono text-xs tabular-nums text-muted-foreground/40">—</td>
              </tr>
            </tbody>
          </table>
        </div>
      </TabsContent>

      {/* Activity Tab */}
      <TabsContent value="activity" className="mt-4">
        <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
          <div className="px-4 py-3 bg-muted/30 border-b">
            <h3 className="text-sm font-semibold">Activity Log</h3>
          </div>
          <div className="px-4 py-8 text-center text-sm text-muted-foreground">
            Audit trail of all project changes will appear here
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
}
