"use server";

import { createClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";
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

export async function updateCatalogItem(
  id: string,
  data: {
    name: string;
    description?: string | null;
    sku?: string | null;
    unit?: string | null;
    category?: string | null;
    default_price?: number | null;
    currency?: string | null;
    is_purchasable: boolean;
    is_active: boolean;
  }
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("catalog_items")
    .update({
      name: data.name,
      description: data.description ?? null,
      sku: data.sku ?? null,
      unit: data.unit ?? "each",
      category: data.category ?? null,
      default_price: data.default_price ?? null,
      currency: data.currency ?? "USD",
      is_purchasable: data.is_purchasable,
      is_active: data.is_active,
    })
    .eq("id", id);

  if (error) return { error: error.message };
  revalidatePath(`/catalog/${id}`);
  return { success: true };
}

export async function searchCatalog(query: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("catalog_items")
    .select("id, name, sku, unit, default_price, currency, category")
    .or(`name.ilike.%${query}%,sku.ilike.%${query}%,description.ilike.%${query}%`)
    .eq("is_active", true)
    .limit(8);
  return data ?? [];
}
