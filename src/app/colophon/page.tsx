import Link from "next/link";
import { buildPageMetadata } from "@/lib/seo";
import { Container } from "@/components/Container";
import { Heading } from "@/components/Heading";
import { Paragraph } from "@/components/Paragraph";

export const metadata = buildPageMetadata({
  title: "Colophon",
  description:
    "What this site runs on, why those choices, and what the garden staging means.",
  path: "/colophon",
});

const STACK = [
  { label: "Framework", value: "Next.js 16, App Router, React 19" },
  { label: "Language", value: "TypeScript, strict, no any" },
  { label: "Styling", value: "Tailwind CSS 4" },
  { label: "Database", value: "Neon Postgres with pgvector" },
  { label: "Hosting", value: "Vercel" },
  { label: "Package manager", value: "Bun" },
  { label: "Search", value: "Hybrid — vector plus keyword, fused by rank" },
  { label: "Comments", value: "Not open yet" },
];

const STAGES = [
  { label: "Seedling", value: "A thought I am still having. Expect to disagree with it later." },
  { label: "Budding", value: "The argument holds, the edges do not." },
  { label: "Evergreen", value: "I stand behind this and keep it current." },
];

export default function ColophonPage() {
  return (
    <Container size="large">
      <div className="py-10">
        <header>
          <span className="label-mono block">Colophon</span>
          <Heading className="mt-4 font-bold text-4xl md:text-5xl tracking-tight">
            How this is built.
          </Heading>
          <Paragraph className="mt-4 max-w-2xl text-muted-foreground">
            A living page, kept current. The long version — every decision and the
            reasoning behind it — is in{" "}
            <Link
              href="/blog/how-i-built-this-site"
              className="text-primary underline underline-offset-4"
            >
              the post
            </Link>
            , which is dated and will age. This will not.
          </Paragraph>
          <hr className="gallery-rule mt-8" />
        </header>

        <section className="mt-10" aria-labelledby="stack">
          <h2 id="stack" className="label-mono">The stack</h2>
          <dl className="mt-5 grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
            {STACK.map((row) => (
              <div key={row.label} className="border-b border-border pb-3">
                <dt className="label-mono">{row.label}</dt>
                <dd className="mt-1 text-sm text-foreground">{row.value}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="mt-14" aria-labelledby="search">
          <h2 id="search" className="label-mono">Why the search works the way it does</h2>
          <Paragraph className="mt-4 max-w-2xl text-muted-foreground">
            Every essay is chunked, embedded, and stored in Postgres. A query runs
            two searches at once — one over the embeddings for meaning, one over the
            text for wording — and the two ranked lists are fused. Pure vector search
            misses a post when you remember the exact phrase; pure keyword search
            misses it when you only remember the idea. Each result on the{" "}
            <Link href="/lab" className="text-primary underline underline-offset-4">
              lab page
            </Link>{" "}
            says which half caught it.
          </Paragraph>
        </section>

        <section className="mt-14" aria-labelledby="stages">
          <h2 id="stages" className="label-mono">What the stages mean</h2>
          <Paragraph className="mt-4 max-w-2xl text-muted-foreground">
            Posts carry a stage instead of pretending every piece arrived finished.
            A digital garden grows unevenly; the label says how much weight to put
            on a given piece.
          </Paragraph>
          <dl className="mt-5 space-y-4">
            {STAGES.map((row) => (
              <div key={row.label} className="border-b border-border pb-3">
                <dt className="label-mono">{row.label}</dt>
                <dd className="mt-1 max-w-2xl text-sm text-muted-foreground">{row.value}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="mt-14" aria-labelledby="principles">
          <h2 id="principles" className="label-mono">Rules I kept</h2>
          <ul className="mt-5 space-y-3 text-muted-foreground">
            <li className="border-b border-border pb-3">
              No stock photography passed off as my own. The photography page stays
              empty until there are real photographs on it.
            </li>
            <li className="border-b border-border pb-3">
              No metric without a method. If a number cannot be sourced it does not
              go on the page.
            </li>
            <li className="border-b border-border pb-3">
              Nothing ships that has not been run. Rendered, not read.
            </li>
          </ul>
        </section>
      </div>
    </Container>
  );
}
