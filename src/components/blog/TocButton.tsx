// Rule: TypeScript Usage - Use TypeScript for all code
"use client";

import { useState } from "react";
import { List, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { TableOfContents } from "./TableOfContents";
import { cn } from "@/lib/utils";

interface TocButtonProps {
  contentSelector: string;
  className?: string;
}

export function TocButton({
  contentSelector,
  className,
}: TocButtonProps): JSX.Element {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className={cn(
            "fixed bottom-24 right-4 z-40 h-10 w-10 rounded-full shadow-md lg:hidden",
            className
          )}
          aria-label="View table of contents"
        >
          <List className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[280px] sm:w-[350px]">
        <SheetHeader>
          <SheetTitle>Table of Contents</SheetTitle>
          <SheetDescription>
            Navigate to different sections of this article
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6">
          <TableOfContents 
            contentSelector={contentSelector} 
            maxDepth={3} 
            minItems={2} 
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
