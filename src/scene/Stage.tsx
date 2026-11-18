import type { ReactNode } from 'react'

// Replaced in Task 5.
export default function Stage({ fallback }: { fallback: ReactNode }) {
  return <>{fallback}</>
}
