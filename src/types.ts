import type { gsap } from "gsap";

export type MotionPreset = {
  from: gsap.TweenVars;
  to: gsap.TweenVars;
  duration?: number;
  ease?: string;
};

export type MotionTrigger = "load" | "scroll" | "hover" | "click" | "manual";

export interface ScrollDeclaration {
  trigger?: string;
  start?: string;
  end?: string;
  scrub?: boolean | number;
  pin?: boolean | string | Element;
  markers?: boolean;
  once?: boolean;
  toggleActions?: string;
  invalidateOnRefresh?: boolean;
}

export interface MotionDeclaration {
  id: string;
  target: string | Element | Element[];
  preset?: string;
  trigger?: MotionTrigger;
  from?: gsap.TweenVars;
  to?: gsap.TweenVars;
  duration?: number;
  delay?: number;
  stagger?: number | gsap.StaggerVars;
  ease?: string;
  repeat?: number;
  yoyo?: boolean;
  paused?: boolean;
  scroll?: ScrollDeclaration;
  onComplete?: () => void;
}

export interface TimelineStep {
  target: string | Element | Element[];
  from?: gsap.TweenVars;
  to: gsap.TweenVars;
  at?: string | number;
  duration?: number;
  ease?: string;
  stagger?: number | gsap.StaggerVars;
}

export interface TimelineDeclaration {
  id: string;
  trigger?: string;
  scroll?: ScrollDeclaration;
  defaults?: gsap.TweenVars;
  steps: TimelineStep[];
  paused?: boolean;
}

export interface ChappieScrollOptions {
  root?: Element | null;
  rootMargin?: string;
  threshold?: number | number[];
  once?: boolean;
  selector?: string;
  respectReducedMotion?: boolean;
}

export interface MotionController {
  play(id: string): void;
  pause(id: string): void;
  reverse(id: string): void;
  restart(id: string): void;
  kill(id: string): void;
  refresh(): void;
  destroy(): void;
}
