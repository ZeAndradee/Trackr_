import React from "react";
import styles from "./ToggleSlide.module.css";

const ToggleSlide = ({
   options = [],
   value,
   onChange,
   className = "",
   ariaLabel,
   size = "md",
}) => {
   return (
      <div
         className={`${styles.toggle} ${styles[size] || ""} ${className}`}
         role="group"
         aria-label={ariaLabel}
      >
         {options.map((opt) => {
            const active = value === opt.key;
            return (
               <button
                  key={opt.key}
                  type="button"
                  className={`${styles.btn} ${active ? styles.active : ""}`}
                  onClick={() => !active && onChange?.(opt.key)}
                  aria-pressed={active}
                  title={opt.title}
               >
                  {opt.icon && <span className={styles.icon}>{opt.icon}</span>}
                  {opt.label && <span>{opt.label}</span>}
               </button>
            );
         })}
      </div>
   );
};

export default ToggleSlide;
