import { requireOnboarded } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { EntityTabs } from "@/components/shared/entity-tabs";
import { Calendar, DollarSign, Users } from "lucide-react";

export default async function ProjectOverviewPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const user = await requireOnboarded();
  const supabase = await createClient();

  const [{ data: project }, { data: members }, { data: bomCounts }, { data: notes }, { data: tasks }] =
    await Promise.all([
      supabase.from("projects").select("*").eq("id", projectId).single(),
      supabase
        .from("project_memberships")
        .select("*, profile:profiles(full_name)")
        .eq("project_id", projectId),
      supabase
        .from("bom_items")
        .select("bom_type")
        .eq("project_id", projectId),
      supabase
        .from("notes")
        .select("*, profile:profiles(full_name)")
        .eq("entity_type", "project")
        .eq("entity_id", projectId)
        .order("created_at", { ascending: false }),
      supabase
        .from("tasks")
        .select("*, profile:profiles(full_name)")
        .eq("entity_type", "project")
        .eq("entity_id", projectId)
        .order("created_at", { ascending: false }),
    ]);

  if (!project) return null;

  const bomByType = {
    purchase: bomCounts?.filter((b) => b.bom_type === "purchase").length ?? 0,
    client_supplied: bomCounts?.filter((b) => b.bom_type === "client_supplied").length ?? 0,
    vendor_supplied: bomCounts?.filter((b) => b.bom_type === "vendor_supplied").length ?? 0,
    feed_through: bomCounts?.filter((b) => b.bom_type === "feed_through").length ?? 0,
  };
  const totalBom = Object.values(bomByType).reduce((a, b) => a + b, 0);

  return (
    <EntityTabs
      entityType="project"
      entityId={projectId}
      currentUserId={user.id}
      notes={notes ?? []}
      tasks={tasks ?? []}
    >
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border bg-card p-5 shadow-sm">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              Key Dates
            </div>
            <div className="mt-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Start</span>
                <span className="font-mono tabular-nums">
                  {project.start_date
                    ? new Date(project.start_date).toLocaleDateString()
                    : "—"}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">End</span>
                <span className="font-mono tabular-nums">
                  {project.end_date
                    ? new Date(project.end_date).toLocaleDateString()
                    : "—"}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border bg-card p-5 shadow-sm">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <DollarSign className="h-4 w-4" />
              Bill of Materials
            </div>
            <p className="mt-3 font-mono text-2xl font-bold tabular-nums">
              {totalBom}
            </p>
            <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
              <span>Purchase: {bomByType.purchase}</span>
              <span>Client: {bomByType.client_supplied}</span>
              <span>Vendor: {bomByType.vendor_supplied}</span>
              <span>Feed-through: {bomByType.feed_through}</span>
            </div>
          </div>

          <div className="rounded-xl border bg-card p-5 shadow-sm">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              Team Members
            </div>
            <p className="mt-3 font-mono text-2xl font-bold tabular-nums">
              {members?.length ?? 0}
            </p>
            <div className="mt-2 space-y-1">
              {members?.slice(0, 3).map((m) => (
                <div key={m.id} className="flex items-center justify-between text-xs">
                  <span>{m.profile?.full_name}</span>
                  <span className="capitalize text-muted-foreground">{m.role}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </EntityTabs>
  );
}
