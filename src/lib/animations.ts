// Standardized animation duration for consistency
const ANIMATION_DURATION = 0.4;

export const fadeInUp = {
  initial: {
    y: 20,
    opacity: 0
  },
  animate: {
    y: 0,
    opacity: 1,
    transition: {
      duration: ANIMATION_DURATION,
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
      duration: ANIMATION_DURATION,
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
      duration: ANIMATION_DURATION,
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
      duration: ANIMATION_DURATION,
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

// Additional common animation variants
export const fadeInScale = {
  initial: {
    opacity: 0,
    scale: 0.95
  },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: ANIMATION_DURATION,
      ease: "easeOut" as const
    }
  }
}

export const slideInLeft = {
  initial: {
    opacity: 0,
    x: -20
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      duration: ANIMATION_DURATION,
      ease: "easeOut" as const
    }
  }
}

export const slideInRight = {
  initial: {
    opacity: 0,
    x: 20
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      duration: ANIMATION_DURATION,
      ease: "easeOut" as const
    }
  }
}

// Container for staggered children
export const staggerContainer = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
}

// Child item for use with staggerContainer
export const staggerItem = {
  initial: {
    opacity: 0,
    y: 20
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: ANIMATION_DURATION,
      ease: "easeOut" as const
    }
  }
}
