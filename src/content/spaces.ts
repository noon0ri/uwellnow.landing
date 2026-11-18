export type SpaceId = 'fitness' | 'office' | 'apartment' | 'spa' | 'lounge'

export type Space = { id: SpaceId; name: string; src: string; srcMobile: string; w: number; h: number }

const space = (id: SpaceId, name: string, w: number, h: number): Space =>
  ({ id, name, src: `/img/space-${id}.webp`, srcMobile: `/img/space-${id}-m.webp`, w, h })

export const SPACES: Space[] = [
  space('fitness', '피트니스', 3356, 1874),
  space('office', '오피스', 2752, 1536),
  space('apartment', '아파트 커뮤니티', 2752, 1536),
  space('spa', '스파 & 사우나', 3990, 2226),
  space('lounge', '라운지', 3636, 2028),
]
