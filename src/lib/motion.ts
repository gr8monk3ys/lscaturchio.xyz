import { useReducedMotion } from 'framer-motion';

export {
  AnimatePresence,
  LayoutGroup,
  LazyMotion,
  MotionConfig,
  m,
  useInView,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type Variants,
} from 'framer-motion'

export const loadMotionFeatures = (): Promise<typeof import('framer-motion')['domAnimation']> =>
  import('framer-motion').then((mod) => mod.domAnimation)

// CSS --duration-* tokens are scoped to hover/focus (150–300ms).
// These JS-side tokens are for framer-motion entrance, exit, and
// layout animations, which cover larger movement and run 2–3× longer.
export const DURATIONS = {
  fast: 0.2,
  default: 0.35,
  slow: 0.5,
} as const;

export const EASINGS = {
  standard: [0.22, 1, 0.36, 1] as const,
} as const;

export function useMotionPreset(
  duration: keyof typeof DURATIONS = 'default',
  easing: keyof typeof EASINGS = 'standard',
): { duration: number; ease: readonly number[] } {
  const reduce = useReducedMotion();
  return {
    duration: reduce ? 0 : DURATIONS[duration],
    ease: EASINGS[easing],
  };
}
