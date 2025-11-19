import { NextRequest, NextResponse } from "next/server";

// In-memory reaction storage (resets on server restart)
// For production, migrate to Supabase or Redis
interface Reactions {
  likes: number;
  bookmarks: number;
}

const reactionsStore = new Map<string, Reactions>();

interface ReactionData {
  slug: string;
  type: "like" | "bookmark";
}

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("slug");

  if (!slug) {
    return NextResponse.json({ error: "Slug is required" }, { status: 400 });
  }

  const reactions = reactionsStore.get(slug) || { likes: 0, bookmarks: 0 };
  return NextResponse.json({ slug, ...reactions });
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ReactionData;
    const { slug, type } = body;

    if (!slug || typeof slug !== "string") {
      return NextResponse.json({ error: "Valid slug is required" }, { status: 400 });
    }

    if (type !== "like" && type !== "bookmark") {
      return NextResponse.json({ error: "Type must be 'like' or 'bookmark'" }, { status: 400 });
    }

    // Get current reactions or initialize
    const currentReactions = reactionsStore.get(slug) || { likes: 0, bookmarks: 0 };

    // Increment the appropriate counter
    if (type === "like") {
      currentReactions.likes += 1;
    } else {
      currentReactions.bookmarks += 1;
    }

    reactionsStore.set(slug, currentReactions);

    return NextResponse.json({ slug, ...currentReactions });
  } catch (error) {
    console.error("[Reactions] Error:", error);
    return NextResponse.json(
      { error: "Failed to record reaction" },
      { status: 500 }
    );
  }
}

// Remove reaction (for toggle functionality)
export async function DELETE(req: NextRequest) {
  try {
    const slug = req.nextUrl.searchParams.get("slug");
    const type = req.nextUrl.searchParams.get("type") as "like" | "bookmark" | null;

    if (!slug || !type) {
      return NextResponse.json({ error: "Slug and type are required" }, { status: 400 });
    }

    const currentReactions = reactionsStore.get(slug) || { likes: 0, bookmarks: 0 };

    // Decrement the appropriate counter (min 0)
    if (type === "like") {
      currentReactions.likes = Math.max(0, currentReactions.likes - 1);
    } else {
      currentReactions.bookmarks = Math.max(0, currentReactions.bookmarks - 1);
    }

    reactionsStore.set(slug, currentReactions);

    return NextResponse.json({ slug, ...currentReactions });
  } catch (error) {
    console.error("[Reactions] Error:", error);
    return NextResponse.json(
      { error: "Failed to remove reaction" },
      { status: 500 }
    );
  }
}
