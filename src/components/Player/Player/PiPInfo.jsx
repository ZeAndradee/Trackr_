import { Link } from "react-router-dom";
import { ChevronUp, X } from "lucide-react";
import Image from "../../Utils/Images/Image/Image";
import ArtistList from "../../Utils/ArtistList/ArtistList";
import { Tooltip } from "../../Utils/Tooltip/Tooltip";
import { getTrackCover } from "../../Utils/Formater/Track";
import { createTrackSlug } from "../../../utils/formatters/textFormatters";
import { usePlayer } from "../../../contexts/PlayerContext";
import styles from "./PiPInfo.module.css";

const PiPInfo = ({ onMoveDown, visible }) => {
  const { currentTrack, openTheaterMode, closePlayer } = usePlayer();
  if (!currentTrack) return null;

  const trackId = currentTrack.trackId || currentTrack.id;
  const title = currentTrack.name || currentTrack.title;
  const trackUrl = createTrackSlug(title, currentTrack.artists, trackId);

  return (
    <div
      className={`${styles.info} ${visible ? styles.visible : ""}`}
      onPointerDown={onMoveDown}
    >
      <Image
        src={getTrackCover(currentTrack)}
        alt={title}
        fallbackVariant="cover"
        borderLength="2px"
        width="42px"
        height="42px"
        to={trackUrl}
        className={styles.cover}
      />
      <div className={styles.meta}>
        <Link to={trackUrl} className={styles.title}>{title}</Link>
        <ArtistList
          artists={currentTrack.artists || []}
          className={styles.artist}
          fontSize="0.68rem"
          color="var(--text-secondary-color)"
        />
      </div>
      <div className={styles.actions}>
        <Tooltip text="Theater mode" position="bottom">
          <button className={styles.actionBtn} onClick={openTheaterMode}>
            <ChevronUp size={18} />
          </button>
        </Tooltip>
        <Tooltip text="Close" position="bottom">
          <button className={styles.actionBtn} onClick={closePlayer}>
            <X size={16} />
          </button>
        </Tooltip>
      </div>
    </div>
  );
};

export default PiPInfo;
