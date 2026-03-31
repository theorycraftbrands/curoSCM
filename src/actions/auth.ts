"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function signUp(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const fullName = formData.get("fullName") as string;

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
    },
  });

  if (error) {
    return { error: error.message };
  }

  redirect("/onboarding");
}

export async function signIn(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  redirect("/dashboard");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function createOrganization(formData: FormData) {
  const supabase = await createClient();
  const adminClient = createAdminClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const orgName = formData.get("orgName") as string;
  const teamName = formData.get("teamName") as string || "Default Team";

  // Generate slug from org name
  const slug = orgName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  // Use admin client to bypass RLS for initial setup
  // 1. Create organization
  const { data: org, error: orgError } = await adminClient
    .from("organizations")
    .insert({ name: orgName, slug })
    .select()
    .single();

  if (orgError) {
    if (orgError.code === "23505") {
      return { error: "An organization with that name already exists" };
    }
    return { error: orgError.message };
  }

  // 2. Create default team
  const { data: team, error: teamError } = await adminClient
    .from("teams")
    .insert({ name: teamName, organization_id: org.id })
    .select()
    .single();

  if (teamError) {
    return { error: teamError.message };
  }

  // 3. Add user as team owner
  const { error: memberError } = await adminClient
    .from("team_memberships")
    .insert({
      user_id: user.id,
      team_id: team.id,
      organization_id: org.id,
      role: "owner",
    });

  if (memberError) {
    return { error: memberError.message };
  }

  redirect("/dashboard");
}
