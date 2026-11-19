'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

const EVERY_MS = 2000
const GIVE_UP_AFTER = 30 // about a minute; the webhook usually lands in seconds

/** Re-reads the order from the server until the webhook has marked it paid. */
export function RefreshWhilePending() {
  const router = useRouter()
  useEffect(() => {
    let tries = 0
    const timer = setInterval(() => {
      tries += 1
      if (tries > GIVE_UP_AFTER) return clearInterval(timer)
      router.refresh()
    }, EVERY_MS)
    return () => clearInterval(timer)
  }, [router])
  return null
}
