import { ArrowUpRight } from "lucide-react";
import { IconBrandBluesky, IconBrandMastodon } from "@tabler/icons-react";
import type { ComponentType } from "react";

function getSyndicationLabel(href: string): { label: string; Icon?: ComponentType<{ className?: string }> } {
  const lower = href.toLowerCase();
  if (lower.includes("bsky.app") || lower.includes("bsky.social") || lower.includes("bluesky")) {
    return { label: "Bluesky", Icon: IconBrandBluesky };
  }
  if (lower.includes("mastodon") || lower.includes("fosstodon") || lower.includes("hachyderm") || lower.includes("mstdn")) {
    return { label: "Mastodon", Icon: IconBrandMastodon };
  }
  return { label: "Syndication" };
}

export function SyndicationLinks({ links }: { links?: string[] }) {
  const list = (links ?? []).filter((l) => typeof l === "string" && l.trim().length > 0);
  if (list.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
      <span className="font-semibold text-foreground/70">Syndicated:</span>
      {list.map((href) => {
        const { label, Icon } = getSyndicationLabel(href);
        return (
          <a
            key={href}
            href={href}
            target="_blank"
            rel="syndication noopener noreferrer"
            className="group inline-flex items-center gap-1 rounded-full border border-border/60 bg-background/70 px-3 py-1 hover:bg-primary/[0.04] transition-colors"
          >
            {Icon ? <Icon className="size-3.5" /> : null}
            <span className="font-semibold text-foreground/80">{label}</span>
            <ArrowUpRight className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
        );
      })}
    </div>
  );
}
