import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import styles from "./Tooltip.module.css";

import { getTrackDate } from "../../../utils/formatters/dateFormatters";
import { RatingTag } from "../Tags/Tags";

export const Tooltip = ({
  text,
  children,
  position = "top",
  followMouse = false,
  className = "",
  forceVisible = false,
  disableHover = false,
}) => {
  const [mousePos, setMousePos] = useState(null);
  const [isHovered, setIsHovered] = useState(false);

  const wrapperRef = useRef(null);
  const [coords, setCoords] = useState({ top: 0, left: 0 });

  const calculatePosition = () => {
    if (!wrapperRef.current) return;
    const rect = wrapperRef.current.getBoundingClientRect();

    const centerX = rect.left + rect.width / 2;

    let top = rect.top - 10;
    let left = centerX;

    if (position === "bottom") {
      top = rect.bottom + 10;
    }

    setCoords({
      top: top + window.scrollY,
      left: left + window.scrollX,
    });
  };

  const handleMouseMove = (e) => {
    if (followMouse) {
      setMousePos({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseEnter = () => {
    if (disableHover) return;
    if (!followMouse) calculatePosition();
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    if (disableHover) return;
    setIsHovered(false);
    setMousePos(null);
  };

  useEffect(() => {
    if ((isHovered || forceVisible) && !followMouse) {
      let rafId;
      const update = () => {
        calculatePosition();
        rafId = requestAnimationFrame(update);
      };
      update();
      return () => cancelAnimationFrame(rafId);
    }
  }, [isHovered, followMouse, forceVisible]);

  if (followMouse) {
    return (
      <div
        className={`${styles.tooltipWrapper} ${className}`}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {children}
        {isHovered &&
          mousePos &&
          createPortal(
            <div
              className={`${styles.tooltipBubble} ${styles.followMouse}`}
              style={{
                top:
                  position === "top"
                    ? mousePos.y - 10 + "px"
                    : mousePos.y + 20 + "px",
                left: mousePos.x + "px",
                transform:
                  position === "top"
                    ? "translateX(-50%) translateY(-100%)"
                    : "translateX(-50%)",
                opacity: 1,
                visibility: "visible",
              }}
            >
              {text}
            </div>,
            document.body
          )}
      </div>
    );
  }

  return (
    <div
      className={`${styles.tooltipWrapper} ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      ref={wrapperRef}
    >
      {children}
      {(isHovered || forceVisible) &&
        createPortal(
          <div
            className={`${styles.tooltipBubble} ${styles[position]}`}
            style={{
              top: coords.top + "px",
              left: coords.left + "px",
              opacity: 1,
              visibility: "visible",
              position: "absolute",
              bottom: "auto",
              transform:
                position === "bottom"
                  ? "translateX(-50%)"
                  : "translateX(-50%) translateY(-100%)",
            }}
          >
            {text}
          </div>,
          document.body
        )}
    </div>
  );
};

export const InfoTooltip = ({
  text,
  position = "top",
  size = 14,
  className = "",
  ariaLabel,
}) => {
  return (
    <Tooltip text={text} position={position} className={className}>
      <button
        type="button"
        className={styles.infoBadge}
        style={{ width: size, height: size, fontSize: size * 0.7 }}
        aria-label={ariaLabel || (typeof text === "string" ? text : "Info")}
      >
        ?
      </button>
    </Tooltip>
  );
};

export const TrackDetailsTooltip = ({ track, visible }) => {
  return (
    <div
      className={`${styles.detailsTooltip} ${visible ? styles.visible : ""}`}
    >
      <div className={styles.tooltipContent}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          {track?.rating && <RatingTag rating={track.rating} size="0.75rem" />}
        </div>
        <div className={styles.trackDateInfo}>
          <div className={styles.dateWrapper}>
            <span className={styles.dateText}>{getTrackDate(track)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
