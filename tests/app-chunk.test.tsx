import { act, render, screen } from '@testing-library/react'
import * as webgl from '../src/lib/webgl'

vi.mock('../src/scene/Stage', () => { throw new Error('chunk load failed') })

test('3D 청크 로드가 실패해도 페이지와 CTA는 남는다', async () => {
  vi.spyOn(webgl, 'hasWebGL').mockReturnValue(true)
  const { default: App } = await import('../src/App')
  render(<App />)
  await act(async () => { await new Promise(r => setTimeout(r, 50)) })
  expect(screen.getByText('물과 탄산수부터 지금 컨디션에 맞춘 영양 음료까지')).toBeInTheDocument()
  expect(screen.getAllByRole('link', { name: /사전 예약하기/ }).length).toBeGreaterThanOrEqual(3)
  expect(screen.getByAltText('유웰나우 AI 뉴트리션 디스펜서')).toBeInTheDocument()
})
