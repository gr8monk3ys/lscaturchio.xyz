import { isAdminConfigured } from "@/lib/admin/session";

const ERROR_MESSAGES: Record<string, string> = {
  state: "The sign-in attempt expired or was tampered with. Try again.",
  denied: "That GitHub account is not allowed to use this portal.",
  exchange: "GitHub sign-in failed. Try again.",
  unconfigured: "The portal is not configured on this deployment.",
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  if (!isAdminConfigured()) {
    return (
      <main>
        <h1 className="text-2xl font-bold">Admin</h1>
        <p className="mt-4 text-muted-foreground">
          The portal is not configured on this deployment. Set the admin environment
          variables (see .env.example) to enable it.
        </p>
      </main>
    );
  }

  return (
    <main>
      <h1 className="text-2xl font-bold">Admin</h1>
      {error && (
        <p className="mt-4 text-sm text-red-600 dark:text-red-400">
          {ERROR_MESSAGES[error] || "Sign-in failed."}
        </p>
      )}
      <p className="mt-4 text-muted-foreground">
        Sign in to publish posts, photos, and page updates. Changes are committed to the
        repository and deploy automatically.
      </p>
      <a
        href="/api/admin/auth/login"
        className="mt-6 inline-block rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
      >
        Sign in with GitHub
      </a>
    </main>
  );
}
