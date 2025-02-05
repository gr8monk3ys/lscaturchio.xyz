export const pricingTiers = [
  {
    id: "starter",
    name: "Starter",
    price: {
      monthly: 2500,
      yearly: 2000,
    },
    description: "Perfect for small data science projects and POCs",
    features: [
      "Data analysis & visualization",
      "Basic ML model development",
      "Weekly progress updates",
      "2 revision rounds",
      "Basic documentation",
    ],
    cta: "Get Started",
  },
  {
    id: "professional",
    name: "Professional",
    price: {
      monthly: 5000,
      yearly: 4000,
    },
    description: "Ideal for production-ready AI solutions",
    features: [
      "Advanced ML/DL models",
      "Model deployment & APIs",
      "Bi-weekly meetings",
      "4 revision rounds",
      "Comprehensive documentation",
    ],
    cta: "Schedule Call",
    popular: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: {
      monthly: "Custom",
      yearly: "Custom",
    },
    description: "Full-scale AI transformation projects",
    features: [
      "Custom AI/ML solutions",
      "End-to-end implementation",
      "Dedicated support",
      "Unlimited revisions",
      "Training & knowledge transfer",
    ],
    cta: "Contact Us",
    highlighted: true,
  },
];