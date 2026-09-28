import { BadgeCheck, Mail, Package } from "lucide-react"
import { useTranslations } from "next-intl"

import { Link } from "@/i18n/navigation"

const mulberry32 = (seed: number) => {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const buildHalftone = () => {
  const rand = mulberry32(7)
  const size = 360
  const step = 12
  const dots: { x: number; y: number; r: number; o: number }[] = []
  for (let y = step / 2; y < size; y += step) {
    for (let x = step / 2; x < size; x += step) {
      const density = Math.max(0, 1 - Math.hypot(x, y) / size)
      if (rand() > density * 1.15) continue
      dots.push({
        x: Math.round((x + (rand() - 0.5) * 6) * 10) / 10,
        y: Math.round((y + (rand() - 0.5) * 6) * 10) / 10,
        r: Math.round((0.7 + density * 2.1 + rand() * 0.4) * 100) / 100,
        o: Math.round((0.3 + density * 0.55) * 100) / 100,
      })
    }
  }
  return dots
}

const halftoneDots = buildHalftone()

const features = [
  { key: "quality", icon: BadgeCheck },
  { key: "packaging", icon: Package },
  { key: "support", icon: Mail },
] as const

const HalftoneField = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 360 360" aria-hidden="true" className={className}>
    {halftoneDots.map((dot, i) => (
      <circle
        key={i}
        cx={dot.x}
        cy={dot.y}
        r={dot.r}
        opacity={dot.o}
        fill="currentColor"
      />
    ))}
  </svg>
)

export function CTA13() {
  const t = useTranslations("About")

  return (
    // Full-bleed dark band that continues on from the hero image.
    <section
      id="about"
      className="relative w-full overflow-hidden bg-neutral-950 px-4 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-20"
    >
      <div className="pointer-events-none absolute -top-10 -left-10 w-40 text-neutral-500 sm:w-72">
        <HalftoneField className="h-auto w-full opacity-60" />
      </div>
      <div className="pointer-events-none absolute -top-14 -right-14 w-48 text-neutral-500 sm:w-96">
        <HalftoneField className="h-auto w-full rotate-90 opacity-80" />
      </div>
      <div className="pointer-events-none absolute -bottom-12 -left-12 w-44 text-neutral-500 sm:w-80">
        <HalftoneField className="h-auto w-full -rotate-90 opacity-80" />
      </div>
      <div className="pointer-events-none absolute -right-10 -bottom-10 w-40 text-neutral-500 sm:w-72">
        <HalftoneField className="h-auto w-full rotate-180 opacity-50" />
      </div>

      {/* Stacked and centred on mobile; on desktop the copy sits left-aligned
          with the feature list as a column beside it. */}
      <div className="relative z-10 mx-auto grid w-full max-w-[1400px] grid-cols-1 lg:grid-cols-12 lg:items-center lg:gap-16">
        <div className="mx-auto flex max-w-4xl flex-col items-center pb-10 text-center lg:col-span-7 lg:mx-0 lg:items-start lg:pb-0 lg:text-left">
          <span className="inline-flex items-center gap-2.5 text-xs font-medium tracking-[0.2em] text-neutral-400 uppercase">
            <img
              src="/prime-fav.svg"
              alt=""
              width={16}
              height={16}
              className="h-4 w-4 invert"
            />
            {t("eyebrow")}
          </span>

          <h2 className="mt-5 max-w-[22ch] text-3xl leading-[1.1] font-medium tracking-tight text-balance text-white sm:text-4xl md:text-5xl lg:mt-6 lg:text-6xl lg:leading-[1.05] xl:text-7xl">
            {t("title")}
          </h2>

          <p className="mt-5 w-full max-w-[68ch] text-left text-sm leading-relaxed text-pretty text-neutral-400 sm:text-base lg:mt-8 lg:max-w-[60ch] lg:text-lg">
            {t("body1")}
          </p>
          <p className="mt-3 w-full max-w-[68ch] text-left text-sm leading-relaxed text-pretty text-neutral-400 sm:text-base lg:max-w-[60ch] lg:text-lg">
            {t("body2")}
          </p>

          <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row lg:mt-10">
            <Link
              href="/about"
              className="inline-flex w-full items-center justify-center rounded-full bg-white px-8 py-3.5 text-sm font-medium text-neutral-950 hover:bg-neutral-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950 sm:w-auto"
            >
              {t("more")}
            </Link>
            <Link
              href="/shop"
              className="inline-flex w-full items-center justify-center rounded-full border border-white/15 px-8 py-3.5 text-sm font-medium text-white hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950 sm:w-auto"
            >
              {t("shop")}
            </Link>
          </div>
        </div>

        <ul className="grid grid-cols-1 gap-8 border-t border-white/[0.08] pt-8 md:grid-cols-3 md:gap-8 lg:col-span-5 lg:grid-cols-1 lg:gap-0 lg:divide-y lg:divide-white/[0.08] lg:border-t-0 lg:border-l lg:pt-0 lg:pl-12">
          {features.map(({ key, icon: Icon }) => (
            <li
              key={key}
              className="flex flex-col items-center text-center lg:flex-row lg:items-start lg:gap-5 lg:py-8 lg:text-left lg:first:pt-0 lg:last:pb-0"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md lg:bg-white/5 lg:ring-1 lg:ring-white/10 lg:ring-inset">
                <Icon className="h-5 w-5 text-white" />
              </span>
              <div>
                <h3 className="mt-4 text-base font-medium text-white lg:mt-0 lg:text-lg">
                  {t(`features.${key}.title`)}
                </h3>
                <p className="mt-2 max-w-[34ch] text-sm leading-relaxed text-pretty text-neutral-400 lg:max-w-none lg:text-base">
                  {t(`features.${key}.body`)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export default CTA13
