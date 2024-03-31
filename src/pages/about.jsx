import Image from 'next/image'
import Head from 'next/head'
import Link from 'next/link'
import clsx from 'clsx'

import { Container } from '@/components/Container'
import {
  TwitterIcon,
  InstagramIcon,
  GitHubIcon,
  LinkedInIcon,
} from '@/components/SocialIcons'
import portraitImage from '@/images/portrait.jpg'

function SocialLink({ className, href, children, icon: Icon }) {
  return (
    <li className={clsx(className, 'flex')}>
      <Link
        href={href}
        className="group flex text-sm font-medium text-zinc-800 transition hover:text-blue-500 dark:text-zinc-200 dark:hover:text-blue-500"
      >
        <Icon className="h-6 w-6 flex-none fill-zinc-500 transition group-hover:fill-blue-500" />
        <span className="ml-4">{children}</span>
      </Link>
    </li>
  )
}

function MailIcon(props) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        fillRule="evenodd"
        d="M6 5a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3V8a3 3 0 0 0-3-3H6Zm.245 2.187a.75.75 0 0 0-.99 1.126l6.25 5.5a.75.75 0 0 0 .99 0l6.25-5.5a.75.75 0 0 0-.99-1.126L12 12.251 6.245 7.187Z"
      />
    </svg>
  )
}

export default function About() {
  return (
    <>
      <Head>
        <title>About - Lorenzo Scaturchio</title>
        <meta
          name="description"
          content="Welcome to the world of Lorenzo Scaturchio, residing in the vibrant city of Los Angeles, California. Follow me on my journey as I strive to automate every aspect of my life."
        />
      </Head>
      <Container className="mt-16 sm:mt-32">
        <div className="grid grid-cols-1 gap-y-16 lg:grid-cols-2 lg:grid-rows-[auto_1fr] lg:gap-y-12">
          <div className="lg:pl-20">
            <div className="max-w-xs px-2.5 lg:max-w-none">
              <Image
                src={portraitImage}
                alt="Lorenzo Scaturchio"
                sizes="(min-width: 1024px) 32rem, 20rem"
                className="aspect-square rotate-3 rounded-2xl bg-zinc-100 object-cover dark:bg-zinc-800"
              />
            </div>
          </div>
          <div className="lg:order-first lg:row-span-2">
            <h1 className="text-4xl font-bold tracking-tight text-zinc-800 dark:text-zinc-100 sm:text-5xl">
              Lorenzo Scaturchio
            </h1>
            <div className="mt-6 space-y-7 text-base text-zinc-600 dark:text-zinc-400">
              <p>
                Since my early days, I have been captivated by the intricacies
                of how things functioned. Nothing was beyond my grasp as I
                constantly delved into the world of discovery. I would
                disassemble and reassemble objects, learning valuable lessons
                even in the face of failure.
              </p>
              <p>
                Among my childhood passions, only second to computers, was
                music. At a tender age, I mastered playing the piano by ear,
                which later led me to pick up the guitar. It has remained an
                enduring passion of mine, and I aspire to publish an album that
                will grace various platforms, including this one.
              </p>
              <p>
                During subsequent summers, while my progress might have been
                stagnant, my fervor for learning something new was unwavering. I
                always sought out new hobbies, immersing myself in a multitude
                of pursuits, for better or worse.
              </p>
              <p>
                Today, I am engaged in creating projects that simplify my life.
                Working with AI/ML, I am committed to inspiring the next
                generation to innovate using the tools now available to us.
              </p>
            </div>
          </div>
          <div className="lg:pl-20">
            <ul role="list">
              {/* <SocialLink href="#" icon={TwitterIcon}>
                Follow me on Twitter
              </SocialLink> */}
              <SocialLink
                href="https://www.instagram.com/lorenzo.scaturchio/"
                icon={InstagramIcon}
                className="mt-4"
              >
                Follow me on Instagram
              </SocialLink>
              <SocialLink
                href="https://github.com/gr8monk3ys"
                icon={GitHubIcon}
                className="mt-4"
              >
                Follow me on GitHub
              </SocialLink>
              <SocialLink
                href="https://www.linkedin.com/in/lorenzo-scaturchio/"
                icon={LinkedInIcon}
                className="mt-4"
              >
                Connect with me on LinkedIn
              </SocialLink>
              <SocialLink
                href="mailto:lorenzosca7@gmail.com"
                icon={MailIcon}
                className="mt-8 border-t border-zinc-100 pt-8 dark:border-zinc-700/40"
              >
                Email: lorenzosca7@gmail.com
              </SocialLink>
            </ul>
          </div>
        </div>
      </Container>
    </>
  )
}
