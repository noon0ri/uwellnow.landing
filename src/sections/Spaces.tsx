import { SPACES_COPY } from '../content/copy'
import { SPACES } from '../content/spaces'

export function Spaces() {
  return (
    <section id="spaces" aria-labelledby="spaces-title" className="relative">
      <h2 id="spaces-title" className="sr-only">{SPACES_COPY.title}</h2>
      {SPACES.map((s, i) => (
        <div key={s.id} data-space={i} className="relative h-[150svh]">
          <div data-space-photo={i} className="sticky top-0 h-svh overflow-hidden">
            <picture>
              <source media="(max-width: 767px)" srcSet={s.srcMobile} />
              <img src={s.src} alt={`${s.name}에 놓인 유웰나우`} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
            </picture>
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 to-transparent pb-10 pt-24 text-white">
              <div className="mx-auto max-w-7xl px-5 md:px-8">
                {i === 0 && <p className="text-sm font-semibold opacity-80">{SPACES_COPY.title}</p>}
                <p className="mt-2 text-[32px] font-bold tracking-[-0.02em] md:text-[48px]">{s.name}</p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </section>
  )
}
