"use client";

import { useState } from "react";
import { createOrganization } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, ArrowRight } from "lucide-react";

export default function OnboardingPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    const result = await createOrganization(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border bg-card p-8 shadow-sm ring-1 ring-foreground/5">
      <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
        <Building2 className="h-6 w-6 text-primary" />
      </div>

      <h1 className="text-xl font-semibold tracking-tight">
        Set up your organization
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        This is where your team will manage projects, vendors, and procurement.
      </p>

      <form action={handleSubmit} className="mt-6 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="orgName">Organization name</Label>
          <Input
            id="orgName"
            name="orgName"
            type="text"
            placeholder="Sigma Engineers & Constructors"
            required
          />
          <p className="text-xs text-muted-foreground">
            Your company or business unit name
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="teamName">First team name</Label>
          <Input
            id="teamName"
            name="teamName"
            type="text"
            placeholder="Procurement"
            defaultValue="Procurement"
          />
          <p className="text-xs text-muted-foreground">
            You can create more teams later
          </p>
        </div>

        {error && (
          <div className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        )}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? (
            "Setting up..."
          ) : (
            <>
              Continue to dashboard
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
