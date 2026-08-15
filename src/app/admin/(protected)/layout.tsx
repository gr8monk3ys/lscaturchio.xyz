import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession, isAdminConfigured } from "@/lib/admin/session";

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
