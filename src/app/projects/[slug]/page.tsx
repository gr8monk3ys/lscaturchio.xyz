import { Container } from "@/components/Container";
import { SingleProduct } from "@/components/projects/Product";
import { findProject, listRoutableProjects } from "@/lib/project-catalogue";

import { Metadata } from "next";
import { redirect } from "next/navigation";
import { buildProjectMetadata } from "@/lib/seo";

type Props = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams(): Array<{ slug: string }> {
  return listRoutableProjects().map((project) => ({ slug: project.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = findProject(slug);
  if (product) {
    return buildProjectMetadata(
      {
        title: product.title,
        description: product.description,
      },
      `/projects/${slug}`,
    );
  } else {
    return {
      title: "Projects | Lorenzo Scaturchio",
      description:
        "Project case studies, experiments, and product builds across AI systems, automation, and web applications.",
    };
  }
}

export default async function SingleProjectPage({
  params,
}: Props) {
  const { slug } = await params;
  const product = findProject(slug);

  if (!product) {
    redirect("/projects");
  }
  return (
    <Container>
      <SingleProduct product={product} />
    </Container>
  );
}
