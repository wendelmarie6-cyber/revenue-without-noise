import React from 'react'

/**
 * Renders a plain CMS text with *asterisks* around words as italics, which
 * headings show in the brand green ("Join Vouched, or *book a session*").
 * Keeps the copy in the admin panel while allowing the website's emphasis.
 */
export const Emphasis: React.FC<{ text?: string | null }> = ({ text }) => {
  if (!text) return null
  return (
    <>
      {text.split(/(\*[^*]+\*)/g).map((part, i) =>
        part.startsWith('*') && part.endsWith('*') && part.length > 2 ? (
          <em key={i}>{part.slice(1, -1)}</em>
        ) : (
          <React.Fragment key={i}>{part}</React.Fragment>
        ),
      )}
    </>
  )
}
