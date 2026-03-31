"use server";

import { createClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/auth/session";
import { redirect } from "next/navigation";

export async function createCatalogItem(formData: FormData) {
  const user = await getSessionUser();
  if (!user || !user.organizationId || !user.memberships[0])
    return { error: "Not authenticated" };

  const supabase = await createClient();
  const price = formData.get("defaultPrice") as string;

  const { data, error } = await supabase
    .from("catalog_items")
    .insert({
      organization_id: user.organizationId,
      team_id: user.memberships[0].team_id,
      name: formData.get("name") as string,
      description: (formData.get("description") as string) || null,
      sku: (formData.get("sku") as string) || null,
      unit: (formData.get("unit") as string) || "each",
      category: (formData.get("category") as string) || null,
      default_price: price ? parseFloat(price) : null,
      currency: (formData.get("currency") as string) || "USD",
    })
    .select()
    .single();

  if (error) return { error: error.message };
  redirect(`/catalog/${data.id}`);
}
