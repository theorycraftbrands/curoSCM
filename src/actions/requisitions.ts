"use server";

import { createClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { Database } from "@/lib/types/database";

type RequisitionStatus = Database["public"]["Enums"]["requisition_status"];

export async function createRequisition(projectId: string, formData: FormData) {
  const user = await getSessionUser();
  if (!user || !user.organizationId) return { error: "Not authenticated" };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("requisitions")
    .insert({
      project_id: projectId,
      organization_id: user.organizationId,
      name: formData.get("name") as string,
      description: (formData.get("description") as string) || null,
      created_by: user.id,
    })
    .select()
    .single();

  if (error) return { error: error.message };
  redirect(`/projects/${projectId}/requisitions/${data.id}`);
}

export async function updateRequisitionStatus(
  id: string,
  status: RequisitionStatus,
  projectId: string
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("requisitions")
    .update({ status })
    .eq("id", id);

  if (error) return { error: error.message };
  revalidatePath(`/projects/${projectId}/requisitions/${id}`);
  return { success: true };
}

export async function addRequisitionItem(
  requisitionId: string,
  data: { description: string; quantity: number; unit: string; cost_code?: string; group_name?: string },
  projectId: string
) {
  const user = await getSessionUser();
  if (!user || !user.organizationId) return { error: "Not authenticated" };

  const supabase = await createClient();
  const { error } = await supabase.from("requisition_items").insert({
    requisition_id: requisitionId,
    organization_id: user.organizationId,
    description: data.description,
    quantity: data.quantity,
    unit: data.unit,
    cost_code: data.cost_code,
    group_name: data.group_name,
  });

  if (error) return { error: error.message };
  revalidatePath(`/projects/${projectId}/requisitions/${requisitionId}`);
  return { success: true };
}

export async function deleteRequisitionItem(itemId: string, projectId: string, requisitionId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("requisition_items").delete().eq("id", itemId);
  if (error) return { error: error.message };
  revalidatePath(`/projects/${projectId}/requisitions/${requisitionId}`);
  return { success: true };
}

export async function transferToBid(requisitionId: string, projectId: string) {
  const user = await getSessionUser();
  if (!user || !user.organizationId) return { error: "Not authenticated" };

  const supabase = await createClient();

  // Get requisition and its items
  const [{ data: req }, { data: items }] = await Promise.all([
    supabase.from("requisitions").select("*").eq("id", requisitionId).single(),
    supabase.from("requisition_items").select("*").eq("requisition_id", requisitionId),
  ]);

  if (!req) return { error: "Requisition not found" };

  // Create bid linked to this requisition
  const { data: bid, error: bidError } = await supabase
    .from("bids")
    .insert({
      project_id: projectId,
      organization_id: user.organizationId,
      requisition_id: requisitionId,
      name: req.name + " Bid",
      description: req.description,
      created_by: user.id,
    })
    .select()
    .single();

  if (bidError) return { error: bidError.message };

  // Copy requisition items to bid items
  if (items && items.length > 0) {
    const bidItems = items.map((item) => ({
      bid_id: bid.id,
      organization_id: user.organizationId!,
      requisition_item_id: item.id,
      catalog_item_id: item.catalog_item_id,
      description: item.description,
      quantity: item.quantity,
      unit: item.unit || "each",
      sort_order: item.sort_order || 0,
    }));

    await supabase.from("bid_items").insert(bidItems);
  }

  // Update requisition status
  await supabase
    .from("requisitions")
    .update({ status: "transferred" })
    .eq("id", requisitionId);

  redirect(`/projects/${projectId}/bids/${bid.id}`);
}
