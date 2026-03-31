"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Search, Package, X } from "lucide-react";
import { Input } from "@/components/ui/input";

interface CatalogItem {
  id: string;
  name: string;
  sku: string | null;
  unit: string | null;
  default_price: number | null;
  currency: string | null;
  category: string | null;
}

interface CatalogPickerProps {
  onSelect: (item: CatalogItem) => void;
  onClear: () => void;
  selected: CatalogItem | null;
}

export function CatalogPicker({ onSelect, onClear, selected }: CatalogPickerProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CatalogItem[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("catalog_items")
        .select("id, name, sku, unit, default_price, currency, category")
        .or(`name.ilike.%${query}%,sku.ilike.%${query}%,description.ilike.%${query}%`)
        .eq("is_active", true)
        .limit(8);
      setResults(data ?? []);
      setOpen(true);
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  if (selected) {
    return (
      <div className="flex items-center gap-2 rounded-lg border bg-primary/5 border-primary/20 px-3 py-2">
        <Package className="h-4 w-4 text-primary shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{selected.name}</p>
          <p className="text-xs text-muted-foreground">
            {[selected.sku, selected.category, selected.unit].filter(Boolean).join(" · ")}
            {selected.default_price != null && (
              <span className="ml-1 font-mono">${Number(selected.default_price).toFixed(2)}</span>
            )}
          </p>
        </div>
        <button onClick={onClear} className="shrink-0 rounded p-1 hover:bg-destructive/10 hover:text-destructive transition-colors">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 200)}
          placeholder="Search catalog by name, SKU, or description..."
          className="pl-8 text-sm"
        />
      </div>

      {open && results.length > 0 && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border bg-popover shadow-lg">
          {results.map((item) => (
            <button
              key={item.id}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                onSelect(item);
                setQuery("");
                setOpen(false);
              }}
              className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm hover:bg-muted/50 transition-colors first:rounded-t-lg last:rounded-b-lg"
            >
              <Package className="h-4 w-4 text-muted-foreground shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{item.name}</p>
                <p className="text-xs text-muted-foreground">
                  {[item.sku && `SKU: ${item.sku}`, item.category, item.unit].filter(Boolean).join(" · ")}
                </p>
              </div>
              {item.default_price != null && (
                <span className="shrink-0 font-mono text-xs tabular-nums text-muted-foreground">
                  ${Number(item.default_price).toFixed(2)}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {open && query.length >= 2 && results.length === 0 && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border bg-popover p-3 text-center text-sm text-muted-foreground shadow-lg">
          No catalog items found
        </div>
      )}
    </div>
  );
}
