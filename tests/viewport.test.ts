import { viewport } from '../src/lib/viewport'

test('viewport는 스크롤바를 뺀 실제 캔버스 크기를 쓴다', () => {
  Object.defineProperty(window, 'innerWidth', { value: 1440, configurable: true })
  Object.defineProperty(document.documentElement, 'clientWidth', { value: 1423, configurable: true })
  Object.defineProperty(document.documentElement, 'clientHeight', { value: 880, configurable: true })
  expect(viewport()).toEqual({ w: 1423, h: 880 })
})
