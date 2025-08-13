gsap.registerPlugin(ScrollTrigger);

// 元素
const box = document.querySelector('.box2');
const boxtext = document.querySelector('.boxtext');
const information = document.querySelector('.information');
const triggerEl = document.querySelector('.section-1'); // ✅ 用稳定容器当触发器

function dyToTop(el, vh = 5) {
  gsap.set(el, { x:0, y:0 });                     // 先清零再测量
  const b = el.getBoundingClientRect();
  const topPx = window.innerHeight * (vh / 100);
  return topPx - b.top;
}

// 在 refresh 开始前把位移清掉，避免用旧 transform 计算
ScrollTrigger.addEventListener("refreshInit", () => {
  gsap.set([box, boxtext], { clearProps: "x,y" });
});

// 1) box2 往上贴到 5vh
gsap.timeline({
  scrollTrigger:{
    trigger: triggerEl,
    start: "top top",
    end: "+=100%",
    scrub: true,
    markers: true,
    invalidateOnRefresh: true,        // ✅ 放在 ScrollTrigger 上
  }
}).to(box, {
  y: (i, el) => dyToTop(el, 5),
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
  x: 300,
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

// Lenis 同步
const lenis = new Lenis();
lenis.on('scroll', ScrollTrigger.update);
(function raf(t){ lenis.raf(t); requestAnimationFrame(raf); })();

// 只保留一个防抖的 refresh（你之前写了两次）
let rid;
window.addEventListener('resize', () => {
  cancelAnimationFrame(rid);
  rid = requestAnimationFrame(() => ScrollTrigger.refresh());
});