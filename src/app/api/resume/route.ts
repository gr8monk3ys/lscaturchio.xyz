import { NextRequest, NextResponse } from "next/server";
import { readFileSync, existsSync } from "fs";
import { join } from "path";
import { validateCsrf } from "@/lib/csrf";
import { logInfo, logError } from "@/lib/logger";
import { withRateLimit, RATE_LIMITS } from "@/lib/with-rate-limit";

// Resume file path - stored in public directory
const RESUME_FILENAME = "Lorenzo_Scaturchio_Resume.pdf";
const LEGACY_FILENAME = "Lorenzo_resume_DS.pdf";

/**
 * GET /api/resume
 * Serves the PDF resume file with proper headers for download
 */
export async function GET() {
  try {
    // Try the new filename first, then fall back to legacy
    let resumePath = join(process.cwd(), "public", RESUME_FILENAME);
    let filename = RESUME_FILENAME;

    if (!existsSync(resumePath)) {
      // Try legacy filename
      resumePath = join(process.cwd(), "public", LEGACY_FILENAME);
      filename = LEGACY_FILENAME;

      if (!existsSync(resumePath)) {
        logError("Resume: File not found", null, {
          component: "resume",
          action: "GET",
          paths: [RESUME_FILENAME, LEGACY_FILENAME],
        });

        return NextResponse.json(
          { error: "Resume file not found" },
          { status: 404 }
        );
      }
    }

    // Read the PDF file and convert to Uint8Array for NextResponse compatibility
    const fileBuffer = readFileSync(resumePath);
    const uint8Array = new Uint8Array(fileBuffer);

    // Return the PDF with appropriate headers
    return new NextResponse(uint8Array, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": fileBuffer.length.toString(),
        "Cache-Control": "public, max-age=3600", // Cache for 1 hour
      },
    });
  } catch (error) {
    logError("Resume: Unexpected error serving file", error, {
      component: "resume",
      action: "GET",
    });

    return NextResponse.json(
      { error: "Failed to serve resume" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/resume
 * Track resume downloads (optional analytics)
 */
const handlePost = async (req: NextRequest) => {
  const csrfError = validateCsrf(req);
  if (csrfError) return csrfError;

  try {
    const body = await req.json();

    if (body.action === "track") {
      // Log download for analytics
      logInfo("Resume: Download tracked", {
        component: "resume",
        action: "download",
        timestamp: new Date().toISOString(),
        userAgent: req.headers.get("user-agent") || "unknown",
      });

      // Optionally: Increment counter in Neon PostgreSQL
      // const sql = getDb();
      // await sql`SELECT increment_resume_downloads()`;

      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { error: "Invalid action" },
      { status: 400 }
    );
  } catch (error) {
    logError("Resume: Error tracking download", error, {
      component: "resume",
      action: "POST",
    });

    return NextResponse.json(
      { error: "Failed to track download" },
      { status: 500 }
    );
  }
};

export const POST = withRateLimit(handlePost, RATE_LIMITS.STANDARD);
