gsap.registerPlugin(ScrollTrigger);

// 元素
const box = document.querySelector('.box2');
const boxtext = document.querySelector('.boxtext');
const information = document.querySelector('.information');
const triggerEl = document.querySelector('.section-1'); // ✅ 用稳定容器当触发器

const logoLeft  = document.querySelector('.box2');
const logoRight = document.querySelector('.box1');

// 取某个矩形在[top, center, bottom]之间的插值位置
function pickFrac(rect, frac){         // frac: 0=top, 0.5=center, 1=bottom
  const top = rect.top;
  const center = rect.top + rect.height / 2;
  const bottom = rect.bottom;
  // 线性插值：top -> center -> bottom
  const mid = top + (center - top) * Math.min(frac, 0.5) * 2;   // 0~0.5
  return frac <= 0.5 ? mid : center + (bottom - center) * (frac - 0.5) * 2; // 0.5~1
}

// 与目标的插值基线对齐
function alignYToFrac(el, target, frac = 0.8, offsetVh = 0){
  gsap.set([el, target], { x:0, y:0 });
  const r1 = el.getBoundingClientRect();
  const r2 = target.getBoundingClientRect();
  const from = pickFrac(r1, frac);
  const to   = pickFrac(r2, frac);
  const offset = window.innerHeight * (offsetVh / 100);
  return (to - from) + offset;
}

gsap.timeline({
  scrollTrigger:{
    trigger: document.querySelector('.section-1'),
    start: "top top",
    end: "+=100%",
    scrub: true,
    markers: true,
    invalidateOnRefresh: true
  }
}).to(logoLeft, {
  y: (i, el) => alignYToFrac(el, logoRight, 0.6, 0), // 0.7 = 介于中心与底之间
  ease: "none"
});

// 2) boxtext 先左移并淡出
gsap.timeline({
  scrollTrigger:{
    trigger: triggerEl,
    start: "top top",
    end: "+=50%",
    scrub: true,
    markers: true,
    invalidateOnRefresh: true
  }
}).to(boxtext, {
  y: () => -window.innerHeight * 0.6,
  autoAlpha: 0,
  ease: "none"
});

// 3) information 淡出
gsap.timeline({
  scrollTrigger:{
    trigger: triggerEl,
    start: "top top",
    end: "+=100%",
    scrub: true,
    markers: true,
    invalidateOnRefresh: true
  }
}).to(information, {
  autoAlpha: 0,
  ease: "none"
});




// Lenis 同步（保留）
const lenis = new Lenis();
lenis.on('scroll', ScrollTrigger.update);
(function raf(t){ lenis.raf(t); requestAnimationFrame(raf); })();

// 防抖 refresh（保留）
let rid;
window.addEventListener('resize', () => {
  cancelAnimationFrame(rid);
  rid = requestAnimationFrame(() => ScrollTrigger.refresh());
});

// ---- 新增：避免刷新恢复到锚点/旧位置，并清掉现有 hash ----
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}
if (location.hash) {
  history.replaceState(null, "", location.pathname + location.search);
}

// ---- 绑定两个 LOGO（互不影响）----
document.addEventListener('DOMContentLoaded', () => {
  // 右上角：到 section5
  const logoRightImg = document.querySelector('.svg-img1');
  logoRightImg?.addEventListener('click', (e) => {
    e.preventDefault();
    lenis.scrollTo('#section5', {
      duration: 1.6,
      easing: t => (t === 1 ? 1 : 1 - 2 ** (-10 * t))
    });
  });

  // 左上角：回到第一页（到 section-1，或直接 0）
  const logoLeftImg = document.querySelector('.svg-img2');
  logoLeftImg?.addEventListener('click', (e) => {
    e.preventDefault();
    // 任选其一：
    // lenis.scrollTo('.section-1', { duration: 0.6, easing: t => (t === 1 ? 1 : 1 - 2 ** (-12 * t)) });
    lenis.scrollTo(0, { duration: 0.6, easing: t => (t === 1 ? 1 : 1 - 2 ** (-12 * t)) });
  });

  // 若 LOGO 外面包了 <a href="#...">，统一拦截默认跳转，避免再次把 hash 写回 URL
  document.querySelectorAll('.svg-img1, .svg-img2').forEach(el => {
    el.closest('a[href^="#"]')?.addEventListener('click', e => e.preventDefault());
  });
});