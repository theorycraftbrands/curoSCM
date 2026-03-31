"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createBusiness } from "@/actions/businesses";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const businessTypes = [
  { value: "vendor", label: "Vendor" },
  { value: "client", label: "Client" },
  { value: "fabricator", label: "Fabricator" },
  { value: "carrier", label: "Carrier" },
  { value: "storage", label: "Storage" },
  { value: "other", label: "Other" },
];

export default function NewBusinessPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    const result = await createBusiness(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link
          href="/businesses"
          className="mb-2 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Businesses
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight">Add Business</h1>
        <p className="text-sm text-muted-foreground">
          Register a new vendor, client, or partner
        </p>
      </div>

      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <form action={handleSubmit} className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Business name *</Label>
              <Input id="name" name="name" required placeholder="Tubes Co." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="legalName">Legal name</Label>
              <Input id="legalName" name="legalName" placeholder="Tubes Co. Ltd." />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="businessType">Type *</Label>
            <div className="flex flex-wrap gap-2">
              {businessTypes.map((type) => (
                <label key={type.value} className="cursor-pointer">
                  <input
                    type="radio"
                    name="businessType"
                    value={type.value}
                    defaultChecked={type.value === "vendor"}
                    className="peer sr-only"
                  />
                  <span className="inline-flex rounded-lg border px-3 py-1.5 text-sm transition-colors peer-checked:border-primary peer-checked:bg-primary/5 peer-checked:text-primary hover:bg-muted">
                    {type.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" name="phone" type="tel" placeholder="+1 (555) 000-0000" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input id="website" name="website" type="url" placeholder="https://tubes.co" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="taxReference">Tax reference</Label>
            <Input id="taxReference" name="taxReference" placeholder="GST/HST number" />
          </div>

          {error && (
            <div className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="flex justify-end">
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Business"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
