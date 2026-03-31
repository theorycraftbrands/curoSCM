"use server";

import { createClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";
import type { Database } from "@/lib/types/database";

type BomItemType = Database["public"]["Enums"]["bom_item_type"];

export async function createBomItem(
  projectId: string,
  data: {
    bom_type: BomItemType;
    description: string;
    quantity: number;
    unit: string;
    unit_price?: number;
    currency?: string;
    cost_code?: string;
    group_name?: string;
    catalog_item_id?: string;
  }
) {
  const user = await getSessionUser();
  if (!user || !user.organizationId) return { error: "Not authenticated" };

  const supabase = await createClient();
  const { error } = await supabase.from("bom_items").insert({
    project_id: projectId,
    organization_id: user.organizationId,
    bom_type: data.bom_type,
    description: data.description,
    quantity: data.quantity,
    unit: data.unit,
    unit_price: data.unit_price,
    currency: data.currency,
    cost_code: data.cost_code,
    group_name: data.group_name,
    catalog_item_id: data.catalog_item_id,
  });

  if (error) return { error: error.message };
  revalidatePath(`/projects/${projectId}/bom`);
  return { success: true };
}

export async function deleteBomItem(itemId: string, projectId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("bom_items").delete().eq("id", itemId);
  if (error) return { error: error.message };
  revalidatePath(`/projects/${projectId}/bom`);
  return { success: true };
}
