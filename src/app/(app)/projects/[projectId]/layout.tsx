import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireOnboarded } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { ProjectNav } from "@/components/shared/project-nav";
import { EditSheet } from "@/components/shared/edit-sheet";
import { ProjectEditForm } from "@/components/shared/project-edit-form";

const statusColors: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  active: "bg-chart-3/10 text-chart-3",
  on_hold: "bg-chart-2/10 text-chart-2",
  complete: "bg-primary/10 text-primary",
  cancelled: "bg-destructive/10 text-destructive",
};

export default async function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const user = await requireOnboarded();
  const supabase = await createClient();

  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .single();

  if (!project) notFound();

  return (
    <div className="space-y-6">
      {/* Project Header */}
      <div>
        <Link
          href="/projects"
          className="mb-2 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Projects
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-muted-foreground tabular-nums">
                {project.project_number}
              </span>
              <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium capitalize ${statusColors[project.status]}`}>
                {project.status.replace("_", " ")}
              </span>
            </div>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight">
              {project.name}
            </h1>
            {project.description && (
              <p className="mt-1 text-sm text-muted-foreground max-w-2xl">
                {project.description}
              </p>
            )}
          </div>
          <div className="flex items-start gap-3">
            <div className="text-right text-xs text-muted-foreground">
              <div className="font-mono tabular-nums">{project.currency}</div>
              {project.start_date && (
                <div className="mt-1">
                  {new Date(project.start_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  {project.end_date && (
                    <> — {new Date(project.end_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</>
                  )}
                </div>
              )}
            </div>
            <EditSheet title="Edit Project">
              {({ close }) => <ProjectEditForm project={project} close={close} />}
            </EditSheet>
          </div>
        </div>
      </div>

      {/* Project Navigation */}
      <ProjectNav projectId={projectId} />

      {/* Page Content */}
      {children}
    </div>
  );
}
