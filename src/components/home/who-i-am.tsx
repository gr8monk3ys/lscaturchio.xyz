import Link from "next/link";
import { PlateHead } from "@/components/home/plate-head";
import { PERSONAL_FAVORITES } from "@/constants/favorites";

export function WhoIAm() {
  return (
    <section className="plate-grid w-full border-b border-rule lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
      <div className="plate-cell py-10 md:py-14">
        <PlateHead
          index="03"
          eyebrow="Who I am"
          title="The rest of it."
          description="Southern California. Absurdism, film as a way of thinking, and music made at home. I climb, run, and surf badly enough to keep enjoying it."
        />
        <Link
          href="/about"
          prefetch={false}
          className="label-mono label-link mt-8 inline-block text-foreground ink-underline hover:text-primary"
        >
          More about me <span aria-hidden="true">→</span>
        </Link>
      </div>

      {/* The facts, a ruled cell each. */}
      <dl className="plate-grid grid-cols-1 sm:grid-cols-2">
        {PERSONAL_FAVORITES.slice(0, 8).map((item) => (
          <div key={item.label} className="plate-cell sm:last:odd:col-span-2">
            <dt className="label-mono">{item.label}</dt>
            <dd className="text-lede mt-1 text-foreground">{item.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
