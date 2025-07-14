"use client";

import { useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { Badge } from "../ui/badge";
import { cn } from "@/lib/utils";

interface ServiceContent {
  title: string;
  subtitle: string;
  tabs: {
    name: string;
    content: string;
    features: string[];
  }[];
}

const services: ServiceContent[] = [
  {
    title: "AUTONOMOUS AGENT DEVELOPMENT",
    subtitle: "Build intelligent, autonomous systems that transform your business operations",
    tabs: [
      {
        name: "Strategy Development",
        content: "My comprehensive autonomous agent development strategy focuses on creating intelligent systems that seamlessly integrate with your existing infrastructure while driving innovation and efficiency. I take a holistic approach to ensure your autonomous agents deliver measurable business value.",
        features: [
          "Custom agent architecture design",
          "Integration planning with existing systems",
          "Scalability and performance optimization",
          "Security and compliance considerations"
        ]
      },
      {
        name: "Performance Evaluation",
        content: "I implement rigorous testing and evaluation frameworks to ensure your autonomous agents perform optimally across diverse scenarios. My evaluation process combines quantitative metrics with qualitative assessments to guarantee reliable and efficient agent behavior.",
        features: [
          "Comprehensive performance metrics",
          "Real-world scenario testing",
          "Load and stress testing",
          "Continuous monitoring systems"
        ]
      },
      {
        name: "Use Case Identification",
        content: "My expert team works closely with your organization to identify and prioritize high-impact use cases for autonomous agents. I analyze your business processes, pain points, and opportunities to determine where autonomous agents can deliver the greatest value.",
        features: [
          "Business process analysis",
          "ROI potential assessment",
          "Implementation roadmap",
          "Risk and opportunity mapping"
        ]
      },
      {
        name: "Feasibility Assessments",
        content: "Before implementation, I conduct thorough feasibility assessments to ensure project success. My assessment covers technical requirements, resMyce allocation, potential challenges, and expected outcomes to provide a clear picture of project viability.",
        features: [
          "Technical capability analysis",
          "ResMyce requirement planning",
          "Risk assessment and mitigation",
          "Cost-benefit analysis"
        ]
      },
    ],
  },
  {
    title: "ENTERPRISE CONSULTING",
    subtitle: "Transform your business with expert AI implementation guidance",
    tabs: [
      {
        name: "Strategy Development",
        content: "My enterprise consulting services help organizations navigate the complex landscape of AI implementation. I develop comprehensive strategies that align with your business objectives while ensuring practical and sustainable solutions.",
        features: [
          "Digital transformation roadmap",
          "Technology stack assessment",
          "Change management planning",
          "Innovation strategy development"
        ]
      },
      {
        name: "Performance Evaluation",
        content: "I provide in-depth analysis of your current systems and processes, identifying opportunities for optimization through AI integration. My evaluation framework ensures that implemented solutions deliver measurable improvements to your business operations.",
        features: [
          "System efficiency analysis",
          "Process optimization planning",
          "Performance benchmark creation",
          "ROI tracking frameworks"
        ]
      },
      {
        name: "Use Case Identification",
        content: "My experts work with your team to identify and prioritize AI implementation opportunities across your enterprise. I focus on finding use cases that deliver maximum business value while considering technical feasibility and resMyce constraints.",
        features: [
          "Opportunity assessment",
          "Priority matrix development",
          "Impact analysis",
          "Implementation timeline planning"
        ]
      },
      {
        name: "Feasibility Assessments",
        content: "I conduct comprehensive feasibility studies for proposed AI initiatives, examining technical requirements, resMyce needs, and potential return on investment. My assessment provides a clear picture of project viability and implementation challenges.",
        features: [
          "Technical feasibility analysis",
          "ResMyce assessment",
          "Implementation cost estimation",
          "Risk evaluation"
        ]
      },
    ],
  },
  {
    title: "CHATBOT DEVELOPMENT",
    subtitle: "Create intelligent conversational interfaces that enhance user experience",
    tabs: [
      {
        name: "Strategy Development",
        content: "I develop sophisticated chatbot solutions that enhance customer engagement and streamline operations. My strategy focuses on creating natural, efficient, and context-aware conversational experiences that meet your specific business needs.",
        features: [
          "Conversation flow design",
          "Natural language processing",
          "Multi-channel integration",
          "Personalization strategy"
        ]
      },
      {
        name: "Performance Evaluation",
        content: "My comprehensive evaluation framework ensures your chatbot delivers consistent, high-quality interactions. I monitor key metrics and user satisfaction to continuously improve the chatbot's performance and effectiveness.",
        features: [
          "Response accuracy tracking",
          "User satisfaction metrics",
          "Conversation flow analysis",
          "Performance optimization"
        ]
      },
      {
        name: "Use Case Identification",
        content: "I analyze your customer interaction patterns and business processes to identify optimal chatbot implementation opportunities. My approach ensures that chatbot solutions address real business needs and enhance user experience.",
        features: [
          "Customer jMyney mapping",
          "Pain point analysis",
          "Automation opportunity identification",
          "ROI potential assessment"
        ]
      },
      {
        name: "Feasibility Assessments",
        content: "My feasibility assessment covers all aspects of chatbot implementation, from technical requirements to user adoption considerations. I provide detailed insights into resMyce needs, integration possibilities, and expected outcomes.",
        features: [
          "Technical requirements analysis",
          "Integration assessment",
          "ResMyce planning",
          "Implementation roadmap"
        ]
      },
    ],
  },
];

export default function ServicesSection() {
  const [selectedService, setSelectedService] = useState<number>(0);
  const [selectedTab, setSelectedTab] = useState<number>(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <section ref={ref} className="py-16 px-4 md:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto space-y-16"
      >
        {/* Service Blocks */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setSelectedService(index);
                setSelectedTab(0);
              }}
              className={cn(
                "group cursor-pointer rounded-lg p-8 transition-all border-0",
                selectedService === index
                  ? "bg-stone-100 dark:bg-stone-700 text-stone-800 dark:text-stone-100 shadow-[inset_2px_2px_5px_rgba(0,0,0,0.05),inset_-2px_-2px_5px_rgba(255,255,255,0.7)] dark:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.2),inset_-1px_-1px_3px_rgba(255,255,255,0.04)]"
                  : "bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-300 shadow-[3px_3px_6px_rgba(0,0,0,0.05),-3px_-3px_6px_rgba(255,255,255,0.8)] dark:shadow-[3px_3px_6px_rgba(0,0,0,0.25),-2px_-2px_5px_rgba(255,255,255,0.03)] hover:shadow-[2px_2px_4px_rgba(0,0,0,0.06),-2px_-2px_4px_rgba(255,255,255,0.9)] dark:hover:shadow-[2px_2px_4px_rgba(0,0,0,0.3),-1px_-1px_3px_rgba(255,255,255,0.05)] hover:translate-y-[-2px]"
              )}
            >
              <div className="flex flex-col h-full">
                <h3 className="text-xl font-semibold mb-3 font-['Space_Mono',monospace] text-stone-800 dark:text-stone-100">{service.title}</h3>
                <p className="text-sm mb-4 text-stone-600 dark:text-stone-400">{service.subtitle}</p>
                <div className="mt-auto flex items-center">
                  <ArrowUpRight className={cn(
                    "w-5 h-5 transition-transform",
                    selectedService === index ? "rotate-45" : "group-hover:rotate-45"
                  )} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Tabs and Content */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          {/* Tabs */}
          <div className="flex flex-wrap gap-4 justify-start">
            {services[selectedService].tabs.map((tab, index) => (
              <button
                key={tab.name}
                onClick={() => setSelectedTab(index)}
                className={cn(
                  "px-4 py-2 rounded-lg transition-all text-sm font-medium border-0 font-['Space_Mono',monospace]",
                  selectedTab === index
                    ? "bg-stone-100 dark:bg-stone-700 text-stone-800 dark:text-stone-100 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.05),inset_-2px_-2px_4px_rgba(255,255,255,0.7)] dark:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.2),inset_-1px_-1px_2px_rgba(255,255,255,0.04)]"
                    : "bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-300 shadow-[2px_2px_4px_rgba(0,0,0,0.05),-2px_-2px_4px_rgba(255,255,255,0.7)] dark:shadow-[2px_2px_4px_rgba(0,0,0,0.25),-1px_-1px_2px_rgba(255,255,255,0.03)] hover:translate-y-[-1px] hover:shadow-[1px_1px_2px_rgba(0,0,0,0.06),-1px_-1px_2px_rgba(255,255,255,0.8)] dark:hover:shadow-[1px_1px_2px_rgba(0,0,0,0.3),-0.5px_-0.5px_1px_rgba(255,255,255,0.05)]"
                )}
              >
                {tab.name}
              </button>
            ))}
          </div>

          {/* Content */}
          <motion.div
            key={`${selectedService}-${selectedTab}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-stone-50 dark:bg-stone-800 rounded-lg p-8 border-0 shadow-[3px_3px_6px_rgba(0,0,0,0.05),-3px_-3px_6px_rgba(255,255,255,0.8)] dark:shadow-[3px_3px_6px_rgba(0,0,0,0.25),-2px_-2px_5px_rgba(255,255,255,0.03)]"
          >
            <div className="max-w-3xl">
              <p className="text-lg text-card-foreground leading-relaxed mb-6">
                {services[selectedService].tabs[selectedTab].content}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {services[selectedService].tabs[selectedTab].features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Badge variant="secondary">{feature}</Badge>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}
