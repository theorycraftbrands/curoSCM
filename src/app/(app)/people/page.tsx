import Link from "next/link";
import { Plus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { requireOnboarded } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export default async function PeoplePage() {
  const user = await requireOnboarded();
  const supabase = await createClient();

  const { data: people } = await supabase
    .from("people")
    .select("*, business:businesses(name)")
    .order("last_name");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">People</h1>
          <p className="text-sm text-muted-foreground">
            Manage contacts and vendor representatives
          </p>
        </div>
        <Link href="/people/new">
          <Button>
            <Plus className="mr-1.5 h-4 w-4" />
            Add Person
          </Button>
        </Link>
      </div>

      {!people || people.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border bg-card py-16">
          <Users className="h-12 w-12 text-muted-foreground/20" />
          <h3 className="mt-4 font-semibold">No people yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Add your first contact to get started
          </p>
          <Link href="/people/new" className="mt-4">
            <Button size="sm">
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Add Person
            </Button>
          </Link>
        </div>
      ) : (
        <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Name</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Business</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Role</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Email</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">City</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {people.map((person) => (
                <tr
                  key={person.id}
                  className="group transition-colors hover:bg-muted/30"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/people/${person.id}`}
                      className="font-medium text-foreground hover:text-primary transition-colors"
                    >
                      {person.first_name} {person.last_name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {person.business?.name || "—"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {person.role || "—"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground font-mono text-xs">
                    {person.email || "—"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {person.city || "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Badge variant={person.is_active ? "secondary" : "outline"}>
                      {person.is_active ? "Active" : "Inactive"}
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
