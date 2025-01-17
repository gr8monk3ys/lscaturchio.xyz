"use client";

import { navlinks } from "@/constants/navlinks";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useState } from "react";
import { IconMenu2 } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] sm:w-auto">
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden absolute right-2 top-1.5 rounded-full"
      >
        <IconMenu2 className="h-4 w-4" />
        <span className="sr-only">Toggle menu</span>
      </Button>

      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center gap-1 px-3 py-2 bg-background/80 backdrop-blur-sm rounded-full border shadow-sm">
        {navlinks.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <NavLink
              key={href}
              href={href}
              label={label}
              icon={Icon}
              isActive={isActive}
            />
          );
        })}
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden flex items-center gap-1 px-3 py-2 bg-background/80 backdrop-blur-sm rounded-full border shadow-sm">
        {navlinks.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <NavLink
              key={href}
              href={href}
              icon={Icon}
              isActive={isActive}
              label={isOpen ? label : ""}
              className={cn(
                "flex-1",
                !isOpen && "justify-center"
              )}
            />
          );
        })}
      </div>

      {/* Background blur effect */}
      <div className="absolute -right-4 top-0 h-24 w-24 rounded-full bg-primary/10 blur-2xl" />
    </nav>
  );
}

interface NavLinkProps {
  href: string;
  label: string;
  icon: React.ComponentType<{ size: number }>;
  isActive: boolean;
  className?: string;
}

function NavLink({ href, label, icon: Icon, isActive, className }: NavLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        "relative px-3 py-1.5 text-sm font-medium transition-colors duration-200 rounded-full",
        isActive 
          ? "text-primary hover:text-primary/90" 
          : "text-muted-foreground hover:text-primary",
        className
      )}
    >
      <span className="relative z-10 flex items-center gap-2">
        <Icon size={16} />
        {label && <span>{label}</span>}
      </span>
      {isActive && (
        <motion.div
          layoutId="navbar-active"
          className="absolute left-3 right-3 bottom-1 h-px bg-primary"
          transition={{
            type: "spring",
            bounce: 0.25,
            stiffness: 130,
            damping: 12,
          }}
        />
      )}
    </Link>
  );
}
