import React from "react";
import styles from "./LyricsSkeleton.module.css";

const LyricsSkeleton = ({ variant }) => {
  const isTheater = variant === "theater";
  const lineCount = isTheater ? 20 : 12;

  return (
    <div className={`${styles.skeletonWrapper} ${isTheater ? styles.theaterWrapper : ""}`}>
      {[...Array(lineCount)].map((_, i) => (
        <div
          key={i}
          className={`${styles.skeletonLine} ${isTheater ? styles.theaterLine : ""}`}
        />
      ))}
    </div>
  );
};

export default LyricsSkeleton;
