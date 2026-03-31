import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Mail, Phone, MapPin, Building2, Briefcase, Clock } from "lucide-react";
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
        <div className="space-y-6">
          {/* Contact Information Card */}
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold">Contact Information</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-start gap-3 rounded-lg bg-muted/30 p-3">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  {person.email ? (
                    <a href={`mailto:${person.email}`} className="text-sm font-mono hover:text-primary transition-colors">
                      {person.email}
                    </a>
                  ) : (
                    <p className="text-sm text-muted-foreground/50">Not provided</p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-lg bg-muted/30 p-3">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Phone</p>
                  {person.phone ? (
                    <p className="text-sm font-mono">{person.phone}</p>
                  ) : (
                    <p className="text-sm text-muted-foreground/50">Not provided</p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-lg bg-muted/30 p-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">City</p>
                  {person.city ? (
                    <p className="text-sm">{person.city}</p>
                  ) : (
                    <p className="text-sm text-muted-foreground/50">Not provided</p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-lg bg-muted/30 p-3">
                <Briefcase className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Role / Department</p>
                  <p className="text-sm">
                    {[person.role, person.department].filter(Boolean).join(" · ") || (
                      <span className="text-muted-foreground/50">Not provided</span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Metadata Card */}
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold">Record Details</h2>
            <div className="grid gap-3 sm:grid-cols-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                Created {new Date(person.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                Updated {new Date(person.updated_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              </div>
            </div>
          </div>
        </div>
      </EntityTabs>
    </div>
  );
}
