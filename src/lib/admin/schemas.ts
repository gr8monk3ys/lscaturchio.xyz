import { z } from "zod";

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD");

export const postPublishSchema = z.object({
  title: z.string().min(1).max(120),
  slug: z
    .string()
    .min(1)
    .max(80)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase-hyphenated"),
  description: z.string().min(1).max(300),
  date: isoDate,
  tags: z.array(z.string().min(1).max(30)).max(10).default([]),
  series: z.string().min(1).max(80).optional(),
  seriesOrder: z.number().int().min(1).max(99).optional(),
  stage: z.enum(["seedling", "budding", "evergreen"]).optional(),
  body: z.string().min(1).max(200_000),
  // Existing cover path, passed through on edits so the cover survives when
  // no new image is uploaded.
  image: z
    .string()
    .regex(/^\/images\/blog\/[a-z0-9-]+\.(webp|png|jpe?g)$/, "Image must be a site-relative blog image path")
    .optional(),
  coverImage: z
    .string()
    .regex(/^data:image\/(png|jpeg|webp);base64,/, "Cover must be a png/jpeg/webp data URL")
    .max(15_000_000)
    .optional(),
  overwrite: z.boolean().default(false),
});
export type PostPublishInput = z.infer<typeof postPublishSchema>;

export const photoEntrySchema = z.object({
  filename: z.string().min(1).max(200),
  category: z.enum(["travel", "nature"]),
  alt: z.string().min(1).max(300),
  camera: z.string().min(1).max(120),
  lens: z.string().min(1).max(120),
  settings: z.string().min(1).max(200),
  recipe: z.string().max(200).optional(),
  location: z.string().max(200).optional(),
  date: isoDate,
});
export type PhotoEntryInput = z.infer<typeof photoEntrySchema>;

export const photoEntriesSchema = z.array(photoEntrySchema).min(1).max(20);

export const nowContentSchema = z.object({
  lastUpdated: isoDate,
  location: z.object({
    label: z.string().min(1).max(120),
    detail: z.string().min(1).max(300),
  }),
  building: z
    .array(
      z.object({
        title: z.string().min(1).max(120),
        href: z.string().min(1).max(300),
        note: z.string().min(1).max(500),
      })
    )
    .max(12),
  thinkingAbout: z.array(z.string().min(1).max(500)).max(12),
});

export const linksContentSchema = z.record(
  z.string().min(1).max(60),
  z.object({
    title: z.string().min(1).max(120),
    description: z.string().min(1).max(500),
    links: z
      .array(
        z.object({
          title: z.string().min(1).max(200),
          link: z.string().url(),
          linkDescription: z.string().min(1).max(500),
          rss: z.string().url().optional(),
        })
      )
      .max(100),
  })
);
