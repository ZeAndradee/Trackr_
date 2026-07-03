import React from "react";
import style from "./Toggle.module.css";

const Toggle = ({ checked, onChange, disabled = false, size = "md", className = "", ariaLabel }) => {
   const handleClick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (!disabled) onChange?.(!checked);
   };

   return (
      <button
         type="button"
         role="switch"
         aria-checked={checked}
         aria-label={ariaLabel}
         disabled={disabled}
         onClick={handleClick}
         className={`${style.toggle} ${style[size] || ""} ${checked ? style.checked : ""} ${disabled ? style.disabled : ""} ${className}`}
      >
         <span className={style.thumb} />
      </button>
   );
};

export default Toggle;
