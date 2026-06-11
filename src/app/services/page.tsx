import { permanentRedirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Services",
  description: "Services and engagement details for AI engineering and RAG systems.",
};

export default function ServicesPage() {
  permanentRedirect("/work-with-me#services");
}
