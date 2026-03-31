"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { BomTable } from "./bom-table";
import { ShoppingCart, ArrowUpFromLine, ArrowDownToLine, ArrowRightLeft } from "lucide-react";
import type { Database } from "@/lib/types/database";

type BomItem = Database["public"]["Tables"]["bom_items"]["Row"];

interface BomTabsProps {
  projectId: string;
  items: BomItem[];
  counts: {
    purchase: number;
    client_supplied: number;
    vendor_supplied: number;
    feed_through: number;
  };
}

const bomTypes = [
  { key: "purchase" as const, label: "Purchase Items", icon: ShoppingCart, description: "Items you pay suppliers for" },
  { key: "client_supplied" as const, label: "Client Supplied", icon: ArrowUpFromLine, description: "Your inputs provided to the vendor" },
  { key: "vendor_supplied" as const, label: "Vendor Supplied", icon: ArrowDownToLine, description: "Items the vendor builds into their pricing" },
  { key: "feed_through" as const, label: "Feed Through", icon: ArrowRightLeft, description: "Pass-through items moving through the process" },
];

export function BomTabs({ projectId, items, counts }: BomTabsProps) {
  return (
    <Tabs defaultValue="purchase" className="w-full">
      <TabsList>
        {bomTypes.map((type) => {
          const Icon = type.icon;
          return (
            <TabsTrigger key={type.key} value={type.key} className="gap-1.5">
              <Icon className="h-3.5 w-3.5" />
              {type.label}
              <span className="ml-1 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-mono tabular-nums">
                {counts[type.key]}
              </span>
            </TabsTrigger>
          );
        })}
      </TabsList>

      {bomTypes.map((type) => (
        <TabsContent key={type.key} value={type.key} className="mt-4">
          <p className="mb-4 text-xs text-muted-foreground">{type.description}</p>
          <BomTable
            projectId={projectId}
            bomType={type.key}
            items={items.filter((i) => i.bom_type === type.key)}
          />
        </TabsContent>
      ))}
    </Tabs>
  );
}
