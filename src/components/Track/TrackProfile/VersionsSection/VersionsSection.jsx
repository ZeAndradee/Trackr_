import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiMoreHorizontal, FiEye, FiChevronDown } from "react-icons/fi";
import { PiPaperPlaneTiltBold } from "react-icons/pi";
import { BsVinyl } from "react-icons/bs";

import { IoAdd } from "react-icons/io5";
import { RiPlayListAddLine } from "react-icons/ri";
import { ListStart, ListEnd, Play } from "lucide-react";
import { usePlayer } from "../../../../contexts/PlayerContext";
import Image from "../../../Utils/Images/Image/Image";
import { getTrackCover } from "../../../Utils/Formater/Track";
import { RatingTag, LikeTag, DurationTag } from "../../../Utils/Tags/Tags";
import ActionMenu from "../../../Utils/Dropdown/ActionMenu";
import AddToListModal from "../../../Utils/AddToListModal/AddToListModal";
import { fetchTrackVersions } from "../../../../services/FetchTrack";
import { createTrackSlug } from "../../../../utils/formatters/textFormatters";
import { useUserContext } from "../../../../contexts/UserContext";
import showToast from "../../../Utils/Toast/Toast";
import styles from "./VersionsSection.module.css";

const formatReleaseDate = (dateStr) => {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
    day: "numeric",
  });
};

const VersionsSection = ({ track }) => {
  const navigate = useNavigate();
  const { userLogged } = useUserContext();
  const { isPlayerVisible, currentTrack, isPlaying, playTrackInQueue, addToQueue, addNextToQueue } = usePlayer();
  const [versions, setVersions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeMenu, setActiveMenu] = useState(null);
  const [menuPosition, setMenuPosition] = useState(null);
  const [showListModal, setShowListModal] = useState(false);
  const [listModalTrack, setListModalTrack] = useState(null);

  const trackId = track?.id || track?.trackId;

  useEffect(() => {
    const loadVersions = async () => {
      if (!trackId) return;
      setIsLoading(true);
      try {
        const data = await fetchTrackVersions(trackId);
        setVersions(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching track versions:", err);
        setVersions([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadVersions();
  }, [trackId]);

  const [isExpanded, setIsExpanded] = useState(false);

  if (isLoading || !versions || versions.length === 0) return null;

  const toggleMenu = (e, versionId) => {
    e.preventDefault();
    e.stopPropagation();
    if (activeMenu === versionId) {
      setActiveMenu(null);
      setMenuPosition(null);
    } else {
      const rect = e.currentTarget.getBoundingClientRect();
      setMenuPosition({ top: rect.bottom, right: window.innerWidth - rect.right });
      setActiveMenu(versionId);
    }
  };

  const trackName = track?.name || "this track";

  return (
    <div className={styles.versionsSection}>
      <button
        className={styles.versionsToggle}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <BsVinyl className={styles.vinylIcon} />
        <span className={styles.versionsToggleText}>
          {versions.length} {trackName}'s {versions.length === 1 ? "version" : "versions"} found
        </span>
        <FiChevronDown className={`${styles.chevron} ${isExpanded ? styles.chevronExpanded : ""}`} />
      </button>
      {isExpanded && <div className={styles.versionsList}>
        {versions.map((version) => {
          const versionId = version.id || version.trackId;
          const title = version.name || version.title;
          const artists = version.artists || track.artists;
          const coverUrl = version.coverUrl;
          const slug = createTrackSlug(title, artists, versionId);
          const userRating = version.userInteractions?.rating || 0;
          const userLiked = version.userInteractions?.liked;
          const reviewId = version.userInteractions?.reviewId;
          const releaseDate = version.album?.release_date || version.releaseDate || version.album?.releaseYear;
          const duration = version.duration;

          const coverTrack = { ...version, coverUrl };

          return (
            <Link
              key={versionId}
              to={slug}
              state={{ trackId: versionId }}
              className={styles.versionItem}
            >
              <div className={styles.versionCoverWrapper}>
                <Image
                  src={getTrackCover(coverTrack)}
                  alt={coverTrack?.name}
                  fallbackVariant="cover"
                  width="100%"
                  height="100%"
                  className={styles.versionCover}
                  borderLength="2px"
                />
              </div>
              <div className={styles.versionInfo}>
                <div className={styles.titleRow}>
                  <p className={styles.versionName}>{title}</p>
                  {userRating > 0 && (
                    <RatingTag
                      rating={userRating}
                      size="0.75rem"
                      to={reviewId && userLogged?.username ? `/${userLogged.username}/log/${reviewId}` : undefined}
                    />
                  )}
                  {userLiked && (
                    <LikeTag
                      size="0.75rem"
                      to={reviewId && userLogged?.username ? `/${userLogged.username}/log/${reviewId}` : undefined}
                    />
                  )}
                </div>
                {releaseDate && (
                  <p className={styles.versionMeta}>{formatReleaseDate(releaseDate)}</p>
                )}
              </div>
              <div className={styles.versionRightSide}>
                {duration && (
                  <DurationTag duration={duration} />
                )}
                <div className={styles.moreMenuContainer}>
                  <button
                    className={styles.moreButton}
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={(e) => toggleMenu(e, versionId)}
                  >
                    <FiMoreHorizontal />
                  </button>
                  {activeMenu === versionId && (
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
                            navigate(slug, { state: { trackId: versionId } });
                          },
                        },
                        ...(!userRating
                          ? [{
                            label: "Review Track",
                            icon: <IoAdd size={18} />,
                            onClick: (e) => {
                              e.preventDefault();
                              e.stopPropagation();
                            },
                          }]
                          : []),
                        {
                          label: "Save to List",
                          icon: <RiPlayListAddLine size={18} />,
                          onClick: (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setListModalTrack(versionId);
                            setShowListModal(true);
                            setActiveMenu(null);
                          },
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
                        ...(!(currentTrack?.trackId === versionId && isPlaying) ? [
                          {
                            label: "Play track",
                            icon: <Play size={18} />,
                            onClick: (e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              playTrackInQueue({ id: versionId, title, artist: version.primaryArtist?.name, coverUrl });
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
                              addNextToQueue({ id: versionId, title, artist: version.primaryArtist?.name, coverUrl });
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
                              addToQueue({ id: versionId, title, artist: version.primaryArtist?.name, coverUrl });
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
            </Link>
          );
        })}
      </div>}

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

export default VersionsSection;
