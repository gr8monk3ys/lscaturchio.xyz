import type { SVGProps } from "react";

export type Navlink = {
  href: string;
  label: string;
  icon?: React.ReactNode | React.ComponentType<SVGProps<SVGSVGElement>>;
};
