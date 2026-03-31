"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { updateLocation } from "@/actions/locations";
import { useEditSheet } from "@/components/shared/edit-sheet";

interface LocationEditFormProps {
  location: {
    id: string;
    name: string;
    location_type: string;
    address_line_1: string | null;
    address_line_2: string | null;
    city: string | null;
    state_province: string | null;
    postal_code: string | null;
    country: string | null;
    is_active: boolean;
    business_id: string | null;
  };
  businesses: Array<{ id: string; name: string }>;
}

const locationTypes = ["mailing", "shipping", "fabrication", "warehouse", "office"];

export function LocationEditForm({ location, businesses }: LocationEditFormProps) {
  const { close } = useEditSheet();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isActive, setIsActive] = useState(location.is_active);
  const [locType, setLocType] = useState(location.location_type);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const form = new FormData(e.currentTarget);

    try {
      const result = await updateLocation(location.id, {
        name: form.get("name") as string,
        location_type: locType,
        address_line_1: (form.get("addressLine1") as string) || null,
        address_line_2: (form.get("addressLine2") as string) || null,
        city: (form.get("city") as string) || null,
        state_province: (form.get("stateProvince") as string) || null,
        postal_code: (form.get("postalCode") as string) || null,
        country: (form.get("country") as string) || null,
        business_id: (form.get("businessId") as string) || null,
        is_active: isActive,
      });

      if (result?.error) { setError(result.error); setLoading(false); }
      else { router.refresh(); close(); }
    } catch {
      setError("Network error — could not save. Please try again.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="flex items-center justify-between rounded-lg border p-3">
        <div>
          <Label className="text-sm font-medium">Active</Label>
          <p className="text-xs text-muted-foreground">Inactive locations are hidden from selection lists</p>
        </div>
        <Switch checked={isActive} onCheckedChange={setIsActive} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="edit-loc-name">Location name *</Label>
        <Input id="edit-loc-name" name="name" required defaultValue={location.name} />
      </div>

      <div className="space-y-2">
        <Label>Type</Label>
        <div className="flex flex-wrap gap-2">
          {locationTypes.map((t) => (
            <label key={t} className="cursor-pointer">
              <input type="radio" name="locationType" value={t} checked={locType === t} onChange={() => setLocType(t)} className="peer sr-only" />
              <span className="inline-flex rounded-lg border px-3 py-1.5 text-sm capitalize transition-colors peer-checked:border-primary peer-checked:bg-primary/5 peer-checked:text-primary hover:bg-muted">{t}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Business</Label>
        <select name="businessId" defaultValue={location.business_id ?? ""} className="flex h-9 w-full rounded-md border bg-background px-3 py-1 text-sm">
          <option value="">— No business —</option>
          {businesses.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
      </div>

      <div className="space-y-2">
        <Label>Address line 1</Label>
        <Input name="addressLine1" defaultValue={location.address_line_1 ?? ""} />
      </div>
      <div className="space-y-2">
        <Label>Address line 2</Label>
        <Input name="addressLine2" defaultValue={location.address_line_2 ?? ""} />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2"><Label>City</Label><Input name="city" defaultValue={location.city ?? ""} /></div>
        <div className="space-y-2"><Label>State/Province</Label><Input name="stateProvince" defaultValue={location.state_province ?? ""} /></div>
        <div className="space-y-2"><Label>Postal code</Label><Input name="postalCode" defaultValue={location.postal_code ?? ""} /></div>
      </div>
      <div className="space-y-2"><Label>Country</Label><Input name="country" defaultValue={location.country ?? ""} /></div>

      {error && <div className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div>}
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={close}>Cancel</Button>
        <Button type="submit" disabled={loading}>{loading ? "Saving..." : "Save Changes"}</Button>
      </div>
    </form>
  );
}
