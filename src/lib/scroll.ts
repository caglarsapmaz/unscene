/** Smooth-scrolls to the very top, or jumps there for people who asked for reduced motion. */
export function scrollToTop() {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
}
