import React from "react";
import styles from "./ProfileSkeleton.module.css";

const ProfileSkeleton = () => {
  return (
    <div className={styles.skeletonContainer}>
      <div className={styles.profileHero}>
        {}
        <div className={styles.profileInfoRow}>
          <div className={styles.avatarSkeleton}></div>

          <div className={styles.profileMainInfo}>
            <div className={styles.profileNameAndActions}>
              <div className={styles.nameContainer}>
                <div className={styles.nameSkeleton}></div>
                <div className={styles.usernameSkeleton}></div>
              </div>
              <div className={styles.buttonSkeleton}></div>
            </div>

            <div className={styles.bioSkeleton}></div>
            <div className={styles.joinDateSkeleton}></div>
          </div>
        </div>

        {}
        <div className={styles.statsContainer}>
          {Array(4)
            .fill()
            .map((_, index) => (
              <div key={`stat-${index}`} className={styles.statBlock}>
                <div className={styles.statCountSkeleton}></div>
                <div className={styles.statTypeSkeleton}></div>
              </div>
            ))}
        </div>
      </div>

      {}
      <div className={styles.tabsContainer}>
        <div className={styles.tabButtons}>
          {Array(3)
            .fill()
            .map((_, index) => (
              <div
                key={`tab-${index}`}
                className={styles.tabButtonSkeleton}
              ></div>
            ))}
        </div>
      </div>

      {}
      <div className={styles.tabContentWrapper}>
        {}
        <div className={styles.contentArea}>
          {}
          <div className={styles.sectionHeader}></div>
          <div className={styles.reviewsContainer}>
            {Array(3)
              .fill()
              .map((_, index) => (
                <div key={`review-${index}`} className={styles.reviewCard}>
                  <div className={styles.reviewHeader}>
                    <div className={styles.albumCoverSkeleton}></div>
                    <div className={styles.trackInfoSkeleton}>
                      <div className={styles.trackNameSkeleton}></div>
                      <div className={styles.artistNameSkeleton}></div>
                    </div>
                  </div>
                  <div className={styles.ratingSkeleton}></div>
                  <div className={styles.reviewTextSkeleton}></div>
                  <div className={styles.reviewTextSkeleton}></div>
                </div>
              ))}
          </div>

          {}
          <div className={styles.sectionHeader}></div>
          <div className={styles.tracksGrid}>
            {Array(6)
              .fill()
              .map((_, index) => (
                <div key={`track-${index}`} className={styles.trackCard}>
                  <div className={styles.trackCoverSkeleton}></div>
                  <div className={styles.trackNameSkeleton}></div>
                  <div className={styles.artistNameSkeleton}></div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSkeleton;
