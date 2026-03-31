"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface BusinessEditFormProps {
  business: {
    id: string;
    name: string;
    legal_name: string | null;
    business_type: string;
    tax_reference: string | null;
    phone: string | null;
    website: string | null;
    timezone: string | null;
    is_active: boolean;
  };
  close: () => void;
}

const businessTypes = [
  { value: "client", label: "Is a Client?" },
  { value: "vendor", label: "Is a Supplier?" },
  { value: "fabricator", label: "Is a Fabricator?" },
  { value: "carrier", label: "Is a Carrier?" },
  { value: "storage", label: "Is a Storage?" },
  { value: "other", label: "Is a Different Kind of Business?" },
];

const timezones = [
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Phoenix",
  "America/Anchorage",
  "Pacific/Honolulu",
  "UTC",
];

export function BusinessEditForm({ business, close }: BusinessEditFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isActive, setIsActive] = useState(business.is_active);
  const [selectedType, setSelectedType] = useState(business.business_type);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const supabase = createClient();

    const { error: err } = await supabase
      .from("businesses")
      .update({
        name: form.get("name") as string,
        legal_name: (form.get("legalName") as string) || null,
        business_type: selectedType as "client" | "vendor" | "fabricator" | "carrier" | "storage" | "other",
        tax_reference: (form.get("taxReference") as string) || null,
        phone: (form.get("phone") as string) || null,
        website: (form.get("website") as string) || null,
        timezone: (form.get("timezone") as string) || "UTC",
        is_active: isActive,
      })
      .eq("id", business.id);

    if (err) {
      setError(err.message);
      setLoading(false);
    } else {
      router.refresh();
      close();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Active toggle */}
      <div className="flex items-center justify-between rounded-lg border p-3">
        <div>
          <Label className="text-sm font-medium">Active</Label>
          <p className="text-xs text-muted-foreground">Inactive businesses are hidden from selection lists</p>
        </div>
        <Switch checked={isActive} onCheckedChange={setIsActive} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="edit-name">Business name *</Label>
          <Input id="edit-name" name="name" required defaultValue={business.name} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit-legalName">Legal name</Label>
          <Input id="edit-legalName" name="legalName" defaultValue={business.legal_name ?? ""} />
        </div>
      </div>

      {/* Business Types — checkboxes like Current SCM */}
      <div className="space-y-3">
        <Label>Business Types</Label>
        <div className="space-y-2">
          {businessTypes.map((type) => (
            <label key={type.value} className="flex items-center gap-3 rounded-lg border p-3 cursor-pointer hover:bg-muted/30 transition-colors">
              <Checkbox
                checked={selectedType === type.value}
                onCheckedChange={() => setSelectedType(type.value)}
              />
              <span className="text-sm">{type.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="edit-phone">Phone</Label>
          <Input id="edit-phone" name="phone" type="tel" defaultValue={business.phone ?? ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit-website">Website</Label>
          <Input id="edit-website" name="website" type="url" defaultValue={business.website ?? ""} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="edit-taxReference">Tax Reference</Label>
          <Input id="edit-taxReference" name="taxReference" defaultValue={business.tax_reference ?? ""} placeholder="EIN / Tax ID" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit-timezone">Timezone</Label>
          <select
            id="edit-timezone"
            name="timezone"
            defaultValue={business.timezone ?? "UTC"}
            className="flex h-9 w-full rounded-md border bg-background px-3 py-1 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {timezones.map((tz) => (
              <option key={tz} value={tz}>{tz.replace("_", " ")}</option>
            ))}
          </select>
        </div>
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
