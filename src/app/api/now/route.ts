import { withRateLimit } from "@/lib/with-rate-limit";
import { RATE_LIMITS } from "@/lib/rate-limit";
import { nowData } from "@/lib/now-data";
import { apiSuccess } from "@/lib/api-response";

const handleGet = async () => {
  return apiSuccess(
    {
      generatedAt: new Date().toISOString(),
      now: nowData,
    },
    {
      headers: {
        "Cache-Control": "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400",
      },
    }
  );
};

export const GET = withRateLimit(handleGet, RATE_LIMITS.PUBLIC);

