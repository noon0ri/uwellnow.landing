# 유웰나우 3D 스크롤 랜딩 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** uwellnow.com 홈을 대체할 한국어 3D 스크롤 랜딩 — 디스펜서가 회전·줌으로 기능을 강조하고, 5개 공간 사진에 바통 터치로 놓이고, 디스플레이에서 기능×맛을 골라 컵에 음료가 채워진 뒤 사전예약으로 이어진다.

**Architecture:** 화면 전체에 고정된 R3F `<Canvas>` 하나 위로 일반 HTML 섹션이 스크롤된다. 섹션마다 GSAP ScrollTrigger(scrub)가 공유 가변 객체 `rig`(모델 회전·위치·스케일, 카메라, 3D 불투명도, 사진 불투명도)를 갱신하고, `useFrame`이 매 프레임 `rig`를 읽어 씬에 반영한다. 순수 계산(사진 크롭→화면 좌표→월드 좌표, 체험 상태 전이, 공간 구간 불투명도)은 `src/lib`에 두고 vitest로 고정한다.

**Tech Stack:** Vite + React 19 + TypeScript, Tailwind v4(`@tailwindcss/vite`), `three`, `@react-three/fiber`, `@react-three/drei`, `gsap`(ScrollTrigger), vitest + jsdom + @testing-library/react. 에셋 처리: `npx @gltf-transform/cli`, Python Pillow(설치됨).

**Spec:** `docs/superpowers/specs/2026-11-18-uwellnow-3d-landing-design.md`

## Global Constraints

- 한국어만. 모든 노출 문구는 `src/content/*.ts`에만 둔다(나중에 영어 추가 대비).
- 카피는 현재 사이트 문구 재사용(스펙 부록). 효능 표현은 사이트 문구 범위를 넘지 않는다.
- 색: `#171717`, `#fff`, `#f2f2f2`, `#eaeaea`, `#393939`, `#222`. 폰트: Freesentation 가변 woff2.
- 사전예약 링크는 항상 `/pre-registration`, 일반 `<a href>`(클라이언트 라우터 없음).
- 헤더 고정: 로고 · 제품소개(`/#product`) · 사전예약 · 원료소개(`/ingredients`) · 고객지원(`/support`) · [사전 예약하기].
- `vite.config.ts`의 `build.assetsDir = 'assets-home'`.
- GA4 `G-CRPVFTV8N0`. 이벤트: `cta_click {location}`, `experience_complete {function, flavor}`.
- 첫 화면 문구·CTA는 HTML로 즉시 렌더, 3D는 지연 로드, 로딩/실패 시 `hero-poster` 이미지.
- DPR 상한 2(모바일 너비 < 768px는 1.5). `prefers-reduced-motion: reduce`이면 회전·줌 대신 정적 전환.
- 기기 실제 높이 1.77 → 씬 단위 1 = 1m로 모델을 높이 1.77로 정규화.

## Review Focus

1. 뷰포트 비율이 사진(약 16:9)과 크게 다를 때(390×844 세로 모바일, 2560×1080 울트라와이드) 바통 터치 순간 3D 기기와 사진 속 기기가 어긋남 → Task 3 `photoFit` 테스트에 두 크기 포함.
2. 공간/체험 구간을 빠르게 또는 거꾸로 스크롤 → 기기가 사라진 채 남거나 사진 두 장이 동시에 진하게 보임. 불투명도는 이벤트가 아니라 진행도의 순수 함수여야 함 → Task 3 `spaceOpacities` 테스트.
3. 붓는 중 다시 탭하거나 연타 → 상태가 꼬이거나 이벤트 중복 전송 → Task 4 reducer 테스트.
4. WebGL 미지원/GLB 로드 실패 → 빈 화면. 포스터와 모든 카피·CTA가 남아야 함 → Task 2 App 폴백 테스트.
5. 스크롤 도중 창 크기 변경/기기 회전 → 정렬 깨짐. 리사이즈 시 `ScrollTrigger.refresh()`와 photoFit 재계산 → Task 7 수동 검증 항목.

---

## File Structure

```
index.html                     GA4 스니펫, 폰트 preload, lang="ko"
vite.config.ts                 react + tailwind 플러그인, assetsDir, vitest(jsdom)
scripts/fetch-assets.sh        현재 사이트 에셋 → public/
scripts/prep-model.sh          GLB 최적화(+ 텍스처 컵 지우기 필요 시)
public/img/…, public/fonts/…, public/models/dispenser.glb
src/main.tsx, src/App.tsx, src/index.css
src/content/copy.ts            모든 섹션 카피
src/content/experience.ts      FUNCTIONS, FLAVORS, resultTitle
src/content/spaces.ts          SPACES(사진 경로·크기·기기 박스)
src/lib/analytics.ts           track()
src/lib/photoFit.ts            coverRect, deviceScreenRect, screenRectToWorld
src/lib/spacePhase.ts          spaceOpacities
src/lib/experienceMachine.ts   reducer
src/lib/webgl.ts               hasWebGL()
src/scene/Stage.tsx            Canvas, 조명, 환경, Suspense, 에러 경계
src/scene/Dispenser.tsx        GLB 로드·정규화, rig 반영
src/scene/anchors.ts           측정한 모델 좌표(DISPLAY, NOZZLE, CUP_BASE)
src/scene/rig.ts               공유 rig 객체 + 기본값
src/scene/useScrollRig.ts      섹션별 ScrollTrigger → rig
src/scene/DisplayUI.tsx        drei <Html transform> + ExperiencePanel
src/scene/Cup.tsx              컵·물줄기·액체
src/sections/*.tsx             Header, Hero, Features, Spaces, Spec, Experience, Apps, FinalCta, Footer
tests/*.test.ts(x)
```

---

### Task 1: 프로젝트 골격과 에셋

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `index.html`, `src/main.tsx`, `src/index.css`, `scripts/fetch-assets.sh`, `scripts/prep-model.sh`, `.gitignore`
- Create (생성물): `public/img/*`, `public/fonts/Freesentation.woff2`, `public/models/dispenser.glb`

**Interfaces:**
- Produces: 정적 경로 `/img/space-{fitness,office,apartment,spa,lounge}.webp`(약 2400px), `/img/space-{…}-m.webp`(약 1600px), `/img/hero-poster.webp`, `/img/user-recipe.webp`, `/img/admin-{home,customers,stock,cart}.webp`, `/img/logo.svg`(또는 현재 사이트가 쓰는 형식), `/fonts/Freesentation.woff2`, `/models/dispenser.glb`. `npm test`, `npm run dev`, `npm run build`.

- [ ] **Step 1:** `git init`, Vite React-TS 템플릿 수준의 골격 작성, 의존성 설치(Tech Stack 목록). `index.html`에 `lang="ko"`, GA4 gtag 스니펫, 폰트 preload. `index.css`에 Tailwind import, `@font-face` Freesentation, Global Constraints의 색을 `@theme` 토큰으로.
- [ ] **Step 2:** `scripts/fetch-assets.sh`: `curl -s https://uwellnow.com/`에서 `/assets/<name>-<hash>.webp` 목록을 뽑아 이름별로 가장 큰 파일과 약 1600px 파일을 위 경로로 저장. 로고는 현재 헤더의 로고 자산, 폰트는 `FreesentationVF-*.woff2`.
- [ ] **Step 3:** `scripts/prep-model.sh`: `npx @gltf-transform/cli optimize "디스펜서 3D 모델.glb" public/models/dispenser.glb --compress meshopt --texture-compress webp`.
- [ ] **Step 4: 검증** — `bash scripts/fetch-assets.sh && bash scripts/prep-model.sh && ls -la public/img public/models` 로 위 파일이 모두 있고 GLB가 2.7MB보다 작음. `npm run build` 성공, `dist/assets-home/`가 생김.
- [ ] **Step 5: Commit** `chore: scaffold vite app and fetch site assets`

### Task 2: 콘텐츠·분석·WebGL 폴백이 있는 정적 페이지

3D 없이도 완결된 페이지(전환 안전망). 이후 태스크가 이 위에 3D를 얹는다.

**Files:**
- Create: `src/content/copy.ts`, `src/lib/analytics.ts`, `src/lib/webgl.ts`, `src/App.tsx`, `src/sections/{Header,Hero,Features,Spaces,Spec,Experience,Apps,FinalCta,Footer}.tsx`
- Test: `tests/app.test.tsx`, `tests/analytics.test.ts`

**Interfaces:**
- Produces:
  - `track(event: 'cta_click' | 'experience_complete', params: Record<string, string>): void` — `window.gtag` 없으면 아무것도 안 함.
  - `hasWebGL(): boolean`
  - `<CtaLink location: string className?>` (Header 안에 export) — `href="/pre-registration"`, 클릭 시 `track('cta_click', {location})`.
  - 각 섹션은 `id`를 가진 `<section>`: `hero`, `features`, `spaces`, `spec`, `experience`, `apps`, `final-cta`. 스크롤 높이: hero 100vh, features 300vh, spaces 5×150vh, spec 150vh, experience 200vh(안쪽 sticky 100vh), apps/final-cta/footer는 내용 높이.
  - `App`은 `hasWebGL()`이 true일 때만 `React.lazy(() => import('./scene/Stage'))`를 렌더. 그 전까지/false일 때는 고정 배경 `<img src="/img/hero-poster.webp">`.

- [ ] **Step 1: 실패하는 테스트**

```tsx
// tests/app.test.tsx
test('WebGL 없이도 헤드라인과 CTA가 보인다', () => {
  vi.spyOn(webgl, 'hasWebGL').mockReturnValue(false)
  render(<App />)
  expect(screen.getByText('물과 탄산수부터 지금 컨디션에 맞춘 영양 음료까지')).toBeInTheDocument()
  expect(screen.getByAltText(/유웰나우/)).toHaveAttribute('src', '/img/hero-poster.webp')
  const ctas = screen.getAllByRole('link', { name: /사전 예약하기/ })
  expect(ctas.length).toBeGreaterThanOrEqual(3) // 헤더, 히어로, 마지막
  ctas.forEach(a => expect(a).toHaveAttribute('href', '/pre-registration'))
})
test('헤더 내비는 기존 페이지로 간다', () => {
  render(<App />)
  expect(screen.getByRole('link', { name: '원료소개' })).toHaveAttribute('href', '/ingredients')
  expect(screen.getByRole('link', { name: '고객지원' })).toHaveAttribute('href', '/support')
})
// tests/analytics.test.ts
test('gtag 없으면 조용히 무시', () => { delete (window as any).gtag; expect(() => track('cta_click', { location: 'hero' })).not.toThrow() })
test('gtag 있으면 event 전송', () => { const g = vi.fn(); (window as any).gtag = g; track('cta_click', { location: 'hero' }); expect(g).toHaveBeenCalledWith('event', 'cta_click', { location: 'hero' }) })
```

- [ ] **Step 2:** `npm test` → FAIL(모듈 없음).
- [ ] **Step 3:** 구현. 카피는 스펙 부록과 페이지 구성 그대로 `copy.ts`에. Spaces 섹션은 이 단계에서 공간 이름 + 사진을 정적으로 보여주고(3D 없을 때의 모습), Spec은 표, Experience는 Task 4의 패널이 들어갈 자리(이 단계에선 "아래로 스크롤해 한 잔을 만들어 보세요" 문구), Apps는 사용자 앱 4단계 / 관리자 앱 4기능 카드 + 이미지.
- [ ] **Step 4:** `npm test` → PASS. `npm run dev`로 열어 데스크톱 1440×900, 모바일 390×844에서 모든 섹션이 읽히는지 눈으로 확인.
- [ ] **Step 5: Commit** `feat: static landing with copy, CTA tracking, webgl fallback`

### Task 3: 바통 터치 계산 + 공간 데이터

**Files:**
- Create: `src/lib/photoFit.ts`, `src/lib/spacePhase.ts`, `src/content/spaces.ts`
- Test: `tests/photoFit.test.ts`, `tests/spacePhase.test.ts`

**Interfaces:**
- Produces:
  - `type Box = { x0: number; y0: number; x1: number; y1: number }` (사진 기준 0–1 정규화, 기기의 바닥~상단 전체)
  - `type Space = { id: 'fitness'|'office'|'apartment'|'spa'|'lounge'; name: string; src: string; srcMobile: string; w: number; h: number; device: Box }`
  - `SPACES: Space[]` — 순서 피트니스, 오피스, 아파트 커뮤니티, 스파 & 사우나, 라운지
  - `coverRect(imgW, imgH, vw, vh): { x: number; y: number; w: number; h: number }` — `object-fit: cover; object-position: center` 일 때 이미지가 그려지는 px 사각형(음수 x/y 가능)
  - `deviceScreenRect(space: Space, vw, vh): { cx: number; cy: number; h: number }` — 뷰포트 px 기준 기기 박스 중심과 높이
  - `screenRectToWorld(r: {cx,cy,h}, vw, vh, cam: { fovDeg: number; distance: number }): { x: number; y: number; scale: number }` — 카메라가 원점을 `distance`만큼 떨어져 −z로 볼 때, 높이 1.77 모델이 화면 높이 `r.h`로 `r` 위치에 투영되게 하는 월드 x, y와 스케일
  - `spaceOpacities(p: number, n: number): { photo: number[]; model: number }` — 공간 구간 진행도 p∈[0,1], 공간 n개. 각 공간 구간 = [이동 0–40% → 3D가 박스에 정렬, 40–50% 3D→사진 크로스페이드, 50–90% 사진 유지, 90–100% 사진→3D]. 어느 p에서도 photo 합 ≤ 1, `max(photo)+model`은 1에 가까움(±0.01).
- 측정값(1600×893 기준에서 잰 값, 나머지는 이 태스크에서 같은 방식으로 측정): fitness `{x0:.423,y0:.293,x1:.533,y1:.767}`, office `{x0:.661,y0:.278,x1:.800,y1:.885}`.

- [ ] **Step 1: 실패하는 테스트**

```ts
test('coverRect: 16:9 사진을 세로 화면에 깔면 좌우가 잘린다', () => {
  const r = coverRect(1600, 893, 390, 844)
  expect(r.h).toBeCloseTo(844); expect(r.w).toBeCloseTo(1600 * 844 / 893); expect(r.x).toBeCloseTo((390 - r.w) / 2)
})
test('coverRect: 울트라와이드에서는 위아래가 잘린다', () => {
  const r = coverRect(1600, 893, 2560, 1080)
  expect(r.w).toBeCloseTo(2560); expect(r.y).toBeLessThan(0)
})
test('deviceScreenRect: 사진과 같은 비율이면 박스 그대로', () => {
  const s = SPACES.find(s => s.id === 'fitness')!
  const d = deviceScreenRect(s, 1600, 893)
  expect(d.cx).toBeCloseTo(((.423 + .533) / 2) * 1600, 0); expect(d.h).toBeCloseTo((.767 - .293) * 893, 0)
})
test('screenRectToWorld: 화면 중앙 전체 높이면 x=y=0, 스케일은 시야 높이/1.77', () => {
  const w = screenRectToWorld({ cx: 800, cy: 450, h: 900 }, 1600, 900, { fovDeg: 35, distance: 5 })
  const viewH = 2 * 5 * Math.tan((35 / 2) * Math.PI / 180)
  expect(w.x).toBeCloseTo(0); expect(w.y).toBeCloseTo(0); expect(w.scale).toBeCloseTo(viewH / 1.77)
})
test('SPACES: 5개, 순서와 박스 범위', () => {
  expect(SPACES.map(s => s.id)).toEqual(['fitness', 'office', 'apartment', 'spa', 'lounge'])
  SPACES.forEach(s => { expect(s.device.x0).toBeLessThan(s.device.x1); expect(s.device.y1).toBeLessThanOrEqual(1) })
})
test('spaceOpacities: 어느 지점에서도 사진이 두 장 진하게 겹치지 않는다', () => {
  for (let p = 0; p <= 1; p += 0.001) {
    const o = spaceOpacities(p, 5)
    expect(o.photo.reduce((a, b) => a + b, 0)).toBeLessThanOrEqual(1.0001)
    expect(Math.max(...o.photo) + o.model).toBeGreaterThan(0.99)
  }
})
test('spaceOpacities: 각 공간 구간 중앙에선 사진만', () => {
  const o = spaceOpacities((1 + 0.7) / 5, 5) // 두 번째 공간의 70% 지점
  expect(o.photo[1]).toBe(1); expect(o.model).toBe(0)
})
```

- [ ] **Step 2:** `npm test` → FAIL.
- [ ] **Step 3:** 구현. 나머지 3장(apartment, spa, lounge)은 사진을 열어 기기 바닥~상단(디스플레이 포함) 박스를 픽셀로 재서 정규화해 `spaces.ts`에 넣는다. 원근 보정은 하지 않는다(기기가 정면).
- [ ] **Step 4:** `npm test` → PASS.
- [ ] **Step 5: Commit** `feat: photo-fit math and space data for baton handoff`

### Task 4: 체험 데이터와 상태 기계

**Files:**
- Create: `src/content/experience.ts`, `src/lib/experienceMachine.ts`
- Test: `tests/experience.test.ts`

**Interfaces:**
- Produces:
  - `FUNCTIONS: { id: string; name: string; ingredients: string[] }[]` — 스펙 표 그대로 6개, 순서: 하이드레이션, 클린 포커스, 에너지, 리커버리, 릴렉스, 데일리
  - `FLAVORS: { id: string; name: string; color: string }[]` — 자몽 `#F4A1A1`, 망고 `#FFC24B`, 레몬 `#F6E27A`, 복숭아 `#FFC7B2`, 오렌지 `#FF9F45`
  - `resultTitle(fnId, flavorId): string` → `"클린 포커스 × 자몽"`
  - `type ExpState = { step: 'function' | 'flavor' | 'pouring' | 'done'; fn?: string; flavor?: string }`
  - `type ExpAction = { type: 'pickFunction'; id: string } | { type: 'pickFlavor'; id: string } | { type: 'pourDone' } | { type: 'reset' } | { type: 'back' }`
  - `expReducer(s: ExpState, a: ExpAction): ExpState`, `initialExp: ExpState = { step: 'function' }`

- [ ] **Step 1: 실패하는 테스트**

```ts
test('데이터는 스펙 표와 일치', () => {
  expect(FUNCTIONS.map(f => f.name)).toEqual(['하이드레이션', '클린 포커스', '에너지', '리커버리', '릴렉스', '데일리'])
  expect(FUNCTIONS.find(f => f.name === '하이드레이션')!.ingredients).toEqual(['나트륨 & 칼륨', '타우린'])
  expect(FLAVORS.map(f => f.name)).toEqual(['자몽', '망고', '레몬', '복숭아', '오렌지'])
})
test('기능 → 맛 → 붓기 → 완료', () => {
  let s = expReducer(initialExp, { type: 'pickFunction', id: FUNCTIONS[1].id })
  expect(s.step).toBe('flavor')
  s = expReducer(s, { type: 'pickFlavor', id: FLAVORS[0].id }); expect(s.step).toBe('pouring')
  s = expReducer(s, { type: 'pourDone' }); expect(s).toMatchObject({ step: 'done', fn: FUNCTIONS[1].id, flavor: FLAVORS[0].id })
  expect(resultTitle(s.fn!, s.flavor!)).toBe('클린 포커스 × 자몽')
})
test('붓는 중에는 선택·뒤로가기 무시', () => {
  const pouring: ExpState = { step: 'pouring', fn: 'focus', flavor: 'grapefruit' }
  expect(expReducer(pouring, { type: 'pickFunction', id: 'relax' })).toBe(pouring)
  expect(expReducer(pouring, { type: 'pickFlavor', id: 'mango' })).toBe(pouring)
  expect(expReducer(pouring, { type: 'back' })).toBe(pouring)
})
test('잘못된 순서·없는 id는 무시', () => {
  expect(expReducer(initialExp, { type: 'pickFlavor', id: 'mango' })).toBe(initialExp)
  expect(expReducer(initialExp, { type: 'pickFunction', id: 'nope' })).toBe(initialExp)
  expect(expReducer(initialExp, { type: 'pourDone' })).toBe(initialExp)
})
test('reset은 처음으로, back은 맛 → 기능', () => {
  expect(expReducer({ step: 'done', fn: 'a', flavor: 'b' }, { type: 'reset' })).toEqual(initialExp)
  expect(expReducer({ step: 'flavor', fn: 'a' }, { type: 'back' })).toEqual(initialExp)
})
```

- [ ] **Step 2:** `npm test` → FAIL.
- [ ] **Step 3:** 구현(id는 영문 slug).
- [ ] **Step 4:** `npm test` → PASS.
- [ ] **Step 5: Commit** `feat: experience data and state machine`

### Task 5: 3D 스테이지와 모델 앵커

**Files:**
- Create: `src/scene/Stage.tsx`, `src/scene/Dispenser.tsx`, `src/scene/anchors.ts`, `src/scene/rig.ts`
- Modify: `scripts/prep-model.sh` (컵이 텍스처에 있으면 지우는 단계), `src/App.tsx` (Stage 연결 확인)

**Interfaces:**
- Consumes: `/models/dispenser.glb`, `hasWebGL`, 포스터 폴백(Task 2)
- Produces:
  - `rig` (가변 싱글턴): `{ model: { rotY: number; x: number; y: number; scale: number; opacity: number }; cam: { x: number; y: number; z: number; tx: number; ty: number; tz: number; fov: number }; photo: number[] }`, `resetRig()`. 카메라 기본: fov 35, `(0, 0.9, 5)`가 `(0, 0.9, 0)`을 봄.
  - `anchors.ts`: `MODEL_HEIGHT = 1.77`, `DISPLAY: { center: [x,y,z]; width: number; height: number; normal: [x,y,z] }`, `NOZZLE: [x,y,z]`, `CUP_BASE: [x,y,z]` — 모두 정규화 후(바닥 y=0, 중심 x=z=0, 높이 1.77) 모델 좌표.
  - `<Stage>`: 고정 풀스크린 Canvas(`pointer-events: none`, DisplayUI만 auto), DPR 규칙, 조명(환경맵 + 키 라이트 + 부드러운 접지 그림자), Suspense 중엔 포스터 유지, 에러 경계 실패 시 포스터.
  - `<Dispenser>`: `useGLTF` 로드, 바운딩 박스로 높이 1.77·바닥 y=0·중심 정렬, 매 프레임 `rig.model` 반영(투명도는 머티리얼 `transparent`/`opacity`).

- [ ] **Step 1:** Stage/Dispenser/rig 구현. `?debug` 쿼리일 때만 OrbitControls + 클릭한 메시 지점을 `console.log`(앵커 측정용, 프로덕션 번들에서 동적 import).
- [ ] **Step 2: 앵커 측정** — `npm run dev` → `/?debug`에서 디스플레이 네 모서리, 노즐 끝, 컵 받침 위치를 클릭해 `anchors.ts`에 기록. 정면을 보며 텍스처에 컵이 그려져 있는지 확인.
- [ ] **Step 3: 컵 지우기(그려져 있을 때만)** — 컵 영역 표면 클릭으로 UV를 로그하고, `scripts/prep-model.sh`에 Pillow 단계를 추가해 해당 UV 영역을 주변 색으로 채운 텍스처로 교체한 뒤 다시 최적화.
- [ ] **Step 4: 검증** — 데스크톱/모바일 크기에서 히어로에 모델이 서 있고, 그림자가 바닥에 붙고, 콘솔 에러가 없음. 개발자 도구에서 WebGL을 끄면(또는 `hasWebGL` false) 포스터가 남음. `npm test` 여전히 PASS.
- [ ] **Step 5: Commit** `feat: 3d stage, normalized dispenser, measured anchors`

### Task 6: 스크롤 연출 — 히어로·기능·공간·스펙

**Files:**
- Create: `src/scene/useScrollRig.ts`
- Modify: `src/scene/Stage.tsx`, `src/sections/{Hero,Features,Spaces,Spec}.tsx`

**Interfaces:**
- Consumes: `rig`, `SPACES`, `deviceScreenRect`, `screenRectToWorld`, `spaceOpacities`, `anchors`
- Produces: `useScrollRig(): void` — Stage 안에서 호출. 섹션 `id`(Task 2)마다 ScrollTrigger(scrub: true)를 만들고 `rig`를 갱신. `gsap.matchMedia`로 reduced-motion 분기. 언마운트 시 모두 kill. 리사이즈 시 `ScrollTrigger.refresh()`와 바통 터치 목표 재계산.

연출 값(스펙 페이지 구성):
- hero: `rotY` 0→2π 천천히(진행도 기반, 정지 시 멈춤), 카메라 기본.
- features 3구간: ① 카메라가 `DISPLAY.center` 앞으로(디스플레이가 화면 높이의 약 60%) + 문구 "AI 추천 · 맞춤 레시피 무제한" ② 노즐 쪽으로 −25° 회전, `NOZZLE` 근접(텍스처가 거칠면 거리 늘림) + "3초 완성" ③ 전체 줌아웃 + "원료 15종 · 24시간".
- spaces: Spaces 섹션에 sticky 풀스크린 `<img>` 5장(모바일은 `srcMobile`), 불투명도 = `spaceOpacities(p,5).photo`. 각 공간 구간 0–40% 동안 모델을 `screenRectToWorld(deviceScreenRect(space, vw, vh), vw, vh, cam)` 위치·스케일과 rotY 0으로 보간, 3D 불투명도 = `.model`. 공간 이름 문구는 사진 위.
- spec: 모델 정면 중앙, 옆에 HTML 치수선(W/H/D)과 스펙 목록.
- reduced-motion: 회전·카메라 이동 없이 구간별 상태로 크로스페이드만.

- [ ] **Step 1:** 구현.
- [ ] **Step 2: 검증 (브라우저)** — 1440×900, 390×844, 2560×1080 각각에서 스크롤: 히어로 회전 → 디스플레이·노즐 줌 → 공간 5곳마다 3D가 사진 속 기기에 겹친 순간 어긋남이 눈에 띄지 않음(가장자리 오차 ≈ 기기 폭의 3% 이내) → 사진 전환 → 스펙. 공간 구간을 빠르게 위아래로 스크롤해도 기기가 사라지거나 사진 두 장이 겹치지 않음. 공간 구간에서 창 크기를 바꿔도 다시 맞음. OS의 동작 줄이기를 켜면 회전 없음. 각 크기에서 스크린샷을 남긴다.
- [ ] **Step 3:** `npm test` PASS, `npm run build` 성공.
- [ ] **Step 4: Commit** `feat: scroll-driven camera and baton handoff`

### Task 7: 디스플레이 체험과 음료 연출

**Files:**
- Create: `src/scene/DisplayUI.tsx`, `src/scene/Cup.tsx`
- Modify: `src/scene/useScrollRig.ts`(experience 구간), `src/sections/Experience.tsx`, `src/scene/Stage.tsx`

**Interfaces:**
- Consumes: `expReducer`, `initialExp`, `FUNCTIONS`, `FLAVORS`, `resultTitle`, `DISPLAY`, `NOZZLE`, `CUP_BASE`, `rig`, `track`, `CtaLink`
- Produces:
  - `<DisplayUI state dispatch>`: drei `<Html transform occlude={false}>`를 `DISPLAY.center`에 `DISPLAY.width × height` 비율로. 화면: STEP 1 "지금 필요한 건?" 기능 6버튼(2×3) / STEP 2 "어떤 맛으로?" 맛 5버튼 + 뒤로 / pouring 중 "만드는 중… 3초" / done: 결과 이름. 버튼은 실제 `<button>`(키보드·스크린리더 가능), 최소 44px 터치 타깃(줌인 상태 기준).
  - `<Cup color: string; progress: number>`: `CUP_BASE`에 텀블러형 반투명 컵, `NOZZLE`→컵 물줄기(progress 0–0.9에 보임), 액체 높이 = progress. 액체 색 = 맛 색.
  - 결과 카드(HTML, Experience 섹션): `resultTitle` + 연결 원료 + `<CtaLink location="experience">이 한 잔, 우리 공간에 들이기</CtaLink>` + [다시 고르기](reset).

흐름: experience 구간 진입 시 카메라가 디스플레이로 줌인(디스플레이가 뷰포트 짧은 변의 약 85%) → 사용자가 기능·맛 선택 → `pickFlavor` 시 GSAP 트윈(스크롤과 무관)으로 카메라를 노즐·컵이 보이게 줌아웃, `progress` 0→1을 3초, 끝나면 `pourDone` + `track('experience_complete', {function, flavor})` 한 번 → 결과 카드. 체험 구간 밖으로 스크롤하면 트윈을 중단하지 않고 끝까지 진행(상태는 유지), 다시 오면 결과가 보임.

- [ ] **Step 1:** 구현.
- [ ] **Step 2: 검증 (브라우저)** — 1440×900, 390×844에서 기능 6종 각각, 맛 5종 각각이 탭되고 색이 맞게 차오름. 붓는 중 연타해도 이벤트는 한 번(GA 디버그 또는 `window.gtag` 스파이로 확인). 다시 고르기 → 처음. 키보드 Tab/Enter만으로 끝까지 진행 가능. 텍스처에 그려진 컵과 3D 컵이 두 개로 보이지 않음.
- [ ] **Step 3:** `npm test` PASS, `npm run build` 성공.
- [ ] **Step 4: Commit** `feat: display experience with pour animation`

### Task 8: 성능·마무리 검증

**Files:**
- Modify: 필요 시 `vite.config.ts`(수동 청크로 three 분리), 각 섹션

- [ ] **Step 1:** `npm run build && npx vite preview` 후 Chrome Lighthouse 모바일: 히어로 헤드라인과 CTA가 3D 로드 전에 보임(LCP 요소가 텍스트 또는 포스터), 초기 JS(3D 청크 제외) gzip ≤ 120KB, 3D 청크 + GLB는 지연 로드.
- [ ] **Step 2:** 저사양 시뮬레이션(CPU 4× 느리게)에서 스크롤 시 프레임 드랍이 심하면 DPR·그림자 해상도를 낮춘다.
- [ ] **Step 3:** 전체 흐름 최종 확인(Task 6·7 검증 목록 재실행) + 모든 CTA가 `/pre-registration`, 헤더 내비 링크 정상, `dist/` 안에 `assets-home/`만 있고 `assets/`는 없음.
- [ ] **Step 4: Commit** `perf: lazy 3d chunk and final checks`
