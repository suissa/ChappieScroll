import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motionPresets } from "./presets";
import type { ChappieScrollOptions, MotionController, MotionDeclaration, TimelineDeclaration } from "./types";

gsap.registerPlugin(ScrollTrigger);
const active = new Map<string, gsap.core.Animation>();
const cleanupHandlers: Array<() => void> = [];
const reduceMotion = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function resolvePreset(name?: string) {
  if (!name) return undefined;
  const item = motionPresets[name as keyof typeof motionPresets];
  if (!item) throw new Error("Unknown ChappieScroll preset: " + name);
  return item;
}

function scrollConfig(scroll: MotionDeclaration["scroll"], fallbackTrigger?: string | Element | Element[]) {
  if (!scroll) return undefined;
  return {
    trigger: scroll.trigger ?? fallbackTrigger,
    start: scroll.start ?? "top 84%",
    end: scroll.end ?? "bottom 16%",
    scrub: scroll.scrub ?? false,
    pin: scroll.pin ?? false,
    markers: scroll.markers ?? false,
    once: scroll.once ?? false,
    toggleActions: scroll.toggleActions ?? "play none none reverse",
    invalidateOnRefresh: scroll.invalidateOnRefresh ?? true,
  };
}

function controller(): MotionController {
  return {
    play: (id) => { active.get(id)?.play(); },
    pause: (id) => { active.get(id)?.pause(); },
    reverse: (id) => { active.get(id)?.reverse(); },
    restart: (id) => { active.get(id)?.restart(); },
    kill: (id) => { active.get(id)?.kill(); active.delete(id); },
    refresh: () => ScrollTrigger.refresh(),
    destroy: () => {
      active.forEach((animation) => animation.kill());
      active.clear();
      cleanupHandlers.splice(0).forEach((cleanup) => cleanup());
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    },
  };
}

/** Declare motion intent; GSAP handles interpolation and ScrollTrigger handles scroll timing. */
export function createMotion(declarations: MotionDeclaration[], options: { respectReducedMotion?: boolean } = {}): MotionController {
  const shouldReduce = (options.respectReducedMotion ?? true) && reduceMotion();

  declarations.forEach((declaration) => {
    if (active.has(declaration.id)) active.get(declaration.id)?.kill();
    const preset = resolvePreset(declaration.preset);
    const from = declaration.from ?? preset?.from;
    const to = { ...(preset?.to ?? {}), ...(declaration.to ?? {}) };
    const duration = shouldReduce ? 0 : declaration.duration ?? preset?.duration ?? 0.8;
    const vars = {
      ...to,
      duration,
      delay: shouldReduce ? 0 : declaration.delay ?? 0,
      ease: declaration.ease ?? preset?.ease ?? "power3.out",
      repeat: declaration.repeat ?? 0,
      yoyo: declaration.yoyo ?? false,
      stagger: declaration.stagger,
      paused: declaration.paused ?? (declaration.trigger === "manual" || declaration.trigger === "hover" || declaration.trigger === "click"),
      onComplete: declaration.onComplete,
      scrollTrigger: declaration.trigger === "scroll" ? scrollConfig(declaration.scroll ?? {}, typeof declaration.target === "string" ? declaration.target : declaration.target as Element) : scrollConfig(declaration.scroll),
    } as gsap.TweenVars;

    let animation: gsap.core.Animation;
    if (declaration.trigger === "hover" || declaration.trigger === "click") {
      const targets = gsap.utils.toArray<HTMLElement>(declaration.target);
      const tween = from
        ? gsap.fromTo(targets, from, { ...vars, paused: true, scrollTrigger: undefined })
        : gsap.to(targets, { ...vars, paused: true, scrollTrigger: undefined });
      const eventName = declaration.trigger === "hover" ? "mouseenter" : "click";
      targets.forEach((element) => {
        const handler = () => tween.restart();
        element.addEventListener(eventName, handler);
        cleanupHandlers.push(() => element.removeEventListener(eventName, handler));
      });
      animation = tween;
    } else if (from) {
      animation = gsap.fromTo(declaration.target, from, vars);
    } else {
      animation = gsap.to(declaration.target, vars);
    }
    active.set(declaration.id, animation);
  });
  return controller();
}

/** Compose ordered steps into controllable GSAP timelines. */
export function createTimelines(declarations: TimelineDeclaration[], options: { respectReducedMotion?: boolean } = {}): MotionController {
  const shouldReduce = (options.respectReducedMotion ?? true) && reduceMotion();
  declarations.forEach((declaration) => {
    if (active.has(declaration.id)) active.get(declaration.id)?.kill();
    const timeline = gsap.timeline({
      paused: declaration.paused ?? true,
      defaults: { duration: shouldReduce ? 0 : 0.8, ease: "power3.out", ...declaration.defaults },
      scrollTrigger: declaration.scroll ? scrollConfig(declaration.scroll, declaration.trigger) : undefined,
    });
    declaration.steps.forEach((step) => {
      const vars = { ...step.to, duration: shouldReduce ? 0 : step.duration, ease: step.ease, stagger: step.stagger };
      if (step.from) timeline.fromTo(step.target, step.from, vars, step.at);
      else timeline.to(step.target, vars, step.at);
    });
    active.set(declaration.id, timeline);
  });
  return controller();
}

/**
 * Included ChappieScroll scroll-animation engine. Declarative data attributes
 * select a preset; GSAP + ScrollTrigger provide the animation runtime.
 */
export function initChappieScroll(options: ChappieScrollOptions = {}): { refresh: () => void; destroy: () => void } {
  const selector = options.selector ?? "[data-chappie-scroll]";
  const scope = options.root ?? document.documentElement;
  const elements = gsap.utils.toArray<HTMLElement>(selector, scope);
  const created: gsap.core.Animation[] = [];
  const reduced = (options.respectReducedMotion ?? true) && reduceMotion();

  elements.forEach((element) => {
    const name = element.dataset.motion ?? "fadeUp";
    const preset = resolvePreset(name);
    if (!preset || element.dataset.chappieReady === "true") return;
    const delay = Number(element.dataset.delay ?? 0);
    const stagger = Number(element.dataset.stagger ?? 0);
    const trigger = element.dataset.scrollTrigger ? document.querySelector(element.dataset.scrollTrigger) ?? element : element;
    const sharedScroll = {
      trigger,
      start: element.dataset.start ?? "top 88%",
      end: element.dataset.end ?? "bottom 12%",
      toggleActions: element.dataset.toggleActions ?? "play none none reverse",
      once: options.once ?? element.dataset.once === "true",
    };
    const duration = reduced ? 0 : Number(element.dataset.duration ?? preset.duration ?? 0.8);
    if (stagger > 0 && element.children.length > 1) {
      created.push(gsap.fromTo(element.children, preset.from, {
        ...preset.to, duration, delay: reduced ? 0 : delay, stagger,
        ease: element.dataset.ease ?? preset.ease ?? "power3.out",
        scrollTrigger: sharedScroll,
      }));
    } else {
      created.push(gsap.fromTo(element, preset.from, {
        ...preset.to, duration, delay: reduced ? 0 : delay,
        ease: element.dataset.ease ?? preset.ease ?? "power3.out",
        scrollTrigger: sharedScroll,
      }));
    }
    element.dataset.chappieReady = "true";
  });

  return {
    refresh: () => ScrollTrigger.refresh(),
    destroy: () => {
      created.forEach((animation) => animation.kill());
      elements.forEach((element) => { delete element.dataset.chappieReady; });
      ScrollTrigger.refresh();
    },
  };
}

export { gsap, ScrollTrigger, motionPresets };
export type { ChappieScrollOptions, MotionController, MotionDeclaration, TimelineDeclaration, TimelineStep, MotionPreset } from "./types";
export type { MotionPresetName } from "./presets";
