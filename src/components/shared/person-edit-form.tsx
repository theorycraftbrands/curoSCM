"use client";

import { useState } from "react";
import { updatePerson } from "@/actions/people";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useEditSheet } from "@/components/shared/edit-sheet";

interface PersonEditFormProps {
  person: {
    id: string;
    first_name: string;
    last_name: string;
    email: string | null;
    phone: string | null;
    role: string | null;
    department: string | null;
    city: string | null;
    is_active: boolean;
    business_id: string | null;
  };
  businesses: Array<{ id: string; name: string }>;
}

export function PersonEditForm({ person, businesses }: PersonEditFormProps) {
  const { close } = useEditSheet();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isActive, setIsActive] = useState(person.is_active);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);

    formData.set("isActive", String(isActive));

    try {
      const result = await updatePerson(person.id, formData);
      if (result?.error) {
        setError(result.error);
        setLoading(false);
      } else {
        close();
      }
    } catch {
      setError("Network error — could not save. Please try again.");
      setLoading(false);
    }
  }

  return (
    <form action={handleSubmit} className="space-y-5">
      {/* Active toggle */}
      <div className="flex items-center justify-between rounded-lg border p-3">
        <div>
          <Label className="text-sm font-medium">Active</Label>
          <p className="text-xs text-muted-foreground">Inactive contacts are hidden from lists</p>
        </div>
        <Switch checked={isActive} onCheckedChange={setIsActive} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="edit-firstName">First name *</Label>
          <Input id="edit-firstName" name="firstName" required defaultValue={person.first_name} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit-lastName">Last name *</Label>
          <Input id="edit-lastName" name="lastName" required defaultValue={person.last_name} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="edit-email">Email</Label>
          <Input id="edit-email" name="email" type="email" defaultValue={person.email ?? ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit-phone">Phone</Label>
          <Input id="edit-phone" name="phone" type="tel" defaultValue={person.phone ?? ""} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="edit-businessId">Business</Label>
        <select
          id="edit-businessId"
          name="businessId"
          defaultValue={person.business_id ?? ""}
          className="flex h-9 w-full rounded-md border bg-background px-3 py-1 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="">— No business —</option>
          {businesses.map((b) => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="edit-role">Role / Title</Label>
          <Input id="edit-role" name="role" defaultValue={person.role ?? ""} placeholder="Sales Manager" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit-department">Department</Label>
          <Input id="edit-department" name="department" defaultValue={person.department ?? ""} placeholder="Sales" />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="edit-city">City</Label>
        <Input id="edit-city" name="city" defaultValue={person.city ?? ""} placeholder="Houston" />
      </div>

      {error && (
        <div className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div>
      )}

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={close}>Cancel</Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}
