import React from "react";
import styles from "./AboutTracksSkeleton.module.css";

const AboutTracksSkeleton = () => {
  const renderTrackCardSkeleton = (index) => (
    <div key={index} className={styles.trackCardSkeleton}>
      <div className={styles.trackCoverSkeleton}></div>
      <div className={styles.trackInfoSkeleton}>
        <div className={styles.trackNameSkeleton}></div>
        <div className={styles.artistNameSkeleton}></div>
      </div>
    </div>
  );

  return (
    <div className={styles.tracksCarouselSkeleton}>
      {renderTrackCardSkeleton(1)}
      {renderTrackCardSkeleton(2)}
    </div>
  );
};

export default AboutTracksSkeleton;
