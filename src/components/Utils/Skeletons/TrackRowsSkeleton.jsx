import React from "react";
import styles from "./TrackRowsSkeleton.module.css";
import { FaUserFriends } from "react-icons/fa";
import { BsStarFill } from "react-icons/bs";
import SectionHeader from "../SectionHeader/SectionHeader";
import { Link } from "react-router-dom";

const TrackRowsSkeleton = () => {
  const renderTrackCardSkeleton = (index) => (
    <div key={index} className={styles.trackCardSkeleton}>
      <div className={styles.coverSkeleton}></div>
      <div className={styles.trackInfoSkeleton}>
        <div className={styles.trackNameSkeleton}></div>
        <div className={styles.artistNameSkeleton}></div>
      </div>
    </div>
  );

  const renderTrackCardSkeletons = () => {
    return Array(5)
      .fill(0)
      .map((_, index) => (
        <div key={index} className={styles.trackCardWrapper}>
          {renderTrackCardSkeleton(index)}
        </div>
      ));
  };

  return (
    <section className={styles.trackRowsContainer}>
      {}
      <div className={styles.sectionContainer}>
        <SectionHeader
          icon={<FaUserFriends />}
          title="Friends' Recent Reviews"
          action={
            <Link to="/" className="headerViewMoreButton">
              View All
            </Link>
          }
        />

        <div className={styles.tracksGrid}>{renderTrackCardSkeletons()}</div>
      </div>

      {}
      <div className={styles.sectionContainer}>
        <div className={styles.tabsContainer}>
          <SectionHeader
            icon={<BsStarFill />}
            title="Trending Tracks"
            action={
              <Link to="/" className="headerViewMoreButton">
                View All
              </Link>
            }
          />
        </div>

        <div className={styles.tracksGrid}>{renderTrackCardSkeletons()}</div>
      </div>
    </section>
  );
};

export default TrackRowsSkeleton;
