import { ViewCountsProvider } from '@/hooks/use-view-counts'

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <ViewCountsProvider>{children}</ViewCountsProvider>
}
