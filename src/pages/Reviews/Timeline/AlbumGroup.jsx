import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Ellipsis } from "lucide-react";
import Image from "../../../components/Utils/Images/Image/Image";
import ArtistList from "../../../components/Utils/ArtistList/ArtistList";
import { RatingTag, Tag } from "../../../components/Utils/Tags/Tags";
import { Tooltip } from "../../../components/Utils/Tooltip/Tooltip";
import useApi from "../../../hooks/Api";
import {
  createAlbumSlug,
  parseReviewContent,
} from "../../../utils/formatters/textFormatters";
import styles from "./AlbumGroup.module.css";

const REVIEW_MAX_LENGTH = 400;

const AlbumGroup = ({ album, tracks = [], onMoreClick, username, totalTracks }) => {
  const api = useApi();
  const [fetchedTotalTracks, setFetchedTotalTracks] = useState(null);

  useEffect(() => {
    let active = true;
    const getAlbumData = async () => {
      try {
        const { data: response } = await api.get(`/album/${album.albumId}`);
        if (active && response?.data) {
          const total = response.data.total_tracks || response.data.totalTracks || response.data.tracks?.length || 0;
          setFetchedTotalTracks(total);
        }
      } catch (e) {
        console.error(e);
      }
    };
    if (album.albumId) {
      getAlbumData();
    }
    return () => {
      active = false;
    };
  }, [album.albumId, api]);

  const slug = createAlbumSlug(album.name, album.artists || [], album.albumId);
  const rawReview = (album.review || "").trim();
  const { text: reviewText, gifUrl } = parseReviewContent(rawReview);
  const hasText = reviewText && reviewText.trim().length > 0;
  const hasGif = !!gifUrl;
  const hasRating = album.rating > 0;
  const shouldTruncate = hasText && reviewText.length > REVIEW_MAX_LENGTH;
  const displayText = shouldTruncate
    ? `${reviewText.slice(0, REVIEW_MAX_LENGTH)}...`
    : reviewText;
  const logUrl = username ? `/${username}/log/${album._id}` : null;

  const trackCount = tracks.length;
  const finalTotalTracks = fetchedTotalTracks || totalTracks || 0;
  const completionPct = finalTotalTracks
    ? Math.min(100, Math.round((trackCount / finalTotalTracks) * 100))
    : 0;

  const getCompletionColor = (pct) => {
    if (pct >= 75) return "var(--rating-high)";
    if (pct >= 35) return "var(--rating-medium)";
    return "var(--rating-low)";
  };

  const completionColor = getCompletionColor(completionPct);

  const formattedDate = new Date(album.selectedDate || album.createdAt).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric"
  });

  return (
    <div className={styles.albumItem}>
      <div className={styles.albumContent}>
        <div className={styles.albumCard}>
          <div className={styles.albumMainInfo}>
            <Link to={slug} className={styles.coverLink}>
              <Image
                src={album.coverUrl}
                alt={album.name}
                fallbackVariant="cover"
                borderLength="2px"
                className={styles.albumCover}
                width="100%"
                height="100%"
              />
            </Link>
            <div className={styles.albumMeta}>
              <div className={styles.albumHeaderRow}>
                <div className={styles.albumTitleBlock}>
                  <Link to={slug} className={styles.albumTitleLink}>
                    <span className={styles.albumTitle}>{album.name}</span>
                  </Link>
                  <Tag size="0.65rem">album</Tag>
                </div>
                <button
                  type="button"
                  className={styles.albumMoreButton}
                  onClick={(event) => onMoreClick(event, album._id)}
                  aria-label="More options"
                >
                  <Ellipsis size={16} />
                </button>
              </div>

              {album.artists && album.artists.length > 0 && (
                <ArtistList artists={album.artists} className={styles.albumArtists} />
              )}
            </div>
          </div>

          <div className={styles.reviewMetaRow}>
            {hasRating && <RatingTag rating={album.rating} size="0.85rem" />}
            {hasRating && <span className={styles.metaDot}>•</span>}

            <Tooltip
              text={`${trackCount} of ${finalTotalTracks} tracks reviewed`}
              position="bottom"
            >
              <div className={styles.completionCircleWrap}>
                <svg width="18" height="18" viewBox="0 0 24 24" className={styles.progressCircle}>
                  <circle
                    cx="12"
                    cy="12"
                    r="9"
                    fill="transparent"
                    stroke="var(--dark-border2)"
                    strokeWidth="3.5"
                  />
                  <circle
                    cx="12"
                    cy="12"
                    r="9"
                    fill="transparent"
                    stroke={completionColor}
                    strokeWidth="3.5"
                    strokeDasharray={2 * Math.PI * 9}
                    strokeDashoffset={2 * Math.PI * 9 * (1 - completionPct / 100)}
                    strokeLinecap="round"
                    transform="rotate(-90 12 12)"
                  />
                </svg>
                <span className={styles.completionFraction}>
                  {trackCount}/{finalTotalTracks}
                </span>
              </div>
            </Tooltip>

            <span className={styles.metaDot}>•</span>
            <span className={styles.reviewDate}>{formattedDate}</span>
          </div>

          {(hasText || hasGif) && (
            <div className={styles.albumReviewSection}>
              {hasText && (
                <p className={styles.albumReviewText}>
                  {displayText}
                  {shouldTruncate && logUrl && (
                    <Link to={logUrl} className={styles.readMore}>
                      Read more
                    </Link>
                  )}
                </p>
              )}
              {hasGif && (
                <img
                  src={gifUrl}
                  alt="Album Review GIF"
                  className={styles.albumReviewGif}
                  onError={(event) => {
                    event.target.style.display = "none";
                  }}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AlbumGroup;
