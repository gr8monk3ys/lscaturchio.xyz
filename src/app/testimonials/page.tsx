import { permanentRedirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Testimonials | Lorenzo Scaturchio",
  description: "Client and collaborator feedback for project work with Lorenzo Scaturchio.",
};

export default function TestimonialsPage() {
  permanentRedirect("/work-with-me#testimonials");
}
