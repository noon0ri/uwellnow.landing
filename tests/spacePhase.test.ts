import { photoOnlyOpacities, spaceOpacities } from '../src/lib/spacePhase'

test('spaceOpacities: 어느 지점에서도 사진이 두 장 진하게 겹치지 않는다', () => {
  for (let p = 0; p <= 1; p += 0.001) {
    const o = spaceOpacities(p, 5)
    expect(o.photo.reduce((a, b) => a + b, 0)).toBeLessThanOrEqual(1.0001)
    expect(Math.max(...o.photo) + o.model).toBeGreaterThan(0.99)
  }
})

test('spaceOpacities: 각 공간 구간 중앙에선 사진만', () => {
  const o = spaceOpacities((1 + 0.7) / 5, 5) // 두 번째 공간의 70% 지점
  expect(o.photo[1]).toBe(1)
  expect(o.model).toBe(0)
})

test('spaceOpacities: 시작과 끝은 3D만', () => {
  for (const p of [0, 1]) {
    const o = spaceOpacities(p, 5)
    expect(o.model).toBe(1)
    expect(Math.max(...o.photo)).toBe(0)
  }
})

test('spaceOpacities: 범위를 벗어난 진행도는 잘라낸다', () => {
  expect(spaceOpacities(-0.5, 5)).toEqual(spaceOpacities(0, 5))
  expect(spaceOpacities(1.5, 5)).toEqual(spaceOpacities(1, 5))
})

test('photoOnlyOpacities: 3D 없이도 항상 사진 한 장 분량이 보인다', () => {
  for (let p = 0; p <= 1; p += 0.001) {
    const o = photoOnlyOpacities(p, 5)
    expect(o.reduce((a, b) => a + b, 0)).toBeCloseTo(1)
  }
  expect(photoOnlyOpacities(0.5, 5)[2]).toBe(1)
})
