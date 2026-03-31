import type { Database } from "@/lib/types/database";

type TeamRole = Database["public"]["Enums"]["team_role"];
type ProjectRole = Database["public"]["Enums"]["project_role"];

// Role hierarchy — lower index = more permissions
const TEAM_ROLE_HIERARCHY: TeamRole[] = ["owner", "admin", "member", "viewer"];
const PROJECT_ROLE_HIERARCHY: ProjectRole[] = ["manager", "buyer", "expediter", "viewer"];

/**
 * Check if a team role meets the minimum required level.
 */
export function hasTeamRole(userRole: TeamRole, minRole: TeamRole): boolean {
  return TEAM_ROLE_HIERARCHY.indexOf(userRole) <= TEAM_ROLE_HIERARCHY.indexOf(minRole);
}

/**
 * Check if a project role meets the minimum required level.
 */
export function hasProjectRole(userRole: ProjectRole, minRole: ProjectRole): boolean {
  return PROJECT_ROLE_HIERARCHY.indexOf(userRole) <= PROJECT_ROLE_HIERARCHY.indexOf(minRole);
}

/**
 * Permission definitions for UI visibility and action gating.
 */
export const PERMISSIONS = {
  // Team-level
  canManageTeam: (role: TeamRole) => hasTeamRole(role, "admin"),
  canInviteMembers: (role: TeamRole) => hasTeamRole(role, "admin"),
  canEditResources: (role: TeamRole) => hasTeamRole(role, "member"),
  canViewResources: (role: TeamRole) => hasTeamRole(role, "viewer"),

  // Project-level
  canManageProject: (role: ProjectRole) => hasProjectRole(role, "manager"),
  canCreateOrders: (role: ProjectRole) => hasProjectRole(role, "buyer"),
  canExpedite: (role: ProjectRole) => hasProjectRole(role, "expediter"),
  canViewProject: (role: ProjectRole) => hasProjectRole(role, "viewer"),
} as const;
