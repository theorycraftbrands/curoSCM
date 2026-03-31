import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Mail, Phone, MapPin, Building2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { requireOnboarded } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { EntityTabs } from "@/components/shared/entity-tabs";

export default async function PersonDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireOnboarded();
  const supabase = await createClient();

  const { data: person } = await supabase
    .from("people")
    .select("*, business:businesses(id, name)")
    .eq("id", id)
    .single();

  if (!person) notFound();

  // Fetch notes and tasks for this person
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
              {person.role && <span>{person.role}</span>}
              {person.role && person.business && <span>&middot;</span>}
              {person.business && (
                <Link
                  href={`/businesses/${person.business.id}`}
                  className="flex items-center gap-1 hover:text-foreground transition-colors"
                >
                  <Building2 className="h-3.5 w-3.5" />
                  {person.business.name}
                </Link>
              )}
            </div>
          </div>
          <Badge variant={person.is_active ? "secondary" : "outline"}>
            {person.is_active ? "Active" : "Inactive"}
          </Badge>
        </div>
      </div>

      <EntityTabs
        entityType="person"
        entityId={id}
        currentUserId={user.id}
        notes={notes ?? []}
        tasks={tasks ?? []}
      >
        {/* Details tab content */}
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold">Contact Information</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {person.email && (
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <a
                  href={`mailto:${person.email}`}
                  className="font-mono text-xs hover:text-primary transition-colors"
                >
                  {person.email}
                </a>
              </div>
            )}
            {person.phone && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="font-mono text-xs">{person.phone}</span>
              </div>
            )}
            {person.city && (
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{person.city}</span>
              </div>
            )}
            {person.department && (
              <div className="flex items-center gap-2 text-sm">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span>{person.department}</span>
              </div>
            )}
          </div>
          {!person.email && !person.phone && !person.city && !person.department && (
            <p className="text-sm text-muted-foreground">
              No contact information added yet.
            </p>
          )}
        </div>
      </EntityTabs>
    </div>
  );
}
