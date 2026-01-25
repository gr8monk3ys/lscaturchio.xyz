import { Metadata } from "next";
import { SecretPageContent } from "./secret-page-content";

export const metadata: Metadata = {
  title: "Secret Page",
  description: "You found the secret page! Here are some hidden goodies.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function SecretPage() {
  return <SecretPageContent />;
}
