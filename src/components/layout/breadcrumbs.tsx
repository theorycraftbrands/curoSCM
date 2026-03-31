"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { Fragment } from "react";

const labelMap: Record<string, string> = {
  dashboard: "Dashboard",
  people: "People",
  businesses: "Businesses",
  places: "Places",
  catalog: "Catalog",
  projects: "Projects",
  settings: "Settings",
  profile: "Profile",
  team: "Team",
  organization: "Organization",
  requisitions: "Requisitions",
  bids: "Bids",
  orders: "Orders",
  inventory: "Inventory",
  bom: "Bill of Materials",
  reports: "Reports",
};

export function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) return null;

  return (
    <nav className="flex items-center gap-1 text-sm">
      {segments.map((segment, index) => {
        const href = "/" + segments.slice(0, index + 1).join("/");
        const label = labelMap[segment] || segment;
        const isLast = index === segments.length - 1;

        return (
          <Fragment key={href}>
            {index > 0 && (
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
            )}
            {isLast ? (
              <span className="font-medium text-foreground">{label}</span>
            ) : (
              <Link
                href={href}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {label}
              </Link>
            )}
          </Fragment>
        );
      })}
    </nav>
  );
}
