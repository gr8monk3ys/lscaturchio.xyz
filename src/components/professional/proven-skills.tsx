import Link from "next/link";

import { listProvenSkills } from "@/lib/project-catalogue";
import { spellCountLower } from "@/lib/spell-count";

/** How many projects to name before the row starts counting instead. */
const NAMED_LIMIT = 3;

/**
 * The tools, each beside the work that proves it.
 *
 * This replaces four hand-typed columns of thirty-one tool names. The list is
 * derived from the project catalogue's `stack` fields, so it cannot claim a
 * tool no project uses — nine of the thirty-one were exactly that — and cannot
 * fall behind the catalogue either. A short row is a weaker claim than a long
 * one, and showing that is the point.
 *
 * One link per row, on the tool, pointing at the catalogue filtered to it. The
 * first version linked each project name instead, which put up to three 19px
 * targets in every row — fifty-four controls under WCAG 2.5.8's 24px floor on
 * one page, the largest count anywhere on the site. The tool is also the better
 * target: it is what the row is about, and `/projects?tech=` already filters.
 */
export function ProvenSkills() {
  const skills = listProvenSkills();
  // Derived, not typed. A literal here is the /books "three books" bug: the
  // sentence was true when it was written and the data moved underneath it.
  const projectCount = new Set(
    skills.flatMap((skill) => skill.usedIn.map((project) => project.slug))
  ).size;

  return (
    <section>
      <h2 className="text-section-title">Tools, and where they were used</h2>
      <p className="mt-4 max-w-2xl text-muted-foreground">
        Derived from the {spellCountLower(projectCount)} projects in the
        catalogue rather than typed out here, so nothing on this list is a tool
        I have not shipped something with. What sits beside each row is the
        evidence for it, and a short row is a weaker claim than a long one.
      </p>

      <ul className="mt-8 grid grid-cols-1 gap-x-12 border-t border-border md:grid-cols-2">
        {skills.map((skill) => {
          const named = skill.usedIn.slice(0, NAMED_LIMIT);
          const remaining = skill.usedIn.length - named.length;
          const evidence = named.map((project) => project.title).join(" · ");

          return (
            <li key={skill.name} className="border-b border-border">
              <Link
                href={`/projects?tech=${encodeURIComponent(skill.name)}`}
                prefetch={false}
                className="label-link flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 py-4 underline-offset-4 transition-colors hover:text-primary"
              >
                <span className="text-foreground">{skill.name}</span>
                <span className="label-mono normal-case tracking-normal">
                  {evidence}
                  {remaining > 0 && ` +${remaining}`}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
