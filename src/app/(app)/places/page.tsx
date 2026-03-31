import Link from "next/link";
import { Plus, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { requireOnboarded } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export default async function PlacesPage() {
  const user = await requireOnboarded();
  const supabase = await createClient();

  const { data: locations } = await supabase
    .from("locations")
    .select("*, business:businesses(name)")
    .order("name");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Places</h1>
          <p className="text-sm text-muted-foreground">
            Shipping, fabrication, and office locations
          </p>
        </div>
        <Link href="/places/new">
          <Button>
            <Plus className="mr-1.5 h-4 w-4" />
            Add Location
          </Button>
        </Link>
      </div>

      {!locations || locations.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border bg-card py-16">
          <MapPin className="h-12 w-12 text-muted-foreground/20" />
          <h3 className="mt-4 font-semibold">No locations yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Add your first location
          </p>
          <Link href="/places/new" className="mt-4">
            <Button size="sm">
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Add Location
            </Button>
          </Link>
        </div>
      ) : (
        <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Name</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Type</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Business</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">City</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Country</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {locations.map((loc) => (
                <tr key={loc.id} className="group transition-colors hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <Link
                      href={`/places/${loc.id}`}
                      className="font-medium hover:text-primary transition-colors"
                    >
                      {loc.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className="capitalize text-xs">
                      {loc.location_type}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {loc.business?.name || "—"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{loc.city || "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{loc.country || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
