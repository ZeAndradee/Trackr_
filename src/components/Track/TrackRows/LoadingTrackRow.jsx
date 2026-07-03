import React from "react";
import styles from "./TrackRows.module.css";

const LoadingTrackRow = ({ count = 5 }) => {
  return (
    <div className={styles.trackRow}>
      {Array(count).fill().map((_, index) => (
        <div
          className={`${styles.trackCardWrapper} ${styles.loadingCard}`}
          key={`loading-card-${index}`}
        >
          <div className={styles.cardLoading}>
            <div className={styles.coverLoading}>
              <div className={styles.shimmer}></div>
            </div>
            <div className={styles.contentLoading}>
              <div className={`${styles.titleLoading} ${styles.shimmerWrapper}`}>
                <div className={styles.shimmer}></div>
              </div>
              <div className={`${styles.textLoading} ${styles.shimmerWrapper}`}>
                <div className={styles.shimmer}></div>
              </div>
              <div className={`${styles.textLoading} ${styles.shimmerWrapper}`} style={{ width: '60%' }}>
                <div className={styles.shimmer}></div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default LoadingTrackRow;