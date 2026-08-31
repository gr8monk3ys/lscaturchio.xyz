/**
 * Shared by the About page and the homepage "Who I am" section, so the two
 * can never drift apart.
 */
export interface PersonalFavorite {
  label: string;
  value: string;
}

export const PERSONAL_FAVORITES: PersonalFavorite[] = [
  {
    label: "Favorite Band",
    value: "Arctic Monkeys"
  },
  {
    label: "Favorite TV Shows",
    value: "One Piece / SpongeBob (tied)"
  },
  {
    label: "Favorite Comedy Show",
    value: "Portlandia"
  },
  {
    label: "Favorite City",
    value: "Pasadena, CA"
  },
  {
    label: "Favorite Coffee",
    value: "Rose City Coffee Co."
  },
  {
    label: "Camera",
    value: "Fujifilm XT30 II"
  },
  {
    label: "Favorite Programming Language",
    value: "Rust"
  },
  {
    label: "Preferred Internet Policy",
    value: "Open, Free, Neutral"
  },
  {
    label: "Religious Views",
    value: "Agnostic (but love learning about religion)"
  },
  {
    label: "Weird Skill",
    value: "I can name a film from a single frame"
  },
];
