import { getAllBlogs } from "../../../../lib/getAllBlogs";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const blogs = await getAllBlogs();
    const recentBlogs = blogs
      .slice(0, 3)
      .map((blog) => ({
        slug: blog.slug,
        title: blog.title,
        description: blog.description,
        date: blog.date,
        image: blog.image,
        tags: blog.tags,
      }));
    
    return NextResponse.json(recentBlogs);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: `Failed to fetch blogs: ${errorMessage}` },
      { status: 500 }
    );
  }
}
