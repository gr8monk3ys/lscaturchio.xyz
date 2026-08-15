import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession, isAdminConfigured } from "@/lib/admin/session";

// Session-gated pages must never be prerendered: at build time the env may be
// absent (static "not configured" shells would be baked in) and the gate
// depends on request cookies either way.
export const dynamic = "force-dynamic";

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!isAdminConfigured()) redirect("/admin/login");
  const session = await getServerSession();
  if (!session) redirect("/admin/login");

  return (
    <div>
      <header className="mb-8 flex items-center justify-between border-b border-border pb-4">
        <Link href="/admin" className="font-semibold">
          Admin
        </Link>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>{session.login}</span>
          <form method="post" action="/api/admin/auth/logout">
            <button type="submit" className="underline">
              Sign out
            </button>
          </form>
        </div>
      </header>
      {children}
    </div>
  );
}
