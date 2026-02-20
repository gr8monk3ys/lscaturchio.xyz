import { permanentRedirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Roadmap | Lorenzo Scaturchio",
  description: "Current priorities and shipping roadmap for lscaturchio.xyz.",
};

export default function RoadmapPage() {
  permanentRedirect("/changelog#roadmap");
}
