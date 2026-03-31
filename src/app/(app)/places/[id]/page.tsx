import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin, Building2, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { requireOnboarded } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { EntityTabs } from "@/components/shared/entity-tabs";
import { EditSheet } from "@/components/shared/edit-sheet";
import { LocationEditForm } from "@/components/shared/location-edit-form";

export default async function LocationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireOnboarded();
  const supabase = await createClient();

  const [{ data: location }, { data: businesses }] = await Promise.all([
    supabase.from("locations").select("*, business:businesses(id, name)").eq("id", id).single(),
    supabase.from("businesses").select("id, name").order("name"),
  ]);
  if (!location) notFound();

  const [{ data: notes }, { data: tasks }] = await Promise.all([
    supabase.from("notes").select("*, profile:profiles(full_name)").eq("entity_type", "location").eq("entity_id", id).order("created_at", { ascending: false }),
    supabase.from("tasks").select("*, profile:profiles(full_name)").eq("entity_type", "location").eq("entity_id", id).order("created_at", { ascending: false }),
  ]);

  const addressParts = [location.address_line_1, location.address_line_2, [location.city, location.state_province].filter(Boolean).join(", "), location.postal_code, location.country].filter(Boolean);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link href="/places" className="mb-2 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Places
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{location.name}</h1>
            {location.business && (
              <Link href={`/businesses/${location.business.id}`} className="mt-1 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <Building2 className="h-3.5 w-3.5" /> {location.business.name}
              </Link>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="capitalize">{location.location_type}</Badge>
            <Badge variant={location.is_active ? "secondary" : "outline"}>{location.is_active ? "Active" : "Inactive"}</Badge>
            <EditSheet title="Edit Location">
              {({ close }) => <LocationEditForm location={location} businesses={businesses ?? []} close={close} />}
            </EditSheet>
          </div>
        </div>
      </div>

      <EntityTabs entityType="location" entityId={id} currentUserId={user.id} notes={notes ?? []} tasks={tasks ?? []}>
        <div className="space-y-6">
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold">Address</h2>
            {addressParts.length > 0 ? (
              <div className="flex items-start gap-3 rounded-lg bg-muted/30 p-4">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <div className="text-sm space-y-0.5">
                  {addressParts.map((part, i) => <p key={i}>{part}</p>)}
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No address provided</p>
            )}
          </div>
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold">Record Details</h2>
            <div className="grid gap-3 sm:grid-cols-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2"><Clock className="h-3.5 w-3.5" /> Created {new Date(location.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</div>
              <div className="flex items-center gap-2"><Clock className="h-3.5 w-3.5" /> Updated {new Date(location.updated_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</div>
            </div>
          </div>
        </div>
      </EntityTabs>
    </div>
  );
}
