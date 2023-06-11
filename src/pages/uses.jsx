import Head from 'next/head'

import { Card } from '@/components/Card'
import { Section } from '@/components/Section'
import { SimpleLayout } from '@/components/SimpleLayout'

function ToolsSection({ children, ...props }) {
  return (
    <Section {...props}>
      <ul role="list" className="space-y-16">
        {children}
      </ul>
    </Section>
  )
}

function Tool({ title, href, children }) {
  return (
    <Card as="li">
      <Card.Title as="h3" href={href}>
        {title}
      </Card.Title>
      <Card.Description>{children}</Card.Description>
    </Card>
  )
}

export default function Uses() {
  return (
    <>
      <Head>
        <title>Tools & Recommendations - Lorenzo Scaturchio</title>
        <meta
          name="description"
          content="A compilation of the software, gadgets, and other resources I frequently use and highly recommend."
        />
      </Head>
      <SimpleLayout
        title="My Arsenal of Software, and Favourite Gadgets"
        intro="Here are the tools I use to develop software, the methods I use to stay productive, or the items I purchase that serve as a comforting illusion of productivity when I am actually procrastinating. Here is a comprehensive list of all the things I love and use."
      >
        <div className="space-y-20">
          <ToolsSection title="Workstation Essentials">
            <Tool title="Custom PC (2018), Intel i7 7700k, Nvidia RTX 3090, 64GB DDR4 RAM, 1000 W Power supply">
              My custom-built PC has been my faithful companion for a
              considerable period. The specifications reflect a long journey of
              owning and continually upgrading my system.
            </Tool>
            <Tool title="Samsung Crg9 Ultrawide display 120hz">
              This display provides the convenience of two screens in one, a
              feature that never fails to bring me immense satisfaction.
            </Tool>
            <Tool title="Custom  Glorious Gaming Keyboard">
              My custom keyboard was designed for the utmost silence. I opted
              for Gateron Silent Red switches and meticulously lubed all the
              keys to minimize typing noise. As a naturally loud typer, this
              keyboard is a sound-reducing asset.
            </Tool>
            <Tool title="Razer Viper Ulitimate Hyperspeed Lightweight Mouse">
              The incredible lightness of this mouse is nothing short of
              amazing. Whether I am gaming or playing bullet chess, the
              negligible weight makes it feel as if I am not holding anything at
              all.
            </Tool>
            <Tool title="Herman Miller Sayl Chair">
              I have fallen in love with this chair, and it significantly
              contributes to the overall aesthetic of my workspace.
            </Tool>
          </ToolsSection>
          <ToolsSection title="Essential Development Tools">
            <Tool title="Neovim (NvChad)">
              This is a suite of plugins for the already impressive Neovim IDE.
              The efficiency and effectiveness of these plugins make it
              impossible for me to revert to any other IDE.
            </Tool>
            <Tool title="Arch Linux">
              I might be falling into a stereotype here, but I run Arch.
              Recently, I switched from Ubuntu to Arch for my WSL installation
              and have found the use of pacman far more enjoyable than apt-get.
              Not to mention, the Arch wiki issimply phenomenal.
            </Tool>
          </ToolsSection>
          <ToolsSection title="Design Resources">
            <Tool title="Figma">
              Figma proves to be a handy tool whenever I need to design
              something quickly, such as a basic wireframe. Beyond that, I do not
              use it extensively, but I appreciate its availability when needed.
            </Tool>
          </ToolsSection>
          <ToolsSection title="Productivity Boosters">
            <Tool title="Notion">
              Notion is my go-to for virtually everything in my life. From
              planning my weekly workouts, to maintaining to-do lists, to
              keeping my recipe book, it offers all the organization I need.
              While I would not classify it as a second brain, its usefulness is
              undeniable.
            </Tool>
          </ToolsSection>
        </div>
      </SimpleLayout>
    </>
  )
}
