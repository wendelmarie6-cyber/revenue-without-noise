import { describe, expect, it } from 'vitest'

import { isActivePath } from '@/utilities/isActivePath'

describe('isActivePath: which header tab is marked as the current page', () => {
  it('marks the tab of the page you are on', () => {
    expect(isActivePath('/shop', '/shop')).toBe(true)
  })

  it('keeps the tab marked on pages below it', () => {
    expect(isActivePath('/shop/thank-you', '/shop')).toBe(true)
    expect(isActivePath('/events/vouched-stammtisch-munich', '/events')).toBe(true)
  })

  it('ignores a trailing slash, query and anchor', () => {
    expect(isActivePath('/shop/', '/shop')).toBe(true)
    expect(isActivePath('/shop', '/shop#step-build')).toBe(true)
    expect(isActivePath('/apply', '/apply?event=vouched-table-munich')).toBe(true)
  })

  it('does not mark a tab whose name only starts the same', () => {
    expect(isActivePath('/shopping', '/shop')).toBe(false)
    expect(isActivePath('/events', '/shop')).toBe(false)
  })

  it('marks the home tab only on the home page', () => {
    expect(isActivePath('/', '/')).toBe(true)
    expect(isActivePath('/shop', '/')).toBe(false)
  })

  it('never marks links to other sites', () => {
    expect(isActivePath('/', 'https://revenuewithoutnoise.com')).toBe(false)
    expect(isActivePath('/shop', null)).toBe(false)
  })
})
