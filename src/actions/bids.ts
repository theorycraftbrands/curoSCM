"use server";

import { createClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { Database } from "@/lib/types/database";

type BidStatus = Database["public"]["Enums"]["bid_status"];

export async function createBid(projectId: string, formData: FormData) {
  const user = await getSessionUser();
  if (!user || !user.organizationId) return { error: "Not authenticated" };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("bids")
    .insert({
      project_id: projectId,
      organization_id: user.organizationId,
      name: formData.get("name") as string,
      description: (formData.get("description") as string) || null,
      due_date: (formData.get("dueDate") as string) || null,
      created_by: user.id,
    })
    .select()
    .single();

  if (error) return { error: error.message };
  redirect(`/projects/${projectId}/bids/${data.id}`);
}

export async function updateBidStatus(id: string, status: BidStatus, projectId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("bids").update({ status }).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath(`/projects/${projectId}/bids/${id}`);
  return { success: true };
}

export async function addBidItem(
  bidId: string,
  data: { description: string; quantity: number; unit: string },
  projectId: string
) {
  const user = await getSessionUser();
  if (!user || !user.organizationId) return { error: "Not authenticated" };

  const supabase = await createClient();
  const { error } = await supabase.from("bid_items").insert({
    bid_id: bidId,
    organization_id: user.organizationId,
    description: data.description,
    quantity: data.quantity,
    unit: data.unit,
  });

  if (error) return { error: error.message };
  revalidatePath(`/projects/${projectId}/bids/${bidId}`);
  return { success: true };
}

export async function addProponent(bidId: string, businessId: string, projectId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("bid_proponents").insert({
    bid_id: bidId,
    business_id: businessId,
  });

  if (error) {
    if (error.code === "23505") return { error: "This vendor is already added" };
    return { error: error.message };
  }
  revalidatePath(`/projects/${projectId}/bids/${bidId}`);
  return { success: true };
}

export async function saveBidResponse(
  bidItemId: string,
  proponentId: string,
  data: { unit_price: number; lead_time_days?: number; is_compliant?: boolean; notes?: string },
  projectId: string,
  bidId: string
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("bid_responses")
    .upsert({
      bid_item_id: bidItemId,
      proponent_id: proponentId,
      unit_price: data.unit_price,
      lead_time_days: data.lead_time_days,
      is_compliant: data.is_compliant ?? true,
      notes: data.notes,
    }, { onConflict: "bid_item_id,proponent_id" });

  if (error) return { error: error.message };
  revalidatePath(`/projects/${projectId}/bids/${bidId}`);
  return { success: true };
}

export async function toggleRecommended(proponentId: string, recommended: boolean, projectId: string, bidId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("bid_proponents")
    .update({ is_recommended: recommended })
    .eq("id", proponentId);

  if (error) return { error: error.message };
  revalidatePath(`/projects/${projectId}/bids/${bidId}`);
  return { success: true };
}
