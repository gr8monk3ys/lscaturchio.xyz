import { PostEditor } from "@/components/admin/post-editor";

export default function AdminNewPostPage() {
  return (
    <main>
      <h1 className="mb-6 text-2xl font-bold">New post</h1>
      <PostEditor />
    </main>
  );
}
