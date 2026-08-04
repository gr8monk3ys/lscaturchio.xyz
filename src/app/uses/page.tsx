import { Container } from "@/components/Container";
import { buildPageMetadata } from "@/lib/seo";
import { Heading } from "@/components/Heading";
import { Paragraph } from "@/components/Paragraph";
import { RagStatusCard } from "@/components/uses/rag-status-card";

export const metadata = buildPageMetadata({
  title: "Uses",
  description: "The hardware, dotfiles, and thirty-seven self-hosted services I actually run. Keyboard-driven, FOSS where it counts, and as little of it on someone else's computer as I can manage.",
  path: "/uses",
});

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="mb-16">
    <h2 className="font-display text-2xl font-semibold tracking-tight mb-6">{title}</h2>
    {children}
  </section>
);

const Item = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="mb-8 border-b border-border pb-8 last:mb-0 last:border-b-0 last:pb-0">
    <h3 className="font-display text-lg font-semibold mb-2">{title}</h3>
    <div className="text-muted-foreground space-y-2">
      {children}
    </div>
  </div>
);

export default function UsesPage() {
  return (
    <Container size="large">
      <div className="max-w-4xl mx-auto py-12">
        <header className="mb-12">
          <span className="label-mono block">Garden · Setup</span>
          <Heading className="mt-4 text-4xl font-bold md:text-5xl">What I Use</Heading>
          <Paragraph className="mt-4 max-w-2xl text-lg text-muted-foreground">
            The following is the way in which I am currently using my setup. My philosophy is usually
            associated with it being <a href="https://suckless.org/rocks/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">FOSS</a> (Free
            and open source software) since this is ideally how the internet is supposed to be used.
            Typically, the less bloat that exists the better.
          </Paragraph>
          <hr className="gallery-rule mt-8" />
          <div className="mt-8 border-l-2 border-border pl-4">
            <p className="label-mono">Disclosure</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Many of the links here are affiliate links to services and products I use. I would never use affiliate links for products that I don&apos;t personally use.
            </p>
          </div>
        </header>

        <Section title="Hardware">
          <Item title="Laptop">
            <p>
              For my laptop, I use a <a href="https://amzn.to/3V3lKhL" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Macbook Pro 15&quot;</a>.
            </p>
          </Item>

          <Item title="Mouse">
            <p>
              For my mouse, I use a <a href="https://amzn.to/48PmLgl" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Razer Viper Pro (White)</a>.
              I found this mouse to be the most lightweight from what I researched but honestly more for gaming (which I
              haven&apos;t done in a while) so a majority of the time I am trying to just use the keyboard.
            </p>
          </Item>

          <Item title="Keyboard">
            <p>
              For my keyboard, I use a <strong>Custom Keyboard</strong>. As of right now the custom build uses a Glorious keyboard
              base but I think eventually I am going to give in on the split keyboard hype as it seems overall more ergonomic.
            </p>
          </Item>

          <Item title="Laptop Stand">
            <p>
              For my laptop stand, I use a <a href="https://www.amazon.co.uk/dp/B07DL3Q3J7/ref=twister_B08FZBMBGW?_encoding=UTF8&th=1" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Rain Design,
              Inc. 10084 mBar Pro+ Foldable Laptop Stand - Silver</a>. This is essential if you want to avoid <a href="https://www.youtube.com/watch?v=Rc8ZQeIZn40" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">the
              typical back and neck pain associated with being hunched over a laptop all day</a>. It also folds small enough to
              stuff it into a backpack to work outside, which I often do.
            </p>
          </Item>
        </Section>

        <Section title="Software">
          <Item title="Operating System">
            <p>
              The daily driver is <strong>macOS</strong>, bullied into behaving like a tiling window
              manager: <a href="https://github.com/nikitabobko/AeroSpace" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">AeroSpace</a> for
              i3-style workspaces, <a href="https://github.com/FelixKratz/SketchyBar" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">SketchyBar</a> in
              place of the menu bar, and <a href="https://karabiner-elements.pqrs.org/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Karabiner</a> remapping
              caps lock into something useful. <a href="https://archlinux.org" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Arch</a> runs
              on the other machines, and my <a href="https://github.com/gr8monk3ys/dotfiles" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">dotfiles</a> install
              on both — they are tested in Ubuntu and Arch containers in CI, with an optional Nix flake
              for anyone who wants the whole thing declarative.
            </p>
          </Item>

          <Item title="Terminal & Shell">
            <p>
              <a href="https://ghostty.org/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline"><strong>Ghostty</strong></a> at
              15pt, with <strong>zsh</strong>, <a href="https://starship.rs/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Starship</a> for
              the prompt and <a href="https://zellij.dev/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Zellij</a> for
              multiplexing. The whole config is keyboard-driven; if something needs a mouse I have usually
              set it up wrong.
            </p>
          </Item>

          <Item title="Command Line">
            <p>
              Most of the standard Unix tools have been quietly replaced:
            </p>
            <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
              <li><a href="https://github.com/atuinsh/atuin" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">atuin</a> — shell history that syncs and is actually searchable</li>
              <li><a href="https://github.com/sxyazi/yazi" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">yazi</a> — file manager</li>
              <li><a href="https://github.com/eza-community/eza" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">eza</a> and <a href="https://github.com/sharkdp/bat" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">bat</a> — <code>ls</code> and <code>cat</code>, with colour</li>
              <li><a href="https://github.com/BurntSushi/ripgrep" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">ripgrep</a> and <a href="https://github.com/ajeetdsouza/zoxide" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">zoxide</a> — grep and <code>cd</code>, faster</li>
              <li><a href="https://github.com/dandavison/delta" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">delta</a> — git diffs worth reading</li>
              <li><a href="https://jj-vcs.github.io/jj/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">jj</a> — Jujutsu, for the repos where I have stopped pretending git&apos;s index is a good idea</li>
              <li><a href="https://mise.jdx.dev/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">mise</a> — one version manager instead of five</li>
            </ul>
          </Item>

          <Item title="Browser">
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

          <Item title="Text Editor">
            <p>
              I use <a href="https://neovim.io/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline"><strong>neovim</strong></a> for
              text editing as it in my opinion although difficult at first is absolutely worth it.
            </p>
          </Item>

          <Item title="Document Processing">
            <p>
              I use primarily <a href="https://www.latex-project.org/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">LaTeX</a> which
              the first document I had ever finished writing was my resume back in 2019.
            </p>
          </Item>
        </Section>

        <Section title="Services">
          <Item title="Email">
            <p>
              For email, I use <a href="https://pr.tn/ref/Y8M5X5MSTJ9G" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline"><strong>ProtonMail</strong></a>.
              Yes I know this isn&apos;t like being as based as hosting your own email client like <a href="https://muttwizard.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Mutt Wizard</a>.
            </p>
          </Item>

          <Item title="Password Manager">
            <p>
              <a href="https://bitwarden.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline"><strong>Bitwarden</strong></a> is
              the best password manager. It does everything you could need a password manager to do, and the premium subscription if you
              want a few more features is dirt-cheap.
            </p>
          </Item>

          <Item title="Hosting">
            <p>
              This site is currently hosted by <strong>Vercel</strong>. Previously, I used <a href="https://www.vultr.com/?ref=9005580-8H" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Vultr</a> with
              a cheap Debian VPS to host all my projects. Having your own VPS gives you a lot more freedom in hosting your own website
              instead of using services like Vercel, Netlify, Heroku, AWS.
            </p>
          </Item>

          <Item title="Domain Registrar">
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
          <Item title="Color Scheme & Fonts">
            <p>
              <a href="https://github.com/joshdick/onedark.vim" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline"><strong>OneDark</strong></a> everywhere
              — Atom One Dark in Ghostty, the matching Neovim theme, the same palette in SketchyBar. One
              theme across every tool matters more than which theme it is; the point is that nothing
              jars when you move between windows.
            </p>
            <p className="mt-4">
              Terminal font is <a href="https://www.jetbrains.com/lp/mono/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline"><strong>JetBrainsMono Nerd Font</strong></a>,
              patched for icons.
            </p>
          </Item>
        </Section>

        <Section title="Self-Hosted">
          <Item title="One Raspberry Pi, thirty-seven services">
            <p>
              Most of what would otherwise be a dozen subscriptions runs on a single Raspberry Pi 5 in
              my apartment, as Docker Compose stacks behind{" "}
              <a href="https://nginxproxymanager.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Nginx Proxy Manager</a> with
              wildcard TLS. The setup is public at{" "}
              <a href="https://github.com/gr8monk3ys/pi-lab" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">pi-lab</a>.
            </p>
            <ul className="list-disc list-inside ml-4 mt-4 space-y-1">
              <li><strong>DNS</strong> — Pi-hole for blocking, resolving through a local Unbound and DNSCrypt rather than a public upstream, so ad-blocking does not just relocate who is watching</li>
              <li><strong>Access</strong> — WireGuard for the VPN, Authelia for single sign-on, CrowdSec underneath on the assumption anything reachable gets probed</li>
              <li><strong>Media</strong> — Jellyfin with the *arr stack and Calibre-Web</li>
              <li><strong>Documents</strong> — Paperless-ngx with OCR, Nextcloud for sync, Syncthing between machines</li>
              <li><strong>Passwords</strong> — Vaultwarden, which is why the Bitwarden clients above talk to my hardware and not somebody else&apos;s</li>
              <li><strong>The rest</strong> — SearXNG, FreshRSS, n8n, Actual Budget, Mealie, Prometheus</li>
            </ul>
          </Item>

          <Item title="Why bother">
            <p>
              Every service here is one that either disappeared, got worse, or started charging monthly
              for something it used to do. Self-hosting is less about the money than about the fact that
              a thing you run cannot be discontinued from a boardroom.
            </p>
          </Item>
        </Section>

        <Section title="RAG Stack">
          <div className="mb-8">
            <RagStatusCard />
          </div>

          <Item title="Vector Search">
            <p>
              Embeddings are stored in <strong>Postgres</strong> (Neon) with <strong>pgvector</strong>, queried via a server-side
              similarity function (<code>match_embeddings</code>) for fast retrieval.
            </p>
          </Item>

          <Item title="Embeddings">
            <p>
              I support two providers:
              <strong> OpenAI</strong> (<code>text-embedding-3-small</code>, 768 dims) when <code>OPENAI_API_KEY</code> is set, or
              <strong> Ollama</strong> (<code>nomic-embed-text</code>) locally for free, private iteration.
            </p>
          </Item>

          <Item title="Chat">
            <p>
              The site chat endpoint uses OpenAI when configured (primary <code>OPENAI_CHAT_MODEL</code>, then smaller fallback
              <code>OPENAI_FALLBACK_CHAT_MODEL</code>), then OpenRouter when configured, then falls back to Ollama locally.
              It degrades gracefully if neither provider is available.
            </p>
          </Item>

          <Item title="Ingestion">
            <p>
              I keep content ingestion repeatable with scripts like <code>bun run generate-embeddings</code> and <code>bun run generate-tts</code>.
              That keeps the AI features grounded on real blog content instead of vibes.
            </p>
          </Item>
        </Section>

        <Section title="This Website">
          <div className="space-y-4 text-muted-foreground">
            <p>
              This site is built with <strong className="text-foreground">Next.js</strong>, a React framework that outputs HTML and CSS. The only Javascript in
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
