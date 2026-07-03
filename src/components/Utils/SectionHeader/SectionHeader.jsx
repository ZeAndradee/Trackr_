import React from "react";
import styles from "./SectionHeader.module.css";

const SectionHeader = ({ icon, title, action, noIconBackground = false, iconColor, className }) => {
  return (
    <div className={`${styles.sectionHeader} ${className || ""}`}>
      {icon && (
        <div
          className={`${styles.sectionIcon} ${
            noIconBackground ? styles.noBackground : ""
          }`}
          style={iconColor ? { color: iconColor } : undefined}
        >
          {icon}
        </div>
      )}
      <h3>{title}</h3>
      {action && <div className={styles.actionContainer}>{action}</div>}
    </div>
  );
};

export default SectionHeader;
