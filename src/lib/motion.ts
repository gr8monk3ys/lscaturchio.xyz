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
