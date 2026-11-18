import { FEATURES } from '../content/copy'

export function Features() {
  return (
    <section id="features" aria-label="주요 기능">
      {FEATURES.map((f, i) => (
        <div key={f.eyebrow} data-feature={i} className="flex h-svh items-end pb-[10vh] md:items-center md:pb-0">
          <div className="mx-auto w-full max-w-7xl px-5 md:px-8">
            <div className="max-w-sm rounded-3xl bg-white/80 p-6 backdrop-blur md:bg-transparent md:p-0 md:backdrop-blur-none">
              <p className="text-sm font-semibold text-gray-800">{f.eyebrow}</p>
              <h2 className="mt-3 whitespace-pre-line text-[28px] font-bold leading-[1.25] tracking-[-0.02em] md:text-[40px]">{f.title}</h2>
              <p className="mt-5 text-[40px] font-bold tracking-[-0.03em] md:text-[56px]">{f.stat}</p>
              <p className="mt-2 text-[15px] text-gray-800 md:text-[17px]">{f.body}</p>
            </div>
          </div>
        </div>
      ))}
    </section>
  )
}
