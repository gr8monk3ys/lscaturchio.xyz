"use client"

import { Container } from '@/components/Container'
import { Heading } from '@/components/Heading'
import { NewsletterForm } from './newsletter-form'
import { motion } from 'framer-motion'

export function NewsletterSection() {
  return (
    <section className="py-20" aria-label="Newsletter signup">
      <Container>
        <div className="max-w-2xl mx-auto text-center neu-card p-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Heading as="h2" className="mb-4">
              Stay Updated
            </Heading>
            <p className="text-lg text-muted-foreground mb-8">
              Join my newsletter to receive updates on new blog posts, projects, and insights on AI, web development, and data science.
            </p>
            <div className="flex justify-center">
              <NewsletterForm />
            </div>
          </motion.div>
        </div>
      </Container>
    </section>
  )
}
