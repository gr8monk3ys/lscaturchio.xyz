import { PostEditor } from "@/components/admin/post-editor";

export default function AdminNewPostPage() {
  return (
    <main>
      <h1 className="mb-6 text-page-title">New post</h1>
      <PostEditor />
    </main>
  );
}
