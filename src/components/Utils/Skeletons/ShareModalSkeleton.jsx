import React from "react";
import styles from "./ShareModalSkeleton.module.css";

const ShareModalSkeleton = () => {
  return (
    <div className={styles.skeletonContainer}>
      <div className={styles.imageSkeleton}></div>
      <div className={styles.actionsSkeleton}>
        <div className={styles.buttonSkeleton}></div>
      </div>
    </div>
  );
};

export default ShareModalSkeleton;
