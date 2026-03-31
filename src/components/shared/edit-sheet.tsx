"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Pencil } from "lucide-react";
import { createContext, useContext, useState } from "react";

const EditSheetContext = createContext<{ close: () => void }>({ close: () => {} });

export function useEditSheet() {
  return useContext(EditSheetContext);
}

interface EditSheetProps {
  title: string;
  children: React.ReactNode;
}

export function EditSheet({ title, children }: EditSheetProps) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger className="inline-flex items-center justify-center gap-1.5 rounded-md border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground">
        <Pencil className="h-3.5 w-3.5" />
        Edit
      </SheetTrigger>
      <SheetContent className="overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
        </SheetHeader>
        <div className="mt-6">
          <EditSheetContext.Provider value={{ close: () => setOpen(false) }}>
            {children}
          </EditSheetContext.Provider>
        </div>
      </SheetContent>
    </Sheet>
  );
}
