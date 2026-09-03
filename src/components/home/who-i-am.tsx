import Link from "next/link";
import { Section } from "@/components/ui/Section";
import { PERSONAL_FAVORITES } from "@/constants/favorites";

export function WhoIAm() {
  return (
    <Section padding="large" size="wide" divider topDivider reveal={false}>
      <div className="grid items-start gap-12 lg:grid-cols-[minmax(280px,360px)_1fr]">
        <div className="lg:sticky lg:top-28">
          <span className="label-mono mb-3 block">03 — Who I am</span>
          <h2 className="text-section-title">The rest of it.</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Southern California. Absurdism, film as a way of thinking, and music made
            at home. I climb, run, and surf badly enough to keep enjoying it.
          </p>
          <Link
            href="/about"
            prefetch={false}
            className="label-mono mt-8 inline-block text-foreground underline-offset-4 hover:text-primary hover:underline"
          >
            More about me →
          </Link>
        </div>

        <dl className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
          {PERSONAL_FAVORITES.slice(0, 8).map((item) => (
            <div key={item.label} className="border-b border-border pb-3">
              <dt className="label-mono">{item.label}</dt>
              <dd className="mt-1 text-sm text-foreground">{item.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </Section>
  );
}
