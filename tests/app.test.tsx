import { render, screen } from '@testing-library/react'
import * as webgl from '../src/lib/webgl'
import App from '../src/App'

test('WebGL 없이도 헤드라인과 CTA가 보인다', () => {
  vi.spyOn(webgl, 'hasWebGL').mockReturnValue(false)
  render(<App />)
  expect(screen.getByText('물과 탄산수부터 지금 컨디션에 맞춘 영양 음료까지')).toBeInTheDocument()
  expect(screen.getByAltText('유웰나우 AI 뉴트리션 디스펜서')).toHaveAttribute('src', '/img/hero-poster.webp')
  const ctas = screen.getAllByRole('link', { name: /사전 예약하기/ })
  expect(ctas.length).toBeGreaterThanOrEqual(3) // 헤더, 히어로, 마지막
  ctas.forEach(a => expect(a).toHaveAttribute('href', '/pre-registration'))
})

test('헤더 내비는 기존 페이지로 간다', () => {
  vi.spyOn(webgl, 'hasWebGL').mockReturnValue(false)
  render(<App />)
  // desktop list + mobile menu each render the nav
  screen.getAllByRole('link', { name: '원료소개' }).forEach(a => expect(a).toHaveAttribute('href', '/ingredients'))
  screen.getAllByRole('link', { name: '고객지원' }).forEach(a => expect(a).toHaveAttribute('href', '/support'))
})

test('제품소개 링크(/#product)의 대상이 있다', () => {
  vi.spyOn(webgl, 'hasWebGL').mockReturnValue(false)
  const { container } = render(<App />)
  expect(container.querySelector('#product')).not.toBeNull()
})
