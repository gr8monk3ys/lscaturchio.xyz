"use client";

import type { ReactNode } from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { isPathActive } from "@/lib/navigation-path";
import { cn } from "@/lib/utils";

interface ActiveNavLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
  activeClassName?: string;
  inactiveClassName?: string;
}

export function ActiveNavLink({
  href,
  children,
  className,
  activeClassName,
  inactiveClassName,
}: ActiveNavLinkProps) {
  const pathname = usePathname();
  const isActive = isPathActive(pathname, href);

  return (
    <Link
      href={href}
      prefetch={false}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        className,
        isActive ? activeClassName : inactiveClassName
      )}
    >
      {children}
    </Link>
  );
}
