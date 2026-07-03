import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Play, MoreVertical, ListEnd } from "lucide-react";
import {
  createAlbumSlug,
  formatDurationCompact,
} from "../../../../utils/formatters/textFormatters";
import { fetchAlbum, fetchAlbumStreams } from "../../../../services/FetchAlbum";
import { usePlayer } from "../../../../contexts/PlayerContext";
import Image from "../../../Utils/Images/Image/Image";
import { getTrackCover } from "../../../Utils/Formater/Track";
import TrackList from "../../../Utils/TrackList/TrackList";
import TrackAlbumTitle from "../../../Utils/TrackAlbumTitle/TrackAlbumTitle";
import ActionMenu from "../../../Utils/Dropdown/ActionMenu";
import showToast from "../../../Utils/Toast/Toast";

import styles from "./AlbumSection.module.css";

const AlbumSection = ({ track }) => {
  const { playAlbumInQueue, addAlbumToQueue } = usePlayer();
  const [albumData, setAlbumData] = useState(null);
  const [streamsMap, setStreamsMap] = useState({});
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState(null);
  const moreButtonRef = useRef(null);

  const albumId = track?.album?.id || track?.album?.albumId || track?.albumId;

  useEffect(() => {
    const loadAlbumData = async () => {
      if (!albumId) return;

      try {
        const [albumResponse, streamsResponse] = await Promise.all([
          fetchAlbum({ id: albumId }),
          fetchAlbumStreams(albumId),
        ]);

        if (albumResponse) {
          setAlbumData(albumResponse);
        }

        if (streamsResponse && Array.isArray(streamsResponse)) {
          const map = {};
          streamsResponse.forEach((item) => {
            map[item.id] = item.streams;
          });
          setStreamsMap(map);
        }
      } catch (error) {
        console.error("Failed to load album data in AlbumSection", error);
      }
    };

    loadAlbumData();
  }, [albumId]);

  if (!track || !track.album) return null;

  const displayTracks = albumData?.tracks || track.relatedTracks;

  const handleOpenMenu = (e) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setMenuPos({
      bottom: window.innerHeight - rect.top + 8,
      right: window.innerWidth - rect.right,
    });
    setMenuOpen(true);
  };

  const albumTitle = track.album?.name;

  const menuItems = [
    {
      label: "Play album",
      icon: <Play size={18} />,
      onClick: () => {
        playAlbumInQueue(albumId);
      },
      section: "queue",
    },
    {
      label: "Add album to queue",
      icon: <ListEnd size={18} />,
      onClick: () => {
        addAlbumToQueue(albumId);
        showToast(`Added to queue: ${albumTitle}`, "success");
      },
      section: "queue",
    },
  ];

  return (
    <div className={styles.albumSection}>
      <div className={styles.albumHeader}>
        <Link
          to={createAlbumSlug(
            track.album?.name,
            track.album?.artists || track.artists,
            track.album?.id || track.album?.albumId || track.albumId
          )}
          state={{
            albumId: track.album?.id || track.album?.albumId || track.albumId,
          }}
          className={styles.albumCoverLink}
        >
          <div className={styles.albumCoverWrapper}>
            <Image src={getTrackCover(track)} alt={track?.name} fallbackVariant="cover" width="100%" height="100%" className={styles.albumCover} borderLength="2px" />
          </div>
        </Link>
        <div className={styles.albumDetails}>
          <p className={styles.albumTitle}>
            <TrackAlbumTitle
              title={track.album?.name}
              to={createAlbumSlug(
                track.album?.name,
                track.album?.artists || track.artists,
                track.album?.id || track.album?.albumId || track.albumId
              )}
              state={{ albumId: track.album?.id || track.album?.albumId || track.albumId }}
              className={styles.albumTitleText}
            />
            <span className={styles.metaDotTitle}>•</span>
            <span className={styles.albumLabel}>{albumData?.totalTracks > 1 ? "Album" : "Single"}</span>
          </p>
          <div className={styles.albumMeta}>
            <p className={styles.albumYear}>{track.releaseYear}</p>
            {albumData?.totalDuration && (
              <>
                <span className={styles.metaDot}>•</span>
                <p className={styles.albumDuration}>{formatDurationCompact(albumData.totalDuration)}</p>
              </>
            )}
          </div>
        </div>
        {albumId && (
          <button
            ref={moreButtonRef}
            className={styles.moreActionsButton}
            onClick={handleOpenMenu}
          >
            <MoreVertical size={16} />
          </button>
        )}
      </div>
      {menuOpen && (
        <ActionMenu
          items={menuItems}
          onClose={() => setMenuOpen(false)}
          position={menuPos}
          anchor="bottom-right"
        />
      )}

      {displayTracks && displayTracks.length > 0 && (
        <TrackList
          tracks={displayTracks}
          streamsMap={streamsMap}
          album={albumData}
          showHeader={false}
          activeTrackId={track.id || track.trackId}
        />
      )}
    </div>
  );
};

export default AlbumSection;
