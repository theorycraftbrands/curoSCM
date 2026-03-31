"use server";

import { createClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { Database } from "@/lib/types/database";

type BusinessType = Database["public"]["Enums"]["business_type"];

export async function createBusiness(formData: FormData) {
  const user = await getSessionUser();
  if (!user || !user.organizationId || !user.memberships[0])
    return { error: "Not authenticated" };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("businesses")
    .insert({
      organization_id: user.organizationId,
      team_id: user.memberships[0].team_id,
      name: formData.get("name") as string,
      legal_name: (formData.get("legalName") as string) || null,
      business_type: (formData.get("businessType") as BusinessType) || "vendor",
      tax_reference: (formData.get("taxReference") as string) || null,
      phone: (formData.get("phone") as string) || null,
      website: (formData.get("website") as string) || null,
      timezone: (formData.get("timezone") as string) || "UTC",
    })
    .select()
    .single();

  if (error) return { error: error.message };
  redirect(`/businesses/${data.id}`);
}
