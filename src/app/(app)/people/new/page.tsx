import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createPerson } from "@/actions/people";
import { PersonForm } from "@/components/shared/person-form";

export default function NewPersonPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link
          href="/people"
          className="mb-2 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to People
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight">Add Person</h1>
        <p className="text-sm text-muted-foreground">
          Create a new contact
        </p>
      </div>

      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <PersonForm action={createPerson} />
      </div>
    </div>
  );
}
