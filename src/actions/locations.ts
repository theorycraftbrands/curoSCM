"use server";

import { createClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { Database } from "@/lib/types/database";

type LocationType = Database["public"]["Enums"]["location_type"];

export async function createLocation(formData: FormData) {
  const user = await getSessionUser();
  if (!user || !user.organizationId || !user.memberships[0])
    return { error: "Not authenticated" };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("locations")
    .insert({
      organization_id: user.organizationId,
      team_id: user.memberships[0].team_id,
      name: formData.get("name") as string,
      location_type: (formData.get("locationType") as LocationType) || "shipping",
      address_line_1: (formData.get("addressLine1") as string) || null,
      address_line_2: (formData.get("addressLine2") as string) || null,
      city: (formData.get("city") as string) || null,
      state_province: (formData.get("stateProvince") as string) || null,
      postal_code: (formData.get("postalCode") as string) || null,
      country: (formData.get("country") as string) || "United States",
      business_id: (formData.get("businessId") as string) || null,
    })
    .select()
    .single();

  if (error) return { error: error.message };
  redirect(`/places/${data.id}`);
}

export async function updateLocation(
  id: string,
  data: {
    name: string;
    location_type: string;
    address_line_1?: string | null;
    address_line_2?: string | null;
    city?: string | null;
    state_province?: string | null;
    postal_code?: string | null;
    country?: string | null;
    business_id?: string | null;
    is_active: boolean;
  }
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("locations")
    .update({
      name: data.name,
      location_type: data.location_type as LocationType,
      address_line_1: data.address_line_1 ?? null,
      address_line_2: data.address_line_2 ?? null,
      city: data.city ?? null,
      state_province: data.state_province ?? null,
      postal_code: data.postal_code ?? null,
      country: data.country ?? null,
      business_id: data.business_id ?? null,
      is_active: data.is_active,
    })
    .eq("id", id);

  if (error) return { error: error.message };
  revalidatePath(`/places/${id}`);
  return { success: true };
}
