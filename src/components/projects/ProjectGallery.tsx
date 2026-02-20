"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useReducer, useRef } from "react";
import { AnimatePresence, LazyMotion, domAnimation, m, useReducedMotion } from '@/lib/motion';
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Calendar, ExternalLink, Github, Keyboard, ArrowRight } from "lucide-react";
import type { Product, ProjectCategory, ProjectStatus } from "@/types/products";

const categoryLabels: Record<ProjectCategory, string> = {
  "ai-ml": "AI/ML",
  "web-apps": "Web Apps",
  "tools": "Tools",
  "open-source": "Open Source",
  "data-science": "Data Science",
};

const statusLabels: Record<ProjectStatus, string> = {
  active: "Active",
  maintained: "Maintained",
  archived: "Archived",
};

function formatStartDate(startDate?: string): string | null {
  if (!startDate) return null;
  const value = `${startDate}-01`;
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return null;
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName.toLowerCase();
  return tag === "input" || tag === "textarea" || tag === "select" || target.isContentEditable;
}

interface ProjectGalleryState {
  activeSlug: string;
  browseMode: boolean;
}

type ProjectGalleryAction =
  | { type: "setActiveSlug"; payload: string }
  | { type: "toggleBrowseMode" }
  | { type: "setBrowseMode"; payload: boolean };

function projectGalleryReducer(
  state: ProjectGalleryState,
  action: ProjectGalleryAction
): ProjectGalleryState {
  switch (action.type) {
    case "setActiveSlug":
      return state.activeSlug === action.payload ? state : { ...state, activeSlug: action.payload };
    case "toggleBrowseMode":
      return { ...state, browseMode: !state.browseMode };
    case "setBrowseMode":
      return state.browseMode === action.payload ? state : { ...state, browseMode: action.payload };
    default:
      return state;
  }
}

function toStableListItems(values: string[], prefix: string): Array<{ key: string; value: string }> {
  const counts = new Map<string, number>();
  return values.map((value) => {
    const count = counts.get(value) ?? 0;
    counts.set(value, count + 1);
    return {
      key: `${prefix}-${value}-${count}`,
      value,
    };
  });
}

export function ProjectGallery({ projects }: { projects: Product[] }) {
  const reduceMotion = useReducedMotion();

  const list = useMemo(
    () => projects.filter((p) => typeof p.slug === "string" && p.slug.length > 0) as Array<Product & { slug: string }>,
    [projects]
  );

  const [{ activeSlug, browseMode }, dispatch] = useReducer(projectGalleryReducer, {
    activeSlug: list[0]?.slug ?? "",
    browseMode: false,
  });

  // Keep selection valid when filters/sorts change.
  useEffect(() => {
    if (list.length === 0) return;
    if (!activeSlug || !list.some((p) => p.slug === activeSlug)) {
      dispatch({ type: "setActiveSlug", payload: list[0].slug });
    }
  }, [activeSlug, list]);

  const active = useMemo(() => list.find((p) => p.slug === activeSlug) ?? list[0], [activeSlug, list]);

  const linkRefs = useRef<Record<string, HTMLAnchorElement | null>>({});

  useEffect(() => {
    if (!browseMode) return;
    if (!active?.slug) return;
    const el = linkRefs.current[active.slug];
    el?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
  }, [active?.slug, browseMode]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (isTypingTarget(e.target)) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      if (e.key === "b" || e.key === "B") {
        e.preventDefault();
        dispatch({ type: "toggleBrowseMode" });
        return;
      }

      if (!browseMode) return;
      if (list.length === 0) return;

      if (e.key === "Escape") {
        e.preventDefault();
        dispatch({ type: "setBrowseMode", payload: false });
        return;
      }

      const index = Math.max(0, list.findIndex((p) => p.slug === activeSlug));
      const nextIndex = (delta: number) => {
        const i = Math.min(list.length - 1, Math.max(0, index + delta));
        dispatch({ type: "setActiveSlug", payload: list[i].slug });
      };

      if (e.key === "ArrowRight" || e.key === "ArrowDown" || e.key === "j" || e.key === "J") {
        e.preventDefault();
        nextIndex(1);
        return;
      }
      if (e.key === "ArrowLeft" || e.key === "ArrowUp" || e.key === "k" || e.key === "K") {
        e.preventDefault();
        nextIndex(-1);
        return;
      }
      if (e.key === "Enter") {
        e.preventDefault();
        if (!activeSlug) return;
        linkRefs.current[activeSlug]?.click();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeSlug, browseMode, list]);

  if (list.length === 0) {
    return (
      <div className="rounded-2xl border border-border/50 bg-card/50 p-10 text-center">
        <p className="text-lg font-medium">No projects match your filters.</p>
        <p className="mt-1 text-sm text-muted-foreground">Try a different category or clear filters.</p>
      </div>
    );
  }

  return (
    <LazyMotion features={domAnimation}>
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-muted-foreground">
            Hover a card to preview. Press <span className="font-semibold text-foreground">B</span> for keyboard browse.
          </div>
          <button
            type="button"
            onClick={() => dispatch({ type: "toggleBrowseMode" })}
            className={cn(
              "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-colors",
              browseMode
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted/60 text-foreground hover:bg-muted"
            )}
            aria-pressed={browseMode}
          >
            <Keyboard className="h-4 w-4" />
            Browse mode
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_380px] gap-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <AnimatePresence mode="popLayout" initial={false}>
              {list.map((project) => {
                const isActive = project.slug === activeSlug;
                return (
                  <m.div
                    key={project.slug}
                    layout
                    initial={reduceMotion ? undefined : { opacity: 0, y: 10 }}
                    animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                    exit={reduceMotion ? undefined : { opacity: 0, y: -10 }}
                    transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <ProjectGalleryCard
                      project={project}
                      isActive={isActive}
                      onActivate={() => dispatch({ type: "setActiveSlug", payload: project.slug })}
                      setRef={(el) => {
                        linkRefs.current[project.slug] = el;
                      }}
                    />
                  </m.div>
                );
              })}
            </AnimatePresence>
          </div>

          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <ProjectRail project={active} />
            </div>
          </aside>
        </div>

        <div className="lg:hidden">
          <ProjectRail project={active} compact />
        </div>
      </div>
    </LazyMotion>
  );
}

function ProjectGalleryCard({
  project,
  isActive,
  onActivate,
  setRef,
}: {
  project: Product & { slug: string };
  isActive: boolean;
  onActivate: () => void;
  setRef: (el: HTMLAnchorElement | null) => void;
}) {
  const reduceMotion = useReducedMotion();
  const shared = !reduceMotion;

  return (
    <Link
      href={`/projects/${project.slug}`}
      ref={setRef}
      onMouseEnter={onActivate}
      onFocus={onActivate}
      className={cn(
        "group block overflow-hidden rounded-2xl border bg-card/60 backdrop-blur-sm transition-all",
        "hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/5",
        isActive ? "border-primary/40 ring-1 ring-primary/20" : "border-border/50 hover:border-primary/25"
      )}
      aria-current={isActive ? "true" : undefined}
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <m.div
          layoutId={shared ? `project-cover-${project.slug}` : undefined}
          className="absolute inset-0"
        >
          <Image
            src={project.thumbnail}
            alt={project.title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            priority={isActive}
          />
        </m.div>
        <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/30 to-transparent" />

        <div className="absolute left-4 right-4 bottom-4 flex items-end justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              {(project.categories || []).slice(0, 2).map((c) => (
                <Badge
                  key={c}
                  variant="secondary"
                  className="border border-border/50 bg-background/70 px-2 py-0.5 text-[11px] font-medium"
                >
                  {categoryLabels[c]}
                </Badge>
              ))}
              {project.status && (
                <span className="rounded-full bg-background/70 px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                  {statusLabels[project.status]}
                </span>
              )}
            </div>
            <m.div layoutId={shared ? `project-title-${project.slug}` : undefined}>
              <div className="mt-2 truncate text-lg font-semibold tracking-tight">
                {project.title}
              </div>
            </m.div>
          </div>
          <div className="shrink-0 rounded-full bg-primary/10 p-2 text-primary transition-colors group-hover:bg-primary/15">
            <ArrowRight className="h-4 w-4" />
          </div>
        </div>
      </div>

      <div className="p-4">
        <p className="text-sm text-muted-foreground line-clamp-2">{project.description}</p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {project.stack?.slice(0, 4).map((t) => (
            <span key={t} className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground">
              {t}
            </span>
          ))}
          {project.stack && project.stack.length > 4 && (
            <span className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground">
              +{project.stack.length - 4}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

function ProjectRail({ project, compact = false }: { project: (Product & { slug?: string }) | undefined; compact?: boolean }) {
  const reduceMotion = useReducedMotion();

  if (!project) return null;

  const when = formatStartDate(project.startDate);
  const title = project.title;
  const description = project.description;
  const tags = (project.categories || []).map((c) => categoryLabels[c]);
  const highlights = toStableListItems(
    (project.caseStudy?.results ?? []).slice(0, 3),
    project.slug ?? project.title
  );

  const Shell = reduceMotion ? "div" : (m.div as unknown as "div");
  const shellKey = project.slug ?? project.title;

  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-border/50 bg-card/60 backdrop-blur-sm",
        compact ? "" : "shadow-sm"
      )}
    >
      <div className={cn("relative", compact ? "aspect-[16/9]" : "aspect-[16/10]")}>
        <Image
          src={project.thumbnail}
          alt={`${title} preview`}
          fill
          className="object-cover"
          sizes={compact ? "100vw" : "380px"}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/30 to-transparent" />
      </div>

      <div className="p-5 space-y-4">
        <Shell
          key={shellKey}
          {...(!reduceMotion
            ? {
                initial: { opacity: 0, y: 8 },
                animate: { opacity: 1, y: 0 },
                transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] },
              }
            : {})}
        >
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              {project.status && (
                <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-foreground">
                  {statusLabels[project.status]}
                </span>
              )}
              {when && (
                <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  {when}
                </span>
              )}
            </div>
            <div className="text-xl font-semibold tracking-tight">{title}</div>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {tags.slice(0, 3).map((t) => (
                <Badge key={t} variant="secondary" className="text-xs">
                  {t}
                </Badge>
              ))}
            </div>
          )}

          {highlights.length > 0 && (
            <div className="rounded-xl border border-primary/15 bg-primary/5 p-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-primary">
                Highlights
              </div>
              <ul className="mt-2 space-y-1.5 text-sm text-foreground">
                {highlights.map((result) => (
                  <li key={result.key} className="flex items-start gap-2">
                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary" />
                    <span>{result.value}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <Link
              href={project.slug ? `/projects/${project.slug}` : "/projects"}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              View case study
              <ArrowRight className="h-4 w-4" />
            </Link>
            {project.demoUrl && (
              <a
                href={project.demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-muted px-4 py-2 text-sm font-medium text-foreground hover:bg-muted/80 transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
                Demo
              </a>
            )}
            {project.sourceUrl && (
              <a
                href={project.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-muted px-4 py-2 text-sm font-medium text-foreground hover:bg-muted/80 transition-colors"
              >
                <Github className="h-4 w-4" />
                Source
              </a>
            )}
          </div>
        </Shell>
      </div>
    </div>
  );
}
