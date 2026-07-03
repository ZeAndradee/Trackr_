import React, { useState, useRef, useEffect } from "react";
import Rating from "@mui/material/Rating";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";

const RatingComponent = ({
  value = 0,
  setValue,
  fcolor,
  borderColor = "var(--star-empty-border)",
  size = "30px",
  ecolor = "var(--star-empty-fill)",
  changeStatus = true,
  gap,
  allowClear = true,
  clearPosition = "right",
  clearIconSize = "18px",
}) => {
  const [hover, setHover] = useState(-1);
  const [isContainerHovered, setIsContainerHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const containerRef = useRef(null);
  const draggingRef = useRef(false);
  const dragValueRef = useRef(-1);

  const getRatingColor = (val) => {
    if (val >= 4) return "var(--rating-high)";
    if (val >= 2.5) return "var(--rating-medium)";
    return "var(--rating-low)";
  };

  const handleClear = () => {
    if (setValue) setValue(0);
    setHover(-1);
  };

  const calcRatingFromTouch = (touchX) => {
    if (!containerRef.current) return null;
    const rect = containerRef.current.getBoundingClientRect();
    const x = touchX - rect.left;
    const ratio = Math.max(0, Math.min(1, x / rect.width));
    const raw = ratio * 5;
    return Math.round(raw * 2) / 2 || 0.5;
  };

  const handleTouchStart = (e) => {
    if (!changeStatus) return;
    e.preventDefault();
    draggingRef.current = true;
    setIsDragging(true);
    const touch = e.touches[0];
    const newVal = calcRatingFromTouch(touch.clientX);
    if (newVal !== null) {
      dragValueRef.current = newVal;
      setHover(newVal);
    }
  };

  const handleTouchMove = (e) => {
    if (!draggingRef.current || !changeStatus) return;
    e.preventDefault();
    const touch = e.touches[0];
    const newVal = calcRatingFromTouch(touch.clientX);
    if (newVal !== null) {
      dragValueRef.current = newVal;
      setHover(newVal);
    }
  };

  const handleTouchEnd = () => {
    if (!draggingRef.current) return;
    const finalValue = dragValueRef.current;
    draggingRef.current = false;
    dragValueRef.current = -1;
    setIsDragging(false);
    setHover(-1);
    if (finalValue !== -1 && setValue) {
      setValue(finalValue);
    }
  };

  const handleMouseDown = (e) => {
    if (!changeStatus) return;
    e.preventDefault();
    draggingRef.current = true;
    setIsDragging(true);
    const newVal = calcRatingFromTouch(e.clientX);
    if (newVal !== null) {
      dragValueRef.current = newVal;
      setHover(newVal);
    }

    const onMouseMove = (ev) => {
      if (!draggingRef.current) return;
      const val = calcRatingFromTouch(ev.clientX);
      if (val !== null) {
        dragValueRef.current = val;
        setHover(val);
      }
    };

    const onMouseUp = () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
      if (!draggingRef.current) return;
      const finalValue = dragValueRef.current;
      draggingRef.current = false;
      dragValueRef.current = -1;
      setIsDragging(false);
      setHover(-1);
      if (finalValue !== -1 && setValue) {
        setValue(finalValue);
      }
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  const ClearIcon = () => (
    <div
      style={{
        position: "absolute",
        [clearPosition === "left" ? "left" : "right"]: "-30px",
        top: 0,
        bottom: 0,
        width: "30px",
        display: "flex",
        alignItems: "center",
        justifyContent: clearPosition === "left" ? "flex-end" : "flex-start",
        opacity: isContainerHovered ? 1 : 0,
        transition: "opacity 0.2s",
        pointerEvents: isContainerHovered ? "auto" : "none",
      }}
      onMouseEnter={() => setIsContainerHovered(true)}
    >
      <CloseRoundedIcon
        onClick={handleClear}
        style={{
          fontSize: clearIconSize,
          color: "#c4c4c4",
          cursor: "pointer",
          opacity: 0.8,
          marginRight: clearPosition === "left" ? "5px" : 0,
          marginLeft: clearPosition === "right" ? "5px" : 0,
          transition: "opacity 0.2s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = 1)}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = 0.8)}
      />
    </div>
  );

  const displayValue = hover !== -1 ? hover : value;
  const displayColor = fcolor || getRatingColor(displayValue);

  return (
    <div
      ref={containerRef}
      style={{
        display: "inline-flex",
        alignItems: "center",
        position: "relative",
        touchAction: changeStatus ? "none" : "auto",
      }}
      onMouseEnter={() => setIsContainerHovered(true)}
      onMouseLeave={() => setIsContainerHovered(false)}
    >
      <Rating
        value={displayValue}
        precision={0.5}
        readOnly
        icon={
          <StarRoundedIcon
            style={{
              fontSize: size,
              color: displayColor,
              stroke: displayColor,
              strokeWidth: 1.5,
              paintOrder: "stroke fill",
            }}
          />
        }
        emptyIcon={
          <StarRoundedIcon
            style={{
              fontSize: size,
              color: ecolor,
              stroke: borderColor,
              strokeWidth: 1.5,
              paintOrder: "stroke fill",
            }}
          />
        }
        sx={{
          "& .MuiRating-icon": {
            width: "auto",
            margin: gap ? `0 ${gap}` : "0 -2px",
          },
        }}
      />
      {changeStatus && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1,
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseMove={(e) => {
            if (!draggingRef.current && changeStatus) {
              const val = calcRatingFromTouch(e.clientX);
              if (val !== null) setHover(val);
            }
          }}
          onMouseLeave={() => {
            if (!draggingRef.current) setHover(-1);
          }}
        />
      )}
      {allowClear && changeStatus && <ClearIcon />}
    </div>
  );
};

export { RatingComponent };
