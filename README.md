# ChappieScroll — Semantic GSAP Motion

ChappieScroll is a semantic declaration layer over GSAP. Describe what should happen using named presets, targets, triggers and timeline steps; GSAP and ScrollTrigger execute the motion.

## Install

```sh
npm install chappie-scroll gsap
```

## Semantic declarations

```ts
import { createMotion } from "chappie-scroll";

const motion = createMotion([
  { id: "hero-enter", target: ".hero__content", preset: "fadeUp", trigger: "load", duration: 1, delay: 0.15 },
  { id: "feature-reveal", target: ".feature-card", preset: "popSoft", trigger: "scroll", stagger: 0.12, scroll: { start: "top 85%", once: true } }
]);

motion.restart("hero-enter");
motion.refresh();
```

## Semantic timelines

```ts
import { createTimelines } from "chappie-scroll";

const pages = createTimelines([{
  id: "page-transition",
  paused: true,
  defaults: { duration: 0.65, ease: "power3.inOut" },
  steps: [
    { target: ".old-page", from: { xPercent: 0, autoAlpha: 1 }, to: { xPercent: -100, autoAlpha: 0 }, at: 0 },
    { target: ".new-page", from: { xPercent: 100, autoAlpha: 0 }, to: { xPercent: 0, autoAlpha: 1 }, at: 0.12 }
  ]
}]);

pages.play("page-transition");
```

Timeline steps support GSAP position values such as numbers, relative offsets and labels.

## Included ChappieScroll scroll engine

The scroll-animation engine is included and powered directly by GSAP + ScrollTrigger:

```ts
import { initChappieScroll } from "chappie-scroll";

const scroll = initChappieScroll({ once: false });
scroll.refresh();
// Call when leaving a SPA route.
scroll.destroy();
```

HTML can declare scroll animations without imperative setup per element:

```html
<section data-chappie-scroll data-motion="fadeUp">...</section>
<div data-chappie-scroll data-motion="blurIn" data-delay="0.12">...</div>
<div data-chappie-scroll data-motion="pop" data-once="true">...</div>
```

Supported attributes: `data-motion`, `data-delay`, `data-stagger`, `data-duration`, `data-ease`, `data-start`, `data-end`, `data-toggle-actions`, `data-once`, and `data-scroll-trigger`.

## Preset collection and demo

The library provides 50 presets spanning fades, directional slides, scale, pop, zoom, rotation, flips, tilt, blur, elastic, bounce, spring, skew, clip-path reveals, drift, float, pulse, shake, shimmer and directional exits. The root page is an interactive catalog that displays every preset, supports replay and category filtering, and includes a timeline composition example.

```sh
npm install
npm run dev
```

## Accessibility and lifecycle

- Respects `prefers-reduced-motion` by default.
- `destroy()` kills active animations and ScrollTriggers.
- Use unique IDs for declarations.
- Call `destroy()` before creating new declarations during SPA route changes.
- ScrollTrigger supports scrub, pin, markers, start/end ranges and toggle actions.

## License

MIT
