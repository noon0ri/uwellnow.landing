import { coverRect, photoFocus, deviceScreenRect, screenRectToWorld } from '../src/lib/photoFit'
import { SPACES } from '../src/content/spaces'

test('coverRect: 16:9 사진을 세로 화면에 깔면 좌우가 잘린다', () => {
  const r = coverRect(1600, 893, 390, 844)
  expect(r.h).toBeCloseTo(844)
  expect(r.w).toBeCloseTo((1600 * 844) / 893)
  expect(r.x).toBeCloseTo((390 - r.w) / 2)
  expect(r.y).toBeCloseTo(0)
})

test('coverRect: 울트라와이드에서는 위아래가 잘린다', () => {
  const r = coverRect(1600, 893, 2560, 1080)
  expect(r.w).toBeCloseTo(2560)
  expect(r.x).toBeCloseTo(0)
  expect(r.y).toBeLessThan(0)
})

test('deviceScreenRect: 사진과 같은 비율이면 박스 그대로', () => {
  const s = SPACES.find(s => s.id === 'fitness')!
  const d = deviceScreenRect(s, 1600, 893.6)
  expect(d.cx).toBeCloseTo(((0.4225 + 0.534) / 2) * 1600, 0)
  expect(d.h).toBeCloseTo((0.768 - 0.293) * 893.6, 0)
})

test('deviceScreenRect: 세로 모바일에서도 사진 크롭을 따라간다', () => {
  const s = SPACES.find(s => s.id === 'office')!
  const f = photoFocus(s, 390, 844)
  const r = coverRect(s.w, s.h, 390, 844, f.x, f.y)
  const d = deviceScreenRect(s, 390, 844)
  expect(d.cx).toBeCloseTo(r.x + ((s.device.x0 + s.device.x1) / 2) * r.w)
  expect(d.cy).toBeCloseTo(r.y + ((s.device.y0 + s.device.y1) / 2) * r.h)
  expect(d.h).toBeCloseTo((s.device.y1 - s.device.y0) * r.h)
})

test('screenRectToWorld: 화면 중앙 전체 높이면 x=y=0, 스케일은 시야 높이/1.77', () => {
  const w = screenRectToWorld({ cx: 800, cy: 450, h: 900 }, 1600, 900, { fovDeg: 35, distance: 5 })
  const viewH = 2 * 5 * Math.tan(((35 / 2) * Math.PI) / 180)
  expect(w.x).toBeCloseTo(0)
  expect(w.y).toBeCloseTo(0)
  expect(w.scale).toBeCloseTo(viewH / 1.77)
})

test('screenRectToWorld: 화면 오른쪽 위는 +x, +y', () => {
  const w = screenRectToWorld({ cx: 1200, cy: 225, h: 300 }, 1600, 900, { fovDeg: 35, distance: 5 })
  const viewH = 2 * 5 * Math.tan(((35 / 2) * Math.PI) / 180)
  expect(w.x).toBeCloseTo((400 / 900) * viewH)
  expect(w.y).toBeCloseTo((225 / 900) * viewH)
  expect(w.scale).toBeCloseTo(((300 / 900) * viewH) / 1.77)
})

test('SPACES: 5개, 순서와 박스 범위', () => {
  expect(SPACES.map(s => s.id)).toEqual(['fitness', 'office', 'apartment', 'spa', 'lounge'])
  SPACES.forEach(s => {
    expect(s.device.x0).toBeLessThan(s.device.x1)
    expect(s.device.y0).toBeLessThan(s.device.y1)
    expect(s.device.x0).toBeGreaterThanOrEqual(0)
    expect(s.device.y1).toBeLessThanOrEqual(1)
  })
})

test('coverRect: object-position 비율을 따른다', () => {
  const r = coverRect(1600, 893, 390, 844, 0.75, 0.5)
  expect(r.x).toBeCloseTo((390 - r.w) * 0.75)
})

test('모든 공간의 기기가 세로 모바일·울트라와이드 화면 안에 다 들어온다', () => {
  for (const [vw, vh] of [[390, 844], [360, 740], [2560, 1080], [1440, 900]]) {
    SPACES.forEach(s => {
      const f = photoFocus(s, vw, vh)
      const r = coverRect(s.w, s.h, vw, vh, f.x, f.y)
      expect(r.x + s.device.x0 * r.w).toBeGreaterThanOrEqual(0)
      expect(r.x + s.device.x1 * r.w).toBeLessThanOrEqual(vw)
      expect(r.y + s.device.y0 * r.h).toBeGreaterThanOrEqual(0)
      expect(r.y + s.device.y1 * r.h).toBeLessThanOrEqual(vh)
    })
  }
})

test('photoFocus: 크롭 여유가 있으면 기기를 화면 가운데로', () => {
  const s = SPACES.find(s => s.id === 'office')!
  const f = photoFocus(s, 390, 844)
  const r = coverRect(s.w, s.h, 390, 844, f.x, f.y)
  expect(r.x + ((s.device.x0 + s.device.x1) / 2) * r.w).toBeCloseTo(195)
})
