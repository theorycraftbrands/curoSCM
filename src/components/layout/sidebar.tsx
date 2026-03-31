"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Users,
  Building2,
  Package,
  FolderKanban,
  LayoutDashboard,
  Settings,
  HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const teamResources: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "People", href: "/people", icon: Users },
  { label: "Businesses", href: "/businesses", icon: Building2 },
  { label: "Catalog", href: "/catalog", icon: Package },
  { label: "Projects", href: "/projects", icon: FolderKanban },
];

const accountItems: NavItem[] = [
  { label: "Settings", href: "/settings/profile", icon: Settings },
  { label: "Help", href: "#", icon: HelpCircle },
];

function NavLink({
  item,
  isActive,
}: {
  item: NavItem;
  isActive: boolean;
}) {
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors whitespace-nowrap",
        isActive
          ? "bg-sidebar-accent text-sidebar-accent-foreground"
          : "text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
      )}
    >
      <Icon className={cn("h-4 w-4 shrink-0", isActive && "text-sidebar-primary")} />
      <span className="opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-200">
        {item.label}
      </span>
    </Link>
  );
}

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="group/sidebar flex h-full w-14 hover:w-56 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-all duration-200 overflow-hidden"
    >
      {/* Logo */}
      <div className="flex h-14 items-center border-b border-sidebar-border px-3 gap-2.5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground font-bold text-sm">
          C
        </div>
        <span className="font-semibold tracking-tight text-sidebar-foreground opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-200 whitespace-nowrap">
          CuroSCM
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto overflow-x-hidden p-2">
        <div className="mb-2">
          <p className="mb-1 px-3 text-[11px] font-semibold uppercase tracking-widest text-sidebar-foreground/40 opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-200 whitespace-nowrap">
            Resources
          </p>
          {teamResources.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              isActive={pathname.startsWith(item.href)}
            />
          ))}
        </div>
      </nav>

      {/* Bottom section */}
      <div className="border-t border-sidebar-border p-2 space-y-1">
        {accountItems.map((item) => (
          <NavLink
            key={item.label}
            item={item}
            isActive={pathname.startsWith(item.href)}
          />
        ))}
      </div>
    </aside>
  );
}
