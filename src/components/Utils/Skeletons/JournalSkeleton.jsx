import React from "react";
import styles from "./JournalSkeleton.module.css";

const JournalSkeleton = () => {
  return (
    <div className={styles.skeletonLoading}>
      <div className={styles.tableView}>
        <div className={styles.tableHeader}>
          <div className={styles.tableHeaderCell + " " + styles.dateColumn}>
            DATE
          </div>
          <div className={styles.tableHeaderCell + " " + styles.trackColumn}>
            TRACK
          </div>
          <div className={styles.tableHeaderCell + " " + styles.artistColumn}>
            ARTIST
          </div>
          <div className={styles.tableHeaderCell + " " + styles.ratingColumn}>
            RATING
          </div>
          <div className={styles.tableHeaderCell + " " + styles.moodColumn}>
            YEAR
          </div>
          <div
            className={styles.tableHeaderCell + " " + styles.actionsColumn}
          ></div>
        </div>

        <div className={styles.yearGroup}>
          <div className={styles.monthGroup}>
            {Array(5)
              .fill()
              .map((_, index) => (
                <div key={`skeleton-row-${index}`} className={styles.tableRow}>
                  <div className={styles.tableCell + " " + styles.dateColumn}>
                    <div className={styles.dayContainer}>
                      <span className={styles.dayNumber}></span>
                    </div>
                  </div>

                  <div className={styles.tableCell + " " + styles.trackColumn}>
                    <div className={styles.trackInfo}>
                      <div className={styles.trackCover}>
                        <div className={styles.skeletonImg}></div>
                      </div>
                      <span
                        className={`${styles.trackTitle} ${styles.shimmerText}`}
                      ></span>
                    </div>
                  </div>

                  <div className={styles.tableCell + " " + styles.artistColumn}>
                    <div className={styles.shimmerText}></div>
                  </div>

                  <div className={styles.tableCell + " " + styles.ratingColumn}>
                    <div className={styles.skeletonStars}></div>
                  </div>

                  <div className={styles.tableCell + " " + styles.moodColumn}>
                    <span className={styles.yearTag}></span>
                  </div>

                  <div
                    className={styles.tableCell + " " + styles.actionsColumn}
                  >
                    <div className={styles.actionButtons}>
                      <div className={styles.actionButton}></div>
                      <div className={styles.actionButton}></div>
                      <div className={styles.actionButton}></div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JournalSkeleton;
