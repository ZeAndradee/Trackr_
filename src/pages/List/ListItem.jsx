import { useUserContext } from "../../contexts/UserContext";
import { FaSortUp, FaSortDown, FaMinus } from "react-icons/fa";
import { MdExplicit } from "react-icons/md";
import Image from "../../components/Utils/Images/Image/Image";
import ArtistList from "../../components/Utils/ArtistList/ArtistList";
import { Tooltip } from "../../components/Utils/Tooltip/Tooltip";
import { formatCompactNumber } from "../../utils/formatters/textFormatters";
import TrackAlbumTitle from "../../components/Utils/TrackAlbumTitle/TrackAlbumTitle";
import styles from "./ListItem.module.css";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { DurationTag } from "../../components/Utils/Tags/Tags";
import ActionMenu from "../../components/Utils/Dropdown/ActionMenu";
import { FiMoreHorizontal, FiEye } from "react-icons/fi";
import { Play, ListStart, ListEnd, Pencil, Plus } from "lucide-react";
import { RiPlayListAddLine } from "react-icons/ri";
import { PiPaperPlaneTiltBold } from "react-icons/pi";
import { usePlayer } from "../../contexts/PlayerContext";
import showToast from "../../components/Utils/Toast/Toast";
import TrackReviewModal from "../../components/Review/TrackReviewModal/TrackReviewModal";
import AddToListModal from "../../components/Utils/AddToListModal/AddToListModal";

const ListItem = ({ track, to, state, onMouseEnter, showRank, showTrend, showStreams, variant = "detailed" }) => {
    const { userLogged } = useUserContext();
    const navigate = useNavigate();
    const { isPlayerVisible, currentTrack, isPlaying, playTrackInQueue, addToQueue, addNextToQueue } = usePlayer();

    const [menuOpen, setMenuOpen] = useState(false);
    const [menuPos, setMenuPos] = useState(null);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [showListModal, setShowListModal] = useState(false);

    const toggleMenu = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (menuOpen) {
            setMenuOpen(false);
        } else {
            const rect = e.currentTarget.getBoundingClientRect();
            setMenuPos({ top: rect.bottom, right: window.innerWidth - rect.right });
            setMenuOpen(true);
        }
    };

    const formatDuration = (ms) => {
        if (!ms) return null;
        const totalSeconds = Math.floor(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const menuItems = [
        {
            label: "View Track",
            icon: <FiEye size={18} />,
            onClick: (e) => {
                e.preventDefault();
                e.stopPropagation();
                navigate(to, { state });
            },
        },
        {
            label: track?.userInteractions?.rating ? "Edit Log" : "Review Track",
            icon: track?.userInteractions?.rating ? <Pencil size={18} /> : <Plus size={18} />,
            onClick: (e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowReviewModal(true);
            },
        },
        {
            label: "Save to List",
            icon: <RiPlayListAddLine size={18} />,
            onClick: (e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowListModal(true);
            },
        },
        {
            label: "Share",
            icon: <PiPaperPlaneTiltBold size={18} />,
            onClick: (e) => {
                e.preventDefault();
                e.stopPropagation();
                const url = `${window.location.origin}${to}`;
                navigator.clipboard.writeText(url);
                showToast("Link copied to clipboard", "success");
            },
        },
        ...(!(currentTrack?.id === (track?.id || track?.trackId) && isPlaying) ? [
            {
                label: "Play track",
                icon: <Play size={18} />,
                onClick: (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    playTrackInQueue({ id: track?.id || track?.trackId, title: track?.name, artist: track?.artists?.[0]?.name, coverUrl: track?.albumCover });
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
                    addNextToQueue({ id: track?.id || track?.trackId, title: track?.name, artist: track?.artists?.[0]?.name, coverUrl: track?.albumCover });
                    showToast(`Playing next: ${track?.name}`, "success");
                },
                section: "queue",
            },
            {
                label: "Add to queue",
                icon: <ListEnd size={18} />,
                onClick: (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    addToQueue({ id: track?.id || track?.trackId, title: track?.name, artist: track?.artists?.[0]?.name, coverUrl: track?.albumCover });
                    showToast(`Added to queue: ${track?.name}`, "success");
                },
                section: "queue",
            },
        ] : []),
    ];

    if (variant === "compact") {
        return (
            <div className={styles.compact} onMouseEnter={onMouseEnter}>
                <Link to={to} state={state} className={styles.coverLink}>
                    <Image
                        src={track?.albumCover}
                        alt={track?.name}
                        fallbackVariant="cover"
                        width="100%"
                        height="100%"
                        className={styles.cover}
                        borderLength="2px"
                    />
                </Link>
                <div className={styles.infoContainer}>
                    <TrackAlbumTitle
                        title={track?.name}
                        to={to}
                        state={state}
                        className={styles.compactTitle}
                        trailing={track?.explicit ? <MdExplicit className={styles.explicitIcon} /> : null}
                    />
                    <ArtistList
                        artists={track?.artists || []}
                        className={styles.artist}
                    />
                </div>
            </div>
        );
    }

    const renderTrendIcon = () => {
        if (!showTrend) return null;
        const movement = track?.movement || 0;
        if (movement > 0) return (
            <Tooltip text={`Up ${movement} positions`}>
                <FaSortUp className={styles.up} />
            </Tooltip>
        );
        if (movement < 0) return (
            <Tooltip text={`Down ${Math.abs(movement)} positions`}>
                <FaSortDown className={styles.down} />
            </Tooltip>
        );
        return (
            <Tooltip text="Stable position">
                <FaMinus className={`${styles.rankChange} ${styles.same}`} />
            </Tooltip>
        );
    };

    return (
        <div
            className={`${styles.itemContainer} ${!showRank ? styles.noRank : ''}`}
            onMouseEnter={onMouseEnter}
        >
            {showRank && (
                <div className={styles.rank}>
                    <span className={styles.rankHash}>#</span> {track?.position || "-"}
                </div>
            )}

            <Link to={to} state={state} className={styles.coverLink}>
                <Image
                    src={track?.albumCover}
                    alt={track?.name}
                    fallbackVariant="cover"
                    width="100%"
                    height="100%"
                    className={styles.cover}
                    borderLength="3px"
                />
            </Link>

            <div className={styles.infoContainer}>
                <TrackAlbumTitle
                    title={track?.name}
                    to={to}
                    state={state}
                    ellipsis={true}
                    className={styles.detailedTitle}
                    trailing={track?.explicit ? <MdExplicit className={styles.explicitIcon} /> : null}
                    rating={track?.userInteractions?.rating}
                    liked={track?.userInteractions?.liked}
                    logUrl={track?.userInteractions?.reviewId && userLogged?.username ? `/${userLogged.username}/log/${track.userInteractions.reviewId}` : undefined}
                    tagSize="0.8rem"
                />
                <ArtistList
                    artists={track?.artists || []}
                    className={styles.artist}
                />
            </div>

            <div className={styles.rightActions}>
                {showTrend ? (
                    <div className={styles.trend}>
                        {renderTrendIcon()}
                    </div>
                ) : (track?.duration_ms || track?.duration) ? (
                    <div className={styles.durationContainer}>
                        <Tooltip text="Duration">
                            <DurationTag duration={formatDuration(track?.duration_ms || track?.duration)} />
                        </Tooltip>
                    </div>
                ) : null}

                {showStreams && (
                    <div className={styles.listens}>
                        <Tooltip text={`${Number(track?.streams || 0).toLocaleString()} Streams`}>
                            <span>{formatCompactNumber(track?.streams || 0)}</span>
                        </Tooltip>
                    </div>
                )}

                <div className={styles.moreMenuContainer}>
                    <button
                        className={styles.moreButton}
                        onMouseDown={(e) => e.stopPropagation()}
                        onClick={toggleMenu}
                    >
                        <FiMoreHorizontal size={18} />
                    </button>
                    {menuOpen && (
                        <ActionMenu
                            items={menuItems}
                            onClose={() => setMenuOpen(false)}
                            position={menuPos}
                            anchor="top-right"
                        />
                    )}
                </div>
            </div>

            {showReviewModal && (
                <TrackReviewModal
                    trackId={track?.id || track?.trackId}
                    reviewId={track?.userInteractions?.reviewId || null}
                    onClose={() => setShowReviewModal(false)}
                />
            )}

            {showListModal && (
                <AddToListModal
                    trackId={track?.id || track?.trackId}
                    onClose={() => setShowListModal(false)}
                />
            )}
        </div>
    );
};

export default ListItem;
