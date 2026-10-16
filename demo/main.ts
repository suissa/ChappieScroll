import { createTimelines, gsap, initChappieScroll, motionPresets, motionPresetNames } from "../src/index";
import "./style.css";

const app = document.querySelector<HTMLDivElement>("#app")!;
app.innerHTML = [
  '<header class="topbar"><a class="logo" href="#">CHAPPIE<span>SCROLL</span></a><nav><a href="#catalog">Presets</a><a href="#timeline">Timelines</a><a href="#api">Semantic API</a></nav><small><i></i> GSAP ENGINE</small></header>',
  '<main><section class="hero"><div class="eyebrow">SEMANTIC MOTION SYSTEM / 01</div><h1>Motion, declared.<br><em>Precisely orchestrated.</em></h1><p>A semantic language for GSAP animations, timelines and scroll-driven experiences. Declare intent. Let the engine execute.</p><a class="cta" href="#catalog">Explore the library <b>↘</b></a><div class="stats"><div><strong>' + motionPresetNames.length + '</strong><span>Motion presets</span></div><div><strong>02</strong><span>Declarative engines</span></div><div><strong>∞</strong><span>Timeline combinations</span></div></div><div class="orb"></div></section>',
  '<section class="section" id="catalog"><div class="eyebrow">THE MOTION COLLECTION / 02</div><div class="section-head"><h2>One intent.<br><em>Many expressions.</em></h2><p>Every preset is reusable. Replay a card to inspect its motion, or filter the collection by behavior.</p></div><div class="filters"><button class="active" data-filter="all">All</button><button data-filter="fade">Fade</button><button data-filter="slide">Slide</button><button data-filter="scale">Scale</button><button data-filter="rotate">Rotate / Flip</button><button data-filter="blur">Blur</button><button data-filter="reveal">Reveal</button><button data-filter="playful">Playful</button><button data-filter="exit">Exit</button></div><div class="catalog" id="preset-grid"></div></section>',
  '<section class="section timeline-section" id="timeline"><div class="eyebrow">COMPOSITION / 03</div><div class="section-head"><h2>Orchestrate the<br><em>whole sequence.</em></h2><p>Individual motions become coordinated timelines. Entry and stagger are explicit steps with a single timing source.</p></div><div class="timeline-demo"><div class="sequence a"><small>01 / INTENT</small><strong>Define</strong><span>semantic input</span></div><div class="sequence b"><small>02 / ORCHESTRATE</small><strong>Compose</strong><span>timeline logic</span></div><div class="sequence c"><small>03 / EXECUTE</small><strong>Animate</strong><span>GSAP runtime</span></div></div><button class="cta" id="replay-timeline">Replay sequence ↻</button></section>',
  '<section class="section" id="api"><div class="eyebrow">DECLARATIVE API / 04</div><div class="section-head"><h2>Describe the <em>intent.</em></h2><p>Separate the meaning of a motion from its runtime. Declarations are composable and reusable.</p></div><pre><code>const motion = createMotion([\n  { id: "hero-enter", target: ".hero",\n    preset: "fadeUp", trigger: "load" },\n  { id: "feature-reveal", target: ".feature",\n    preset: "popSoft", trigger: "scroll",\n    stagger: 0.12, scroll: { once: true } }\n]);\nmotion.restart("hero-enter");</code></pre></section>',
  '<footer><a class="logo" href="#">CHAPPIE<span>SCROLL</span></a><span>SEMANTIC DECLARATIONS. GSAP EXECUTION.</span></footer></main>'
].join("");

const groups: Record<string, string[]> = {
  fade: ["fade"], slide: ["slide", "rise", "drop"], scale: ["scale", "pop", "zoom", "punch", "spring", "settle", "elastic"],
  rotate: ["rotate", "flip", "tilt", "swing"], blur: ["blur"], reveal: ["reveal", "expand", "counter", "gentle", "drift", "float", "backIn", "snap"],
  playful: ["elastic", "bounce", "pulse", "shake", "swing", "punch"], exit: ["exit", "fadeOut", "scaleOut", "blurOut"]
};
function category(name: string) {
  const found = Object.entries(groups).find(([, prefixes]) => prefixes.some((prefix) => name.toLowerCase().includes(prefix.toLowerCase())));
  return found?.[0] ?? "reveal";
}
function render(filter = "all") {
  const grid = document.querySelector<HTMLDivElement>("#preset-grid")!;
  grid.innerHTML = "";
  motionPresetNames.filter((name) => filter === "all" || category(name) === filter).forEach((name, index) => {
    const card = document.createElement("article");
    card.className = "preset";
    card.innerHTML = '<button class="preview" aria-label="Replay ' + name + '"><span class="shape shape-' + (index % 6) + '"></span><span class="arrow">↗</span></button><div class="preset-label"><small>' + String(index + 1).padStart(2, "0") + '</small><strong>' + name + '</strong><button class="replay" aria-label="Replay animation">↻</button></div><div class="tag">' + category(name) + ' / gsap</div>';
    const replay = () => {
      const shape = card.querySelector<HTMLElement>(".shape")!;
      const preset = motionPresets[name as keyof typeof motionPresets];
      gsap.killTweensOf(shape);
      gsap.set(shape, { clearProps: "all", autoAlpha: 1 });
      gsap.fromTo(shape, { ...preset.from }, { ...preset.to, duration: preset.duration ?? 0.8, ease: preset.ease ?? "power3.out", overwrite: true });
    };
    card.querySelector(".preview")!.addEventListener("click", replay);
    card.querySelector(".replay")!.addEventListener("click", replay);
    grid.append(card);
  });
  scrollEngine?.destroy();
  scrollEngine = initChappieScroll({ once: true });
}
let scrollEngine: ReturnType<typeof initChappieScroll> | undefined;
render();
document.querySelectorAll<HTMLButtonElement>("[data-filter]").forEach((button) => button.addEventListener("click", () => {
  document.querySelector(".filters .active")?.classList.remove("active");
  button.classList.add("active");
  render(button.dataset.filter);
}));

const timeline = createTimelines([{
  id: "demo-sequence", paused: true, defaults: { duration: 0.65, ease: "power3.out" },
  steps: [
    { target: ".sequence.a", from: { x: -30, autoAlpha: 0 }, to: { x: 0, autoAlpha: 1 }, at: 0 },
    { target: ".sequence.b", from: { y: 25, autoAlpha: 0, scale: 0.92 }, to: { y: 0, autoAlpha: 1, scale: 1 }, at: 0.2 },
    { target: ".sequence.c", from: { x: 30, autoAlpha: 0 }, to: { x: 0, autoAlpha: 1 }, at: 0.4 }
  ]
}]);
timeline.play("demo-sequence");
document.querySelector<HTMLButtonElement>("#replay-timeline")!.addEventListener("click", () => timeline.restart("demo-sequence"));
