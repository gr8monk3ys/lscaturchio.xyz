import { MotionProvider } from "@/components/layout/motion-provider";

/**
 * This segment renders framer-motion `m.` components, so it mounts the
 * `LazyMotion` provider that loads their feature bundle. The provider used to
 * sit in the root layout, which loaded that bundle on every route — the home
 * page paid 69 KB gzipped for animations it never runs. See motion-provider.tsx.
 */
export default function MotionLayout({ children }: { children: React.ReactNode }) {
  return <MotionProvider>{children}</MotionProvider>;
}
