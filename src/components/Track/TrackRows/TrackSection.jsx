import React from "react";
import styles from "./TrackRows.module.css";
import { Link } from "react-router-dom";
import arrowIcon from "../../../assets/icons/arrow-right.svg";
import LoadingTrackRow from "./LoadingTrackRow";

const TrackSection = ({
  title,
  linkTo,
  isLoading,
  tracks,
  renderTrack,
  emptyMessage,
}) => {
  const safeTracksArray = Array.isArray(tracks) ? tracks : [];
  const hasData = safeTracksArray.length > 0;
  const displayData = safeTracksArray.slice(0, 5);

  return (
    <div className={styles.trackSection}>
      <div className={styles.sectionHeader}>
        <div className={styles.titleWrapper}>
          <div className={styles.decorativeAccent}></div>
          <h2 className={styles.sectionTitle}>
            <span className={styles.titleHighlight}>{title}</span>
          </h2>
          <span className={styles.titleUnderline}></span>
        </div>
        <Link to={linkTo} className={styles.viewAllLink}>
          View all
          <img src={arrowIcon} alt="Arrow" className={styles.arrowIcon} />
        </Link>
      </div>

      {isLoading ? (
        <LoadingTrackRow count={5} />
      ) : hasData ? (
        <div className={styles.trackRowContainer}>
          <div className={styles.trackRow}>
            {displayData.map((track, index) => (
              <div className={styles.trackCardWrapper} key={`track-${index}`}>
                {renderTrack(track, index)}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className={styles.emptyState}>
          <p>{emptyMessage}</p>
        </div>
      )}
    </div>
  );
};

export default TrackSection;
