"use client"

import { usePathname } from 'next/navigation'
import { SITE_URL } from '@/lib/site-url'

export function CanonicalLink() {
  const pathname = usePathname()
  const canonicalUrl = `${SITE_URL}${pathname || ''}`

  return <link rel="canonical" href={canonicalUrl} />
}
