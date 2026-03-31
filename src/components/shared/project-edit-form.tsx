"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";

interface ProjectEditFormProps {
  project: {
    id: string;
    name: string;
    description: string | null;
    status: string;
    currency: string;
    start_date: string | null;
    end_date: string | null;
  };
  close: () => void;
}

const statuses = [
  { value: "draft", label: "Draft" },
  { value: "active", label: "Active" },
  { value: "on_hold", label: "On Hold" },
  { value: "complete", label: "Complete" },
  { value: "cancelled", label: "Cancelled" },
];

export function ProjectEditForm({ project, close }: ProjectEditFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(project.status);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const supabase = createClient();

    const { error: err } = await supabase.from("projects").update({
      name: form.get("name") as string,
      description: (form.get("description") as string) || null,
      status: status as "draft" | "active" | "on_hold" | "complete" | "cancelled",
      currency: (form.get("currency") as string) || "USD",
      start_date: (form.get("startDate") as string) || null,
      end_date: (form.get("endDate") as string) || null,
    }).eq("id", project.id);

    if (err) { setError(err.message); setLoading(false); }
    else { router.refresh(); close(); }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label>Status</Label>
        <div className="flex flex-wrap gap-2">
          {statuses.map((s) => (
            <label key={s.value} className="cursor-pointer">
              <input type="radio" value={s.value} checked={status === s.value} onChange={() => setStatus(s.value)} className="peer sr-only" />
              <span className="inline-flex rounded-lg border px-3 py-1.5 text-sm capitalize transition-colors peer-checked:border-primary peer-checked:bg-primary/5 peer-checked:text-primary hover:bg-muted">{s.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Project name *</Label>
        <Input name="name" required defaultValue={project.name} />
      </div>
      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea name="description" defaultValue={project.description ?? ""} className="min-h-[80px]" />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2"><Label>Start date</Label><Input name="startDate" type="date" defaultValue={project.start_date ?? ""} /></div>
        <div className="space-y-2"><Label>End date</Label><Input name="endDate" type="date" defaultValue={project.end_date ?? ""} /></div>
        <div className="space-y-2"><Label>Currency</Label><Input name="currency" defaultValue={project.currency} /></div>
      </div>

      {error && <div className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div>}
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={close}>Cancel</Button>
        <Button type="submit" disabled={loading}>{loading ? "Saving..." : "Save Changes"}</Button>
      </div>
    </form>
  );
}
