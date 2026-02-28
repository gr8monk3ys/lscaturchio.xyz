import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { formatDate } from "@/lib/formatDate";

interface BlogCardProps {
  slug: string;
  title: string;
  description: string;
  date: string;
  image: string;
  tags: string[];
}

export function BlogCard({ slug, title, description, date, image, tags }: BlogCardProps) {
  return (
    <Link href={`/blog/${slug}`} className="block h-full">
      <Card className="flex h-full cursor-pointer flex-col overflow-hidden group transition-transform duration-200 hover:-translate-y-1">
        <div className="relative h-48 w-full overflow-hidden rounded-t-2xl">
          <Image
            src={image || "/images/blog/default.webp"}
            alt={title}
            fill
            quality={65}
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 30vw"
          />
        </div>
        <CardHeader>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
          <CardTitle className="line-clamp-2">{title}</CardTitle>
          <CardDescription className="flex items-center gap-3">
            <time dateTime={date}>{formatDate(date)}</time>
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-grow">
          <p className="line-clamp-3 text-muted-foreground">{description}</p>
        </CardContent>
      </Card>
    </Link>
  );
}
