import { useEffect, useRef } from "react";

const MARGIN = 8;
const MIN_WIDTH = 200;
const MAX_WIDTH = 600;
const DEFAULT_WIDTH = 200;
const ASPECT = 16 / 9;
const WIDTH_KEY = "trackr_pip_width";
const CORNER_KEY = "trackr_pip_corner";

const vw = () => document.documentElement.clientWidth;
const vh = () => document.documentElement.clientHeight;

export default function usePiPDrag(containerRef, { enabled, onTap } = {}) {
  const stateRef = useRef({
    corner: (() => {
      if (typeof window === "undefined") return "br";
      const saved = localStorage.getItem(CORNER_KEY);
      return ["tl", "tr", "bl", "br"].includes(saved) ? saved : "br";
    })(),
    width: (() => {
      if (typeof window === "undefined") return DEFAULT_WIDTH;
      const saved = parseInt(localStorage.getItem(WIDTH_KEY) || "", 10);
      return Number.isFinite(saved) ? Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, saved)) : DEFAULT_WIDTH;
    })(),
  });

  const apply = (animate) => {
    const el = containerRef.current;
    if (!el || document.fullscreenElement === el) return;
    const { corner, width } = stateRef.current;
    el.style.position = "fixed";
    el.style.width = `${width}px`;
    el.style.height = "auto";
    el.style.clipPath = "";
    el.style.visibility = "visible";
    el.style.transition = animate
      ? "left 0.28s ease, top 0.28s ease, width 0.2s ease"
      : "none";
    const h = el.offsetHeight || width / ASPECT;
    const isBottom = corner[0] === "b";
    const isRight = corner[1] === "r";
    el.style.top = `${isBottom ? Math.max(MARGIN, vh() - h - MARGIN) : MARGIN}px`;
    el.style.bottom = "auto";
    el.style.left = `${isRight ? Math.max(MARGIN, vw() - width - MARGIN) : MARGIN}px`;
    el.style.right = "auto";
  };

  const snapCorner = (el) => {
    const r = el.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const corner = (cy > vh() / 2 ? "b" : "t") + (cx > vw() / 2 ? "r" : "l");
    stateRef.current.corner = corner;
    localStorage.setItem(CORNER_KEY, corner);
    apply(true);
  };

  useEffect(() => {
    if (!enabled) return;
    apply(false);
    requestAnimationFrame(() => apply(false));
    const onResize = () => apply(false);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  const onMoveDown = (e) => {
    if (!enabled) return;
    if (e.target.closest("button") || e.target.closest("input") || e.target.closest("a")) return;
    const el = containerRef.current;
    if (!el) return;
    e.preventDefault();
    const rect = el.getBoundingClientRect();
    const startX = e.clientX;
    const startY = e.clientY;
    const offX = e.clientX - rect.left;
    const offY = e.clientY - rect.top;
    let moved = false;
    el.setPointerCapture?.(e.pointerId);

    const move = (ev) => {
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      if (!moved && Math.abs(dx) < 3 && Math.abs(dy) < 3) return;
      moved = true;
      el.style.transition = "none";
      const left = Math.max(0, Math.min(vw() - rect.width, ev.clientX - offX));
      const top = Math.max(0, Math.min(vh() - rect.height, ev.clientY - offY));
      el.style.left = `${left}px`;
      el.style.right = "auto";
      el.style.top = `${top}px`;
      el.style.bottom = "auto";
    };

    const up = () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", up);
      if (!moved) {
        onTap?.();
        return;
      }
      snapCorner(el);
    };

    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
  };

  const onResizeDown = (dir) => (e) => {
    if (!enabled) return;
    const el = containerRef.current;
    if (!el) return;
    e.preventDefault();
    e.stopPropagation();
    const rect = el.getBoundingClientRect();
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = stateRef.current.width;
    const hasE = dir.includes("e");
    const hasW = dir.includes("w");
    const hasN = dir.includes("n");
    const hasS = dir.includes("s");
    const anchorRight = rect.right;
    const anchorLeft = rect.left;
    const anchorTop = rect.top;
    const anchorBottom = rect.bottom;
    el.setPointerCapture?.(e.pointerId);
    el.style.transition = "none";

    const move = (ev) => {
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      const cands = [];
      if (hasE) cands.push(dx);
      if (hasW) cands.push(-dx);
      if (hasS) cands.push(dy * ASPECT);
      if (hasN) cands.push(-dy * ASPECT);
      const dW = cands.reduce((a, b) => (Math.abs(b) > Math.abs(a) ? b : a), 0);
      const width = Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, startWidth + dW));
      stateRef.current.width = width;
      el.style.width = `${width}px`;
      el.style.height = "auto";
      const h = el.offsetHeight || width / ASPECT;
      const left = hasW ? anchorRight - width : anchorLeft;
      const top = hasN ? anchorBottom - h : anchorTop;
      el.style.left = `${left}px`;
      el.style.right = "auto";
      el.style.top = `${top}px`;
      el.style.bottom = "auto";
    };

    const up = () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", up);
      localStorage.setItem(WIDTH_KEY, String(Math.round(stateRef.current.width)));
      snapCorner(el);
    };

    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
  };

  return { onMoveDown, onResizeDown };
}
