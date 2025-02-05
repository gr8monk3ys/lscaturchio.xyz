import { getAllBlogs } from "../../../../lib/getAllBlogs";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const blogs = await getAllBlogs();
    const recentBlogs = blogs
      .slice(0, 3)
      .map(({ component, ...meta }) => meta);
    
    return NextResponse.json(recentBlogs);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch blogs" },
      { status: 500 }
    );
  }
}
