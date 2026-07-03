import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import TrackCardRow from "../TrackCardRow/TrackCardRow";
import Image from "../Images/Image/Image";
import { getTrackCover } from "../Formater/Track";
import SimilarSectionSkeleton from "../Skeletons/SimilarSectionSkeleton";
import { fetchSimilarTracks } from "../../../services/FetchTrack";
import { fetchSimilarAlbums } from "../../../services/FetchAlbum";
import {
  createTrackSlug,
  createAlbumSlug,
} from "../../../utils/formatters/textFormatters";
import styles from "./SimilarSection.module.css";

const SimilarSection = ({ type = "track", name, artist, id, tracks, maxItems = 5 }) => {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSimilar = async () => {
      setIsLoading(true);
      try {
        let data = [];
        if (type === "track" && name && artist) {
          data = await fetchSimilarTracks(name, artist);
        } else if (type === "album" && tracks && tracks.length > 0) {
          const sorted = [...tracks].sort(
            (a, b) => (b.popularity || 0) - (a.popularity || 0)
          );
          const topTrack = sorted[0];
          const trackArtist = topTrack.primaryArtist?.name || artist;
          const trackName = topTrack.name;
          if (trackName && trackArtist) {
            data = await fetchSimilarAlbums(trackName, trackArtist);
          }
        }
        setItems(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching similar items:", err);
        setItems([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadSimilar();
  }, [type, name, artist, id, tracks]);

  if (isLoading) return <SimilarSectionSkeleton count={maxItems} />;
  if (!items || items.length === 0) return null;

  const title = type === "track" ? "Similar tracks" : "Similar albums";

  const renderItem = (item) => {
    if (type === "album") {
      const slug = createAlbumSlug(item.name, item.artists, item.id);
      return (
        <Link key={item.id} to={slug} state={{ albumId: item.id }}>
          <Image src={getTrackCover(item)} alt={item?.name} fallbackVariant="cover" width="100%" height="100%" tooltip={item?.name} borderLength="3px" className={styles.trackCoverRadius} />
        </Link>
      );
    }

    return (
      <Link
        key={item.id}
        to={createTrackSlug(
          item.name,
          item.artists,
          item.id || item.trackId
        )}
        state={{ trackId: item.id || item.trackId }}
      >
        <Image src={getTrackCover(item)} alt={item?.name} fallbackVariant="cover" width="100%" height="100%" tooltip={item?.name} borderLength="3px" className={styles.trackCoverRadius} />
      </Link>
    );
  };

  return (
    <div className={styles.similarSection}>
      <h3 className={styles.similarTitle}>{title}</h3>
      <TrackCardRow>
        {items.slice(0, maxItems).map(renderItem)}
      </TrackCardRow>
    </div>
  );
};

export default SimilarSection;
