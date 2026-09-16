// Two icon sets, one boundary: Tabler supplies brand marks, Lucide everything
// else. Not a redundancy to consolidate — lucide-react v1 dropped every logo
// (no Github, Linkedin, Mastodon, Bluesky), so a brand mark has nowhere else to
// come from, and a generic glyph has no reason to come from here. The split is
// enforced by `icon libraries` in src/__tests__/lib/design-drift.test.ts;
// before that gate existed this file pulled four generic glyphs from Tabler
// purely because the brand imports were already open above them.
import {
  IconBrandLinkedin,
  IconBrandGithubFilled,
  IconBrandInstagram,
  IconBrandMastodon,
  IconBrandLeetcode,
} from "@tabler/icons-react";
import { Book, Bookmark, Film, UserPlus } from "lucide-react";

export const socials = [
  {
    href: "https://social.lscaturchio.xyz/@gr8monk3ys",
    label: "Mastodon",
    icon: IconBrandMastodon,
    relMe: true,
  },
  {
    href: "https://social.lscaturchio.xyz/auth/sign_up",
    label: "Join Lorenzo Social",
    icon: UserPlus,
  },
  {
    href: "https://github.com/gr8monk3ys",
    label: "Github",
    icon: IconBrandGithubFilled,
  },
  {
    href: "https://linkedin.com/in/lorenzo-scaturchio",
    label: "LinkedIn",
    icon: IconBrandLinkedin,
  },
  {
    href: "https://www.instagram.com/lorenzo.scaturchio",
    label: "Instagram",
    icon: IconBrandInstagram,
  },
  {
    href: "https://letterboxd.com/gr8monk3ys/",
    label: "Letterboxd",
    icon: Film,
  },
  {
    href: "https://www.goodreads.com/user/show/168274083-lorenzo",
    label: "Goodreads",
    icon: Book,
  },
  {
    href: "https://leetcode.com/u/gr8monk3ys/",
    label: "Leetcode",
    icon: IconBrandLeetcode,
  },
  {
    href: "https://substack.com/@gr8monk3ys",
    label: "Substack",
    icon: Bookmark,
  },
];
