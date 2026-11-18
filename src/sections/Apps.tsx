import { APPS } from '../content/copy'

export function Apps() {
  return (
    <section id="apps" className="relative bg-white py-24 md:py-36">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="grid items-center gap-10 md:grid-cols-2 md:gap-16">
          <div>
            <p className="text-sm font-semibold text-gray-800">{APPS.user.label}</p>
            <h2 className="mt-3 text-[28px] font-bold leading-[1.3] tracking-[-0.02em] md:text-[40px]">{APPS.user.title}</h2>
            <ol className="mt-8 space-y-5">
              {APPS.user.steps.map(([t, d], i) => (
                <li key={t} className="flex gap-4">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ink text-sm font-semibold text-white">{i + 1}</span>
                  <div><p className="font-semibold">{t}</p><p className="mt-1 text-[15px] text-gray-800">{d}</p></div>
                </li>
              ))}
            </ol>
          </div>
          <img src={APPS.user.image} alt="사용자 앱 맞춤 레시피 화면" loading="lazy" className="w-full rounded-3xl bg-subtle" />
        </div>

        <div className="mt-28 md:mt-40">
          <p className="text-sm font-semibold text-gray-800">{APPS.admin.label}</p>
          <h2 className="mt-3 text-[28px] font-bold leading-[1.3] tracking-[-0.02em] md:text-[40px]">{APPS.admin.title}</h2>
          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {APPS.admin.items.map(([t, img]) => (
              <li key={t} className="overflow-hidden rounded-3xl bg-subtle">
                <p className="p-6 pb-4 text-[17px] font-semibold leading-snug">{t}</p>
                <img src={img} alt="" loading="lazy" className="w-full" />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
