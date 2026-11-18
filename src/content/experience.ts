// Functions grouped from the site's ingredient tags (approved by the user, 2026-11-18).
export const FUNCTIONS = [
  { id: 'hydration', name: '하이드레이션', ingredients: ['나트륨 & 칼륨', '타우린'] },
  { id: 'focus', name: '클린 포커스', ingredients: ['카페인 & L-테아닌'] },
  { id: 'energy', name: '에너지', ingredients: ['비타민C'] },
  { id: 'recovery', name: '리커버리', ingredients: ['필수 아미노산(BCAA)'] },
  { id: 'relax', name: '릴렉스', ingredients: ['마그네슘 & L-테아닌 & 루테인'] },
  { id: 'daily', name: '데일리', ingredients: ['비타민 B-complex & 미네랄', '클리어 단백질'] },
]

export const FLAVORS = [
  { id: 'grapefruit', name: '자몽', color: '#F4A1A1' },
  { id: 'mango', name: '망고', color: '#FFC24B' },
  { id: 'lemon', name: '레몬', color: '#F6E27A' },
  { id: 'peach', name: '복숭아', color: '#FFC7B2' },
  { id: 'orange', name: '오렌지', color: '#FF9F45' },
]

export const findFunction = (id: string) => FUNCTIONS.find(f => f.id === id)
export const findFlavor = (id: string) => FLAVORS.find(f => f.id === id)

export const resultTitle = (fnId: string, flavorId: string) => `${findFunction(fnId)?.name} × ${findFlavor(flavorId)?.name}`
