import React from "react";
import { DurationTag } from "../Utils/Tags/Tags";
import { MdExplicit } from "react-icons/md";
import { Link } from "react-router-dom";
import ArtistList from "../Utils/ArtistList/ArtistList";
import TrackAlbumTitle from "../Utils/TrackAlbumTitle/TrackAlbumTitle";
import Image from "../Utils/Images/Image/Image";
import { getTrackCover } from "../Utils/Formater/Track";
import styles from "./SearchItems.module.css";

const SearchTrackItem = ({ track, to, state }) => {
  const allArtists = track.artists || [];
  const coverUrl =
    track.coverUrl;
  const releaseYear =
    track.album?.release_date?.split("-")[0] ||
    track.release_date?.split("-")[0];

  return (
    <Link
      to={to}
      state={state}
      className={styles.itemContainer}
    >
      <div className={styles.coverContainer}>
        <Image src={getTrackCover(track)} alt={track?.name} fallbackVariant="cover" width="100%" height="100%" className={styles.cover} />
      </div>
      <div className={styles.infoContainer}>
        <span className={styles.primaryText}>
          <TrackAlbumTitle title={track.name} ellipsis />
          {track.explicit && <MdExplicit className={styles.explicitIcon} />}
        </span>
        <span className={styles.secondaryText}>
          <ArtistList artists={allArtists} />
          {releaseYear && (
            <span className={styles.releaseYear}> • {releaseYear}</span>
          )}
        </span>
      </div>
      {track.duration && <DurationTag duration={track.duration} />}
    </Link>
  );
};

export default SearchTrackItem;
