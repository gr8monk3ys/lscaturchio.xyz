// Rule: TypeScript Usage - Use TypeScript for all code
"use client";

import { useState } from "react";
import { Keyboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { KeyboardShortcutsHelp } from "@/components/ui/keyboard-shortcut";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function FooterShortcuts(): JSX.Element {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="flex items-center gap-2 text-sm text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100"
        >
          <Keyboard className="h-4 w-4" />
          <span>Keyboard Shortcuts</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <KeyboardShortcutsHelp />
        </div>
      </DialogContent>
    </Dialog>
  );
}
