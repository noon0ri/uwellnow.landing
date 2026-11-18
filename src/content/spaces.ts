export type SpaceId = 'fitness' | 'office' | 'apartment' | 'spa' | 'lounge'

export type Box = { x0: number; y0: number; x1: number; y1: number }

/** device: the dispenser's full extent in the photo, normalized 0–1. rotY: model yaw (rad) matching the photo's view. */
export type Space = { id: SpaceId; name: string; src: string; srcMobile: string; w: number; h: number; device: Box; rotY: number }

// Boxes measured in px on the 1600×893 variants.
const space = (id: SpaceId, name: string, w: number, h: number, [x0, y0, x1, y1]: number[], rotY = 0): Space => ({
  id, name, src: `/img/space-${id}.webp`, srcMobile: `/img/space-${id}-m.webp`, w, h, rotY,
  device: { x0: x0 / 1600, y0: y0 / 893, x1: x1 / 1600, y1: y1 / 893 },
})

export const SPACES: Space[] = [
  space('fitness', '피트니스', 3356, 1874, [676, 262, 854, 686]),
  space('office', '오피스', 2752, 1536, [1058, 248, 1280, 790]),
  space('apartment', '아파트 커뮤니티', 2752, 1536, [1135, 228, 1375, 768]),
  space('spa', '스파 & 사우나', 3990, 2226, [1033, 208, 1265, 722]),
  // Shot at an angle; the photo's device is slimmer than the model at any yaw, so x0 is nudged +30px to centre the overlap.
  space('lounge', '라운지', 3636, 2028, [958, 225, 1140, 730], -0.75),
]
