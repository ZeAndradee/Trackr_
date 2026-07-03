import { Link } from "react-router-dom";
import ArtistList from "../../Utils/ArtistList/ArtistList";
import Image from "../../Utils/Images/Image/Image";
import { getTrackCover } from "../../Utils/Formater/Track";
import { usePlayer } from "../../../contexts/PlayerContext";
import { createTrackSlug } from "../../../utils/formatters/textFormatters";
import QueueItemSkeleton from "../../Utils/Skeletons/QueueItemSkeleton";
import styles from "./SimilarTracks.module.css";

const SimilarTracks = ({ onNavigate }) => {
  const {
    recommendationsQueue,
    recommendationsExhausted,
    recommendationsSeedName,
    playTrackInQueue,
    removeFromRecommendations,
  } = usePlayer();

  if (recommendationsQueue.length === 0) {
    if (recommendationsExhausted) {
      return <div className={styles.empty}>No similar tracks found</div>;
    }
    return (
      <div className={styles.list}>
        {Array.from({ length: 6 }).map((_, i) => (
          <QueueItemSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className={styles.list}>
      {recommendationsSeedName && (
        <h3 className={styles.heading}>
          Similar tracks to <span className={styles.headingName}>{recommendationsSeedName}</span>
        </h3>
      )}
      {recommendationsQueue.map((item, index) => {
        const id = item.trackId || item.id;
        const displayName = item.name || item.title || "";
        return (
          <div
            key={item._queueId || id || index}
            className={styles.item}
            onClick={() => {
              playTrackInQueue(item);
              removeFromRecommendations(index);
            }}
          >
            <Image
              src={getTrackCover(item)}
              alt={displayName}
              fallbackVariant="cover"
              borderLength="2px"
              height="52px"
              width="52px"
              className={styles.art}
            />
            <div className={styles.meta}>
              <Link
                to={createTrackSlug(displayName, item.artists, id)}
                state={{ trackId: id }}
                className={styles.title}
                onClick={(e) => {
                  e.stopPropagation();
                  onNavigate?.();
                }}
              >
                {displayName}
              </Link>
              <ArtistList
                artists={item.artists || []}
                className={styles.artist}
                fontSize="0.8rem"
                color="var(--text-secondary-color)"
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SimilarTracks;
