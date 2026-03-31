"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createLocation } from "@/actions/locations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const locationTypes = [
  { value: "shipping", label: "Shipping" },
  { value: "mailing", label: "Mailing" },
  { value: "fabrication", label: "Fabrication" },
  { value: "warehouse", label: "Warehouse" },
  { value: "office", label: "Office" },
];

export default function NewLocationPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    const result = await createLocation(formData);
    if (result?.error) { setError(result.error); setLoading(false); }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link href="/places" className="mb-2 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Places
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight">Add Location</h1>
      </div>
      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <form action={handleSubmit} className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Location name *</Label>
              <Input id="name" name="name" required placeholder="Main Warehouse" />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <div className="flex flex-wrap gap-2">
                {locationTypes.map((t) => (
                  <label key={t.value} className="cursor-pointer">
                    <input type="radio" name="locationType" value={t.value} defaultChecked={t.value === "shipping"} className="peer sr-only" />
                    <span className="inline-flex rounded-lg border px-3 py-1.5 text-sm transition-colors peer-checked:border-primary peer-checked:bg-primary/5 peer-checked:text-primary hover:bg-muted">{t.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="addressLine1">Address line 1</Label>
            <Input id="addressLine1" name="addressLine1" placeholder="123 Industrial Blvd" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="addressLine2">Address line 2</Label>
            <Input id="addressLine2" name="addressLine2" placeholder="Unit 4B" />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input id="city" name="city" placeholder="Calgary" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stateProvince">Province/State</Label>
              <Input id="stateProvince" name="stateProvince" placeholder="AB" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="postalCode">Postal code</Label>
              <Input id="postalCode" name="postalCode" placeholder="T2P 1A1" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <Input id="country" name="country" defaultValue="Canada" />
          </div>
          {error && <div className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div>}
          <div className="flex justify-end">
            <Button type="submit" disabled={loading}>{loading ? "Creating..." : "Create Location"}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
