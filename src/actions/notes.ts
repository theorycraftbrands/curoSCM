"use server";

import { createClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";

export async function createNote(
  entityType: string,
  entityId: string,
  content: string,
  pathname: string
) {
  const user = await getSessionUser();
  if (!user || !user.organizationId) return { error: "Not authenticated" };

  const supabase = await createClient();
  const { error } = await supabase.from("notes").insert({
    organization_id: user.organizationId,
    entity_type: entityType,
    entity_id: entityId,
    content,
    created_by: user.id,
  });

  if (error) return { error: error.message };
  revalidatePath(pathname);
  return { success: true };
}

export async function deleteNote(noteId: string, pathname: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("notes").delete().eq("id", noteId);
  if (error) return { error: error.message };
  revalidatePath(pathname);
  return { success: true };
}
