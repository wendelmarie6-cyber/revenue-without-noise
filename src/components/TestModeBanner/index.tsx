import React from 'react'

/** Shown on every page with a buy button while Stripe runs in test mode. */
export const TestModeBanner: React.FC<{ text: string }> = ({ text }) => (
  <div
    role="status"
    className="w-full bg-amber-100 text-amber-950 dark:bg-amber-900 dark:text-amber-50 text-center text-sm font-medium py-2 px-4"
  >
    {text}
  </div>
)
