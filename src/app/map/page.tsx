import { permanentRedirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Map",
  description: "A map of the whole garden, grouped by theme.",
};

export default function MapPage() {
  permanentRedirect("/topics");
}
