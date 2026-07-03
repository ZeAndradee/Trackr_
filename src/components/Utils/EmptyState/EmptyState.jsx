import React from "react";
import styles from "./EmptyState.module.css";
import { Button } from "../Buttons/Button";

const EmptyState = ({
  icon,
  title,
  message,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  customIcon,
  customClass,
  fullHeight = false,
}) => {
  const hasActions = (actionLabel && onAction) || (secondaryActionLabel && onSecondaryAction);

  return (
    <div className={`${styles.emptyStateContainer} ${fullHeight ? styles.fullHeight : ""} ${customClass || ""}`}>
      <div className={styles.iconContainer}>
        {customIcon || <div className={styles.defaultIcon}>{icon}</div>}
      </div>

      <h2 className={styles.title}>
        {title}
      </h2>

      <p className={styles.message}>
        {message}
      </p>

      {hasActions && (
        <div className={styles.actions}>
          {actionLabel && onAction && (
            <Button variant="primary" size="md" fullWidth onClick={onAction}>
              {actionLabel}
            </Button>
          )}
          {secondaryActionLabel && onSecondaryAction && (
            <Button variant="secondary" size="md" fullWidth onClick={onSecondaryAction}>
              {secondaryActionLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default EmptyState;
