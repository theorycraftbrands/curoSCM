import { requireOnboarded } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Package } from "lucide-react";

export default async function ProjectInventoryPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  await requireOnboarded();
  const supabase = await createClient();

  const { data: items } = await supabase
    .from("bom_items")
    .select("*")
    .eq("project_id", projectId)
    .eq("bom_type", "purchase")
    .order("description");

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Project Inventory</h2>
        <p className="text-sm text-muted-foreground">
          Stock levels and incoming materials for purchase items
        </p>
      </div>

      {!items || items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border bg-card py-16">
          <Package className="h-12 w-12 text-muted-foreground/20" />
          <h3 className="mt-4 font-semibold">No purchase items yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Add items to the BOM to track inventory
          </p>
        </div>
      ) : (
        <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Item</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Ordered</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Unit</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Current Stock</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Allocated</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Available</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Incoming</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium">{item.description}</p>
                    {item.cost_code && (
                      <p className="text-xs font-mono text-muted-foreground">{item.cost_code}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right font-mono tabular-nums">{item.quantity}</td>
                  <td className="px-4 py-3 text-muted-foreground">{item.unit}</td>
                  <td className="px-4 py-3 text-right font-mono tabular-nums text-muted-foreground">0</td>
                  <td className="px-4 py-3 text-right font-mono tabular-nums text-muted-foreground">0</td>
                  <td className="px-4 py-3 text-right font-mono tabular-nums text-muted-foreground">0</td>
                  <td className="px-4 py-3 text-right">
                    <Badge variant="outline" className="font-mono tabular-nums text-xs">
                      {item.quantity}
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
