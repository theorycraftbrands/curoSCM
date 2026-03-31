"use server";

import { createClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";
import type { Database } from "@/lib/types/database";

type TaskStatus = Database["public"]["Enums"]["task_status"];
type TaskPriority = Database["public"]["Enums"]["task_priority"];

export async function createTask(
  entityType: string,
  entityId: string,
  data: { title: string; description?: string; priority?: TaskPriority; due_date?: string; assigned_to?: string },
  pathname: string
) {
  const user = await getSessionUser();
  if (!user || !user.organizationId) return { error: "Not authenticated" };

  const supabase = await createClient();
  const { error } = await supabase.from("tasks").insert({
    organization_id: user.organizationId,
    entity_type: entityType,
    entity_id: entityId,
    title: data.title,
    description: data.description,
    priority: data.priority || "medium",
    due_date: data.due_date,
    assigned_to: data.assigned_to,
    created_by: user.id,
  });

  if (error) return { error: error.message };
  revalidatePath(pathname);
  return { success: true };
}

export async function updateTaskStatus(
  taskId: string,
  status: TaskStatus,
  pathname: string
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("tasks")
    .update({ status })
    .eq("id", taskId);

  if (error) return { error: error.message };
  revalidatePath(pathname);
  return { success: true };
}
