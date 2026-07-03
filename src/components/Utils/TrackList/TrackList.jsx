import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUserContext } from "../../../contexts/UserContext";
import { FiMoreHorizontal, FiEye, FiChevronDown } from "react-icons/fi";
import { PiPaperPlaneTiltBold } from "react-icons/pi";
import { Pencil, Plus, ListStart, ListEnd, Play, MoreVertical } from "lucide-react";
import { RiPlayListAddLine } from "react-icons/ri";
import { usePlayer } from "../../../contexts/PlayerContext";

import styles from "./TrackList.module.css";
import {
  createTrackSlug,
  createAlbumSlug,
  formatCompactNumber,
  formatDurationCompact,
} from "../../../utils/formatters/textFormatters";
import ActionMenu from "../../Utils/Dropdown/ActionMenu";
import ArtistList from "../../Utils/ArtistList/ArtistList";
import TrackAlbumTitle from "../../Utils/TrackAlbumTitle/TrackAlbumTitle";
import Image from "../Images/Image/Image";
import { getTrackCover } from "../Formater/Track";
import TrackReviewModal from "../../Review/TrackReviewModal/TrackReviewModal";
import AddToListModal from "../../Utils/AddToListModal/AddToListModal";
import showToast from "../../Utils/Toast/Toast";

const TrackList = ({
  tracks,
  album,
  streamsMap = {},
  showHeader = false,
  activeTrackId = null,
  initialDisplayCount = 5,
  linkSuffix = "",
  defaultExpanded = false,
  albumMenuItems,
  showAlbumCover = false,
  showAlbumName = false,
  showAllTracks = false,
  onViewMore
}) => {
  const navigate = useNavigate();
  const { userLogged } = useUserContext();
  const { isPlayerVisible, currentTrack, isPlaying, playTrackInQueue, addToQueue, addNextToQueue } = usePlayer();
  const [showTrackReviewModal, setShowTrackReviewModal] = useState(false);
  const [showListModal, setShowListModal] = useState(false);
  const [activeTrack, setActiveTrack] = useState(null);
  const [listModalTrack, setListModalTrack] = useState(null);
  const [activeMenu, setActiveMenu] = useState(null);
  const [menuPosition, setMenuPosition] = useState(null);
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [albumMenuOpen, setAlbumMenuOpen] = useState(false);
  const [albumMenuPos, setAlbumMenuPos] = useState(null);

  if (!tracks || tracks.length === 0) {
    return null;
  }

  const handleFastLog = (track, e) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveTrack({ id: track.id, userInteractions: track.userInteractions });
    setShowTrackReviewModal(true);
  };

  const handleCloseTrackReviewModal = () => {
    setShowTrackReviewModal(false);
    setActiveTrack(null);
  };

  const handleAddToList = (track, e) => {
    e.preventDefault();
    e.stopPropagation();
    setListModalTrack(track.id);
    setShowListModal(true);
  };

  const toggleMenu = (e, trackId) => {
    e.preventDefault();
    e.stopPropagation();
    if (activeMenu === trackId) {
      setActiveMenu(null);
      setMenuPosition(null);
    } else {
      const rect = e.currentTarget.getBoundingClientRect();
      setMenuPosition({ top: rect.bottom, right: window.innerWidth - rect.right });
      setActiveMenu(trackId);
    }
  };

  const canPaginate = !showAllTracks && tracks.length > initialDisplayCount;
  let visibleTracks = tracks;
  if (canPaginate && !isExpanded) {
    visibleTracks = tracks.slice(0, initialDisplayCount);
    if (activeTrackId) {
      const activeTrackIdx = tracks.findIndex((t) => t.id === activeTrackId);
      if (activeTrackIdx >= initialDisplayCount) {
        visibleTracks = [
          ...tracks.slice(0, initialDisplayCount - 1),
          tracks[activeTrackIdx]
        ];
      }
    }
  }

  return (
    <div className={styles.trackListContainer}>
      {showHeader && (
        <div className={styles.sectionHeader}>
          <div className={styles.titleGroup}>
            <h3>Tracks</h3>
            <span className={styles.dot}>•</span>
            <span>{tracks.length} tracks</span>
            {album?.totalDuration && (
              <>
                <span className={styles.dot}>•</span>
                <span>{formatDurationCompact(album.totalDuration)}</span>
              </>
            )}
          </div>
          {albumMenuItems && albumMenuItems.length > 0 && (
            <>
              <button
                className={styles.albumMoreButton}
                onClick={(e) => {
                  e.stopPropagation();
                  const rect = e.currentTarget.getBoundingClientRect();
                  setAlbumMenuPos({
                    top: rect.bottom + 8,
                    right: window.innerWidth - rect.right,
                  });
                  setAlbumMenuOpen(true);
                }}
              >
                <MoreVertical size={16} />
              </button>
              {albumMenuOpen && (
                <ActionMenu
                  items={albumMenuItems}
                  onClose={() => setAlbumMenuOpen(false)}
                  position={albumMenuPos}
                  anchor="top-right"
                />
              )}
            </>
          )}
        </div>
      )}

      <div className={styles.trackList}>
        {visibleTracks.map((t, index) => {
          const originalIndex = tracks.findIndex((track) => track.id === t.id);

          const userRating = t.userInteractions?.rating || 0;
          const streams = streamsMap[t.id];
          const popularity = t.popularity;

          const title = t.name;
          const allArtists = (t.artists && t.artists.length > 0) ? t.artists : (album?.artists || []);
          const artistName = allArtists[0]?.name;
          const trackSlug = createTrackSlug(title, allArtists, t.id);
          const isCurrentTrack = t.id === activeTrackId;
          const trackAlbum = t.album || album;
          const albumName = trackAlbum?.name;
          const albumId = trackAlbum?.id;
          const albumSlug = (albumName && albumId)
            ? createAlbumSlug(albumName, trackAlbum?.artists || allArtists, albumId)
            : null;

          return (
            <div
              key={t.id}
              className={`${styles.trackItem} ${isCurrentTrack ? styles.activeTrack : ""}`}
            >
              <Link
                to={`${trackSlug}${linkSuffix}`}
                state={{ trackId: t.id }}
                className={styles.trackItemOverlay}
                aria-label={title}
                tabIndex={-1}
              />
              <div className={styles.trackIndexInfo}>
                <span className={styles.trackIndex}>
                  {showAlbumCover ? originalIndex + 1 : (t.trackNumber || originalIndex + 1)}
                </span>
                {showAlbumCover && (
                  <Image
                    src={getTrackCover(t)}
                    alt={t?.name}
                    fallbackVariant="cover"
                    className={styles.trackCover}
                    height="48px"
                    width="48px"
                  />
                )}

                <div className={styles.trackInfo}>
                  <TrackAlbumTitle
                    title={title}
                    fontSize="0.95rem"
                    rating={userRating}
                    liked={t.userInteractions?.liked}
                    tagSize="0.75rem"
                    logUrl={t.userInteractions?.reviewId && userLogged?.username ? `/${userLogged.username}/log/${t.userInteractions.reviewId}` : undefined}
                    className={styles.trackTitle}
                  />
                  {showAlbumName && albumName ? (
                    <TrackAlbumTitle
                      title={albumName}
                      to={albumSlug || undefined}
                      state={albumSlug ? { albumId } : undefined}
                      fontSize="0.85rem"
                      ellipsis
                      color="var(--text-secondary-color)"
                      className={styles.trackArtist}
                    />
                  ) : (
                    <ArtistList
                      artists={allArtists}
                      className={styles.trackArtist}
                      fontSize="0.85rem"
                      color="var(--text-secondary-color)"
                    />
                  )}
                </div>
              </div>

              <div className={styles.trackRightSide}>
                {streams > 0 && (
                  <span className={styles.trackStreams}>
                    {formatCompactNumber(streams)}
                  </span>
                )}
                {!streams && popularity > 0 && (
                  <span className={styles.trackStreams}>
                    {popularity}%
                  </span>
                )}

                <button
                  className={styles.playButton}
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    playTrackInQueue({ id: t.id, title, artist: artistName, coverUrl: album?.coverUrl || t.coverUrl });
                  }}
                >
                  <Play size={16} fill="currentColor" />
                </button>

                <div className={styles.moreMenuContainer}>
                  <button
                    className={styles.moreButton}
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={(e) => toggleMenu(e, t.id)}
                  >
                    <FiMoreHorizontal />
                  </button>
                  {activeMenu === t.id && (
                    <ActionMenu
                      onClose={() => { setActiveMenu(null); setMenuPosition(null); }}
                      position={menuPosition}
                      items={[
                        {
                          label: "View Track",
                          icon: <FiEye size={18} />,
                          onClick: (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            navigate(trackSlug, {
                              state: { trackId: t.id },
                            });
                          },
                        },
                        {
                          label: userRating ? "Edit Log" : "Review Track",
                          icon: userRating ? <Pencil size={18} /> : <Plus size={18} />,
                          onClick: (e) => handleFastLog(t, e),
                        },
                        {
                          label: "Save to List",
                          icon: <RiPlayListAddLine size={18} />,
                          onClick: (e) => handleAddToList(t, e),
                        },
                        {
                          label: "Share",
                          icon: <PiPaperPlaneTiltBold size={18} />,
                          onClick: (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            const url = `${window.location.origin}${trackSlug}`;
                            navigator.clipboard.writeText(url);
                            showToast("Link copied to clipboard", "success");
                          },
                        },
                        ...(!(currentTrack?.id === t.id && isPlaying) ? [
                          {
                            label: "Play track",
                            icon: <Play size={18} />,
                            onClick: (e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              playTrackInQueue({ id: t.id, title: title, artist: artistName, coverUrl: album?.coverUrl || t.coverUrl });
                            },
                            section: "queue",
                          },
                        ] : []),
                        ...(isPlayerVisible ? [
                          {
                            label: "Play next",
                            icon: <ListStart size={18} />,
                            onClick: (e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              addNextToQueue({ id: t.id, title: title, artist: artistName, coverUrl: album?.coverUrl || t.coverUrl });
                              showToast(`Playing next: ${title}`, "success");
                            },
                            section: "queue",
                          },
                          {
                            label: "Add to queue",
                            icon: <ListEnd size={18} />,
                            onClick: (e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              addToQueue({ id: t.id, title: title, artist: artistName, coverUrl: album?.coverUrl || t.coverUrl });
                              showToast(`Added to queue: ${title}`, "success");
                            },
                            section: "queue",
                          },
                        ] : []),
                      ]}
                    />
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {canPaginate && (
          <div className={styles.showMoreContainer}>
            <button
              className={styles.showMoreButton}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
            >
              {isExpanded
                ? "Show Less"
                : `Show ${tracks.length - initialDisplayCount} More`}
              <FiChevronDown
                size={18}
                className={`${styles.chevronIcon} ${isExpanded ? styles.rotated : ""}`}
              />
            </button>
          </div>
        )}
      </div>

      {showTrackReviewModal && activeTrack && (
        <TrackReviewModal
          trackId={activeTrack?.id}
          reviewId={activeTrack?.userInteractions?.reviewId || null}
          onClose={handleCloseTrackReviewModal}
        />
      )}

      {showListModal && listModalTrack && (
        <AddToListModal
          trackId={listModalTrack}
          onClose={() => {
            setShowListModal(false);
            setListModalTrack(null);
          }}
        />
      )}
    </div>
  );
};

export default TrackList;
