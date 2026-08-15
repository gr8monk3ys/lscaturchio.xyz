import { Container } from "@/components/Container";
import { buildPageMetadata } from "@/lib/seo";
import { ExternalLink, Rss } from "lucide-react";
import linksJson from "@/data/links.json";
import type { LinksContent, SectionData } from "@/types/links";

export const metadata = buildPageMetadata({
  title: "Links",
  description: "Curated collection of bookmarks, documentation, indie blogs, and YouTube channels that have shaped my thinking on AI, privacy, and technology.",
  path: "/links",
});

const linksData: LinksContent = linksJson as LinksContent;

const Section = ({ data }: { data: SectionData }) => {
  if (data.links.length === 0) return null;

  return (
    <section className="mb-16">
      <h2 className="text-2xl font-bold">{data.title}</h2>
      <p className="mt-2 text-muted-foreground">{data.description}</p>

      <div className="mt-6 border-t border-border">
        {data.links.map((link) => (
          <a
            key={link.link}
            href={link.link}
            target="_blank"
            rel="noopener noreferrer"
            className="group block border-b border-border py-4 transition-colors"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h3 className="mb-1 flex items-center gap-2 text-lg font-semibold transition-colors group-hover:text-primary">
                  {link.title}
                  <ExternalLink className="size-4 opacity-0 transition-opacity group-hover:opacity-100" />
                  {link.rss && (
                    <span title="RSS Feed Available">
                      <Rss className="size-4 text-primary" aria-label="RSS Feed Available" />
                    </span>
                  )}
                </h3>
                <p className="text-sm text-muted-foreground">{link.linkDescription}</p>
              </div>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
};

export default function LinksPage() {
  return (
    <Container size="large">
      <div className="max-w-4xl mx-auto py-12">
        <header className="mb-12">
          <span className="label-mono block">Garden · Bookmarks</span>
          <h1 className="mt-4 text-4xl md:text-5xl font-bold tracking-tight">
            Links &amp; Resources
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
            A curated collection of documentation, indie blogs, and YouTube channels that have shaped
            my thinking. Consider this my digital bookshelf.
          </p>
          <hr className="gallery-rule mt-8" />
        </header>

        {Object.entries(linksData).map(([id, data]) => (
          <Section key={id} data={data} />
        ))}

        <div className="mt-8 border-t border-border pt-6">
          <span className="label-mono block">About This Page</span>
          <p className="mt-3 text-muted-foreground">
            This list is constantly evolving. I add things as I discover them and remove things that no longer
            resonate. If you have suggestions for resources I should check out, feel free to reach out. I&apos;m
            always looking for new rabbit holes to fall into.
          </p>
        </div>
      </div>
    </Container>
  );
}
