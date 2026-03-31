import { notFound } from "next/navigation";
import { requireOnboarded } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { RequisitionDetail } from "@/components/shared/requisition-detail";

export default async function RequisitionDetailPage({
  params,
}: {
  params: Promise<{ projectId: string; id: string }>;
}) {
  const { projectId, id } = await params;
  const user = await requireOnboarded();
  const supabase = await createClient();

  const [{ data: req }, { data: items }, { data: notes }, { data: tasks }, { data: businesses }] = await Promise.all([
    supabase.from("requisitions").select("*").eq("id", id).single(),
    supabase.from("requisition_items").select("*").eq("requisition_id", id).order("sort_order").order("created_at"),
    supabase.from("notes").select("*, profile:profiles(full_name)").eq("entity_type", "requisition").eq("entity_id", id).order("created_at", { ascending: false }),
    supabase.from("tasks").select("*, profile:profiles(full_name)").eq("entity_type", "requisition").eq("entity_id", id).order("created_at", { ascending: false }),
    supabase.from("businesses").select("id, name").eq("business_type", "vendor").order("name"),
  ]);

  if (!req) notFound();

  return (
    <RequisitionDetail
      requisition={req}
      items={items ?? []}
      notes={notes ?? []}
      tasks={tasks ?? []}
      businesses={businesses ?? []}
      projectId={projectId}
      currentUserId={user.id}
    />
  );
}
