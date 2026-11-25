/** @type {import('tailwindcss').Config} */
const config = {
  theme: {
    extend: {
      typography: {
        DEFAULT: {
          css: [
            {
              '--tw-prose-body': 'var(--text)',
              '--tw-prose-headings': 'var(--text)',
              '--tw-prose-lead': 'var(--muted-foreground)',
              '--tw-prose-links': 'var(--text)',
              '--tw-prose-bold': 'var(--text)',
              '--tw-prose-bullets': 'var(--primary)',
              '--tw-prose-counters': 'var(--muted-foreground)',
              '--tw-prose-hr': 'var(--border)',
              '--tw-prose-quotes': 'var(--text)',
              '--tw-prose-invert-body': 'var(--text)',
              '--tw-prose-invert-headings': 'var(--text)',
              '--tw-prose-invert-links': 'var(--text)',
              '--tw-prose-invert-bold': 'var(--text)',
              '--tw-prose-invert-lead': 'var(--muted-foreground)',
              '--tw-prose-invert-bullets': 'var(--primary)',
              color: 'var(--muted-foreground)',
              h1: {
                fontWeight: 'normal',
                marginBottom: '0.25em',
              },
            },
          ],
        },
        base: {
          css: [
            {
              h1: {
                fontSize: '2.75rem',
                lineHeight: '1.05',
              },
              h2: {
                fontSize: '1.75rem',
                lineHeight: '1.15',
              },
            },
          ],
        },
        md: {
          css: [
            {
              h1: {
                fontSize: '4.5rem',
                lineHeight: '1.02',
              },
              h2: {
                fontSize: '2.25rem',
              },
            },
          ],
        },
      },
    },
  },
}

export default config
