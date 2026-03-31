"use server";

import { createClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/auth/session";
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
      country: (formData.get("country") as string) || "Canada",
      business_id: (formData.get("businessId") as string) || null,
    })
    .select()
    .single();

  if (error) return { error: error.message };
  redirect(`/places/${data.id}`);
}
