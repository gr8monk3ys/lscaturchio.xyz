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
        <title>Uses - Lorenzo Scaturchio</title>
        <meta
          name="description"
          content="Software I use, and other things I recommend."
        />
      </Head>
      <SimpleLayout
        title="Software I use, gadgets I love, and other things I recommend."
        intro="I get asked a lot about the things I use to build software, stay productive, or buy to fool myself into thinking I’m being productive when I’m really just procrastinating. Here’s a big list of all of my favorite stuff."
      >
        <div className="space-y-20">
          <ToolsSection title="Workstation">
            <Tool title="Custom PC (2018), Intel i7 7700k, Nvidia RTX 3090, 64GB DDR4 RAM, 1000 W Power supply">
              My custom PC has been my bread and butter for a while. The specs are from a long
              time of owning and upgrading my computer.
            </Tool>
            <Tool title="Samsung Crg9 Ultrawide display 120hz">
              This display lets me have just one screen but it can act like two which couldnt
              make me any happier.
            </Tool>
            <Tool title="Custom  Glorious Gaming Keyboard">
              My custom keyboard was built to be extremely silent. I chose the Gateron Silent Red
              switches as well as lubed all the keys to ensure minimal sound from typing.
              Basically I am a loud typer so I wanted to reduce that with the keyboard.
            </Tool>
            <Tool title="Razer Viper Ulitimate Hyperspeed Lightweight Mouse">
              This mouse is absurdly light and I just love how I could drag around
              with it if I am playing a game or if I am playing bullet chess, it
              does not feel like I am holding anything at all.
            </Tool>
            <Tool title="Herman Miller Sayl Chair">
              I am in love with this chair and it frankly makes up most of the 
              aesthetic
            </Tool>
          </ToolsSection>
          <ToolsSection title="Development tools">
            <Tool title="Neovim (NvChad)">
              This is a suite of plugins for an already amazing IDE that are 
              added onto nvim that I absolutely love and cant really go back 
              to any other IDE since it works so well and is pretty efficient.
            </Tool>
            <Tool title="Arch Linux">
              I dont want to be that guy... but I run Arch btw but I am that guy. Just started using
              this instead of ubuntu for my WSL installation and I do enjoy using
              pacman more than apt-get. Plus their wiki is just insane.
            </Tool>
          </ToolsSection>
          <ToolsSection title="Design">
            <Tool title="Figma">
              Figma has been really useful if I want to design something really quick like
              a basic wireframe. Other than that I rarely ever use this.
            </Tool>
          </ToolsSection>
          <ToolsSection title="Productivity">
            <Tool title="Notion">
              I use this for practially everything in my life. From setting up
              the weekly workouts, to to-do lists, to my recipe book, this has
              all of the organization that I would need and no I do not consider
              it a second brain but it is very useful.
            </Tool>
          </ToolsSection>
        </div>
      </SimpleLayout>
    </>
  )
}
