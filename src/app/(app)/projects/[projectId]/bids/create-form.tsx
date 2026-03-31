"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createBid } from "@/actions/bids";

export function CreateBidForm({ projectId }: { projectId: string }) {
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleCreate(formData: FormData) {
    setLoading(true);
    await createBid(projectId, formData);
    setLoading(false);
  }

  if (!showForm) {
    return (
      <Button size="sm" onClick={() => setShowForm(true)}>
        <Plus className="mr-1.5 h-3.5 w-3.5" /> New Bid
      </Button>
    );
  }

  return (
    <form action={handleCreate} className="rounded-xl border bg-card p-4 shadow-sm space-y-3 w-full">
      <Input name="name" placeholder="Bid name *" required />
      <div className="grid gap-3 sm:grid-cols-2">
        <Input name="description" placeholder="Description (optional)" />
        <Input name="dueDate" type="date" />
      </div>
      <div className="flex justify-end gap-2">
        <Button size="sm" variant="ghost" onClick={() => setShowForm(false)} type="button">Cancel</Button>
        <Button size="sm" type="submit" disabled={loading}>{loading ? "Creating..." : "Create"}</Button>
      </div>
    </form>
  );
}
