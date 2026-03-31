import Link from "next/link";
import { Plus, FolderKanban, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { requireOnboarded } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

const statusColors: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  active: "bg-chart-3/10 text-chart-3",
  on_hold: "bg-chart-2/10 text-chart-2",
  complete: "bg-primary/10 text-primary",
  cancelled: "bg-destructive/10 text-destructive",
};

export default async function ProjectsPage() {
  const user = await requireOnboarded();
  const supabase = await createClient();

  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Projects</h1>
          <p className="text-sm text-muted-foreground">
            Manage procurement projects
          </p>
        </div>
        <Link href="/projects/new">
          <Button>
            <Plus className="mr-1.5 h-4 w-4" />
            New Project
          </Button>
        </Link>
      </div>

      {!projects || projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border bg-card py-16">
          <FolderKanban className="h-12 w-12 text-muted-foreground/20" />
          <h3 className="mt-4 font-semibold">No projects yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Create your first procurement project
          </p>
          <Link href="/projects/new" className="mt-4">
            <Button size="sm">
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              New Project
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/projects/${project.id}`}
              className="group rounded-xl border bg-card p-5 shadow-sm transition-all hover:shadow-md hover:border-primary/20"
            >
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-xs text-muted-foreground tabular-nums">
                    {project.project_number}
                  </p>
                  <h3 className="mt-1 font-semibold group-hover:text-primary transition-colors truncate">
                    {project.name}
                  </h3>
                  {project.description && (
                    <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                      {project.description}
                    </p>
                  )}
                </div>
                <span className={`ml-2 shrink-0 inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium capitalize ${statusColors[project.status]}`}>
                  {project.status.replace("_", " ")}
                </span>
              </div>

              <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {project.start_date
                    ? new Date(project.start_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                    : "No start date"}
                </div>
                <span className="font-mono tabular-nums">{project.currency}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
