"use server";

import { createClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createPerson(formData: FormData) {
  const user = await getSessionUser();
  if (!user || !user.organizationId || !user.memberships[0])
    return { error: "Not authenticated" };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("people")
    .insert({
      organization_id: user.organizationId,
      team_id: user.memberships[0].team_id,
      first_name: formData.get("firstName") as string,
      last_name: formData.get("lastName") as string,
      email: (formData.get("email") as string) || null,
      phone: (formData.get("phone") as string) || null,
      role: (formData.get("role") as string) || null,
      department: (formData.get("department") as string) || null,
      business_id: (formData.get("businessId") as string) || null,
      city: (formData.get("city") as string) || null,
    })
    .select()
    .single();

  if (error) return { error: error.message };
  redirect(`/people/${data.id}`);
}

export async function updatePerson(id: string, formData: FormData) {
  const supabase = await createClient();

  const isActiveStr = formData.get("isActive") as string | null;

  const { error } = await supabase
    .from("people")
    .update({
      first_name: formData.get("firstName") as string,
      last_name: formData.get("lastName") as string,
      email: (formData.get("email") as string) || null,
      phone: (formData.get("phone") as string) || null,
      role: (formData.get("role") as string) || null,
      department: (formData.get("department") as string) || null,
      business_id: (formData.get("businessId") as string) || null,
      city: (formData.get("city") as string) || null,
      ...(isActiveStr != null ? { is_active: isActiveStr === "true" } : {}),
    })
    .eq("id", id);

  if (error) return { error: error.message };
  revalidatePath(`/people/${id}`);
  return { success: true };
}
