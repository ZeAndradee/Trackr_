import React from "react";
import { Link } from "react-router-dom";
import ArtistList from "../Utils/ArtistList/ArtistList";
import TrackAlbumTitle from "../Utils/TrackAlbumTitle/TrackAlbumTitle";
import Image from "../Utils/Images/Image/Image";
import styles from "./SearchItems.module.css";

const SearchAlbumItem = ({ album, to, state }) => {
  const allArtists = album.artists || [];
  const coverUrl = album.images?.[0]?.url || album.coverUrl;
  const releaseYear = (album.releaseDate || album.release_date)?.split("-")[0];

  return (
    <Link
      to={to}
      state={state}
      className={styles.itemContainer}
    >
      <div className={styles.coverContainer}>
        <Image src={coverUrl} alt={album.name} fallbackVariant="cover" width="100%" height="100%" className={styles.cover} />
      </div>
      <div className={styles.infoContainer}>
        <span className={styles.primaryText}>
          <TrackAlbumTitle title={album.name} ellipsis />
        </span>
        <span className={styles.secondaryText}>
          <ArtistList artists={allArtists} />
          {releaseYear && ` • ${releaseYear}`}
        </span>
      </div>
    </Link>
  );
};

export default SearchAlbumItem;
