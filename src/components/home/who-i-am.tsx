import Link from "next/link";
import { LedgerHead, LedgerSection } from "@/components/ui/ledger-section";
import { PERSONAL_FAVORITES } from "@/constants/favorites";

export function WhoIAm() {
  return (
    <LedgerSection
      head={
        <>
          <LedgerHead
            index="03"
            eyebrow="Who I am"
            title="The rest of it."
            description="Southern California. Absurdism, film as a way of thinking, and music made at home. I climb, run, and surf badly enough to keep enjoying it."
          />
          <Link
            href="/about"
            prefetch={false}
            className="label-mono mt-8 inline-block text-foreground underline-offset-4 hover:text-primary hover:underline"
          >
            More about me →
          </Link>
        </>
      }
    >
      <dl className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
        {PERSONAL_FAVORITES.slice(0, 8).map((item) => (
          <div key={item.label} className="border-b border-border pb-3">
            <dt className="label-mono">{item.label}</dt>
            <dd className="mt-1 text-sm text-foreground">{item.value}</dd>
          </div>
        ))}
      </dl>
    </LedgerSection>
  );
}
