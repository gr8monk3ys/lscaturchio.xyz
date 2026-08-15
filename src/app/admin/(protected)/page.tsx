import Link from "next/link";

const SECTIONS = [
  { href: "/admin/posts", title: "Blog posts", blurb: "Write a new post or edit an existing one." },
  { href: "/admin/photos", title: "Photos", blurb: "Upload photos to the gallery." },
  { href: "/admin/now", title: "Now page", blurb: "Update location, projects, and current thinking." },
  { href: "/admin/links", title: "Links", blurb: "Curate the links and resources page." },
];

export default function AdminDashboard() {
  return (
    <main>
      <h1 className="text-2xl font-bold">What are you publishing?</h1>
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {SECTIONS.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className="rounded-md border border-border bg-card p-6 transition-colors hover:border-primary"
          >
            <h2 className="font-semibold">{s.title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{s.blurb}</p>
          </Link>
        ))}
      </div>
      <p className="mt-8 text-sm text-muted-foreground">
        Publishing commits to the repository; Vercel deploys the change in about two minutes.
      </p>
    </main>
  );
}
