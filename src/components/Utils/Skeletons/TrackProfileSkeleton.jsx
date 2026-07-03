import React from "react";
import styles from "./TrackProfileSkeleton.module.css";

const TrackProfileSkeleton = () => {
  return (
    <div className={styles.container}>
      { }
      <div className={styles.heroSkeleton}>
        <div className={styles.headerOverlay}></div>
        <div className={styles.headerContent}>
          <div className={styles.coverWrapper}>
            <div className={`${styles.skeletonPulse} ${styles.coverSkeleton}`}></div>
          </div>
          <div className={styles.info}>
            <div className={styles.infoLeft}>
              <div className={styles.textWrapper}>
                <div className={`${styles.skeletonPulse} ${styles.typeSkeleton}`}></div>
                <div className={`${styles.skeletonPulse} ${styles.titleSkeleton}`}></div>
                <div className={`${styles.skeletonPulse} ${styles.subtitleSkeleton}`}></div>
              </div>
            </div>
            <div className={styles.infoRight}>
              <div className={styles.statsSkeleton}>
                <div className={styles.statLineSkeleton}>
                  <div className={`${styles.skeletonPulse} ${styles.statValueSkeleton}`}></div>
                  <div className={`${styles.skeletonPulse} ${styles.statLabelSkeleton}`}></div>
                </div>
                <div className={styles.statSeparator}></div>
                <div className={styles.statLineSkeleton}>
                  <div className={`${styles.skeletonPulse} ${styles.statValueSkeleton}`}></div>
                  <div className={`${styles.skeletonPulse} ${styles.statLabelSkeleton}`}></div>
                </div>
                <div className={styles.statSeparator}></div>
                <div className={styles.statLineSkeleton}>
                  <div className={`${styles.skeletonPulse} ${styles.statValueSkeleton}`}></div>
                  <div className={`${styles.skeletonPulse} ${styles.statLabelSkeleton}`}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      { }
      <div className={styles.contentTabs}>
        <div className={`${styles.skeletonPulse} ${styles.tabButtonSkeleton}`} style={{ width: '80px' }}></div>
        <div className={`${styles.skeletonPulse} ${styles.tabButtonSkeleton}`} style={{ width: '60px' }}></div>
      </div>

      <div className={styles.tabContent}>
        <div className={styles.socialTab}>
          { }
          <div className={styles.mainSocialContent}>
            { }
            <div className={styles.sectionSkeleton}>
              <div className={`${styles.skeletonPulse} ${styles.sectionHeaderSkeleton}`}></div>
              <div className={styles.trackListSkeleton}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className={styles.trackItemSkeleton}>
                    <div className={`${styles.skeletonPulse} ${styles.trackNumberSkeleton}`}></div>
                    <div className={styles.trackDetailsSkeleton}>
                      <div className={`${styles.skeletonPulse} ${styles.trackNameSkeleton}`}></div>
                      <div className={`${styles.skeletonPulse} ${styles.trackArtistSkeleton}`}></div>
                    </div>
                    <div className={`${styles.skeletonPulse} ${styles.trackStatsSkeleton}`}></div>
                  </div>
                ))}
              </div>
            </div>

            { }
            <div className={styles.sectionSkeleton}>
              <div className={`${styles.skeletonPulse} ${styles.sectionHeaderSkeleton}`}></div>
              <div className={styles.reviewListSkeleton}>
                {[1, 2].map(i => (
                  <div key={i} className={styles.reviewItemSkeleton}>
                    <div className={styles.reviewHeaderSkeleton}>
                      <div className={`${styles.skeletonPulse} ${styles.avatarSkeleton}`}></div>
                      <div className={`${styles.skeletonPulse} ${styles.reviewAuthorSkeleton}`}></div>
                    </div>
                    <div className={`${styles.skeletonPulse} ${styles.reviewTextSkeleton}`}></div>
                    <div className={`${styles.skeletonPulse} ${styles.reviewTextSkeleton}`} style={{ width: '80%' }}></div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          { }
          <div className={styles.socialSidebar}>
            { }
            <div className={`${styles.skeletonPulse} ${styles.youtubeSkeleton}`}></div>

            { }
            <div className={styles.sidebarSectionSkeleton}>
              <div className={styles.lyricsSkeleton}>
                {[...Array(10)].map((_, i) => (
                  <div key={i} className={`${styles.skeletonPulse} ${styles.lyricsLineSkeleton}`} style={{ width: `${85 - (i % 3) * 10}%` }}></div>
                ))}
              </div>
            </div>

            { }
            <div className={styles.sidebarSectionSkeleton}>
              <div className={`${styles.skeletonPulse} ${styles.sidebarHeaderSkeleton}`}></div>
              <div className={styles.detailsGridSkeleton}>
                {[1, 2, 3].map(i => (
                  <div key={i} className={styles.detailItemSkeleton}>
                    <div className={`${styles.skeletonPulse} ${styles.detailLabelSkeleton}`}></div>
                    <div className={`${styles.skeletonPulse} ${styles.detailValueSkeleton}`}></div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default TrackProfileSkeleton;
