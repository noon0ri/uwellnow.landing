import { SPEC } from '../content/copy'

// Device box is 70svh tall and centered; the 3D camera frames the model to the same box (Task 6).
export const SPEC_BOX_VH = 0.7
const ASPECT = 75.5 / 177

export function Spec() {
  return (
    <section id="spec" aria-labelledby="spec-title" className="relative h-[150svh]">
      <div className="sticky top-0 flex h-svh items-center">
        <div className="mx-auto grid w-full max-w-7xl items-center gap-8 px-5 md:grid-cols-[1fr_auto_1fr] md:px-8">
          <div className="order-2 rounded-3xl bg-white/85 p-6 backdrop-blur md:order-1 md:bg-transparent md:p-0 md:backdrop-blur-none">
            <h2 id="spec-title" className="text-[28px] font-bold tracking-[-0.02em] md:text-[40px]">{SPEC.title}</h2>
            <dl className="mt-6 divide-y divide-line border-y border-line text-[15px]">
              {SPEC.rows.map(([k, v]) => (
                <div key={k} className="flex justify-between gap-6 py-3"><dt className="text-gray-800">{k}</dt><dd className="font-semibold">{v}</dd></div>
              ))}
            </dl>
          </div>
          {/* dimension lines around where the model stands */}
          <div aria-hidden className="relative order-1 mx-auto hidden md:order-2 md:block" style={{ height: `${SPEC_BOX_VH * 100}svh`, width: `${SPEC_BOX_VH * 100 * ASPECT}svh` }}>
            <div className="absolute -top-8 left-0 right-0 flex items-center gap-2 text-xs font-semibold">
              <span className="h-px flex-1 bg-ink" />{SPEC.dims.w} cm<span className="h-px flex-1 bg-ink" />
            </div>
            <div className="absolute -right-10 bottom-0 top-0 flex flex-col items-center gap-2 text-xs font-semibold">
              <span className="w-px flex-1 bg-ink" /><span className="[writing-mode:vertical-rl]">{SPEC.dims.h} cm</span><span className="w-px flex-1 bg-ink" />
            </div>
          </div>
          <div className="order-3 hidden md:block" />
        </div>
      </div>
    </section>
  )
}
