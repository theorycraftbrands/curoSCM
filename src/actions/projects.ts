"use server";

import { createClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createProject(formData: FormData) {
  const user = await getSessionUser();
  if (!user || !user.organizationId || !user.memberships[0])
    return { error: "Not authenticated" };

  const supabase = await createClient();

  const { data: project, error } = await supabase
    .from("projects")
    .insert({
      organization_id: user.organizationId,
      team_id: user.memberships[0].team_id,
      name: formData.get("name") as string,
      description: (formData.get("description") as string) || null,
      currency: (formData.get("currency") as string) || "CAD",
      start_date: (formData.get("startDate") as string) || null,
      end_date: (formData.get("endDate") as string) || null,
    })
    .select()
    .single();

  if (error) return { error: error.message };

  // Add creator as project manager
  await supabase.from("project_memberships").insert({
    project_id: project.id,
    user_id: user.id,
    role: "manager",
  });

  redirect(`/projects/${project.id}`);
}

export async function updateProject(id: string, formData: FormData) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("projects")
    .update({
      name: formData.get("name") as string,
      description: (formData.get("description") as string) || null,
      currency: (formData.get("currency") as string) || "CAD",
      status: (formData.get("status") as string) || undefined,
      start_date: (formData.get("startDate") as string) || null,
      end_date: (formData.get("endDate") as string) || null,
    })
    .eq("id", id);

  if (error) return { error: error.message };
  revalidatePath(`/projects/${id}`);
  return { success: true };
}
