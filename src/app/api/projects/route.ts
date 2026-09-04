import { withRateLimit } from "@/lib/with-rate-limit";
import { RATE_LIMITS } from "@/lib/rate-limit";
import { listProjects, toPublicProject } from "@/lib/project-catalogue";
import { apiSuccess } from "@/lib/api-response";

const handleGet = async () => {
  const projects = listProjects().map(toPublicProject);

  return apiSuccess(
    { count: projects.length, projects },
    {
      headers: {
        "Cache-Control": "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400",
      },
    }
  );
};

export const GET = withRateLimit(handleGet, RATE_LIMITS.PUBLIC);

