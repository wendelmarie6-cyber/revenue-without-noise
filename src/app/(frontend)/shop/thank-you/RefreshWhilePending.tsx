'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

// The webhook usually lands within seconds, so check often at first. A late
// webhook (Stripe retries for hours) is still picked up, just less often.
const FAST_MS = 2000
const FAST_TRIES = 30 // about a minute
const SLOW_MS = 15000
const GIVE_UP_AFTER_MS = 10 * 60 * 1000

/** Re-reads the order from the server until the webhook has marked it paid. */
export function RefreshWhilePending() {
  const router = useRouter()
  useEffect(() => {
    const started = Date.now()
    let tries = 0
    let timer: ReturnType<typeof setTimeout>
    const tick = () => {
      tries += 1
      if (Date.now() - started > GIVE_UP_AFTER_MS) return
      router.refresh()
      timer = setTimeout(tick, tries < FAST_TRIES ? FAST_MS : SLOW_MS)
    }
    timer = setTimeout(tick, FAST_MS)
    return () => clearTimeout(timer)
  }, [router])
  return null
}
