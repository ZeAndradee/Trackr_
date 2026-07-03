import { useEffect } from "react";

const findScrollParent = (el) => {
  let node = el?.parentElement;
  while (node && node !== document.body) {
    const style = getComputedStyle(node);
    if (style.overflowY === "auto" || style.overflowY === "scroll") return node;
    node = node.parentElement;
  }
  return null;
};

export default function useFollowSlot(containerRef, slotEl, { isTheater = false, reflowKey } = {}) {
  useEffect(() => {
    if (!slotEl) return;
    const scrollParent = findScrollParent(slotEl);

    const update = () => {
      const container = containerRef.current;
      if (!container) return;
      if (document.fullscreenElement === container) return;
      const rect = slotEl.getBoundingClientRect();
      if (rect.width === 0 && rect.height === 0) return;
      container.style.position = "fixed";
      container.style.top = `${rect.top}px`;
      container.style.left = `${rect.left}px`;
      container.style.width = `${rect.width}px`;
      container.style.height = `${rect.height}px`;
      container.style.bottom = "auto";
      container.style.right = "auto";
      container.style.borderRadius = "var(--border-radius)";
      container.style.zIndex = isTheater ? "201" : "10";
      container.style.boxShadow = "none";
      container.style.transition = "none";
      container.style.visibility = "visible";

      if (scrollParent) {
        const parentRect = scrollParent.getBoundingClientRect();
        const clipTop = Math.max(0, parentRect.top - rect.top);
        const clipBottom = Math.max(0, rect.bottom - parentRect.bottom);
        container.style.clipPath = clipTop > 0 || clipBottom > 0
          ? `inset(${clipTop}px 0 ${clipBottom}px 0)`
          : "";
      }
    };

    update();

    let rafId;
    const start = performance.now();
    const loop = () => {
      update();
      if (performance.now() - start < 700) rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);

    const observer = new ResizeObserver(update);
    observer.observe(slotEl);
    window.addEventListener("scroll", update, { passive: true });
    if (scrollParent) scrollParent.addEventListener("scroll", update, { passive: true });
    document.addEventListener("fullscreenchange", update);

    return () => {
      cancelAnimationFrame(rafId);
      observer.disconnect();
      window.removeEventListener("scroll", update);
      if (scrollParent) scrollParent.removeEventListener("scroll", update);
      document.removeEventListener("fullscreenchange", update);
      const container = containerRef.current;
      if (container) container.style.cssText = "";
    };
  }, [containerRef, slotEl, isTheater, reflowKey]);
}
