import { Container } from "@/components/Container";
import { Metadata } from "next";
import { ExternalLink, Shield, BookOpen, Globe, Code, Youtube, Rss } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Links | Lorenzo Scaturchio",
  description:
    "Curated collection of bookmarks, documentation, indie blogs, and YouTube channels that have shaped my thinking on AI, privacy, and technology.",
};

interface LinkData {
  title: string;
  link: string;
  linkDescription: string;
  rss?: string;
}

interface SectionData {
  title: string;
  description: string;
  links: LinkData[];
}

const linksData: Record<string, SectionData> = {
  privacy: {
    title: "Digital Privacy Resources",
    description: "Resources I have specifically used to educate myself on digital rights and tools to mitigate risk.",
    links: []
  },
  docs: {
    title: "Favorite Documentation",
    description: "Documentation that I find to be insanely good.",
    links: [
      {
        title: "Arch Wiki",
        link: "https://wiki.archlinux.org/title/Main_page",
        linkDescription: "Duh"
      },
      {
        title: "C++ Reference",
        link: "https://cplusplus.com/reference/",
        linkDescription: "Comprehensive C++ standard library reference"
      },
      {
        title: "Rust Programming Language",
        link: "https://doc.rust-lang.org/stable/book/",
        linkDescription: "Actually GOATED"
      },
      {
        title: "HTMX",
        link: "https://htmx.org/",
        linkDescription: "REST APIs without direct JavaScript - it is written in JavaScript though"
      },
      {
        title: "LangChain",
        link: "https://python.langchain.com/docs/introduction/",
        linkDescription: "Used this documentation a lot for my applications, the one I have had most fun with"
      }
    ]
  },
  indie: {
    title: "Alternative Internet",
    description: "Websites not about any specific topic, but included because I like their writing.",
    links: [
      {
        title: "~bt",
        link: "https://bt.ht/",
        linkDescription: "Fascinating site",
        rss: "https://bt.ht/atom.xml"
      },
      {
        title: "Neel Nanda",
        link: "https://www.neelnanda.io/",
        linkDescription: "A mechanistic interpretability Google DeepMind specialist with really cool tips"
      },
      {
        title: "Ludwig Abap",
        link: "https://ludwigabap.com/",
        linkDescription: "Very insightful and love the way they display their links/bookmarks"
      },
      {
        title: "Cheapskate's Guide",
        link: "https://cheapskatesguide.org/",
        linkDescription: "Shows you don't need a lot of computing power to develop custom applications"
      },
      {
        title: "CozyNet",
        link: "https://www.cozynet.org/",
        linkDescription: "Cozy corner of the internet",
        rss: "https://www.cozynet.org/feed/feed.xml"
      },
      {
        title: "Drew DeVault",
        link: "https://drewdevault.com",
        linkDescription: "Open source advocate and SourceHut creator",
        rss: "https://drewdevault.com/blog/index.xml"
      },
      {
        title: "Jared White",
        link: "https://jaredwhite.com/",
        linkDescription: "Web development and the open web",
        rss: "https://jaredwhite.com/feed.xml"
      },
      {
        title: "Luke Smith",
        link: "https://lukesmith.xyz/",
        linkDescription: "Minimalism, Linux, and based takes",
        rss: "https://lukesmith.xyz/index.xml"
      },
      {
        title: "Manuel Moreale",
        link: "https://manuelmoreale.com/",
        linkDescription: "Thoughtful writing on the web and life",
        rss: "https://manuelmoreale.com/feed/rss"
      }
    ]
  },
  webdev: {
    title: "Web Development",
    description: "Websites and blogs about web development (without the bloat).",
    links: [
      {
        title: "Go Make Things",
        link: "https://gomakethings.com",
        linkDescription: "Vanilla JavaScript and simplicity-first web dev",
        rss: "https://gomakethings.com/feed/index.xml"
      },
      {
        title: "The Spicy Web",
        link: "https://www.spicyweb.dev/",
        linkDescription: "Modern web development with a spicy take",
        rss: "https://www.spicyweb.dev/feed.xml"
      }
    ]
  },
  youtube: {
    title: "YouTube Channels",
    description: "YouTube channels I find within normalcy but some one standard deviation off.",
    links: [
      {
        title: "Andrej Karpathy",
        link: "https://www.youtube.com/@AndrejKarpathy",
        linkDescription: "AI and deep learning insights from one of the pioneers in the field"
      },
      {
        title: "3Blue1Brown",
        link: "https://www.youtube.com/@3blue1brown",
        linkDescription: "Beautifully visualized math concepts and tutorials"
      },
      {
        title: "F.D Signifier",
        link: "https://www.youtube.com/@FDSignifire",
        linkDescription: "Thought-provoking content on culture, politics, and social issues"
      },
      {
        title: "Tor's Cabinet of Curiosities",
        link: "https://www.youtube.com/@torscabinetofcuriosities",
        linkDescription: "Exploring fascinating and obscure subjects with deep dives"
      },
      {
        title: "Eli the Computer Guy",
        link: "https://www.youtube.com/@ElitheComputerGuy",
        linkDescription: "Tech tutorials and practical computing"
      },
      {
        title: "Luke Smith",
        link: "https://www.youtube.com/@LukeSmithxyz",
        linkDescription: "Minimalism, Linux, and self-hosting with a personal touch"
      },
      {
        title: "Louis Rossmann",
        link: "https://www.youtube.com/@rossaborable",
        linkDescription: "Tech repair and right to repair advocacy"
      },
      {
        title: "Coffeezilla",
        link: "https://www.youtube.com/@Coffeezilla",
        linkDescription: "Investigating scams, frauds, and internet grifters"
      },
      {
        title: "Dreams of Code",
        link: "https://www.youtube.com/@dreamsofcode",
        linkDescription: "Coding tutorials and developer productivity"
      },
      {
        title: "Mental Outlaw",
        link: "https://www.youtube.com/@MentalOutlaw",
        linkDescription: "Privacy, Linux, and tech commentary"
      },
      {
        title: "Internet of Bugs",
        link: "https://www.youtube.com/@InternetofBugs",
        linkDescription: "Software engineering perspectives and industry critique"
      },
      {
        title: "NEOPUNKFM",
        link: "https://www.youtube.com/@NEOPUNKFM",
        linkDescription: "Electronic music mixes and cyberpunk culture"
      },
      {
        title: "Professor Skye's Record Review",
        link: "https://www.youtube.com/@ProfessorSkye",
        linkDescription: "In-depth reviews of albums and musical analysis"
      }
    ]
  }
};

const iconMap: Record<string, React.ElementType> = {
  privacy: Shield,
  docs: BookOpen,
  indie: Globe,
  webdev: Code,
  youtube: Youtube
};

const Section = ({ id, data }: { id: string; data: SectionData }) => {
  const Icon = iconMap[id] || Globe;

  if (data.links.length === 0) return null;

  return (
    <section className="mb-16">
      <div className="flex items-center gap-3 mb-3">
        <div className="size-10 rounded-xl neu-flat flex items-center justify-center">
          <Icon className="size-5 text-primary" />
        </div>
        <h2 className="text-2xl font-bold">{data.title}</h2>
      </div>
      <p className="text-muted-foreground mb-6 ml-[52px]">{data.description}</p>

      <div className="grid gap-3">
        {data.links.map((link) => (
          <a
            key={link.link}
            href={link.link}
            target="_blank"
            rel="noopener noreferrer"
            className="group block p-4 rounded-xl neu-card hover:shadow-lg transition-all"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold mb-1 group-hover:text-primary transition-colors flex items-center gap-2">
                  {link.title}
                  <ExternalLink className="size-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  {link.rss && (
                    <span title="RSS Feed Available">
                      <Rss className="size-4 text-orange-500" aria-label="RSS Feed Available" />
                    </span>
                  )}
                </h3>
                <p className="text-sm text-muted-foreground">{link.linkDescription}</p>
              </div>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
};

export default function LinksPage() {
  return (
    <Container size="large">
      <div className="max-w-4xl mx-auto py-12">
        <div className="mb-12">
          <Badge variant="secondary" className="mb-4">Bookmarks</Badge>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Links & Resources
          </h1>
          <p className="text-xl text-muted-foreground">
            A curated collection of documentation, indie blogs, and YouTube channels that have shaped
            my thinking. Consider this my digital bookshelf.
          </p>
        </div>

        {Object.entries(linksData).map(([id, data]) => (
          <Section key={id} id={id} data={data} />
        ))}

        <div className="mt-8 p-6 rounded-xl neu-flat">
          <h3 className="text-xl font-semibold mb-2">About This Page</h3>
          <p className="text-muted-foreground">
            This list is constantly evolving. I add things as I discover them and remove things that no longer
            resonate. If you have suggestions for resources I should check out, feel free to reach out. I&apos;m
            always looking for new rabbit holes to fall into.
          </p>
        </div>
      </div>
    </Container>
  );
}
