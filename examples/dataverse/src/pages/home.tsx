import { useRef } from 'react'
import { gsap } from "gsap";
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { useT } from "@/lib/i18n"
gsap.registerPlugin(ScrollTrigger, useGSAP);


export default function HomePage() {

  const { t } = useT()
  const testimonials = t.home.testimonials.items

  const home = useRef<HTMLElement | null>(null)
  const hero = useRef<HTMLElement | null>(null)
  const testimonialsSection = useRef<HTMLElement | null>(null)
  const testimonialCard = useRef<HTMLElement | null>(null)

  useGSAP(() => {
    gsap.fromTo(hero.current,
      { opacity: 0 },
      {
      opacity: 1,
      delay: 0.3,
      duration: 2,
      ease: "power2.out",
    })
  }, { scope: hero })

  useGSAP(() => {
    gsap.fromTo(testimonialsSection.current,
      { opacity: 0, y: 50 },
      {
        opacity: 1,
        y: 0,
        duration: 1.5,
        ease: "power2.out",
        scrollTrigger: {
          trigger: testimonialsSection.current,
        }
      })

  }, {scope: testimonialsSection })

  useGSAP(() => {
    gsap.fromTo(testimonialCard.current,
      {opacity: 0, y:50 },
      { opacity: 1,
        y: 0,
        duration: 1.5,
        ease: "power2.out",
        scrollTrigger: {
          trigger: testimonialsSection.current,
          start: "top 90%",
          scrub: 1,
        }
      })
  })
  
  return (
    <div ref={home} className="h-full overflow-y-auto bg-[radial-gradient(circle_at_top_right,oklch(0.94_0.05_240),transparent_45%),radial-gradient(circle_at_20%_80%,oklch(0.93_0.06_180),transparent_40%)]">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-20 px-6 py-10 md:px-10 lg:py-16">
        <section id="hero" ref={hero} className="relative overflow-hidden rounded-3xl border border-border/70 bg-card/80 p-8 opacity-0 shadow-lg backdrop-blur md:p-12">
          <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-[oklch(0.83_0.13_230/.35)] blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 left-10 h-56 w-56 rounded-full bg-[oklch(0.86_0.12_170/.35)] blur-3xl" />

          <div className="relative max-w-3xl space-y-6">
            <p className="inline-flex rounded-full border border-border bg-background/80 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              {t.home.hero.badge}
            </p>
            <h1 className="text-balance text-4xl font-semibold leading-tight md:text-6xl">
              {t.home.hero.title}
            </h1>
            <p className="max-w-2xl text-lg text-muted-foreground">
              {t.home.hero.description}
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Button size="lg" className="px-8">
                {t.home.hero.primaryCta}
              </Button>
              <Button size="lg" variant="outline" className="px-8">
                {t.home.hero.secondaryCta}
              </Button>
            </div>
          </div>
        </section>

        <section id="testimonials" ref={testimonialsSection} className="space-y-8">
          <div className="max-w-2xl space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              {t.home.testimonials.badge}
            </p>
            <h2 className="text-3xl font-semibold md:text-4xl">{t.home.testimonials.title}</h2>
          </div>

          <div ref={testimonialCard} className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((testimonial) => (
              <Card id="card" key={testimonial.name} className="h-full border-border/80 bg-card/85 backdrop-blur">
                <CardHeader className="space-y-5">
                  <p className="text-base leading-relaxed text-foreground/90">"{testimonial.quote}"</p>
                  <CardContent className="p-0">
                    <p className="text-sm font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </CardContent>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}