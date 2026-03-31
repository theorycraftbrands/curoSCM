"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Info, ClipboardList, FileText, Package, BarChart3, Gavel, ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProjectNavProps {
  projectId: string;
}

const navItems = [
  { label: "Overview", href: "", icon: Info },
  { label: "Bill of Materials", href: "/bom", icon: ClipboardList },
  { label: "Inventory", href: "/inventory", icon: Package },
  { label: "Requisitions", href: "/requisitions", icon: FileText },
  { label: "Bids", href: "/bids", icon: Gavel },
  { label: "Orders", href: "/orders", icon: ShoppingCart, disabled: true },
  { label: "Reports", href: "/reports", icon: BarChart3, disabled: true },
];

export function ProjectNav({ projectId }: ProjectNavProps) {
  const pathname = usePathname();
  const basePath = `/projects/${projectId}`;

  return (
    <nav className="flex gap-1 overflow-x-auto border-b pb-px">
      {navItems.map((item) => {
        const href = `${basePath}${item.href}`;
        const isActive = item.href === ""
          ? pathname === basePath
          : pathname.startsWith(href);
        const Icon = item.icon;

        if (item.disabled) {
          return (
            <span
              key={item.label}
              className="flex items-center gap-1.5 px-3 py-2 text-sm text-muted-foreground/40 cursor-not-allowed"
            >
              <Icon className="h-3.5 w-3.5" />
              {item.label}
            </span>
          );
        }

        return (
          <Link
            key={item.label}
            href={href}
            className={cn(
              "flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors border-b-2 -mb-px",
              isActive
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
