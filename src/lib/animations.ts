export const fadeInUp = {
  initial: {
    y: 20,
    opacity: 0
  },
  animate: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: [0.6, -0.05, 0.01, 0.99] as [number, number, number, number]
    }
  }
}

export const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

export const fadeIn = {
  initial: {
    opacity: 0
  },
  animate: {
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: "easeInOut" as const
    }
  }
}

export const scaleUp = {
  initial: {
    scale: 0.95,
    opacity: 0
  },
  animate: {
    scale: 1,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: [0.6, -0.05, 0.01, 0.99] as [number, number, number, number]
    }
  }
}

export const slideIn = {
  initial: {
    x: -20,
    opacity: 0
  },
  animate: {
    x: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut" as const
    }
  }
}

export const parallaxScroll = (yOffset: number = 100) => ({
  initial: {
    y: 0
  },
  animate: {
    y: yOffset,
    transition: {
      type: "spring" as const,
      stiffness: 10,
      damping: 100,
      mass: 1
    }
  }
})
