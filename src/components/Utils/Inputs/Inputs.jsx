import { forwardRef, useState } from "react";
import { FiEye, FiEyeOff, FiX } from "react-icons/fi";
import styles from "./Inputs.module.css";

const cn = (...c) => c.filter(Boolean).join(" ");

export const TextInput = forwardRef(
  (
    {
      type = "text",
      label,
      mandatory = false,
      error,
      id,
      icon,
      clearable = false,
      onClear,
      className,
      containerClassName,
      value,
      onChange,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === "password";
    const inputType = isPassword && showPassword ? "text" : type;

    const hasValue = value !== undefined && value !== null && value !== "";
    const showClear = clearable && hasValue && !props.disabled;
    const hasRightAction = isPassword || showClear;
    const hasBothActions = isPassword && showClear;

    const handleClear = () => {
      if (onClear) onClear();
      else if (onChange) onChange({ target: { value: "" } });
    };

    return (
      <div className={cn(styles.group, containerClassName)}>
        {label && (
          <label className={styles.label} htmlFor={id}>
            {label}
            {mandatory && <span className={styles.mandatory}>*</span>}
          </label>
        )}
        <div className={styles.wrapper}>
          {icon && <span className={styles.icon}>{icon}</span>}
          <input
            ref={ref}
            id={id}
            type={inputType}
            value={value}
            onChange={onChange}
            className={cn(
              styles.input,
              icon && styles.hasIcon,
              hasBothActions ? styles.hasBothActions : hasRightAction && styles.hasRightAction,
              error && styles.error,
              className
            )}
            {...props}
          />
          {showClear && (
            <button
              type="button"
              className={cn(styles.rightAction, isPassword && styles.clearButton)}
              onClick={handleClear}
              tabIndex={-1}
              aria-label="Clear"
            >
              <FiX />
            </button>
          )}
          {isPassword && (
            <button
              type="button"
              className={styles.rightAction}
              onClick={() => setShowPassword((s) => !s)}
              tabIndex={-1}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </button>
          )}
        </div>
        {error && <span className={styles.errorText}>{error}</span>}
      </div>
    );
  }
);
TextInput.displayName = "TextInput";

export const TextArea = forwardRef(
  (
    {
      label,
      mandatory = false,
      error,
      id,
      maxLength,
      showCounter = false,
      resize = "vertical",
      className,
      containerClassName,
      value,
      ...props
    },
    ref
  ) => {
    const length = typeof value === "string" ? value.length : 0;
    const limitReached = maxLength != null && length >= maxLength;

    return (
      <div className={cn(styles.group, containerClassName)}>
        {label && (
          <label className={styles.label} htmlFor={id}>
            {label}
            {mandatory && <span className={styles.mandatory}>*</span>}
          </label>
        )}
        <div className={cn(styles.textareaWrapper, error && styles.error)}>
          <textarea
            ref={ref}
            id={id}
            value={value}
            maxLength={maxLength}
            className={cn(
              styles.textarea,
              resize === "none" && styles.textareaNoResize,
              className
            )}
            {...props}
          />
          {showCounter && maxLength != null && (
            <span className={cn(styles.charCounter, limitReached && styles.charCounterLimit)}>
              {length}/{maxLength}
            </span>
          )}
        </div>
        {error && <span className={styles.errorText}>{error}</span>}
      </div>
    );
  }
);
TextArea.displayName = "TextArea";

export const Checkbox = forwardRef(
  ({ label, disabled = false, className, id, ...props }, ref) => {
    const content = (
      <input
        ref={ref}
        id={id}
        type="checkbox"
        disabled={disabled}
        className={cn(styles.checkbox, className)}
        {...props}
      />
    );
    if (!label) return content;
    return (
      <label
        htmlFor={id}
        className={cn(styles.checkboxWrapper, disabled && styles.checkboxDisabled)}
      >
        {content}
        {label}
      </label>
    );
  }
);
Checkbox.displayName = "Checkbox";

export default {
  TextInput,
  TextArea,
  Checkbox,
}