import React from 'react'

/** Shown on every page with a buy button while Stripe runs in test mode. */
export const TestModeBanner: React.FC<{ text: string }> = ({ text }) => (
  <div
    role="status"
    className="w-full border-y border-amber-500/30 bg-amber-500/10 text-amber-200 text-center text-xs font-medium uppercase tracking-[0.2em] py-2 px-4"
  >
    {text}
  </div>
)
