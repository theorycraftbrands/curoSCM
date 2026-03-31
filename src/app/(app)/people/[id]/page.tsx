import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Building2, Briefcase } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { requireOnboarded } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { EntityTabs } from "@/components/shared/entity-tabs";
import { EditSheet } from "@/components/shared/edit-sheet";
import { PersonEditForm } from "@/components/shared/person-edit-form";

export default async function PersonDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireOnboarded();
  const supabase = await createClient();

  const [{ data: person }, { data: businesses }] = await Promise.all([
    supabase
      .from("people")
      .select("*, business:businesses(id, name)")
      .eq("id", id)
      .single(),
    supabase.from("businesses").select("id, name").order("name"),
  ]);

  if (!person) notFound();

  const [{ data: notes }, { data: tasks }] = await Promise.all([
    supabase
      .from("notes")
      .select("*, profile:profiles(full_name)")
      .eq("entity_type", "person")
      .eq("entity_id", id)
      .order("created_at", { ascending: false }),
    supabase
      .from("tasks")
      .select("*, profile:profiles(full_name)")
      .eq("entity_type", "person")
      .eq("entity_id", id)
      .order("created_at", { ascending: false }),
  ]);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link
          href="/people"
          className="mb-2 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to People
        </Link>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {person.first_name} {person.last_name}
            </h1>
            <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
              {person.role && (
                <span className="flex items-center gap-1">
                  <Briefcase className="h-3.5 w-3.5" />
                  {person.role}
                </span>
              )}
              {person.department && (
                <span>&middot; {person.department}</span>
              )}
              {person.business && (
                <>
                  <span>&middot;</span>
                  <Link
                    href={`/businesses/${person.business.id}`}
                    className="flex items-center gap-1 hover:text-foreground transition-colors"
                  >
                    <Building2 className="h-3.5 w-3.5" />
                    {person.business.name}
                  </Link>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={person.is_active ? "secondary" : "outline"}>
              {person.is_active ? "Active" : "Inactive"}
            </Badge>
            <EditSheet title="Edit Person">
              <PersonEditForm
                person={person}
                businesses={businesses ?? []}
              />
            </EditSheet>
          </div>
        </div>
      </div>

      <EntityTabs
        entityType="person"
        entityId={id}
        currentUserId={user.id}
        notes={notes ?? []}
        tasks={tasks ?? []}
      >
        {/* Dense data table layout */}
        <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <tbody className="divide-y">
              <tr>
                <td className="px-4 py-2.5 w-40 text-muted-foreground bg-muted/30 font-medium">First Name</td>
                <td className="px-4 py-2.5">{person.first_name}</td>
              </tr>
              <tr>
                <td className="px-4 py-2.5 text-muted-foreground bg-muted/30 font-medium">Last Name</td>
                <td className="px-4 py-2.5">{person.last_name}</td>
              </tr>
              <tr>
                <td className="px-4 py-2.5 text-muted-foreground bg-muted/30 font-medium">Email</td>
                <td className="px-4 py-2.5">
                  {person.email ? (
                    <a href={`mailto:${person.email}`} className="font-mono text-xs hover:text-primary transition-colors">{person.email}</a>
                  ) : <span className="text-muted-foreground/40">—</span>}
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2.5 text-muted-foreground bg-muted/30 font-medium">Phone</td>
                <td className="px-4 py-2.5">
                  {person.phone ? <span className="font-mono text-xs">{person.phone}</span> : <span className="text-muted-foreground/40">—</span>}
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2.5 text-muted-foreground bg-muted/30 font-medium">Business</td>
                <td className="px-4 py-2.5">
                  {person.business ? (
                    <Link href={`/businesses/${person.business.id}`} className="hover:text-primary transition-colors">{person.business.name}</Link>
                  ) : <span className="text-muted-foreground/40">—</span>}
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2.5 text-muted-foreground bg-muted/30 font-medium">Role</td>
                <td className="px-4 py-2.5">{person.role || <span className="text-muted-foreground/40">—</span>}</td>
              </tr>
              <tr>
                <td className="px-4 py-2.5 text-muted-foreground bg-muted/30 font-medium">Department</td>
                <td className="px-4 py-2.5">{person.department || <span className="text-muted-foreground/40">—</span>}</td>
              </tr>
              <tr>
                <td className="px-4 py-2.5 text-muted-foreground bg-muted/30 font-medium">City</td>
                <td className="px-4 py-2.5">{person.city || <span className="text-muted-foreground/40">—</span>}</td>
              </tr>
              <tr>
                <td className="px-4 py-2.5 text-muted-foreground bg-muted/30 font-medium">Status</td>
                <td className="px-4 py-2.5">
                  <Badge variant={person.is_active ? "secondary" : "outline"}>{person.is_active ? "Active" : "Inactive"}</Badge>
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2.5 text-muted-foreground bg-muted/30 font-medium">Created</td>
                <td className="px-4 py-2.5 text-muted-foreground text-xs font-mono tabular-nums">
                  {new Date(person.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2.5 text-muted-foreground bg-muted/30 font-medium">Last Updated</td>
                <td className="px-4 py-2.5 text-muted-foreground text-xs font-mono tabular-nums">
                  {new Date(person.updated_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </EntityTabs>
    </div>
  );
}
