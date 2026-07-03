import { useEffect, useState, useRef } from "react";

const imageDataCache = new Map();
const inflight = new Map();

const SAMPLE_SIZE = 128;

export function loadImageData(url, size = SAMPLE_SIZE) {
  if (!url) return Promise.resolve(null);
  const key = `${url}@${size}`;
  if (imageDataCache.has(key)) return Promise.resolve(imageDataCache.get(key));
  if (inflight.has(key)) return inflight.get(key);

  const p = new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        ctx.drawImage(img, 0, 0, size, size);
        const data = ctx.getImageData(0, 0, size, size);
        const payload = {
          data: data.data,
          width: size,
          height: size,
          naturalWidth: img.naturalWidth,
          naturalHeight: img.naturalHeight,
        };
        imageDataCache.set(key, payload);
        resolve(payload);
      } catch {
        imageDataCache.set(key, null);
        resolve(null);
      } finally {
        inflight.delete(key);
      }
    };
    img.onerror = () => {
      imageDataCache.set(key, null);
      inflight.delete(key);
      resolve(null);
    };
    img.src = url;
  });
  inflight.set(key, p);
  return p;
}

export function mapRectToImage(elemRect, bgRect, imgW, imgH, fit = "cover") {
  if (!elemRect || !bgRect || !imgW || !imgH) return null;
  const bgAspect = bgRect.width / bgRect.height;
  const imgAspect = imgW / imgH;

  let drawW, drawH, drawX, drawY;
  if (fit === "cover") {
    if (imgAspect > bgAspect) {
      drawH = bgRect.height;
      drawW = drawH * imgAspect;
      drawX = bgRect.left + (bgRect.width - drawW) / 2;
      drawY = bgRect.top;
    } else {
      drawW = bgRect.width;
      drawH = drawW / imgAspect;
      drawX = bgRect.left;
      drawY = bgRect.top + (bgRect.height - drawH) / 2;
    }
  } else {
    if (imgAspect > bgAspect) {
      drawW = bgRect.width;
      drawH = drawW / imgAspect;
      drawX = bgRect.left;
      drawY = bgRect.top + (bgRect.height - drawH) / 2;
    } else {
      drawH = bgRect.height;
      drawW = drawH * imgAspect;
      drawX = bgRect.left + (bgRect.width - drawW) / 2;
      drawY = bgRect.top;
    }
  }

  const x = (elemRect.left - drawX) / drawW;
  const y = (elemRect.top - drawY) / drawH;
  const w = elemRect.width / drawW;
  const h = elemRect.height / drawH;

  const cx = Math.max(0, Math.min(1, x));
  const cy = Math.max(0, Math.min(1, y));
  const cw = Math.max(0, Math.min(1 - cx, w));
  const ch = Math.max(0, Math.min(1 - cy, h));

  if (cw <= 0 || ch <= 0) return null;
  return { x: cx, y: cy, w: cw, h: ch };
}

export function sampleRegion(imgPayload, region) {
  if (!imgPayload || !region) return null;
  const { data, width, height } = imgPayload;
  const x0 = Math.floor(region.x * width);
  const y0 = Math.floor(region.y * height);
  const x1 = Math.min(width, Math.ceil((region.x + region.w) * width));
  const y1 = Math.min(height, Math.ceil((region.y + region.h) * height));
  if (x1 <= x0 || y1 <= y0) return null;

  let r = 0,
    g = 0,
    b = 0,
    count = 0;
  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) {
      const i = (y * width + x) * 4;
      const a = data[i + 3];
      if (a < 128) continue;
      r += data[i];
      g += data[i + 1];
      b += data[i + 2];
      count++;
    }
  }
  if (!count) return null;
  r = r / count;
  g = g / count;
  b = b / count;

  const toLin = (v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  const luminance = 0.2126 * toLin(r) + 0.7152 * toLin(g) + 0.0722 * toLin(b);

  return {
    r: Math.round(r),
    g: Math.round(g),
    b: Math.round(b),
    luminance,
    isLight: luminance > 0.2,
  };
}

export async function getBehindContrast({
  elementRect,
  bgRect,
  bgUrl,
  fit = "cover",
}) {
  const img = await loadImageData(bgUrl);
  if (!img) return null;
  const region = mapRectToImage(
    elementRect,
    bgRect,
    img.naturalWidth,
    img.naturalHeight,
    fit,
  );
  return sampleRegion(img, region);
}

export function useBehindContrast(elementRef, bgRef, bgUrl, options = {}) {
  const { fit = "cover", enabled = true } = options;
  const [info, setInfo] = useState(null);
  const rafRef = useRef(0);
  const payloadRef = useRef(null);

  useEffect(() => {
    if (!enabled || !bgUrl) {
      setInfo(null);
      payloadRef.current = null;
      return;
    }
    let cancelled = false;

    const compute = () => {
      const el = elementRef.current;
      const bg = bgRef.current;
      const payload = payloadRef.current;
      if (!el || !bg || !payload) return;
      const elemRect = el.getBoundingClientRect();
      const bgRect = bg.getBoundingClientRect();
      const region = mapRectToImage(
        elemRect,
        bgRect,
        payload.naturalWidth,
        payload.naturalHeight,
        fit,
      );
      if (!region) {
        if (!cancelled)
          setInfo({
            r: 0,
            g: 0,
            b: 0,
            luminance: 0,
            isLight: false,
            offBg: true,
          });
        return;
      }
      const result = sampleRegion(payload, region);
      if (!cancelled && result) setInfo(result);
    };

    const schedule = () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(compute);
    };

    loadImageData(bgUrl).then((p) => {
      if (cancelled) return;
      payloadRef.current = p;
      compute();
    });

    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);

    let ro;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(schedule);
      if (elementRef.current) ro.observe(elementRef.current);
      if (bgRef.current) ro.observe(bgRef.current);
    }

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (ro) ro.disconnect();
    };
  }, [elementRef, bgRef, bgUrl, fit, enabled]);

  return info;
}
