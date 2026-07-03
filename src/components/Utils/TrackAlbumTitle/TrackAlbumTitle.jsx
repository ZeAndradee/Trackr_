import React, { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useIsomorphicLayoutEffect } from "../../../hooks/useIsomorphicLayoutEffect";
import styles from "./TrackAlbumTitle.module.css";
import { RatingTag, LikeTag } from "../Tags/Tags";
import { truncateText } from "../../../utils/formatters/textFormatters";

const parsePx = (v) => {
  if (typeof v === "number") return v;
  if (typeof v !== "string") return null;
  const m = v.match(/^([\d.]+)\s*(px|rem|em)?$/);
  if (!m) return null;
  const n = parseFloat(m[1]);
  const unit = m[2] || "px";
  if (unit === "rem" || unit === "em") return n * 16;
  return n;
};

const TrackAlbumTitle = ({
  title,
  to,
  state,
  fontSize,
  rating,
  liked,
  logUrl,
  tagSize,
  hero = false,
  heroMaxLines = 2,
  minFontSize = "1rem",
  maxChars,
  ellipsis = false,
  as: As = "span",
  className,
  color,
  onClick,
  emptyText = "Unknown",
  trailing,
}) => {
  const containerRef = useRef(null);
  const textRef = useRef(null);
  const [shrunkSize, setShrunkSize] = useState(null);
  const [forceEllipsis, setForceEllipsis] = useState(false);

  useIsomorphicLayoutEffect(() => {
    if (!hero) {
      setShrunkSize(null);
      setForceEllipsis(false);
      return;
    }
    const el = textRef.current;
    const container = containerRef.current;
    if (!el || !container) return;

    let raf;
    let lastWidth = 0;
    let lastApplied = null;

    const fit = () => {
      const computed = window.getComputedStyle(el);
      const startPx =
        parsePx(fontSize) ?? parseFloat(computed.fontSize) ?? 16;
      const minPx = parsePx(minFontSize) ?? 16;
      const maxPx = Math.max(startPx, minPx);
      const minBound = Math.min(startPx, minPx);

      const fits = (px) => {
        el.style.fontSize = `${px}px`;
        return el.getClientRects().length <= heroMaxLines;
      };

      let best;
      if (fits(maxPx)) {
        best = maxPx;
      } else {
        let lo = minBound;
        let hi = maxPx;
        best = minBound;
        while (lo <= hi) {
          const mid = Math.floor((lo + hi) / 2);
          if (fits(mid)) {
            best = mid;
            lo = mid + 1;
          } else {
            hi = mid - 1;
          }
        }
      }

      el.style.fontSize = "";
      const next = best < startPx ? `${best}px` : null;
      if (next !== lastApplied) {
        lastApplied = next;
        setShrunkSize(next);
      }
      setForceEllipsis(false);
    };

    raf = requestAnimationFrame(fit);
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect?.width ?? 0;
      if (Math.abs(w - lastWidth) < 1) return;
      lastWidth = w;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(fit);
    });
    ro.observe(container);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [hero, fontSize, minFontSize, title, heroMaxLines]);

  const displayText = (() => {
    if (!title) return emptyText;
    if (maxChars) return truncateText(title, maxChars);
    return title;
  })();

  const truncate = hero ? false : (ellipsis || !!maxChars || forceEllipsis);

  const textClass = [
    styles.text,
    truncate ? styles.ellipsis : styles.wrap,
    to ? styles.linked : "",
    !title ? styles.empty : "",
    className || "",
  ]
    .filter(Boolean)
    .join(" ");

  const textInlineStyle = {};
  if (shrunkSize || fontSize) textInlineStyle.fontSize = shrunkSize || fontSize;
  if (color) textInlineStyle.color = color;

  const titleAttr = truncate && typeof title === "string" ? title : undefined;

  const inner = to ? (
    <Link
      ref={textRef}
      to={to}
      state={state}
      className={textClass}
      style={textInlineStyle}
      onClick={(e) => {
        e.stopPropagation();
        if (onClick) onClick(e);
      }}
      title={titleAttr}
    >
      {displayText}
    </Link>
  ) : (
    <As
      ref={textRef}
      className={textClass}
      style={textInlineStyle}
      onClick={onClick}
      title={titleAttr}
    >
      {displayText}
    </As>
  );

  const hasTag = (rating && Number(rating) > 0) || liked;

  return (
    <span
      ref={containerRef}
      className={`${styles.container} ${hero ? styles.hero : ""}`}
    >
      {inner}
      {hasTag && (
        <span className={styles.tags}>
          {rating && Number(rating) > 0 && (
            <RatingTag rating={Number(rating)} size={tagSize} to={logUrl} />
          )}
          {liked && <LikeTag size={tagSize} to={logUrl} />}
        </span>
      )}
      {trailing && <span className={styles.tags}>{trailing}</span>}
    </span>
  );
};

export default TrackAlbumTitle;
