import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { Database } from "@/lib/types/database";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type TeamMembership = Database["public"]["Tables"]["team_memberships"]["Row"] & {
  team: Database["public"]["Tables"]["teams"]["Row"];
};

export interface SessionUser {
  id: string;
  email: string;
  profile: Profile;
  memberships: TeamMembership[];
  organizationId: string | null;
}

/**
 * Get the current authenticated user with profile and memberships.
 * Returns null if not authenticated.
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // Fetch profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) return null;

  // Fetch team memberships with team details
  const { data: memberships } = await supabase
    .from("team_memberships")
    .select("*, team:teams(*)")
    .eq("user_id", user.id);

  const orgId = memberships?.[0]?.organization_id ?? null;

  return {
    id: user.id,
    email: user.email!,
    profile,
    memberships: (memberships as TeamMembership[]) ?? [],
    organizationId: orgId,
  };
}

/**
 * Require authentication. Redirects to login if not authenticated.
 */
export async function requireAuth(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  return user;
}

/**
 * Require that the user has completed onboarding (has an organization).
 */
export async function requireOnboarded(): Promise<SessionUser> {
  const user = await requireAuth();
  if (!user.organizationId) redirect("/onboarding");
  return user;
}
