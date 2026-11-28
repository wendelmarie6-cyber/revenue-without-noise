// Whether a header link points at the page the visitor is on, so the tab can
// be marked. A tab stays marked on the pages below it (/shop/thank-you under
// /shop); the home link only on the home page; links to other sites never.
export const isActivePath = (pathname: string, href: string | null | undefined): boolean => {
  if (!href || !href.startsWith('/')) return false
  const clean = (p: string) => p.split(/[?#]/)[0].replace(/\/+$/, '') || '/'
  const target = clean(href)
  const current = clean(pathname)
  if (target === '/') return current === '/'
  return current === target || current.startsWith(`${target}/`)
}
