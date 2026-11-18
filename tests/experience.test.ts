import { FUNCTIONS, FLAVORS, resultTitle } from '../src/content/experience'
import { expReducer, initialExp, type ExpState } from '../src/lib/experienceMachine'

test('데이터는 스펙 표와 일치', () => {
  expect(FUNCTIONS.map(f => f.name)).toEqual(['하이드레이션', '클린 포커스', '에너지', '리커버리', '릴렉스', '데일리'])
  expect(FUNCTIONS.find(f => f.name === '하이드레이션')!.ingredients).toEqual(['나트륨 & 칼륨', '타우린'])
  expect(FUNCTIONS.find(f => f.name === '데일리')!.ingredients).toEqual(['비타민 B-complex & 미네랄', '클리어 단백질'])
  expect(FLAVORS.map(f => f.name)).toEqual(['자몽', '망고', '레몬', '복숭아', '오렌지'])
  expect(FLAVORS.map(f => f.color)).toEqual(['#F4A1A1', '#FFC24B', '#F6E27A', '#FFC7B2', '#FF9F45'])
})

test('기능 → 맛 → 붓기 → 완료', () => {
  let s = expReducer(initialExp, { type: 'pickFunction', id: FUNCTIONS[1].id })
  expect(s.step).toBe('flavor')
  s = expReducer(s, { type: 'pickFlavor', id: FLAVORS[0].id })
  expect(s.step).toBe('pouring')
  s = expReducer(s, { type: 'pourDone' })
  expect(s).toMatchObject({ step: 'done', fn: FUNCTIONS[1].id, flavor: FLAVORS[0].id })
  expect(resultTitle(s.fn!, s.flavor!)).toBe('클린 포커스 × 자몽')
})

test('붓는 중에는 선택·뒤로가기 무시', () => {
  const pouring: ExpState = { step: 'pouring', fn: 'focus', flavor: 'grapefruit' }
  expect(expReducer(pouring, { type: 'pickFunction', id: 'relax' })).toBe(pouring)
  expect(expReducer(pouring, { type: 'pickFlavor', id: 'mango' })).toBe(pouring)
  expect(expReducer(pouring, { type: 'back' })).toBe(pouring)
  expect(expReducer(pouring, { type: 'reset' })).toBe(pouring)
})

test('잘못된 순서·없는 id는 무시', () => {
  expect(expReducer(initialExp, { type: 'pickFlavor', id: 'mango' })).toBe(initialExp)
  expect(expReducer(initialExp, { type: 'pickFunction', id: 'nope' })).toBe(initialExp)
  expect(expReducer(initialExp, { type: 'pourDone' })).toBe(initialExp)
  const flavor: ExpState = { step: 'flavor', fn: 'focus' }
  expect(expReducer(flavor, { type: 'pickFlavor', id: 'nope' })).toBe(flavor)
})

test('reset은 처음으로, back은 맛 → 기능', () => {
  expect(expReducer({ step: 'done', fn: 'focus', flavor: 'mango' }, { type: 'reset' })).toEqual(initialExp)
  expect(expReducer({ step: 'flavor', fn: 'focus' }, { type: 'back' })).toEqual(initialExp)
})
