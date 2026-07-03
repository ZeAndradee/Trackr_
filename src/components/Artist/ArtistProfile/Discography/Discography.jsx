import React from "react";
import { Link } from "react-router-dom";
import Image from "../../../Utils/Images/Image/Image";
import { createAlbumSlug } from "../../../../utils/formatters/textFormatters";
import TrackAlbumTitle from "../../../Utils/TrackAlbumTitle/TrackAlbumTitle";
import styles from "./Discography.module.css";

const PREVIEW_COUNT = 8;

const Discography = ({ albums, artist, onViewMore }) => {
  if (!albums || albums.length === 0) return null;

  const sorted = [...albums].sort((a, b) => {
    const dateA = a.release_date || a.releaseDate || "";
    const dateB = b.release_date || b.releaseDate || "";
    return dateB.localeCompare(dateA);
  });

  const preview = sorted.slice(0, PREVIEW_COUNT);

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeading}>
        <h2>Discography</h2>
        {albums.length > PREVIEW_COUNT && (
          <button className={styles.viewMore} onClick={onViewMore}>
            View All
          </button>
        )}
      </div>

      <div className={styles.grid}>
        {preview.map((album) => {
          const artistsArr = album.artists || (artist ? [artist] : []);
          const slug = createAlbumSlug(album.name, artistsArr, album.id);
          const cover = album.images?.[0]?.url || album.coverUrl;
          const year = (album.release_date || album.releaseDate || "").split("-")[0];

          return (
            <div key={album.id} className={styles.albumCard}>
              <Link to={slug} state={{ albumId: album.id }} className={styles.coverWrapper}>
                <Image
                  src={cover}
                  alt={album.name}
                  fallbackVariant="cover"
                  borderLength="3px"
                  className={styles.cover}
                  width="100%"
                  height="100%"
                />
              </Link>
              <TrackAlbumTitle
                title={album.name}
                to={slug}
                state={{ albumId: album.id }}
                ellipsis
                className={styles.albumName}
              />
              <div className={styles.albumMeta}>
                {year && <span>{year}</span>}
                {year && album.album_group && <span className={styles.metaDot}>•</span>}
                {album.album_group && (
                  <span className={styles.albumType}>{album.album_group}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default Discography;
