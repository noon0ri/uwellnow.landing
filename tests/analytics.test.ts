import { track } from '../src/lib/analytics'

test('gtag 없으면 조용히 무시', () => {
  delete (window as any).gtag
  expect(() => track('cta_click', { location: 'hero' })).not.toThrow()
})

test('gtag 있으면 event 전송', () => {
  const g = vi.fn()
  ;(window as any).gtag = g
  track('cta_click', { location: 'hero' })
  expect(g).toHaveBeenCalledWith('event', 'cta_click', { location: 'hero' })
})
