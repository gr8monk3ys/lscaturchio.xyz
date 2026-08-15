import { PhotosUploader } from "@/components/admin/photos-uploader";

export default function AdminPhotosPage() {
  return (
    <main>
      <h1 className="mb-2 text-2xl font-bold">Photos</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Uploads are converted to webp (q85, max 1920px) and committed together with their
        gallery entries.
      </p>
      <PhotosUploader />
    </main>
  );
}
