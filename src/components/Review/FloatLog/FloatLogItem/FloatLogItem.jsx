import React, { useContext, useRef, useState } from "react";
import style from "./FloatLogItem.module.css";
import MoreOptions from "../../../MoreOptions/MoreOptions";
import useClickOutside from "../../../../hooks/useClickOutside";
import { LogContainerContext } from "../../../../contexts/LogContainerContext";
import { returnArtists, returnCoverUrl } from "../../../Utils/Formater/Track";
import ArtistList from "../../../Utils/ArtistList/ArtistList";
import { returnYear } from "../../../Utils/Text/TruncateString";

const FloatLogItem = ({ track, onItemClick, onTrackSelect }) => {
  const [overlayIsVisible, setOverlayIsVisible] = useState(false);
  const { setShowLogContainer, setSelectedTrack } =
    useContext(LogContainerContext);
  const ref = useRef(null);

  useClickOutside(ref, () => setOverlayIsVisible(false));

  const handleItemClick = () => {
    if (onTrackSelect && typeof onTrackSelect === "function") {
      const selectedTrackData = {
        id: track.id,
        name: track.name,
        artist: returnArtists(track),
        coverUrl: returnCoverUrl(track, 2),
      };
      onTrackSelect(selectedTrackData);
    } else {
      setShowLogContainer(true);
      setSelectedTrack(track);
    }

    if (onItemClick && typeof onItemClick === "function") {
      onItemClick();
    }
  };

  const handleMoreClick = (e) => {
    e.stopPropagation();
    setOverlayIsVisible(!overlayIsVisible);
  };

  return (
    <div className={style.FloatLogItem} onClick={handleItemClick}>
      <div className={style.coverWrapper}>
        <img
          className={style.trackCover}
          src={returnCoverUrl(track, 2)}
          alt={`${track?.name} cover`}
        />
      </div>

      <div className={style.trackData}>
        <div className={style.leftData}>
          <div className={style.nameRelease}>
            <p className={style.trackName} title={track?.name}>
              {track?.name}
            </p>
            {track?.album?.release_date && (
              <span className={style.releaseYear}>
                {returnYear(track?.album?.release_date)}
              </span>
            )}
          </div>
          <div className={style.artistDuration}>
            <span className={style.artistName}>
              <ArtistList artists={track?.artists || []} maxVisible={2} />
            </span>
            {track?.duration && (
              <>
                <span className={style.separator}>•</span>
                <span className={style.duration}>{track?.duration}</span>
              </>
            )}
          </div>
        </div>

        <button
          className={style.moreButton}
          onClick={handleMoreClick}
          aria-label="More options"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 13C12.5523 13 13 12.5523 13 12C13 11.4477 12.5523 11 12 11C11.4477 11 11 11.4477 11 12C11 12.5523 11.4477 13 12 13Z"
              fill="currentColor"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M19 13C19.5523 13 20 12.5523 20 12C20 11.4477 19.5523 11 19 11C18.4477 11 18 11.4477 18 12C18 12.5523 18.4477 13 19 13Z"
              fill="currentColor"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M5 13C5.55228 13 6 12.5523 6 12C6 11.4477 5.55228 11 5 11C4.44772 11 4 11.4477 4 12C4 12.5523 4.44772 13 5 13Z"
              fill="currentColor"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {overlayIsVisible && <MoreOptions ref={ref} track={track} />}
      </div>
    </div>
  );
};

export default FloatLogItem;
