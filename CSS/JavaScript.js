gsap.registerPlugin(ScrollTrigger);

// Lenis 平滑滚动（全局通用）
const lenis = new Lenis();
lenis.on('scroll', ScrollTrigger.update);
(function raf(t){ lenis.raf(t); requestAnimationFrame(raf); })();

// 防抖 refresh（全局通用）
let rid;
window.addEventListener('resize', () => {
  cancelAnimationFrame(rid);
  rid = requestAnimationFrame(() => ScrollTrigger.refresh());
});

// ---- 避免刷新恢复到锚点/旧位置，并清掉现有 hash ----
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}
if (location.hash) {
  history.replaceState(null, "", location.pathname + location.search);
}

// ---- 通用函数 ----
function pickFrac(rect, frac){         
  const top = rect.top;
  const center = rect.top + rect.height / 2;
  const bottom = rect.bottom;
  const mid = top + (center - top) * Math.min(frac, 0.5) * 2;
  return frac <= 0.5 ? mid : center + (bottom - center) * (frac - 0.5) * 2;
}

function alignYToFrac(el, target, frac = 0.8, offsetVh = 0){
  gsap.set([el, target], { x:0, y:0 });
  const r1 = el.getBoundingClientRect();
  const r2 = target.getBoundingClientRect();
  const from = pickFrac(r1, frac);
  const to   = pickFrac(r2, frac);
  const offset = window.innerHeight * (offsetVh / 100);
  return (to - from) + offset;
}

function stickBelow(el, target, gapVh = 2){
  gsap.set([el, target], { x: 0, y: 0 });      
  const r1 = el.getBoundingClientRect();
  const r2 = target.getBoundingClientRect();
  const gap = window.innerHeight * (gapVh / 100);
  return (r2.bottom + gap) - r1.top;
}

// ---- 绑定 跳转 点击事件（通用）----
document.addEventListener('DOMContentLoaded', () => {

  document.querySelectorAll('.svg-img2,.personal-web').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.href = "index.html"; // ✅ 跳转页面
    });
  });

  const logoRightImg = document.querySelector('.text1 a'); // 右上角 → section5
  logoRightImg?.addEventListener('click', (e) => {
    e.preventDefault();
    lenis.scrollTo('#section5', {
      duration: 1.2,
      easing: t => (t === 1 ? 1 : 1 - 2 ** (-10 * t))
    });
  });

  const logoLeftImg = document.querySelector('.svg-img1'); // 左下角 → 回到顶部
  logoLeftImg?.addEventListener('click', (e) => {
    e.preventDefault();
    lenis.scrollTo(0, { 
      duration: 0.6, 
      easing: t => (t === 1 ? 1 : 1 - 2 ** (-12 * t)) 
    });
  });

  // 拦截 a[href^="#"]，避免 hash 写回 URL
  document.querySelectorAll('.svg-img1, .svg-img2').forEach(el => {
    el.closest('a[href^="#"]')?.addEventListener('click', e => e.preventDefault());
  });
});


// =======================
// 分设备逻辑
// =======================
const mm = gsap.matchMedia();

// --------------------
// 桌面端 (>= 769px)
// --------------------
mm.add("(min-width: 769px)", () => {
  const box2       = document.querySelector('.box2');
  const boxtext    = document.querySelector('.boxtext');
  const information= document.querySelector('.information');
  const triggerEl  = document.querySelector('.section-1');
  const logoLeft   = document.querySelector('.box2');
  const logoRight  = document.querySelector('.box1');

  // 1) 左侧 LOGO → 对齐右侧 LOGO
  gsap.timeline({
    scrollTrigger:{
      trigger: triggerEl,
      start: "top top",
      end: "+=100%",
      scrub: true,
      markers: true,
      invalidateOnRefresh: true
    }
  }).to(logoLeft, {
    y: (i, el) => alignYToFrac(el, logoRight, 0.6, 0),
    ease: "none"
  });

  // 2) boxtext 向上移并淡出
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
});


// --------------------
// 手机端 (<= 768px)
// --------------------
mm.add("(max-width: 768px)", () => {
  const box2  = document.querySelector('.box2');  
  const box1  = document.querySelector('.box1');  
  const triggerEl = document.querySelector('.section-1');

  // 小 LOGO → 贴到大 LOGO 下方
  gsap.timeline({
    scrollTrigger:{
      trigger: triggerEl,
      start: "top top",
      end:   "+=100%",
      scrub: true,
      markers: false,
      invalidateOnRefresh: true
    }
  }).to(box2, {
    y: (i, el) => stickBelow(el, box1, 0.6), 
    ease: "none"
  });


   // —— 手机端：首屏文案（.information）轻移并淡出 —— 
   const info = document.querySelector('.information');

   // 用真实视口高度，手机端更稳定
   const vh = () => (window.visualViewport?.height || window.innerHeight);
 
   gsap.timeline({
     scrollTrigger:{
       trigger: triggerEl,
       start: "top top",
       end:   () => "+=" + vh() * 0.8,   // 0.8 屏内完成淡出，可按需调 0.6~1
       scrub: true,
       markers: false,
       invalidateOnRefresh: true,
       // 保底：滚出首屏后强制隐藏；返回首屏再显示
       onLeave:     () => gsap.set(info, { autoAlpha: 0 }),
       onEnterBack: () => gsap.set(info, { autoAlpha: 1 })
     }
   })
   .to(info, {
     y: () => -vh() * 0.25,  // 轻轻上移 25% 视口高，可调小/大
     autoAlpha: 0,
     ease: "none"
   });



});