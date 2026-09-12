import Link from "next/link";
import Image from "next/image";
import { formatDate } from "@/lib/formatDate";
import type { BlogStage } from "@/lib/blog-stage";
import { StageBadge } from "@/components/blog/stage-badge";

interface BlogCardProps {
  slug: string;
  title: string;
  description: string;
  date: string;
  image: string;
  tags: string[];
  priority?: boolean;
  stage?: BlogStage;
}

/**
 * Gallery card: the cover is a framed plate; below it a mono wall-label
 * (date + tags), the Fraunces title, and the dek. No card chrome — the
 * pieces hang on the paper and the whole thing is one hover target.
 */
export function BlogCard({
  slug,
  title,
  description,
  date,
  image,
  tags,
  priority = false,
  stage,
}: BlogCardProps) {
  const label = [formatDate(date), ...tags.slice(0, 2)].join("  ·  ");

  return (
    <Link href={`/blog/${slug}`} prefetch={false} className="group block h-full">
      <article className="flex h-full flex-col">
        <div className="relative aspect-[3/2] w-full overflow-hidden border border-border">
          <Image
            src={image || "/images/blog/default.webp"}
            alt={title}
            fill
            quality={65}
            priority={priority}
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 30vw"
          />
        </div>
        <span className="label-mono mt-4 block">
          {label}
          {stage ? (
            <>
              {"  ·  "}
              <StageBadge stage={stage} />
            </>
          ) : null}
        </span>
        {/* `text-card-title`, the same step the index rows use. This was
          `text-xl font-semibold tracking-tight` — a self-invented scale in
          the body voice, with a tracking override on top, for the archive
          view of the same essays. `display-scale-outside-ramp` only fires
          from `text-2xl` up, so both this and the index's 16px spans sat
          one step under every rule. */}
        <h2 className="text-card-title mt-2 line-clamp-2 transition-colors group-hover:text-primary">
          {title}
        </h2>
        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      </article>
    </Link>
  );
}
