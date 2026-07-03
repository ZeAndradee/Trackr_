import React from "react";
import { Link } from "react-router-dom";
import styles from "./Button.module.css";

export const Button = ({
  variant = "primary",
  size = "md",
  children,
  to,
  disabled = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  className = "",
  onClick,
  customPadding,
  customFontSize,
  style,
  ...props
}) => {
  const buttonClasses = [
    styles.button,
    styles[variant],
    styles[size],
    fullWidth ? styles.fullWidth : "",
    disabled ? styles.disabled : "",
    className,
  ].join(" ");

  const content = (
    <>
      {leftIcon && <span className={styles.leftIcon}>{leftIcon}</span>}
      <span className={styles.content}>{children}</span>
      {rightIcon && <span className={styles.rightIcon}>{rightIcon}</span>}
    </>
  );

  const customStyles = {
    ...(style || {}),
    ...(customPadding ? { padding: customPadding } : {}),
    ...(customFontSize ? { fontSize: customFontSize } : {}),
  };

  if (to && !disabled) {
    return (
      <Link to={to} className={buttonClasses} style={customStyles} {...props}>
        {content}
      </Link>
    );
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={buttonClasses}
      style={customStyles}
      {...props}
    >
      {content}
    </button>
  );
};
