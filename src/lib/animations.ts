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

// Stagger item with hidden/visible for whileInView usage
export const staggerItemVariants = {
  hidden: {
    opacity: 0,
    y: 15
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: ANIMATION_DURATION
    }
  }
}

// Container variants with hidden/visible for staggered animations
export const staggerContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
}

// Photo/image reveal with spring animation
export const photoReveal = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      type: "spring" as const,
      stiffness: 150,
      damping: 20
    }
  }
}

// Icon/badge animation with custom delay support
export const iconPop = {
  hidden: { scale: 0, opacity: 0 },
  visible: (i: number) => ({
    scale: 1,
    opacity: 1,
    transition: {
      type: "spring" as const,
      stiffness: 200,
      damping: 20,
      delay: 0.4 + (i * 0.08)
    }
  })
}

// ============================================
// SHOW/HIDDEN VARIANTS (alternative naming)
// For components using "show" instead of "visible"
// ============================================

// Container variants with hidden/show naming
export const showContainerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
}

// Item variants with hidden/show naming
export const showItemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: ANIMATION_DURATION
    }
  }
}

// Item with spring animation for hidden/show
export const showItemSpringVariants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 15
    }
  }
}
