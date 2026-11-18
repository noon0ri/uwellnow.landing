import { EXPERIENCE_COPY as C } from '../content/copy'

export function Experience() {
  return (
    <section id="experience" aria-labelledby="exp-title" className="relative h-[200svh]">
      <div className="sticky top-0 h-svh">
        <div className="mx-auto max-w-7xl px-5 pt-24 md:px-8 md:pt-32">
          <p className="text-sm font-semibold text-gray-800">{C.eyebrow}</p>
          <h2 id="exp-title" className="mt-3 whitespace-pre-line text-[28px] font-bold leading-[1.25] tracking-[-0.02em] md:text-[40px]">{C.title}</h2>
          <p className="mt-3 text-[15px] text-gray-800">{C.hint}</p>
        </div>
      </div>
    </section>
  )
}
