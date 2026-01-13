"use client"

import { usePathname } from 'next/navigation'

export function CanonicalLink() {
  const pathname = usePathname()
  const canonicalUrl = `https://lscaturchio.xyz${pathname || ''}`

  return <link rel="canonical" href={canonicalUrl} />
}
