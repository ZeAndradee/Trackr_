import React from "react";
import styles from "./TrackRowsSkeleton.module.css";

const TrackCardsSkeleton = () => {
  const renderTrackCardSkeleton = (index) => (
    <div key={index} className={styles.trackCardSkeleton}>
      <div className={styles.coverSkeleton}></div>
      <div className={styles.trackInfoSkeleton}>
        <div className={styles.trackNameSkeleton}></div>
        <div className={styles.artistNameSkeleton}></div>
      </div>
    </div>
  );

  return (
    <>
      {Array(5)
        .fill(0)
        .map((_, index) => (
          <div key={index} className={styles.trackCardWrapper}>
            {renderTrackCardSkeleton(index)}
          </div>
        ))}
    </>
  );
};

export default TrackCardsSkeleton;
