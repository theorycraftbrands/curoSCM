import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Phone, Globe, FileText, Users, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { requireOnboarded } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { EntityTabs } from "@/components/shared/entity-tabs";

const typeColors: Record<string, string> = {
  vendor: "bg-chart-1/10 text-chart-1",
  client: "bg-chart-2/10 text-chart-2",
  fabricator: "bg-chart-4/10 text-chart-4",
  carrier: "bg-chart-3/10 text-chart-3",
  storage: "bg-chart-5/10 text-chart-5",
  other: "bg-muted text-muted-foreground",
};

export default async function BusinessDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireOnboarded();
  const supabase = await createClient();

  const { data: business } = await supabase
    .from("businesses")
    .select("*")
    .eq("id", id)
    .single();

  if (!business) notFound();

  // Fetch related data in parallel
  const [{ data: people }, { data: locations }, { data: notes }, { data: tasks }] =
    await Promise.all([
      supabase
        .from("people")
        .select("id, first_name, last_name, role, email")
        .eq("business_id", id)
        .order("last_name"),
      supabase
        .from("locations")
        .select("id, name, location_type, city, country")
        .eq("business_id", id)
        .order("name"),
      supabase
        .from("notes")
        .select("*, profile:profiles(full_name)")
        .eq("entity_type", "business")
        .eq("entity_id", id)
        .order("created_at", { ascending: false }),
      supabase
        .from("tasks")
        .select("*, profile:profiles(full_name)")
        .eq("entity_type", "business")
        .eq("entity_id", id)
        .order("created_at", { ascending: false }),
    ]);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link
          href="/businesses"
          className="mb-2 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Businesses
        </Link>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {business.name}
            </h1>
            {business.legal_name && business.legal_name !== business.name && (
              <p className="text-sm text-muted-foreground">
                {business.legal_name}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${typeColors[business.business_type] || typeColors.other}`}
            >
              {business.business_type}
            </span>
            <Badge variant={business.is_active ? "secondary" : "outline"}>
              {business.is_active ? "Active" : "Inactive"}
            </Badge>
          </div>
        </div>
      </div>

      <EntityTabs
        entityType="business"
        entityId={id}
        currentUserId={user.id}
        notes={notes ?? []}
        tasks={tasks ?? []}
      >
        <div className="space-y-6">
          {/* Contact info */}
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold">Business Information</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {business.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="font-mono text-xs">{business.phone}</span>
                </div>
              )}
              {business.website && (
                <div className="flex items-center gap-2 text-sm">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <a
                    href={business.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline text-xs"
                  >
                    {business.website}
                  </a>
                </div>
              )}
              {business.tax_reference && (
                <div className="flex items-center gap-2 text-sm">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="font-mono text-xs">{business.tax_reference}</span>
                </div>
              )}
            </div>
          </div>

          {/* Linked People */}
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                People
                {people && people.length > 0 && (
                  <span className="font-mono text-xs text-muted-foreground">
                    ({people.length})
                  </span>
                )}
              </h2>
            </div>
            {!people || people.length === 0 ? (
              <p className="text-sm text-muted-foreground">No contacts linked</p>
            ) : (
              <div className="divide-y">
                {people.map((person) => (
                  <div key={person.id} className="flex items-center justify-between py-2">
                    <Link
                      href={`/people/${person.id}`}
                      className="text-sm font-medium hover:text-primary transition-colors"
                    >
                      {person.first_name} {person.last_name}
                    </Link>
                    <span className="text-xs text-muted-foreground">{person.role || ""}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Linked Locations */}
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                Locations
                {locations && locations.length > 0 && (
                  <span className="font-mono text-xs text-muted-foreground">
                    ({locations.length})
                  </span>
                )}
              </h2>
            </div>
            {!locations || locations.length === 0 ? (
              <p className="text-sm text-muted-foreground">No locations linked</p>
            ) : (
              <div className="divide-y">
                {locations.map((loc) => (
                  <div key={loc.id} className="flex items-center justify-between py-2">
                    <Link
                      href={`/places/${loc.id}`}
                      className="text-sm font-medium hover:text-primary transition-colors"
                    >
                      {loc.name}
                    </Link>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground capitalize">
                        {loc.location_type}
                      </span>
                      {loc.city && (
                        <span className="text-xs text-muted-foreground">
                          {loc.city}, {loc.country}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </EntityTabs>
    </div>
  );
}
