import React from "react";
import { IoInformationCircle } from "react-icons/io5";
import SectionHeader from "../../../Utils/SectionHeader/SectionHeader";
import { GenreTag } from "../../../Utils/Tags/Tags";
import styles from "./DetailsSection.module.css";

const DetailsSection = ({ track }) => {
  if (!track) return null;

  return (
    <div className={styles.sidebarSection}>
      <SectionHeader title="Track Details" />
      <div className={styles.sidebarDetailSection}>
        {track.duration && (
          <div className={styles.sidebarDetailRow}>
            <div className={styles.sidebarDetailLabel}>Duration</div>
            <div className={styles.sidebarDetailValue}>{track.duration}</div>
          </div>
        )}
        {(track.album?.releaseDate ||
          track.album?.releaseYear ||
          track.releaseYear) && (
            <div className={styles.sidebarDetailRow}>
              <div className={styles.sidebarDetailLabel}>Release</div>
              <div className={styles.sidebarDetailValue}>
                {track.album?.releaseDate ||
                  track.album?.releaseYear ||
                  track.releaseYear}
              </div>
            </div>
          )}
        {track.genres && track.genres.length > 0 && (
          <div className={styles.sidebarDetailRow}>
            <div className={styles.sidebarDetailLabel}>Genres</div>
            <div className={styles.genreTags}>
              {track.genres.slice(0, 3).map((genre, index) => (
                <GenreTag key={index} genre={genre} />
              ))}
            </div>
          </div>
        )}
        {track.popularity !== undefined && (
          <div className={styles.sidebarDetailRow}>
            <div className={styles.sidebarDetailLabel}>Popularity</div>
            <div className={styles.popularityWrapper}>
              <div className={styles.popularityContainer}>
                <div
                  className={styles.popularityFill}
                  style={{ width: `${track.popularity}%` }}
                />
              </div>
              <span className={styles.popularityValue}>
                {track.popularity}%
              </span>
            </div>
          </div>
        )}
        {track.explicit && (
          <div className={styles.sidebarDetailRow}>
            <div className={styles.sidebarDetailLabel}>Explicit</div>
            <div className={styles.explicitIcon}>E</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DetailsSection;
