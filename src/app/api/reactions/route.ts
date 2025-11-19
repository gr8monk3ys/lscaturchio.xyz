import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

interface Reactions {
  likes: number;
  bookmarks: number;
}

interface ReactionData {
  slug: string;
  type: "like" | "bookmark";
}

/**
 * GET /api/reactions?slug=xxx
 * Get reactions (likes and bookmarks) for a specific blog post
 */
export async function GET(req: NextRequest) {
  try {
    const slug = req.nextUrl.searchParams.get("slug");

    if (!slug) {
      return NextResponse.json({ error: "Slug is required" }, { status: 400 });
    }

    const supabase = getSupabase();

    // Get reactions from database
    const { data, error } = await supabase
      .from("reactions")
      .select("likes, bookmarks")
      .eq("slug", slug)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error("[Reactions] Database error:", error);
      return NextResponse.json(
        { error: "Failed to fetch reactions" },
        { status: 500 }
      );
    }

    const reactions: Reactions = data || { likes: 0, bookmarks: 0 };
    return NextResponse.json({ slug, ...reactions });
  } catch (error) {
    console.error("[Reactions] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch reactions" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/reactions
 * Add a reaction (like or bookmark) to a blog post
 */
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

    const supabase = getSupabase();

    // Get current reactions
    const { data: currentData } = await supabase
      .from("reactions")
      .select("likes, bookmarks")
      .eq("slug", slug)
      .single();

    const current = currentData || { likes: 0, bookmarks: 0 };

    // Increment the appropriate counter
    const newReactions = {
      slug,
      likes: type === "like" ? current.likes + 1 : current.likes,
      bookmarks: type === "bookmark" ? current.bookmarks + 1 : current.bookmarks,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("reactions")
      .upsert(newReactions, { onConflict: 'slug' })
      .select("likes, bookmarks")
      .single();

    if (error) {
      console.error("[Reactions] Upsert error:", error);
      return NextResponse.json(
        { error: "Failed to record reaction" },
        { status: 500 }
      );
    }

    return NextResponse.json({ slug, ...data });
  } catch (error) {
    console.error("[Reactions] Error:", error);
    return NextResponse.json(
      { error: "Failed to record reaction" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/reactions?slug=xxx&type=like
 * Remove a reaction (for toggle functionality)
 */
export async function DELETE(req: NextRequest) {
  try {
    const slug = req.nextUrl.searchParams.get("slug");
    const type = req.nextUrl.searchParams.get("type") as "like" | "bookmark" | null;

    if (!slug || !type) {
      return NextResponse.json({ error: "Slug and type are required" }, { status: 400 });
    }

    if (type !== "like" && type !== "bookmark") {
      return NextResponse.json({ error: "Type must be 'like' or 'bookmark'" }, { status: 400 });
    }

    const supabase = getSupabase();

    // Get current reactions
    const { data: currentData } = await supabase
      .from("reactions")
      .select("likes, bookmarks")
      .eq("slug", slug)
      .single();

    const current = currentData || { likes: 0, bookmarks: 0 };

    // Decrement the appropriate counter (min 0)
    const newReactions = {
      slug,
      likes: type === "like" ? Math.max(0, current.likes - 1) : current.likes,
      bookmarks: type === "bookmark" ? Math.max(0, current.bookmarks - 1) : current.bookmarks,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("reactions")
      .upsert(newReactions, { onConflict: 'slug' })
      .select("likes, bookmarks")
      .single();

    if (error) {
      console.error("[Reactions] Upsert error:", error);
      return NextResponse.json(
        { error: "Failed to remove reaction" },
        { status: 500 }
      );
    }

    return NextResponse.json({ slug, ...data });
  } catch (error) {
    console.error("[Reactions] Error:", error);
    return NextResponse.json(
      { error: "Failed to remove reaction" },
      { status: 500 }
    );
  }
}
