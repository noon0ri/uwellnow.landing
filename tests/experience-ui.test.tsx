import { act, fireEvent, render, screen } from '@testing-library/react'
import { Experience } from '../src/sections/Experience'
import { resetExp } from '../src/lib/experienceStore'
import { rig } from '../src/scene/rig'

// a real user needs >300ms between taps on successive steps
const settle = () => act(() => vi.advanceTimersByTime(350))

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'Date'] })
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
  settle()
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
  settle()
  fireEvent.click(screen.getByRole('button', { name: '뒤로' }))
  expect(screen.getByText('지금 필요한 건?')).toBeInTheDocument()
})

test('더블탭: 기능을 고른 직후의 두 번째 탭은 같은 자리의 맛을 고르지 않는다', () => {
  render(<Experience />)
  fireEvent.click(screen.getByRole('button', { name: '클린 포커스' }))
  fireEvent.click(screen.getByRole('button', { name: '망고' })) // same grid cell, 0ms later
  expect(screen.getByText('어떤 맛으로?')).toBeInTheDocument()
  settle()
  fireEvent.click(screen.getByRole('button', { name: '망고' }))
  expect(screen.getByText(/만드는 중/)).toBeInTheDocument()
})

test('단계가 바뀌면 포커스가 새 단계 제목으로, 완성되면 결과 제목으로 간다', () => {
  render(<Experience />)
  const fn = screen.getByRole('button', { name: '하이드레이션' })
  fn.focus()
  fireEvent.click(fn)
  expect(document.activeElement?.textContent).toBe('어떤 맛으로?')
  settle()
  fireEvent.click(screen.getByRole('button', { name: '레몬' }))
  act(() => vi.advanceTimersByTime(3000))
  expect(document.activeElement?.textContent).toBe('하이드레이션 × 레몬')
  fireEvent.click(screen.getByRole('button', { name: '다시 고르기' }))
  expect(document.activeElement?.textContent).toBe('지금 필요한 건?')
})

test('동작 줄이기: 붓기 시작과 동시에 카메라·컵이 최종 상태로 (애니메이션 없음)', () => {
  window.matchMedia = vi.fn().mockReturnValue({ matches: true, addEventListener() {}, removeEventListener() {} }) as any
  render(<Experience />)
  fireEvent.click(screen.getByRole('button', { name: '에너지' }))
  settle()
  fireEvent.click(screen.getByRole('button', { name: '오렌지' }))
  expect(rig.exp.blend).toBe(1)
  expect(rig.pour.progress).toBe(1)
  delete (window as any).matchMedia
})
