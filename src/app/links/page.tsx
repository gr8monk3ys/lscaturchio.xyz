import { Container } from "@/components/Container";
import { Metadata } from "next";
import { ExternalLink, BookOpen, Code, Podcast, Video, Newspaper, Globe } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Links | Lorenzo Scaturchio",
  description:
    "Curated collection of resources, tools, articles, and websites that Lorenzo Scaturchio finds valuable. From privacy tools to philosophy, technical blogs to indie music.",
};

const Section = ({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) => (
  <section className="mb-12">
    <div className="flex items-center gap-3 mb-6">
      <div className="size-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
        <Icon className="size-5" />
      </div>
      <h2 className="text-3xl font-bold">{title}</h2>
    </div>
    {children}
  </section>
);

const LinkItem = ({ href, title, description }: { href: string; title: string; description: string }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="group block p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-accent/5 transition-all"
  >
    <div className="flex items-start justify-between gap-4">
      <div className="flex-1 min-w-0">
        <h3 className="text-lg font-semibold mb-1 group-hover:text-primary transition-colors flex items-center gap-2">
          {title}
          <ExternalLink className="size-4 opacity-0 group-hover:opacity-100 transition-opacity" />
        </h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  </a>
);

export default function LinksPage() {
  return (
    <Container size="large">
      <div className="max-w-4xl mx-auto py-12">
        <div className="mb-12">
          <Badge variant="secondary" className="mb-4">Resources</Badge>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Links I Find Valuable
          </h1>
          <p className="text-xl text-muted-foreground">
            A curated collection of resources, tools, articles, and websites that have influenced my thinking
            or that I find myself returning to regularly. Consider this my digital bookshelf.
          </p>
        </div>

        <Section title="Privacy & FOSS" icon={Globe}>
          <div className="space-y-3">
            <LinkItem
              href="https://www.privacyguides.org/"
              title="Privacy Guides"
              description="Comprehensive resource for protecting your data and privacy online. The definitive guide to privacy tools."
            />
            <LinkItem
              href="https://www.eff.org/"
              title="Electronic Frontier Foundation"
              description="Defending civil liberties in the digital world. Essential reading for anyone who cares about internet freedom."
            />
            <LinkItem
              href="https://suckless.org/"
              title="Suckless.org"
              description="Philosophy of simplicity in software. Less bloat, more control. Home of dwm, st, and other minimal tools."
            />
            <LinkItem
              href="https://www.fsf.org/"
              title="Free Software Foundation"
              description="Promoting computer user freedom and defending the rights of all free software users."
            />
            <LinkItem
              href="https://switching.software/"
              title="Switching Software"
              description="Ethical, easy-to-use and privacy-conscious alternatives to well-known software."
            />
          </div>
        </Section>

        <Section title="Technical Blogs & Resources" icon={Code}>
          <div className="space-y-3">
            <LinkItem
              href="https://simonwillison.net/"
              title="Simon Willison's Weblog"
              description="Insightful posts about AI, LLMs, and web development. One of the best technical blogs out there."
            />
            <LinkItem
              href="https://blog.samaltman.com/"
              title="Sam Altman's Blog"
              description="Thoughts on startups, AI, and the future from OpenAI's CEO."
            />
            <LinkItem
              href="https://karpathy.github.io/"
              title="Andrej Karpathy's Blog"
              description="Deep dives into AI and neural networks from a former Tesla AI director."
            />
            <LinkItem
              href="https://www.fast.ai/"
              title="Fast.ai"
              description="Making neural nets uncool again. Practical deep learning for coders."
            />
            <LinkItem
              href="https://www.eugeneyan.com/"
              title="Eugene Yan"
              description="Applied ML in production. Real-world AI engineering insights."
            />
          </div>
        </Section>

        <Section title="Philosophy & Thinking" icon={BookOpen}>
          <div className="space-y-3">
            <LinkItem
              href="https://plato.stanford.edu/"
              title="Stanford Encyclopedia of Philosophy"
              description="The most comprehensive philosophical resource online. Deep, peer-reviewed articles on every topic."
            />
            <LinkItem
              href="https://www.brainpickings.org/"
              title="The Marginalian (formerly Brain Pickings)"
              description="Maria Popova's brilliant explorations of literature, philosophy, and the human condition."
            />
            <LinkItem
              href="https://aeon.co/"
              title="Aeon"
              description="Essays, videos and ideas on philosophy, science, and culture. Consistently thoughtful content."
            />
            <LinkItem
              href="https://fs.blog/"
              title="Farnam Street"
              description="Mental models for better thinking. Shane Parrish's insights on decision-making and learning."
            />
          </div>
        </Section>

        <Section title="Interesting Reads" icon={Newspaper}>
          <div className="space-y-3">
            <LinkItem
              href="https://gwern.net/"
              title="Gwern.net"
              description="Long-form essays on everything from AI to psychology. Dense but rewarding reads."
            />
            <LinkItem
              href="https://waitbutwhy.com/"
              title="Wait But Why"
              description="Tim Urban's illustrated long-form articles on everything that matters. Procrastination at its finest."
            />
            <LinkItem
              href="https://paulgraham.com/articles.html"
              title="Paul Graham's Essays"
              description="Classic essays on startups, programming, and life from Y Combinator's founder."
            />
            <LinkItem
              href="https://slatestarcodex.com/"
              title="Slate Star Codex (now Astral Codex Ten)"
              description="Scott Alexander's rationalist blog. Psychology, politics, and everything in between."
            />
          </div>
        </Section>

        <Section title="Tools I Actually Use" icon={Code}>
          <div className="space-y-3">
            <LinkItem
              href="https://neovim.io/"
              title="Neovim"
              description="The text editor I use daily. Vim but better. Steep learning curve, worth it."
            />
            <LinkItem
              href="https://www.mozilla.org/en-US/firefox/"
              title="Firefox"
              description="The only major browser that isn't Chromium-based. Privacy-respecting and open source."
            />
            <LinkItem
              href="https://proton.me/"
              title="Proton Mail"
              description="Encrypted email from Switzerland. Not as hardcore as self-hosting, but way more practical."
            />
            <LinkItem
              href="https://bitwarden.com/"
              title="Bitwarden"
              description="Open-source password manager. Does everything you need, costs almost nothing."
            />
            <LinkItem
              href="https://obsidian.md/"
              title="Obsidian"
              description="Note-taking with local markdown files. Considering switching from Notion to this."
            />
          </div>
        </Section>

        <Section title="Music & Culture" icon={Podcast}>
          <div className="space-y-3">
            <LinkItem
              href="https://pitchfork.com/"
              title="Pitchfork"
              description="Music criticism and discovery. Love it or hate it, they shape music discourse."
            />
            <LinkItem
              href="https://bandcamp.com/"
              title="Bandcamp"
              description="The best platform for discovering and supporting independent musicians."
            />
            <LinkItem
              href="https://rateyourmusic.com/"
              title="RateYourMusic"
              description="Deep music database and community. For when you want to rabbit-hole into music discovery."
            />
          </div>
        </Section>

        <Section title="Learning Platforms" icon={Video}>
          <div className="space-y-3">
            <LinkItem
              href="https://www.youtube.com/@3blue1brown"
              title="3Blue1Brown"
              description="Visual math and computer science. Grant Sanderson's animations make complex topics intuitive."
            />
            <LinkItem
              href="https://missing.csail.mit.edu/"
              title="The Missing Semester"
              description="MIT course on computing tools they don't teach you in school. Git, vim, shell scripting, etc."
            />
            <LinkItem
              href="https://github.com/ossu/computer-science"
              title="OSSU Computer Science"
              description="Free, self-paced education in Computer Science. The curriculum is comprehensive and well-structured."
            />
          </div>
        </Section>

        <div className="mt-16 p-6 rounded-lg bg-accent/30 border border-border">
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
