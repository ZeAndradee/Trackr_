import React, { useState, useEffect, useRef, useMemo } from "react";
import { Link } from "react-router-dom";
import { useUserStatus } from "../../../../contexts/SocketContext";
import { Tooltip } from "../../Tooltip/Tooltip";
import FallbackLogo from "../../../../assets/icons/trackr-round-logo-gray.svg";
import style from "./Image.module.css";

const PRESETS = { xs: 28, sm: 40, md: 64, lg: 96, xl: 130 };

const getInitials = (name) => {
   if (!name) return "";
   const cleaned = name.replace(/[^\p{L}\s]/gu, " ");
   const parts = cleaned.trim().split(/\s+/).filter(Boolean);
   if (!parts.length) return "";
   if (parts.length === 1) return parts[0][0].toUpperCase();
   return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const hashHue = (str = "") => {
   let h = 0;
   for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) % 360;
   return h;
};

const resolveRadius = (radius) => {
   if (radius === "none") return "0";
   if (radius === "round") return "50%";
   if (typeof radius === "number") return `${radius}px`;
   return radius;
};

const Image = ({
   src,
   name,
   alt,
   title,
   size,
   width,
   height,
   aspectRatio,
   radius,
   to,
   onClick,
   hoverBorder = false,
   borderLength,
   tooltip,
   fallback,
   fallbackVariant = "avatar",
   status: propStatus,
   userId,
   className = "",
   showBadge = true,
   imgProps = {},
}) => {
   const [isLoaded, setIsLoaded] = useState(false);
   const [hasError, setHasError] = useState(false);
   const imgRef = useRef(null);

   const useExplicitSize = width != null || height != null;
   const hasSize = size != null;
   const px = typeof size === "number" ? size : PRESETS[size] || PRESETS.xl;
   const classNameDriven = !useExplicitSize && !hasSize;
   const liveStatus = useUserStatus(userId, propStatus);
   const status = userId ? liveStatus || "invisible" : propStatus;

   const initials = useMemo(() => getInitials(name), [name]);
   const hue = useMemo(() => hashHue(name || alt || ""), [name, alt]);

   const showFallback = !src || hasError;
   const interactive = !!(to || onClick);
   const effectiveRadius = radius != null
      ? radius
      : fallbackVariant === "cover"
         ? "var(--border-radius)"
         : "round";
   const radiusValue = resolveRadius(effectiveRadius);

   useEffect(() => {
      setIsLoaded(false);
      setHasError(false);
      if (imgRef.current?.complete && imgRef.current?.naturalHeight !== 0) {
         setIsLoaded(true);
      }
   }, [src]);

   const sharedStyle = {
      borderRadius: radiusValue,
      "--img-fallback-bg": `hsl(${hue}, 35%, 28%)`,
      "--img-fallback-fg": `hsl(${hue}, 60%, 78%)`,
      "--img-radius": radiusValue,
      ...(borderLength ? { "--img-border-length": borderLength } : {}),
   };

   const containerStyle = useExplicitSize
      ? {
           width: width ?? height,
           height: height ?? width,
           minWidth: width ?? height,
           minHeight: height ?? width,
           aspectRatio: aspectRatio || (width && height ? undefined : "1 / 1"),
           ...sharedStyle,
        }
      : hasSize
         ? {
              width: px,
              height: px,
              minWidth: px,
              minHeight: px,
              ...sharedStyle,
           }
         : {
              aspectRatio: aspectRatio || (fallbackVariant === "cover" ? "1 / 1" : undefined),
              ...sharedStyle,
           };

   const fontSize = Math.max(10, Math.round((hasSize ? px : 64) * 0.38));

   const renderFallback = () => {
      if (fallback) return fallback;
      if (fallbackVariant === "cover") {
         return (
            <div className={style.coverFallback}>
               <img src={FallbackLogo} alt="" className={style.coverFallbackLogo} />
            </div>
         );
      }
      return (
         <div className={style.fallback} style={{ fontSize }}>
            {initials || (
               <svg viewBox="0 0 24 24" width="55%" height="55%" aria-hidden="true">
                  <path
                     fill="currentColor"
                     d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5zm0 2c-3.33 0-10 1.67-10 5v3h20v-3c0-3.33-6.67-5-10-5z"
                  />
               </svg>
            )}
         </div>
      );
   };

   const inner = (
      <>
         <div className={style.clip} style={classNameDriven ? undefined : { borderRadius: radiusValue }}>
            {!showFallback && (
               <img
                  ref={imgRef}
                  src={src}
                  alt={alt || name || "image"}
                  onLoad={() => setIsLoaded(true)}
                  onError={() => {
                     setHasError(true);
                     setIsLoaded(true);
                  }}
                  className={`${style.img} ${isLoaded ? style.fadeIn : ""}`}
                  {...imgProps}
               />
            )}

            {showFallback && renderFallback()}

            {!isLoaded && !showFallback && (
               <div className={style.loader} />
            )}
         </div>

         {showBadge && status && (classNameDriven || useExplicitSize || px >= 30) && (
            <div
               className={`${style.statusBadge} ${style[status] || style.online} ${
                  hasSize && !useExplicitSize && px > 60 ? style.largeBadge : ""
               }`}
               title={status.charAt(0).toUpperCase() + status.slice(1)}
            />
         )}
      </>
   );

   const classNames = [
      style.image,
      hoverBorder ? style.hoverBorder : "",
      borderLength ? style.coverBorder : "",
      interactive ? style.interactive : "",
      className,
   ]
      .filter(Boolean)
      .join(" ");

   let rendered;
   if (to) {
      rendered = (
         <Link
            to={to}
            className={classNames}
            style={containerStyle}
            onClick={onClick}
            title={title || alt || name}
            aria-label={alt || name || "image"}
         >
            {inner}
         </Link>
      );
   } else {
      rendered = (
         <div
            className={classNames}
            style={containerStyle}
            onClick={onClick}
            role={interactive ? "button" : undefined}
            tabIndex={interactive ? 0 : undefined}
            title={title || alt || name}
            aria-label={alt || name || "image"}
         >
            {inner}
         </div>
      );
   }

   if (tooltip) {
      return <Tooltip text={tooltip}>{rendered}</Tooltip>;
   }

   return rendered;
};

export default Image;
