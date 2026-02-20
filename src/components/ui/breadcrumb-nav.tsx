"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";
import { BreadcrumbStructuredData } from "./structured-data";

interface BreadcrumbNavProps {
  homeLabel?: string;
  excludeHome?: boolean;
  customSegments?: { [key: string]: string };
}

const EMPTY_CUSTOM_SEGMENTS: { [key: string]: string } = {};

export function BreadcrumbNav({
  homeLabel = "Home",
  excludeHome = false,
  customSegments = EMPTY_CUSTOM_SEGMENTS,
}: BreadcrumbNavProps) {
  const pathname = usePathname();
  
  // Skip rendering if we're on the home page
  if (pathname === "/") return null;
  
  // Split the pathname into segments
  const segments = pathname
    .split("/")
    .filter(Boolean)
    .map((segment) => {
      // Check if this segment is a dynamic route parameter (e.g., [slug])
      const isDynamicSegment = segment.startsWith("[") && segment.endsWith("]");
      
      // If it's a dynamic segment, use a placeholder or custom label
      return {
        name: customSegments[segment] || 
              (isDynamicSegment ? segment.replace(/[\[\]]/g, "") : segment),
        path: segment,
      };
    });
  
  // Build the breadcrumb items with cumulative paths
  const breadcrumbItems = segments.map((segment, index) => {
    const path = `/${segments.slice(0, index + 1).map(s => s.path).join("/")}`;
    return {
      name: segment.name.charAt(0).toUpperCase() + segment.name.slice(1).replace(/-/g, " "),
      path,
    };
  });
  
  // Add home at the beginning if not excluded
  if (!excludeHome) {
    breadcrumbItems.unshift({ name: homeLabel, path: "/" });
  }
  
  // Prepare data for structured data
  const structuredDataItems = breadcrumbItems.map(item => ({
    name: item.name,
    item: `https://lscaturchio.xyz${item.path}`,
  }));
  
  return (
    <nav aria-label="Breadcrumb" className="mb-6 text-sm">
      <BreadcrumbStructuredData items={structuredDataItems} />
      <ol className="flex items-center space-x-2">
        {breadcrumbItems.map((item, index) => (
          <li key={item.path} className="flex items-center">
            {index > 0 && (
              <ChevronRight className="mx-2 h-4 w-4 text-muted-foreground" />
            )}
            
            {index === 0 && !excludeHome && (
              <Home className="mr-1 h-4 w-4" />
            )}
            
            {index === breadcrumbItems.length - 1 ? (
              <span className="font-medium text-foreground" aria-current="page">
                {item.name}
              </span>
            ) : (
              <Link
                href={item.path}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {item.name}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
