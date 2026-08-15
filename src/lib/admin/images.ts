import sharp from "sharp";

/**
 * Normalize an uploaded image for the site: webp q85, max 1920px wide (the
 * same recipe the manual cwebp workflow used), plus the gallery's aspect
 * bucket derived from the final dimensions.
 */
export async function toWebp(
  input: Buffer
): Promise<{ data: Buffer; aspectRatio: "square" | "portrait" | "landscape" }> {
  const { data, info } = await sharp(input)
    .resize({ width: 1920, withoutEnlargement: true })
    .webp({ quality: 85 })
    .toBuffer({ resolveWithObject: true });
  const ratio = info.width / info.height;
  const aspectRatio = ratio > 1.15 ? "landscape" : ratio < 0.87 ? "portrait" : "square";
  return { data, aspectRatio };
}
