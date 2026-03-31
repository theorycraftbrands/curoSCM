"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createRequisition } from "@/actions/requisitions";

export function CreateRequisitionForm({ projectId }: { projectId: string }) {
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleCreate(formData: FormData) {
    setLoading(true);
    await createRequisition(projectId, formData);
    setLoading(false);
  }

  if (!showForm) {
    return (
      <Button size="sm" onClick={() => setShowForm(true)}>
        <Plus className="mr-1.5 h-3.5 w-3.5" />
        New Requisition
      </Button>
    );
  }

  return (
    <form action={handleCreate} className="rounded-xl border bg-card p-4 shadow-sm space-y-3 w-full">
      <Input name="name" placeholder="Requisition name *" required />
      <Input name="description" placeholder="Description (optional)" />
      <div className="flex justify-end gap-2">
        <Button size="sm" variant="ghost" onClick={() => setShowForm(false)} type="button">Cancel</Button>
        <Button size="sm" type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create"}
        </Button>
      </div>
    </form>
  );
}
