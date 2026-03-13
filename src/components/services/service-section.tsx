'use client'

import { useMemo, useRef, useState } from 'react'
import { m, useInView, useReducedMotion } from '@/lib/motion'
import { ArrowUpRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SERVICES } from '@/constants/services'

export default function ServicesSection(): React.ReactNode {
  const [selectedService, setSelectedService] = useState<number>(0)
  const [selectedTab, setSelectedTab] = useState<number>(0)
  const ref = useRef(null)
  const reduceMotion = useReducedMotion()
  const isInView = useInView(ref, { once: true })
  const currentService = useMemo(() => SERVICES[selectedService], [selectedService])
  const currentTab = useMemo(
    () => currentService.tabs[selectedTab],
    [currentService, selectedTab]
  )

  return (
    <section ref={ref} className="py-16 px-4 md:px-6 lg:px-8">
      <m.div
        initial={reduceMotion ? undefined : { opacity: 0, y: 20 }}
        animate={
          reduceMotion
            ? { opacity: 1, y: 0 }
            : isInView
              ? { opacity: 1, y: 0 }
              : { opacity: 0, y: 20 }
        }
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto space-y-16"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {SERVICES.map((service, index) => (
            <m.div
              key={service.title}
              whileHover={reduceMotion ? undefined : { scale: 1.02 }}
              whileTap={reduceMotion ? undefined : { scale: 0.98 }}
              onClick={() => {
                setSelectedService(index)
                setSelectedTab(0)
              }}
              className={cn(
                'group cursor-pointer rounded-xl p-8 transition-[transform,box-shadow,color,background-color]',
                selectedService === index
                  ? 'neu-pressed bg-primary/5'
                  : 'neu-card'
              )}
            >
              <div className="flex flex-col h-full">
                <h3 className={cn(
                  'text-xl font-semibold mb-3',
                  selectedService === index && 'text-primary'
                )}>{service.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">{service.subtitle}</p>
                <div className="mt-auto flex items-center">
                  <ArrowUpRight className={cn(
                    'w-5 h-5 transition-transform text-primary',
                    selectedService === index ? 'rotate-45' : 'group-hover:rotate-45'
                  )} />
                </div>
              </div>
            </m.div>
          ))}
        </div>

        <m.div
          initial={reduceMotion ? undefined : { opacity: 0 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          <div className="flex flex-wrap gap-3 justify-start">
            {currentService.tabs.map((tab, index) => (
              <button
                key={tab.name}
                onClick={() => setSelectedTab(index)}
                className={cn(
                  'px-5 py-2.5 rounded-xl transition-[color,background-color,box-shadow] text-sm font-medium',
                  selectedTab === index
                    ? 'neu-pressed text-primary'
                    : 'neu-button hover:text-primary'
                )}
              >
                {tab.name}
              </button>
            ))}
          </div>

          <m.div
            key={`${selectedService}-${selectedTab}`}
            initial={reduceMotion ? undefined : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="neu-card rounded-xl p-8"
          >
            <div className="max-w-3xl">
              <p className="text-lg leading-relaxed mb-6">
                {currentTab.content}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {currentTab.features.map((feature) => (
                  <div key={feature} className="flex items-center gap-2">
                    <span className="text-primary">→</span>
                    <span className="text-muted-foreground">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </m.div>
        </m.div>
      </m.div>
    </section>
  )
}
