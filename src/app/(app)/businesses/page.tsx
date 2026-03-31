import Link from "next/link";
import { Plus, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { requireOnboarded } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

const typeColors: Record<string, string> = {
  vendor: "bg-chart-1/10 text-chart-1",
  client: "bg-chart-2/10 text-chart-2",
  fabricator: "bg-chart-4/10 text-chart-4",
  carrier: "bg-chart-3/10 text-chart-3",
  storage: "bg-chart-5/10 text-chart-5",
  other: "bg-muted text-muted-foreground",
};

export default async function BusinessesPage() {
  const user = await requireOnboarded();
  const supabase = await createClient();

  const { data: businesses } = await supabase
    .from("businesses")
    .select("*")
    .order("name");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Businesses</h1>
          <p className="text-sm text-muted-foreground">
            Vendors, clients, and partners
          </p>
        </div>
        <Link href="/businesses/new">
          <Button>
            <Plus className="mr-1.5 h-4 w-4" />
            Add Business
          </Button>
        </Link>
      </div>

      {!businesses || businesses.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border bg-card py-16">
          <Building2 className="h-12 w-12 text-muted-foreground/20" />
          <h3 className="mt-4 font-semibold">No businesses yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Add your first vendor or client
          </p>
          <Link href="/businesses/new" className="mt-4">
            <Button size="sm">
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Add Business
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
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Phone</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Website</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {businesses.map((biz) => (
                <tr key={biz.id} className="group transition-colors hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <Link
                      href={`/businesses/${biz.id}`}
                      className="font-medium hover:text-primary transition-colors"
                    >
                      {biz.name}
                    </Link>
                    {biz.legal_name && biz.legal_name !== biz.name && (
                      <p className="text-xs text-muted-foreground">{biz.legal_name}</p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize ${typeColors[biz.business_type] || typeColors.other}`}>
                      {biz.business_type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground font-mono text-xs">
                    {biz.phone || "—"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">
                    {biz.website || "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Badge variant={biz.is_active ? "secondary" : "outline"}>
                      {biz.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
