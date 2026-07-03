import React from "react";
import styles from "./SimilarSectionSkeleton.module.css";

const SimilarSectionSkeleton = ({ count = 5 }) => {
  return (
    <div className={styles.container}>
      <div className={styles.titleSkeleton}></div>
      <div className={styles.grid}>
        {Array(count)
          .fill(0)
          .map((_, index) => (
            <div key={index} className={styles.coverSkeleton}></div>
          ))}
      </div>
    </div>
  );
};

export default SimilarSectionSkeleton;
