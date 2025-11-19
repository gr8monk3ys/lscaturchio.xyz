import { Container } from "@/components/Container";
import { Metadata } from "next";
import { Monitor, Mouse, Keyboard, Laptop, HardDrive, Globe, Terminal, Code, Palette } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Uses | Lorenzo Scaturchio",
  description:
    "Tools, software, and hardware Lorenzo Scaturchio uses daily. From Arch Linux and Neovim to ProtonMail and Bitwarden. Focused on FOSS, privacy, and minimal bloat.",
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="mb-12">
    <h2 className="text-3xl font-bold mb-6 text-primary">{title}</h2>
    {children}
  </section>
);

const Item = ({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) => (
  <div className="mb-6 flex gap-4">
    <div className="shrink-0 mt-1">
      <div className="size-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
        <Icon className="size-5" />
      </div>
    </div>
    <div className="flex-1">
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <div className="text-muted-foreground space-y-2">
        {children}
      </div>
    </div>
  </div>
);

export default function UsesPage() {
  return (
    <Container size="large">
      <div className="max-w-4xl mx-auto py-12">
        <div className="mb-12">
          <Badge variant="secondary" className="mb-4">My Setup</Badge>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            What I Use
          </h1>
          <p className="text-xl text-muted-foreground mb-6">
            The following is the way in which I am currently using my setup. My philosophy is usually
            associated with it being <a href="https://suckless.org/rocks/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">FOSS</a> (Free
            and open source software) since this is ideally how the internet is supposed to be used.
            Typically, the less bloat that exists the better.
          </p>
          <div className="bg-accent/50 border border-border rounded-lg p-4">
            <p className="text-sm font-medium mb-1">Disclosure</p>
            <p className="text-sm text-muted-foreground">
              Many of the links here are affiliate links to services and products I use. I would never use affiliate links for products that I don&apos;t personally use.
            </p>
          </div>
        </div>

        <Section title="Hardware">
          <Item icon={Laptop} title="Laptop">
            <p>
              For my laptop, I use a <a href="https://amzn.to/3V3lKhL" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Macbook Pro 15&quot;</a>.
            </p>
          </Item>

          <Item icon={Mouse} title="Mouse">
            <p>
              For my mouse, I use a <a href="https://amzn.to/48PmLgl" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Razer Viper Pro (White)</a>.
              I found this mouse to be the most lightweight from what I researched but honestly more for gaming (which I
              haven&apos;t done in a while) so a majority of the time I am trying to just use the keyboard.
            </p>
          </Item>

          <Item icon={Keyboard} title="Keyboard">
            <p>
              For my keyboard, I use a <strong>Custom Keyboard</strong>. As of right now the custom build uses a Glorious keyboard
              base but I think eventually I am going to give in on the split keyboard hype as it seems overall more ergonomic.
            </p>
          </Item>

          <Item icon={Monitor} title="Laptop Stand">
            <p>
              For my laptop stand, I use a <a href="https://www.amazon.co.uk/dp/B07DL3Q3J7/ref=twister_B08FZBMBGW?_encoding=UTF8&th=1" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Rain Design,
              Inc. 10084 mBar Pro+ Foldable Laptop Stand - Silver</a>. This is essential if you want to avoid <a href="https://www.youtube.com/watch?v=Rc8ZQeIZn40" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">the
              typical back and neck pain associated with being hunched over a laptop all day</a>. It also folds small enough to
              stuff it into a backpack to work outside, which I often do.
            </p>
          </Item>
        </Section>

        <Section title="Software">
          <Item icon={Terminal} title="Operating System & Terminal">
            <p>
              Of course like many others, I use <a href="https://archlinux.org" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline"><strong>Arch Linux</strong></a> (btw).
              Yes, it is a pain in the ass to set up but yes this was absolutely worth the time. Why? Because of:
            </p>
            <ol className="list-decimal list-inside ml-4 mt-2 space-y-1">
              <li>The Wiki</li>
              <li>Rolling releases</li>
              <li>Simple and FOSS</li>
            </ol>
            <p className="mt-4">
              I currently use <a href="https://iterm2.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline"><strong>Iterm2</strong></a> for
              my terminal due to it simply being the most popular tool for MacOS users. For my shell, I use <strong>zsh</strong> with
              a few plugins for niceties like syntax highlighting and auto-complete.
            </p>
          </Item>

          <Item icon={Globe} title="Browser">
            <p>
              For my <strong>browser</strong>, I use <a href="https://www.mozilla.org/en-US/firefox/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline"><strong>Firefox</strong></a> with
              a user.js file (based on <a href="https://github.com/yokoffing/BetterFox" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Betterfox</a>) to
              disable trackers and bloat. <a href="https://brave.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Brave</a> is also usually what
              I would use if I am not using Firefox.
            </p>
            <p className="mt-4">
              For <strong>browser extensions</strong> I use:
            </p>
            <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
              <li><a href="https://ublockorigin.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">uBlock Origin</a> to block ads and trackers</li>
              <li><a href="https://chromewebstore.google.com/detail/duckduckgo-search-tracker/bkdgflcldnnnapblkhphbgpggdiikppg" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Duckduckgo Privacy Essentials</a> - Actively protects your data</li>
              <li><a href="https://addons.mozilla.org/en-US/firefox/addon/istilldontcareaboutcookies/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">I Still don&apos;t Care About Cookies</a> - Prevents cookie pop-ups</li>
              <li><a href="https://chromewebstore.google.com/detail/privacy-badger/pkehgijcmpdhfbdbbnkijodmdjhbjlgp" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Privacy Badger</a> - Automatically blocks hidden trackers</li>
              <li><a href="https://addons.mozilla.org/en-US/firefox/addon/decentraleyes/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Decentraleyes</a> - Local CDN access</li>
              <li><a href="https://addons.mozilla.org/en-US/firefox/addon/vimium-ff/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Vimium</a> - Vim-like keybindings</li>
              <li><a href="https://bitwarden.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Bitwarden</a> - Password management</li>
            </ul>
          </Item>

          <Item icon={Code} title="Text Editor">
            <p>
              I use <a href="https://neovim.io/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline"><strong>neovim</strong></a> for
              text editing as it in my opinion although difficult at first is absolutely worth it.
            </p>
          </Item>

          <Item icon={HardDrive} title="Document Processing">
            <p>
              I use primarily <a href="https://www.latex-project.org/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">LaTeX</a> which
              the first document I had ever finished writing was my resume back in 2019.
            </p>
          </Item>
        </Section>

        <Section title="Services">
          <Item icon={Globe} title="Email">
            <p>
              For email, I use <a href="https://pr.tn/ref/Y8M5X5MSTJ9G" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline"><strong>ProtonMail</strong></a>.
              Yes I know this isn&apos;t like being as based as hosting your own email client like <a href="https://muttwizard.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Mutt Wizard</a>.
            </p>
          </Item>

          <Item icon={HardDrive} title="Password Manager">
            <p>
              <a href="https://bitwarden.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline"><strong>Bitwarden</strong></a> is
              the best password manager. It does everything you could need a password manager to do, and the premium subscription if you
              want a few more features is dirt-cheap.
            </p>
          </Item>

          <Item icon={Globe} title="Hosting">
            <p>
              This site is currently hosted by <strong>Vercel</strong>. Previously, I used <a href="https://www.vultr.com/?ref=9005580-8H" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Vultr</a> with
              a cheap Debian VPS to host all my projects. Having your own VPS gives you a lot more freedom in hosting your own website
              instead of using services like Vercel, Netlify, Heroku, AWS.
            </p>
          </Item>

          <Item icon={Globe} title="Domain Registrar">
            <p>
              I use <a href="https://www.epik.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline"><strong>Epik</strong></a> to
              purchase my domains which isn&apos;t anything special or particular, this just happens to be what I use.
            </p>
          </Item>
        </Section>

        <Section title="Applications">
          <div className="space-y-4">
            <p>
              For note-taking, I used to use <a href="https://www.notion.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline"><strong>Notion</strong></a>.
              Now, I am debating switching to Obsidian as it is an offline alternative but I am not sure yet since I find the best
              note-taking to still be on pen and paper even though I am much faster at typing than I am writing.
            </p>
            <p>
              For email application, I use <a href="https://www.thunderbird.net/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline"><strong>Thunderbird</strong></a>.
              I have my annoyances with it, but it&apos;s the best email client there is on Linux.
            </p>
            <p>
              For RSS feed using a <a href="https://newsboat.org/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline"><strong>newsboat</strong></a>.
            </p>
          </div>
        </Section>

        <Section title="Theme">
          <Item icon={Palette} title="Color Scheme & Fonts">
            <p>
              I use the <a href="https://github.com/catppuccin/catppuccin" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline"><strong>Catppuccin</strong></a> color
              scheme for just about everything.
            </p>
            <p className="mt-4">
              For my terminal font, I use <a href="https://github.com/subframe7536/Maple-font" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline"><strong>Maple Mono</strong></a>.
              Of course, I also use <strong>Nerd Font</strong> icons.
            </p>
          </Item>
        </Section>

        <Section title="This Website">
          <div className="bg-accent/30 border border-border rounded-lg p-6">
            <p className="mb-4">
              This site is built with <strong>Next.js</strong>, a React framework that outputs HTML and CSS. The only Javascript in
              this entire page is for interactive components and navigation. Previously, I used <a href="https://gohugo.io/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Hugo</a>,
              a static site generator.
            </p>
            <p>
              The design philosophy is minimal and focused on content, with an emphasis on performance and accessibility. All images are
              optimized to WebP format, and the site follows modern web standards for SEO and metadata.
            </p>
          </div>
        </Section>
      </div>
    </Container>
  );
}
