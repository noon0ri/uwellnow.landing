// All visible copy lives here (Korean only for now; reused from uwellnow.com).
export const NAV = [
  { label: '제품소개', href: '/#product' },
  { label: '사전예약', href: '/pre-registration' },
  { label: '원료소개', href: '/ingredients' },
  { label: '고객지원', href: '/support' },
]

export const CTA_LABEL = '사전 예약하기'
export const CTA_HREF = '/pre-registration'

export const HERO = {
  badge: 'NEW',
  title: '물과 탄산수부터 지금 컨디션에 맞춘 영양 음료까지',
  sub: '3초 만에 즉시 완성하는 지금 필요한 한 잔',
  posterAlt: '유웰나우 AI 뉴트리션 디스펜서',
}

export const FEATURES = [
  { eyebrow: 'AI 추천', title: '지금 나에게 맞는 한 잔을\nAI가 추천합니다', stat: '맞춤레시피 무제한', body: '취향과 니즈에 맞춘 레시피, 조합할수록 넓어지는 한 잔의 선택' },
  { eyebrow: '제조시간', title: '3초 이내\n빠르게 완성되는 한 잔', stat: '3초', body: '기다림 없이 바로 즐기는 웰니스' },
  { eyebrow: '원료 · 이용시간', title: '15가지 원료,\n24시간 언제든', stat: '15개 · 24시간', body: '지금 필요한 한 잔을 위한 15가지 선택. 원하는 순간 가까이에서 누리는 웰니스' },
]

export const SPACES_COPY = {
  title: '유웰나우와 함께 할 수 있는 공간',
}

export const SPEC = {
  title: '공간에 꼭 맞는 크기',
  rows: [
    ['크기', 'W 75.5 × D 56.2 × H 177 cm'],
    ['무게', '120 kg'],
    ['전압', 'AC 220V, 60Hz'],
    ['소비전력', '최대 2,000W'],
    ['급수방식', '직수 연결 / 내부 급수탱크'],
  ] as const,
  dims: { w: 'W 75.5', d: 'D 56.2', h: 'H 177' },
}

export const EXPERIENCE_COPY = {
  eyebrow: '직접 만들어 보기',
  title: '기능 하나, 맛 하나.\n3초면 나만의 한 잔',
  hint: '화면에서 지금 필요한 기능과 맛을 골라 보세요',
  stepFunction: '지금 필요한 건?',
  stepFlavor: '어떤 맛으로?',
  pouring: '만드는 중…',
  done: '완성! 나만의 한 잔',
  back: '뒤로',
  retry: '다시 고르기',
  ingredientsLabel: '들어간 원료',
  cta: '이 한 잔, 우리 공간에 들이기',
  fallback: '아래 버튼으로 기능과 맛을 골라 보세요',
}

export const APPS = {
  user: {
    label: '사용자 앱',
    title: '나에게 맞게 추천받고, 원하는 대로 완성합니다',
    image: '/img/user-recipe.webp',
    steps: [
      ['건강 정보를 입력하세요', '앱에 나의 건강 정보와 현재 컨디션을 입력합니다.'],
      ['맞춤 레시피를 추천받아요', '입력된 정보를 바탕으로 AI가 지금 나에게 맞는 한 잔을 추천합니다.'],
      ['내 취향대로 조정해요', '추천 레시피의 맛과 원료를 원하는 대로 세부 조정합니다.'],
      ['3초안에 완성해요', '선택이 끝나면 3초 안에 제조되어 바로 즐길 수 있습니다.'],
    ] as const,
  },
  admin: {
    label: '관리자 앱',
    title: '운영은 쉽고 관리는 간편하게',
    items: [
      ['고객과 주문을 더 쉽게 관리하세요', '/img/admin-customers.webp'],
      ['매출 흐름을 놓치지 마세요', '/img/admin-home.webp'],
      ['카트리지 잔여량을 실시간으로 관리하세요', '/img/admin-stock.webp'],
      ['필요할 때 바로, 부족하기 전에 자동으로', '/img/admin-cart.webp'],
    ] as const,
  },
}

export const FINAL_CTA = {
  title: '우리 공간에 유웰나우를',
  sub: '30초만에 신청하고, 출시 소식과 얼리버드 혜택을 가장 먼저 만나보세요',
}

export const FOOTER = {
  company: '주식회사 유웰나우 / 대표이사 하현서 / 부산광역시 남구 문현금융로 40 (BIFC)',
  biz: '사업자등록번호 336-81-03792 / 대표번호 010-2041-2103',
  copyright: '© 2026. UWELLNOW Co.,LTD. All rights reserved.',
}
