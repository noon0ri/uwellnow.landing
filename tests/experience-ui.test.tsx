import { act, fireEvent, render, screen } from '@testing-library/react'
import { Experience } from '../src/sections/Experience'
import { resetExp } from '../src/lib/experienceStore'

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
  resetExp()
})
afterEach(() => vi.useRealTimers())

test('기능 → 맛 → 3초 후 결과와 사전예약 CTA, 이벤트는 한 번', () => {
  const gtag = vi.fn()
  ;(window as any).gtag = gtag
  render(<Experience />)
  expect(screen.getByText('지금 필요한 건?')).toBeInTheDocument()
  expect(screen.getAllByRole('button').filter(b => b.dataset.fn)).toHaveLength(6)

  fireEvent.click(screen.getByRole('button', { name: '클린 포커스' }))
  expect(screen.getByText('어떤 맛으로?')).toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: '자몽' }))
  expect(screen.getByText(/만드는 중/)).toBeInTheDocument()

  act(() => vi.advanceTimersByTime(3000))
  expect(screen.getAllByText('클린 포커스 × 자몽').length).toBeGreaterThan(0)
  expect(screen.getByText('카페인 & L-테아닌')).toBeInTheDocument()
  expect(screen.getByRole('link', { name: '이 한 잔, 우리 공간에 들이기' })).toHaveAttribute('href', '/pre-registration')
  expect(gtag.mock.calls.filter(c => c[1] === 'experience_complete')).toEqual([['event', 'experience_complete', { function: 'focus', flavor: 'grapefruit' }]])

  fireEvent.click(screen.getByRole('button', { name: '다시 고르기' }))
  expect(screen.getByText('지금 필요한 건?')).toBeInTheDocument()
})

test('맛 단계에서 뒤로 가면 기능 선택으로', () => {
  render(<Experience />)
  fireEvent.click(screen.getByRole('button', { name: '릴렉스' }))
  fireEvent.click(screen.getByRole('button', { name: '뒤로' }))
  expect(screen.getByText('지금 필요한 건?')).toBeInTheDocument()
})
