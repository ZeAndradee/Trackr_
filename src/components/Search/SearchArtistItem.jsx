import React from "react";
import styles from "./SearchItems.module.css";
import Image from "../Utils/Images/Image/Image";

const SearchArtistItem = ({ artist, onClick }) => {
  const imageUrl = artist.images?.[0]?.url || artist.imageUrl;
  const genres = artist.genres?.slice(0, 2).join(", ");

  return (
    <div className={styles.itemContainer} onClick={onClick}>
      <div className={styles.avatarContainer}>
        <Image
          src={imageUrl}
          name={artist.name}
          size={48}
          showBadge={false}
        />
      </div>
      <div className={styles.infoContainer}>
        <span className={styles.primaryText}>{artist.name}</span>
        {genres && <span className={styles.secondaryText}>{genres}</span>}
      </div>
    </div>
  );
};

export default SearchArtistItem;
