// Rule: TypeScript Usage - Use TypeScript for all code
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { List, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TableOfContents } from "@/components/blog/TableOfContents";
import { 
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

interface MobileTableOfContentsProps {
  contentSelector: string;
  maxDepth?: number;
  minItems?: number;
}

export function MobileTableOfContents({
  contentSelector,
  maxDepth = 3,
  minItems = 2,
}: MobileTableOfContentsProps): JSX.Element {
  const [open, setOpen] = useState(false);

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="fixed bottom-20 right-6 z-40 h-10 w-10 rounded-full p-0 shadow-md lg:hidden"
          aria-label="Show table of contents"
        >
          <List className="h-5 w-5" />
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle>Table of Contents</DrawerTitle>
            <DrawerDescription>
              Navigate through sections of this article
            </DrawerDescription>
          </DrawerHeader>
          <div className="p-4 pb-0">
            <TableOfContents 
              contentSelector={contentSelector} 
              maxDepth={maxDepth} 
              minItems={minItems} 
            />
          </div>
          <DrawerFooter>
            <DrawerClose asChild>
              <Button variant="outline">Close</Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
