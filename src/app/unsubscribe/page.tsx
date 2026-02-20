import type { Metadata } from "next";
import { ogCardUrl } from "@/lib/seo";
import { UnsubscribePageClient } from "@/components/pages/unsubscribe-page-client";

export const metadata: Metadata = {
  title: "Unsubscribe",
  description:
    "Manage your newsletter preferences and unsubscribe from Lorenzo Scaturchio email updates.",
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: "Unsubscribe | Lorenzo Scaturchio",
    description: "Manage your newsletter subscription preferences.",
    images: [
      {
        url: ogCardUrl({
          title: "Newsletter",
          description: "Subscription preferences",
          type: "default",
        }),
        width: 1200,
        height: 630,
      },
    ],
  },
};

export default function UnsubscribePage() {
  return <UnsubscribePageClient />;
}
