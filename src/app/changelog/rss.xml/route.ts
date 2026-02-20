import { Feed } from "feed";
import { CHANGELOG } from "@/constants/changelog";
import { getSiteUrl } from "@/lib/site-url";

export async function GET() {
  const siteUrl = getSiteUrl();
  const now = new Date();

  const feed = new Feed({
    title: "lscaturchio.xyz Changelog",
    description: "Updates, improvements, and fixes to lscaturchio.xyz.",
    id: `${siteUrl}/changelog`,
    link: `${siteUrl}/changelog`,
    language: "en",
    image: `${siteUrl}/og-image.webp`,
    favicon: `${siteUrl}/favicon.ico`,
    copyright: `All rights reserved ${now.getFullYear()}, Lorenzo Scaturchio`,
    updated: now,
    feedLinks: {
      rss: `${siteUrl}/changelog/rss.xml`,
    },
    author: {
      name: "Lorenzo Scaturchio",
      email: "lorenzo@lscaturchio.xyz",
      link: siteUrl,
    },
  });

  for (const entry of CHANGELOG) {
    const anchor = `v-${entry.version.replace(/\./g, "-")}`;
    const url = `${siteUrl}/changelog#${anchor}`;

    const changesHtml = `<ul>${entry.changes
      .map((c) => `<li><strong>${c.type}:</strong> ${c.text}</li>`)
      .join("")}</ul>`;

    feed.addItem({
      title: `Version ${entry.version}`,
      id: url,
      link: url,
      description: entry.changes.find((c) => c.type === "highlight")?.text ?? "Site update",
      content: changesHtml,
      date: new Date(entry.date),
      published: new Date(entry.date),
    });
  }

  return new Response(feed.rss2(), {
    headers: {
      "Content-Type": "application/xml;charset=utf-8",
    },
  });
}
