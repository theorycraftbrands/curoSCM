import { Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Breadcrumbs } from "./breadcrumbs";
import { UserMenu } from "./user-menu";
import { getSessionUser } from "@/lib/auth/session";

export async function TopNav() {
  const user = await getSessionUser();

  const initials = user?.profile.full_name
    ? user.profile.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  return (
    <header className="flex h-14 items-center justify-between border-b bg-background px-4">
      {/* Left: Breadcrumbs */}
      <Breadcrumbs />

      {/* Right: Actions */}
      <div className="flex items-center gap-1">
        {/* Search (Cmd+K placeholder) */}
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Search className="h-4 w-4" />
        </Button>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative h-8 w-8">
          <Bell className="h-4 w-4" />
        </Button>

        {/* User menu */}
        <UserMenu
          userName={user?.profile.full_name ?? "User"}
          userEmail={user?.email ?? ""}
          initials={initials}
        />
      </div>
    </header>
  );
}
