import React, { useCallback, useEffect, useMemo, useState, useRef } from "react";
import useStickyFollowScroll from "../../hooks/useStickyFollowScroll";
import { IoIosCheckmarkCircle } from "react-icons/io";
import { RiHeart3Line, RiHeart3Fill } from "react-icons/ri";
import { LuClock } from "react-icons/lu";
import { IoChatbubbleOutline } from "react-icons/io5";
import { Send, Pencil, Trash2, Flag, Search as SearchIcon, X, AudioLines } from "lucide-react";
import { FiMoreHorizontal } from "react-icons/fi";
import styles from "./List.module.css";
import ListItem from "./ListItem";
import Image from "../../components/Utils/Images/Image/Image";
import { GenreTag } from "../../components/Utils/Tags/Tags";
import HeroItem from "../../components/Utils/HeroItem/HeroItem";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useLoaderData } from "react-router";
import { createTrackSlug, formatDurationCompact } from "../../utils/formatters/textFormatters";
import { getRelativeTime } from "../../utils/formatters/dateFormatters";
import { likeList, deleteList } from "../../services/FetchList";
import { loaderFetch } from "../../services/ssrLoader";
import { buildMeta, itemListLd, breadcrumbLd } from "../../services/seo";
import ListSkeleton from "../../components/Utils/Skeletons/ListSkeleton";
import ErrorBoundary from "../../components/Utils/Error/ErrorBoundary";
import { Tooltip } from "../../components/Utils/Tooltip/Tooltip";
import { useAuthModal } from "../../contexts/AuthModalContext";
import { useUserContext } from "../../contexts/UserContext";
import { usePlayer } from "../../contexts/PlayerContext";
import ActionMenu from "../../components/Utils/Dropdown/ActionMenu";
import showToast from "../../components/Utils/Toast/Toast";
import { TextInput } from "../../components/Utils/Inputs/Inputs";
import { Button } from "../../components/Utils/Buttons/Button";
import ToggleSlide from "../../components/Utils/Toggle/ToggleSlide";

export async function loader({ params, request }) {
  const { username, listname } = params;
  if (!username || !listname) {
    throw new Response("List not found", { status: 404 });
  }

  const list = await loaderFetch(`/lists/${username}/${listname}`, request);
  if (!list) {
    throw new Response("List not found", { status: 404 });
  }

  return { list };
}

export function meta({ data, params }) {
  const list = data?.list;
  const name =
    list?.name ||
    (params.listname || "")
      .split("-")
      .filter(Boolean)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  const owner = list?.owner?.username || params.username;
  const canonical = `/${params.username}/list/${params.listname}`;
  const tracks = list?.tracks || [];
  const trackCount = tracks.length;

  const artistSet = [];
  const seen = new Set();
  for (const t of tracks) {
    for (const a of t.artists || []) {
      if (a?.name && !seen.has(a.name.toLowerCase())) {
        seen.add(a.name.toLowerCase());
        artistSet.push(a.name);
      }
    }
  }
  const topArtists = artistSet.slice(0, 5);
  const sampleTracks = tracks
    .slice(0, 5)
    .map((t) => t.name)
    .filter(Boolean);

  const descParts = [
    list?.description ||
      `${name || "A playlist"} by @${owner} on Trackr.`,
    trackCount ? `${trackCount} tracks${topArtists.length ? ` featuring ${topArtists.join(", ")}` : ""}.` : "",
    sampleTracks.length ? `Includes ${sampleTracks.join(", ")}.` : "",
  ].filter(Boolean);

  return buildMeta({
    title: name ? `${name} — Playlist by @${owner} | Trackr` : "List | Trackr",
    description: descParts.join(" "),
    canonical,
    type: "music.playlist",
    image: list?.tracks?.[0]?.albumCover || "",
    imageAlt: name ? `${name} playlist cover` : undefined,
    jsonLd: [
      itemListLd(list, { canonical }),
      breadcrumbLd([
        { name: "Trackr", url: "/" },
        { name: `@${owner}`, url: `/${owner}` },
        { name: name || "List", url: canonical },
      ]),
    ],
  });
}

const List = () => {
    const sidebarRef = useRef(null);
    useStickyFollowScroll(sidebarRef);
    const navigate = useNavigate();
    const { username, listname } = useParams();
    const { openModal } = useAuthModal();
    const { userLogged } = useUserContext();
    const { playListInQueue } = usePlayer();

    const { list: initialList } = useLoaderData();

    const [listData, setListData] = useState(initialList);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [sortConfig, setSortConfig] = useState({ key: 'rank', direction: 'ascending' });

    const [liked, setLiked] = useState(initialList?.userInteractions?.liked || false);
    const [likeCount, setLikeCount] = useState(initialList?.likeCount || 0);
    const [commentCount, setCommentCount] = useState(initialList?.commentCount || 0);

    const [activeMenuId, setActiveMenuId] = useState(null);
    const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });

    const [searchParams, setSearchParams] = useSearchParams();
    const searchQuery = searchParams.get("q") || "";
    const viewMode = searchParams.get("view") || "compact";

    const handleSearchChange = (e) => {
        const newQ = e.target.value;
        setSearchParams(prev => {
            if (newQ) prev.set("q", newQ);
            else prev.delete("q");
            return prev;
        }, { replace: true });
    };

    const handleClearSearch = () => {
        setSearchParams(prev => {
            prev.delete("q");
            return prev;
        }, { replace: true });
    };

    const handleViewModeChange = (mode) => {
        setSearchParams(prev => {
            if (mode === "compact") prev.delete("view");
            else prev.set("view", mode);
            return prev;
        }, { replace: true });
    };

    useEffect(() => {
        setListData(initialList);
        setLiked(initialList?.userInteractions?.liked || false);
        setLikeCount(initialList?.likeCount || 0);
        setCommentCount(initialList?.commentCount || 0);
    }, [initialList]);

    useEffect(() => {
        setSortConfig({ key: 'position', direction: 'ascending' });
    }, [listData]);

    const handleShare = useCallback(() => {
        navigator.clipboard.writeText(window.location.href);
        showToast("Link copied to clipboard", "success");
    }, []);

    const handleLike = async () => {
        if (!listData?._id) return;

        if (!userLogged) {
            openModal("login-reason", {
                title: "Like a list to save it.",
                message: "Join Trackr to let the author know you enjoyed their list."
            });
            return;
        }

        const previousLiked = liked;
        const previousLikeCount = likeCount;

        const newLiked = !liked;
        setLiked(newLiked);
        setLikeCount(prev => newLiked ? prev + 1 : prev - 1);

        try {
            await likeList(listData._id);
        } catch (error) {
            setLiked(previousLiked);
            setLikeCount(previousLikeCount);
            console.error("Failed to update like status", error);
        }
    };

    const sortedTracks = useMemo(() => {
        if (!listData?.tracks) return [];
        let sortableItems = [...listData.tracks];

        const q = searchQuery.trim().toLowerCase();
        if (q) {
            sortableItems = sortableItems.filter((t) => {
                const name = (t.name || "").toLowerCase();
                const artists = (t.artists || []).map((a) => (a?.name || "").toLowerCase()).join(" ");
                return name.includes(q) || artists.includes(q);
            });
        }

        if (sortConfig.key) {
            sortableItems.sort((a, b) => {
                let aValue, bValue;

                if (sortConfig.key === 'title') {
                    aValue = a.name || "";
                    bValue = b.name || "";
                } else if (sortConfig.key === 'listens') {
                    aValue = Number(a.streams || 0);
                    bValue = Number(b.streams || 0);
                } else if (sortConfig.key === 'duration') {
                    aValue = Number(a.duration_ms || a.duration || 0);
                    bValue = Number(b.duration_ms || b.duration || 0);
                } else {
                    aValue = a[sortConfig.key];
                    bValue = b[sortConfig.key];
                }

                if (aValue < bValue) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableItems;
    }, [listData, sortConfig, searchQuery]);


    const handleMenuClick = useCallback((e, listId) => {
        e.preventDefault();
        e.stopPropagation();
        const rect = e.currentTarget.getBoundingClientRect();
        setMenuPosition({
            top: rect.bottom + 8,
            right: window.innerWidth - rect.right,
        });
        setActiveMenuId((prev) => (prev === listId ? null : listId));
    }, []);

    const isOwnProfile = userLogged?.username?.toLowerCase() === username?.toLowerCase();

    const handleReportListClick = async () => {
        const isConfirmed = await showToast("Are you sure you want to report this list?", "warning", { confirm: true });
        if (isConfirmed) {
            showToast("List reported. Thank you for helping keep Trackr safe.", "success");
        }
    };

    const handleDeleteListClick = async (listId) => {
        const isConfirmed = await showToast("Are you sure you want to delete this list?", "warning", { confirm: true });
        if (isConfirmed) {
            try {
                await deleteList(listId);
                showToast("List deleted successfully", "success");
                navigate(`/${username}/lists`);
            } catch (err) {
                console.error("Failed to delete list", err);
                showToast("Failed to delete list", "error");
            }
        }
    };

    const renderActionMenu = () => {
        const listId = listData?._id || listData?.id;
        const menuItems = isOwnProfile ? [
            { label: "Edit List", icon: <Pencil size={18} />, onClick: () => navigate(`/${listData?.owner?.username || username}/list/${listData?.slug || listname}/edit`) },
            { label: "Share List", icon: <Send size={18} />, onClick: () => handleShare() },
            { label: "Delete List", icon: <Trash2 size={18} />, onClick: () => handleDeleteListClick(listId), section: "danger" },
        ] : [
            { label: "Share List", icon: <Send size={18} />, onClick: () => handleShare() },
            { label: "Report List", icon: <Flag size={18} />, onClick: () => handleReportListClick(), section: "danger" },
        ];

        return (
            <ActionMenu
                items={menuItems}
                onClose={() => setActiveMenuId(null)}
                position={menuPosition}
                anchor="top-right"
            />
        );
    };


    if (loading) return <ListSkeleton />;

    if (error || !listData) return <ErrorBoundary source="listProfile" error={error || { status: 404 }} />;

    const tracks = listData.tracks || [];
    const showStreams = tracks.length > 0 && tracks[0]?.streams != null;

    const listenedCount = tracks.filter(t => t.userInteractions?.listened).length;
    const completionPercentage = tracks.length > 0
        ? Math.floor((listenedCount / tracks.length) * 100)
        : 0;

    const topTrackCover = tracks[0]?.albumCover;

    return (
        <div className={styles.container}>
            <HeroItem
                coverUrl={topTrackCover}
                stackedCovers={tracks.length >= 4 ? tracks.slice(1, 4).map(t => t.albumCover) : []}
                title={listData?.name || "Untitled List"}
                type="List"
                subtitle={
                    <div className={styles.subtitleRow}>
                        <span>{tracks.length} tracks</span>
                        <span className={styles.heroDivider}>·</span>
                        <span>{formatDurationCompact(listData?.totalDuration)}</span>
                    </div>
                }
                stats={
                    <div className={styles.heroRightStats}>
                        <div className={styles.statLineItem}>
                            <span className={styles.statLineValue}>{listData?.likeCount || 0}</span>
                            <span className={styles.statLineLabel}>Likes</span>
                        </div>
                        <div className={styles.statSeparator} />
                        <div className={styles.statLineItem}>
                            <span className={styles.statLineValue}>{0}</span>
                            <span className={styles.statLineLabel}>Reviews</span>
                        </div>
                        <div className={styles.statSeparator} />
                        <div className={styles.statLineItem}>
                            <span className={styles.statLineValue}>{listData?.shareCount || 0}</span>
                            <span className={styles.statLineLabel}>Shares</span>
                        </div>
                    </div>
                }
            >
                {listData?.tags?.length > 0 && (
                    <div className={styles.heroTags}>
                        {listData.tags.map(tag => (
                            <GenreTag key={tag} genre={tag} />
                        ))}
                    </div>
                )}
                <div className={styles.heroUser}>
                    <Image
                        size={40}
                        src={listData?.owner?.userimage || listData?.owner?.image || listData?.owner?.userImage}
                        name={listData?.owner?.username}
                        userId={listData?.owner?._id || listData?.owner?.id}
                        status={listData?.owner?.status}
                        to={listData?.owner?.username ? `/${listData.owner.username}` : undefined}
                    />
                    <div className={styles.heroUserInfo}>
                        <span className={styles.heroCreatedBy}>Created by</span>
                        <span className={styles.heroUserName}>{listData?.owner?.username || "Unknown"}</span>
                    </div>
                </div>
            </HeroItem>

            <div className={styles.contentWrapper}>
                <div className={styles.leftColumn}>
                    <div className={styles.columnHeadersWrapper}>
                        <div className={styles.headerLeft}>
                            <Button
                                variant="primary"
                                size="md"
                                onClick={() => playListInQueue(listData)}
                                className={styles.listenButton}
                            >
                                Start Listening
                            </Button>
                            <TextInput
                                icon={<SearchIcon size={16} />}
                                placeholder="Search tracks"
                                value={searchQuery}
                                onChange={handleSearchChange}
                                clearable={true}
                                onClear={handleClearSearch}
                                containerClassName={`${styles.searchInputWrapper} ${searchQuery ? styles.searchInputActive : ""}`}
                            />
                        </div>
                        <div className={styles.headerActions}>
                            <ToggleSlide
                                options={[
                                    { key: "compact", label: "Compact" },
                                    { key: "detailed", label: "Detailed" },
                                ]}
                                value={viewMode}
                                onChange={handleViewModeChange}
                                ariaLabel="View mode"
                            />
                        </div>
                    </div>

                    <div className={`${styles.listContainer} ${viewMode === "compact" && sortedTracks.length > 0 ? styles.listContainerGrid : ""}`}>
                        {sortedTracks.length > 0 ? (
                            sortedTracks.map((track) => (
                                <ListItem
                                    key={track._id || track.trackId}
                                    track={track}
                                    to={createTrackSlug(track?.name || "track", track?.artists || [], track.id || track.trackId)}
                                    state={{ trackId: track.id || track.trackId }}
                                    showRank={listData?.isRanked}
                                    showTrend={username?.toLowerCase() === 'trackr' && listname?.toLowerCase() === 'trending'}
                                    showStreams={showStreams && viewMode === "detailed"}
                                    variant={viewMode}
                                />
                            ))
                        ) : (
                            <div className={styles.emptyState}>
                                <AudioLines size={32} className={styles.emptyIcon} />
                                <span className={styles.emptyTitle}>No tracks found</span>
                                <span className={styles.emptySubtitle}>
                                    {searchQuery
                                        ? `Nothing matches "${searchQuery}". Try a different search.`
                                        : "This list is currently empty."}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                <div ref={sidebarRef} className={styles.rightColumn}>
                    <div className={styles.listenedSection}>
                        <div className={styles.completionRow}>
                            {completionPercentage === 100 ? (
                                <>
                                    <div className={styles.countWrapper}>
                                        <span className={styles.completionCount}>{listenedCount}/{tracks.length}</span>
                                        <span className={styles.separationDot}>•</span>
                                        <span className={styles.listenedLabel}>you've listened</span>
                                    </div>
                                    <div className={styles.completedBadge}>
                                        <IoIosCheckmarkCircle />
                                        <span>Completed</span>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className={styles.countWrapper}>
                                        <span className={styles.completionCount}>{listenedCount}/{tracks.length}</span>
                                        <span className={styles.separationDot}>•</span>
                                        <span className={styles.listenedLabel}>you've listened</span>
                                    </div>
                                    <span className={`${styles.completionPercent} ${completionPercentage >= 66 ? styles.completionHigh : completionPercentage >= 33 ? styles.completionMedium : styles.completionLow}`}>
                                        {completionPercentage}%
                                    </span>
                                </>
                            )}
                        </div>
                        <div className={styles.completionBarTrack}>
                            <div
                                className={`${styles.completionBarFill} ${completionPercentage === 100 ? styles.fillDone : completionPercentage >= 66 ? styles.fillHigh : completionPercentage >= 33 ? styles.fillMedium : styles.fillLow}`}
                                style={{ width: `${completionPercentage}%` }}
                            />
                        </div>
                    </div>
                    <div className={styles.aboutListCard}>

                        <div className={styles.aboutListContent}>

                            <div className={styles.metadataRow}>
                                <div className={styles.metadataItem}>
                                    <LuClock />
                                    <span>
                                        {listData?.lastEdit
                                            ? `Updated ${getRelativeTime(listData.lastEdit)}`
                                            : `Created ${listData?.createdAt ? getRelativeTime(listData.createdAt) : "recently"}`}
                                    </span>
                                </div>
                            </div>
                            <p className={styles.listDescription}>
                                {listData?.description || "No description available."}
                            </p>


                            <div className={styles.actionsRow}>
                                <div className={styles.interactionGroup}>
                                    <button
                                        className={`${styles.actionButtonLike} ${liked ? styles.liked : ''}`}
                                        onClick={handleLike}
                                    >
                                        {liked ? <RiHeart3Fill /> : <RiHeart3Line />}
                                        <span key={likeCount} className={styles.count}>{likeCount}</span>
                                    </button>

                                    <button className={styles.actionButtonComment}>
                                        <IoChatbubbleOutline />
                                        <span key={commentCount} className={styles.count}>{commentCount}</span>
                                    </button>
                                </div>

                                <button
                                    className={styles.moreButton}
                                    onMouseDown={(e) => e.stopPropagation()}
                                    onClick={(e) => handleMenuClick(e, listData?._id || listData?.id)}
                                    aria-label="More options"
                                >
                                    <FiMoreHorizontal size={20} />
                                </button>
                                {activeMenuId === (listData?._id || listData?.id) && renderActionMenu()}
                            </div>
                        </div>
                    </div>




                </div>
            </div>
        </div >
    );
};

export default List;
