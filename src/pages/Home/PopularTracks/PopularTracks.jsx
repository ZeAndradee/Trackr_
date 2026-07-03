import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaArrowUp, FaArrowDown } from "react-icons/fa";
import { Ellipsis, ListStart, ListEnd, Play } from "lucide-react";
import { FiEye } from "react-icons/fi";
import { IoAdd } from "react-icons/io5";
import { RiPlayListAddLine } from "react-icons/ri";
import { PiPaperPlaneTiltBold } from "react-icons/pi";
import { usePlayer } from "../../../contexts/PlayerContext";
import Image from "../../../components/Utils/Images/Image/Image";
import { getTrackCover } from "../../../components/Utils/Formater/Track";
import ActionMenu from "../../../components/Utils/Dropdown/ActionMenu";
import TrackReviewModal from "../../../components/Review/TrackReviewModal/TrackReviewModal";
import AddToListModal from "../../../components/Utils/AddToListModal/AddToListModal";
import showToast from "../../../components/Utils/Toast/Toast";
import { fetchTrendingList } from "../../../services/FetchList";
import ArtistList from "../../../components/Utils/ArtistList/ArtistList";
import { createTrackSlug } from "../../../utils/formatters/textFormatters";
import styles from "./PopularTracks.module.css";

const PopularTracks = () => {
  const navigate = useNavigate();
  const { isPlayerVisible, currentTrack, isPlaying, playTrackInQueue, addToQueue, addNextToQueue } = usePlayer();
  const [tracks, setTracks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeMenu, setActiveMenu] = useState(null);
  const [menuPosition, setMenuPosition] = useState(null);
  const [showTrackReviewModal, setShowTrackReviewModal] = useState(false);
  const [activeTrack, setActiveTrack] = useState(null);
  const [showListModal, setShowListModal] = useState(false);
  const [listModalTrack, setListModalTrack] = useState(null);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const data = await fetchTrendingList();
        setTracks((data?.tracks || []).slice(0, 5));
      } catch (err) {
        setTracks([]);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

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

  const handleFastLog = (track, e) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveTrack({
      ...track,
      title: track.name,
      primaryArtist: track.primaryArtist || { name: "Unknown" },
      featuredArtists: track.artists?.slice(1) || [],
      albumTitle: track.albumTitle || track.album?.title,
      releaseYear: track.releaseYear || track.album?.releaseYear,
      albumId: track.albumId || track.album?.id,
      coverUrl: track.coverUrl,
    });
    setShowTrackReviewModal(true);
  };

  const handleAddToList = (track, e) => {
    e.preventDefault();
    e.stopPropagation();
    setListModalTrack(track.id || track.trackId);
    setShowListModal(true);
  };

  if (isLoading) {
    return (
      <div className={styles.section}>
        <div className={styles.titleRow}>
          <h3 className={styles.title}>Global trending</h3>
          <Link to="/trackr/list/trending" className={styles.seeAll}>See all</Link>
        </div>
        <div className={styles.container}>
          {[1, 2, 3, 4, 5].map((n) => (
            <div key={n} className={styles.skeletonItem}>
              <div className={styles.skeletonCover} />
              <div className={styles.skeletonContent}>
                <div className={styles.skeletonLine} />
                <div className={styles.skeletonLineShort} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!tracks || tracks.length === 0) return null;

  return (
    <div className={styles.section}>
      <div className={styles.titleRow}>
        <h3 className={styles.title}>Global trending</h3>
        <Link to="/trackr/list/trending" className={styles.seeAll}>See all</Link>
      </div>
      <div className={styles.container}>
        {tracks.map((track, index) => {
          const slug = createTrackSlug(
            track?.name || "track",
            track?.artists || [],
            track.id || track.trackId
          );
          const allArtists = track?.artists || [];
          const trackId = track.id || track.trackId;

          return (
            <div key={trackId || index} className={styles.trackItem}>
              <Link to={slug} className={styles.coverLink}>
                <div className={styles.coverWrapper}>
                  <Image src={getTrackCover(track)} alt={track?.name} fallbackVariant="cover" width="100%" height="100%" borderLength="2px" />
                </div>
              </Link>
              <div className={styles.info}>
                <div className={styles.trackNameRow}>
                  <Link to={slug} className={styles.trackName}>
                    {track.name || "Unknown Track"}
                  </Link>
                  <span className={styles.rankBadge}>
                    #{track.position ?? index + 1}
                    {track.movement > 0 && <FaArrowUp className={styles.movementIcon} />}
                    {track.movement < 0 && <FaArrowDown className={styles.movementIcon} />}
                  </span>
                </div>
                <ArtistList artists={allArtists} className={styles.artistName} />
              </div>
              <div className={styles.moreButtonWrapper}>
                <button
                  className={styles.moreButton}
                  onClick={(e) => toggleMenu(e, trackId)}
                  aria-label="More options"
                >
                  <Ellipsis size={18} />
                </button>
                {activeMenu === trackId && (
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
                          navigate(slug, { state: { trackId } });
                        },
                      },
                      {
                        label: "Review Track",
                        icon: <IoAdd size={18} />,
                        onClick: (e) => handleFastLog(track, e),
                      },
                      {
                        label: "Save to List",
                        icon: <RiPlayListAddLine size={18} />,
                        onClick: (e) => handleAddToList(track, e),
                      },
                      {
                        label: "Share",
                        icon: <PiPaperPlaneTiltBold size={18} />,
                        onClick: (e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          const url = `${window.location.origin}${slug}`;
                          navigator.clipboard.writeText(url);
                          showToast("Link copied to clipboard", "success");
                        },
                      },
                      ...(!(currentTrack?.trackId === trackId && isPlaying) ? [
                        {
                          label: "Play track",
                          icon: <Play size={18} />,
                          onClick: (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            playTrackInQueue({ id: trackId, title: track.name || "track", artist: track.primaryArtist?.name, coverUrl: track.coverUrl });
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
                            const trackTitle = track.name || "track";
                            addNextToQueue({ id: trackId, title: trackTitle, artist: track.primaryArtist?.name, coverUrl: track.coverUrl });
                            showToast(`Playing next: ${trackTitle}`, "success");
                          },
                          section: "queue",
                        },
                        {
                          label: "Add to queue",
                          icon: <ListEnd size={18} />,
                          onClick: (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            const trackTitle = track.name || "track";
                            addToQueue({ id: trackId, title: trackTitle, artist: track.primaryArtist?.name, coverUrl: track.coverUrl });
                            showToast(`Added to queue: ${trackTitle}`, "success");
                          },
                          section: "queue",
                        },
                      ] : []),
                    ]}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {showTrackReviewModal && activeTrack && (
        <TrackReviewModal
          trackId={activeTrack.id || activeTrack.trackId}
          reviewId={activeTrack?.userInteractions?.reviewId || null}
          onClose={() => { setShowTrackReviewModal(false); setActiveTrack(null); }}
          rating={activeTrack?.userInteractions?.rating || 0}
          liked={activeTrack?.userInteractions?.liked || false}
          listened={activeTrack?.userInteractions?.listened || false}
        />
      )}

      {showListModal && listModalTrack && (
        <AddToListModal
          trackId={listModalTrack}
          onClose={() => { setShowListModal(false); setListModalTrack(null); }}
        />
      )}
    </div>
  );
};

export default PopularTracks;
