import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Phone, Globe, FileText, Users, MapPin, Clock, Building2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { requireOnboarded } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { EntityTabs } from "@/components/shared/entity-tabs";
import { EditSheet } from "@/components/shared/edit-sheet";
import { BusinessEditForm } from "@/components/shared/business-edit-form";

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

  const [{ data: people }, { data: locations }, { data: notes }, { data: tasks }] =
    await Promise.all([
      supabase.from("people").select("id, first_name, last_name, role, email, phone").eq("business_id", id).order("last_name"),
      supabase.from("locations").select("id, name, location_type, city, state_province, country").eq("business_id", id).order("name"),
      supabase.from("notes").select("*, profile:profiles(full_name)").eq("entity_type", "business").eq("entity_id", id).order("created_at", { ascending: false }),
      supabase.from("tasks").select("*, profile:profiles(full_name)").eq("entity_type", "business").eq("entity_id", id).order("created_at", { ascending: false }),
    ]);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link href="/businesses" className="mb-2 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Businesses
        </Link>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{business.name}</h1>
            {business.legal_name && business.legal_name !== business.name && (
              <p className="text-sm text-muted-foreground">{business.legal_name}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${typeColors[business.business_type] || typeColors.other}`}>
              {business.business_type}
            </span>
            <Badge variant={business.is_active ? "secondary" : "outline"}>
              {business.is_active ? "Active" : "Inactive"}
            </Badge>
            <EditSheet title="Edit Business">
              {({ close }) => <BusinessEditForm business={business} close={close} />}
            </EditSheet>
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
          {/* Business Information Card */}
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold">Business Information</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-start gap-3 rounded-lg bg-muted/30 p-3">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Phone</p>
                  {business.phone ? (
                    <p className="text-sm font-mono">{business.phone}</p>
                  ) : (
                    <p className="text-sm text-muted-foreground/50">Not provided</p>
                  )}
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-lg bg-muted/30 p-3">
                <Globe className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Website</p>
                  {business.website ? (
                    <a href={business.website} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">{business.website}</a>
                  ) : (
                    <p className="text-sm text-muted-foreground/50">Not provided</p>
                  )}
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-lg bg-muted/30 p-3">
                <FileText className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Tax Reference</p>
                  {business.tax_reference ? (
                    <p className="text-sm font-mono">{business.tax_reference}</p>
                  ) : (
                    <p className="text-sm text-muted-foreground/50">Not provided</p>
                  )}
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-lg bg-muted/30 p-3">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Timezone</p>
                  <p className="text-sm">{business.timezone?.replace("_", " ") || "UTC"}</p>
                </div>
              </div>
            </div>
          </div>

          {/* People */}
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                People
                <span className="font-mono text-xs text-muted-foreground">({people?.length ?? 0})</span>
              </h2>
              <Link href={`/people/new?businessId=${id}`} className="text-xs text-primary hover:underline">
                + Add Contact
              </Link>
            </div>
            {!people || people.length === 0 ? (
              <p className="text-sm text-muted-foreground">No contacts linked to this business</p>
            ) : (
              <div className="divide-y">
                {people.map((person) => (
                  <div key={person.id} className="flex items-center justify-between py-3">
                    <div>
                      <Link href={`/people/${person.id}`} className="text-sm font-medium hover:text-primary transition-colors">
                        {person.first_name} {person.last_name}
                      </Link>
                      {person.role && <p className="text-xs text-muted-foreground">{person.role}</p>}
                    </div>
                    <div className="text-right text-xs text-muted-foreground">
                      {person.email && <p className="font-mono">{person.email}</p>}
                      {person.phone && <p className="font-mono">{person.phone}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Locations */}
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                Locations
                <span className="font-mono text-xs text-muted-foreground">({locations?.length ?? 0})</span>
              </h2>
              <Link href={`/places/new?businessId=${id}`} className="text-xs text-primary hover:underline">
                + Add Location
              </Link>
            </div>
            {!locations || locations.length === 0 ? (
              <p className="text-sm text-muted-foreground">No locations linked to this business</p>
            ) : (
              <div className="divide-y">
                {locations.map((loc) => (
                  <div key={loc.id} className="flex items-center justify-between py-3">
                    <div>
                      <Link href={`/places/${loc.id}`} className="text-sm font-medium hover:text-primary transition-colors">
                        {loc.name}
                      </Link>
                      <Badge variant="outline" className="ml-2 text-[10px] capitalize">{loc.location_type}</Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {[loc.city, loc.state_province, loc.country].filter(Boolean).join(", ")}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Record Details */}
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold">Record Details</h2>
            <div className="grid gap-3 sm:grid-cols-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Clock className="h-3.5 w-3.5" />
                Created {new Date(business.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-3.5 w-3.5" />
                Updated {new Date(business.updated_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              </div>
            </div>
          </div>
        </div>
      </EntityTabs>
    </div>
  );
}
