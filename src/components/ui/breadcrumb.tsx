"use client";

// Rule: TypeScript Usage - Use TypeScript for all code with explicit return types
import { Fragment, ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

// Rule: TypeScript Usage - Prefer interfaces over types
interface BreadcrumbItem {
  label: string;
  href: string;
  isCurrent?: boolean;
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[];
  className?: string;
  homeHref?: string;
  showHomeIcon?: boolean;
  customSegments?: Record<string, string>;
}

// Rule: UI and Styling - Use Tailwind CSS for styling
// Export with two different names for backward compatibility
export function Breadcrumb({
  items,
  className,
  homeHref = "/",
  showHomeIcon = true,
  customSegments,
}: BreadcrumbProps): JSX.Element {
  // Generate items from customSegments if provided
  const breadcrumbItems = items || (customSegments ? generateItemsFromSegments(customSegments) : []);
  
  // Helper function to create breadcrumb items from customSegments
  function generateItemsFromSegments(segments: Record<string, string>): BreadcrumbItem[] {
    return Object.entries(segments).map(([path, label], index, arr) => ({
      label,
      href: `/${path}`,
      isCurrent: index === arr.length - 1
    }));
  }
  return (
    <nav aria-label="Breadcrumb" className={cn("flex", className)}>
      <ol className="flex flex-wrap items-center gap-1.5 text-sm font-space-mono text-stone-600 dark:text-stone-400">
        {showHomeIcon && (
          <li>
            <Link 
              href={homeHref}
              className="flex items-center hover:text-stone-800 dark:hover:text-stone-200 transition-colors"
              aria-label="Home"
            >
              <Home className="h-4 w-4" />
            </Link>
            <span className="sr-only">Home</span>
          </li>
        )}
        
        {breadcrumbItems.map((item, index) => {
          const isLast = index === breadcrumbItems.length - 1;
          
          return (
            <Fragment key={item.href}>
              {(index > 0 || showHomeIcon) && (
                <li className="flex items-center" aria-hidden="true">
                  <ChevronRight className="h-4 w-4" />
                </li>
              )}
              
              <li>
                {isLast ? (
                  <span className="font-medium text-stone-800 dark:text-stone-200" aria-current="page">
                    {item.label}
                  </span>
                ) : (
                  <Link
                    href={item.href}
                    className="hover:text-stone-800 dark:hover:text-stone-200 transition-colors"
                  >
                    {item.label}
                  </Link>
                )}
              </li>
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}

// Alias for backward compatibility
export const BreadcrumbNav = Breadcrumb;

// Helper function to generate breadcrumb items from the current path
export function useAutoBreadcrumb(
  customLabels: Record<string, string> = {},
  skipSegments: string[] = []
): BreadcrumbItem[] {
  const pathname = usePathname();
  
  if (!pathname) return [];
  
  const segments = pathname.split('/').filter(Boolean);
  let currentPath = "";
  
  return segments
    .filter(segment => !skipSegments.includes(segment))
    .map((segment, index) => {
      currentPath += `/${segment}`;
      
      const isLast = index === segments.length - 1;
      const defaultLabel = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
      const label = customLabels[segment] || defaultLabel;
      
      return {
        label,
        href: currentPath,
        isCurrent: isLast
      };
    });
}
