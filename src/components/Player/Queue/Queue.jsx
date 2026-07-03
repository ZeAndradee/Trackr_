import { useState, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { X, MoreHorizontal, Eye, Plus, Play, Disc3 } from "lucide-react";
import { PiPaperPlaneTiltBold } from "react-icons/pi";
import { RiPlayListAddLine } from "react-icons/ri";
import ArtistList from "../../Utils/ArtistList/ArtistList";
import Image from "../../Utils/Images/Image/Image";
import { getTrackCover } from "../../Utils/Formater/Track";
import { usePlayer } from "../../../contexts/PlayerContext";
import ActionMenu from "../../Utils/Dropdown/ActionMenu";
import TrackReviewModal from "../../Review/TrackReviewModal/TrackReviewModal";
import AddToListModal from "../../Utils/AddToListModal/AddToListModal";
import showToast from "../../Utils/Toast/Toast";
import { createTrackSlug } from "../../../utils/formatters/textFormatters";
import { Tooltip } from "../../Utils/Tooltip/Tooltip";
import QueueItemSkeleton from "../../Utils/Skeletons/QueueItemSkeleton";
import styles from "./Queue.module.css";

const Queue = () => {
  const {
    queue,
    currentIndex,
    removeFromQueue,
    removeFromRecommendations,
    reorderRecommendations,
    jumpToIndex,
    reorderQueue,
    clearUpNext,
    recommendationsQueue,
    recommendationsExhausted,
    addToQueue,
    playTrackInQueue,
    closeTheaterMode,
  } = usePlayer();

  const navigate = useNavigate();
  const [dragIndex, setDragIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [recsDragIndex, setRecsDragIndex] = useState(null);
  const [recsDragOverIndex, setRecsDragOverIndex] = useState(null);
  const [activeMenu, setActiveMenu] = useState(null);
  const [menuPosition, setMenuPosition] = useState(null);
  const [activeRecsMenu, setActiveRecsMenu] = useState(null);
  const [recsMenuPosition, setRecsMenuPosition] = useState(null);
  const [reviewTrack, setReviewTrack] = useState(null);
  const [listTrack, setListTrack] = useState(null);
  const dragNode = useRef(null);
  const recsDragNode = useRef(null);

  const nowPlaying = currentIndex >= 0 ? queue[currentIndex] : null;
  const upNextWithIndices = queue
    .map((item, i) => ({ item, realIndex: i }))
    .filter(({ item, realIndex }) => realIndex > currentIndex && !item.isRepeatLoop);

  const handleDragStart = useCallback((e, index) => {
    dragNode.current = e.currentTarget;
    setDragIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", index.toString());
    requestAnimationFrame(() => {
      if (dragNode.current) dragNode.current.style.opacity = "0.4";
    });
  }, []);

  const handleDragOver = useCallback((e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverIndex(index);
  }, []);

  const handleDragEnd = useCallback(() => {
    if (dragNode.current) dragNode.current.style.opacity = "1";
    if (dragIndex !== null && dragOverIndex !== null && dragIndex !== dragOverIndex) {
      reorderQueue(dragIndex, dragOverIndex);
    }
    setDragIndex(null);
    setDragOverIndex(null);
    dragNode.current = null;
  }, [dragIndex, dragOverIndex, reorderQueue]);

  const handleRecsDragStart = useCallback((e, index) => {
    recsDragNode.current = e.currentTarget;
    setRecsDragIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", index.toString());
    requestAnimationFrame(() => {
      if (recsDragNode.current) recsDragNode.current.style.opacity = "0.4";
    });
  }, []);

  const handleRecsDragOver = useCallback((e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setRecsDragOverIndex(index);
  }, []);

  const handleRecsDragEnd = useCallback(() => {
    if (recsDragNode.current) recsDragNode.current.style.opacity = "1";
    if (recsDragIndex !== null && recsDragOverIndex !== null && recsDragIndex !== recsDragOverIndex) {
      reorderRecommendations(recsDragIndex, recsDragOverIndex);
    }
    setRecsDragIndex(null);
    setRecsDragOverIndex(null);
    recsDragNode.current = null;
  }, [recsDragIndex, recsDragOverIndex, reorderRecommendations]);

  const handleOpenMenu = (e, index) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setMenuPosition({ top: rect.bottom + 4, left: rect.left - 160 });
    setActiveMenu(index);
  };

  const handleOpenRecsMenu = (e, index) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setRecsMenuPosition({ top: rect.bottom + 4, left: rect.left - 160 });
    setActiveRecsMenu(index);
  };

  const viewTrack = (item) => {
    navigate(createTrackSlug(item.name || item.title, item.artists, item.trackId), { state: { trackId: item.trackId } });
    closeTheaterMode();
  };

  const shareTrack = (item) => {
    const url = `${window.location.origin}${createTrackSlug(item.name || item.title, item.artists, item.trackId)}`;
    navigator.clipboard.writeText(url);
    showToast("Link copied to clipboard", "success");
  };

  const getMenuItems = (item, index) => [
    { label: "View track", icon: <Eye size={18} />, onClick: () => viewTrack(item), section: "user" },
    { label: "Review track", icon: <Plus size={18} />, onClick: () => setReviewTrack(item), section: "user" },
    { label: "Add to list", icon: <RiPlayListAddLine size={18} />, onClick: () => setListTrack(item), section: "user" },
    { label: "Share", icon: <PiPaperPlaneTiltBold size={18} />, onClick: () => shareTrack(item), section: "track", order: 99 },
    { label: "Remove from queue", icon: <X size={18} />, onClick: () => removeFromQueue(index), section: "danger" },
  ];

  const getRecommendationMenuItems = (item, index) => [
    { label: "View track", icon: <Eye size={18} />, onClick: () => viewTrack(item), section: "user" },
    { label: "Review track", icon: <Plus size={18} />, onClick: () => setReviewTrack(item), section: "user" },
    { label: "Add to list", icon: <RiPlayListAddLine size={18} />, onClick: () => setListTrack(item), section: "user" },
    {
      label: "Add to queue", icon: <RiPlayListAddLine size={18} />, section: "queue", onClick: () => {
        addToQueue(item);
        removeFromRecommendations(index);
        showToast(`Added to queue: ${item.name || item.title}`, "success");
      },
    },
    { label: "Remove", icon: <X size={18} />, onClick: () => removeFromRecommendations(index), section: "danger" },
  ];

  const renderItem = (item, index, opts = {}) => {
    const { isRec = false, realIndex = index, draggable = false, showPlay = false } = opts;
    const keyBase = item._queueId || `${isRec ? "rec-" : ""}${item.videoId}-${index}`;

    if (item.youtubeStatus === "loading") {
      return <QueueItemSkeleton key={item._queueId || `${isRec ? "rec-" : ""}skeleton-${index}`} />;
    }

    const isActive = !isRec && realIndex === currentIndex;
    const isDragOver = isRec ? recsDragOverIndex === index : dragOverIndex === realIndex;
    const isUnavailable = item.youtubeStatus === "error";
    const displayName = item.name || item.title || "";
    const trackSlug = createTrackSlug(displayName, item.artists, item.trackId);

    const onPlay = isRec
      ? () => { playTrackInQueue(item); removeFromRecommendations(index); }
      : () => jumpToIndex(realIndex);

    const dragProps =
      draggable && !isUnavailable
        ? isRec
          ? {
              draggable: true,
              onDragStart: (e) => handleRecsDragStart(e, index),
              onDragOver: (e) => handleRecsDragOver(e, index),
              onDragEnd: handleRecsDragEnd,
            }
          : {
              draggable: true,
              onDragStart: (e) => handleDragStart(e, realIndex),
              onDragOver: (e) => handleDragOver(e, realIndex),
              onDragEnd: handleDragEnd,
            }
        : {};

    const itemEl = (
      <div
        key={keyBase}
        className={`${styles.queueItem} ${isActive ? styles.queueItemActive : ""} ${isDragOver ? styles.queueItemDragOver : ""} ${isUnavailable ? styles.queueItemUnavailable : ""}`}
        onClick={!isRec && !isUnavailable ? () => jumpToIndex(realIndex) : undefined}
        {...dragProps}
      >
        <div className={styles.queueArtWrap}>
          <Image
            src={getTrackCover(item)}
            alt={item?.name}
            fallbackVariant="cover"
            borderLength="2px"
            height="44px"
            width="44px"
            className={styles.queueArt}
          />
          {showPlay && !isUnavailable && (
            <button
              className={styles.playOverlay}
              onClick={(e) => { e.stopPropagation(); onPlay(); }}
              aria-label="Play now"
            >
              <Play size={16} fill="currentColor" />
            </button>
          )}
        </div>
        <div className={styles.queueMeta}>
          <Link
            to={trackSlug}
            className={styles.queueTrackTitle}
            onClick={(e) => { e.stopPropagation(); closeTheaterMode(); }}
          >
            {displayName}
          </Link>
          <ArtistList
            artists={item.artists || []}
            className={styles.queueTrackArtist}
            fontSize="0.78rem"
            color="var(--text-secondary-color)"
          />
        </div>
        {!isUnavailable && (
          <button
            className={styles.moreBtn}
            onClick={(e) => (isRec ? handleOpenRecsMenu(e, index) : handleOpenMenu(e, realIndex))}
          >
            <MoreHorizontal size={14} />
          </button>
        )}
      </div>
    );

    if (isUnavailable) {
      return (
        <Tooltip key={keyBase} text="This track is currently unavailable" position="top">
          <div className={styles.queueItemUnavailableWrapper}>{itemEl}</div>
        </Tooltip>
      );
    }
    return itemEl;
  };

  return (
    <>
      <div className={styles.queueBody}>
        {queue.length === 0 ? (
          <div className={styles.emptyQueue}>Queue is empty</div>
        ) : (
          <>
            {nowPlaying && (
              <div className={styles.section}>
                <span className={styles.sectionLabel}>Now playing</span>
                {renderItem(nowPlaying, currentIndex)}
              </div>
            )}

            {upNextWithIndices.length > 0 && (
              <div className={styles.section}>
                <div className={styles.sectionLabelRow}>
                  <div className={styles.sectionLabelGroup}>
                    <span className={styles.sectionLabel}>Playing next</span>
                    <span className={styles.dragHint}>drag to reorder</span>
                  </div>
                  <button className={styles.clearBtn} onClick={clearUpNext}>Clear</button>
                </div>
                <div className={styles.nextList}>
                  {upNextWithIndices.map(({ item, realIndex }) =>
                    renderItem(item, realIndex, { realIndex, draggable: true, showPlay: true })
                  )}
                </div>
              </div>
            )}

            <div className={styles.section}>
              <div className={styles.sectionLabelRow}>
                <div className={styles.sectionLabelGroup}>
                  <span className={styles.sectionLabel}>Recommendations</span>
                  {recommendationsQueue.length > 0 && (
                    <span className={styles.dragHint}>drag to reorder</span>
                  )}
                </div>
              </div>
              {recommendationsQueue.length > 0 ? (
                <div className={styles.nextList}>
                  {recommendationsQueue.map((item, i) =>
                    renderItem(item, i, { isRec: true, draggable: true, showPlay: true })
                  )}
                </div>
              ) : (
                <div className={styles.recommendationsEmpty}>
                  <Disc3 size={28} className={styles.recommendationsEmptyIcon} />
                  <span className={styles.recommendationsEmptyText}>
                    {recommendationsExhausted
                      ? "No similar tracks found"
                      : "Searching similar tracks…"}
                  </span>
                  {recommendationsExhausted && (
                    <span className={styles.recommendationsEmptyHint}>
                      Try adding more songs to your queue
                    </span>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {activeMenu !== null && menuPosition && (
        <ActionMenu
          items={getMenuItems(queue[activeMenu], activeMenu)}
          onClose={() => { setActiveMenu(null); setMenuPosition(null); }}
          position={menuPosition}
        />
      )}

      {activeRecsMenu !== null && recsMenuPosition && (
        <ActionMenu
          items={getRecommendationMenuItems(recommendationsQueue[activeRecsMenu], activeRecsMenu)}
          onClose={() => { setActiveRecsMenu(null); setRecsMenuPosition(null); }}
          position={recsMenuPosition}
        />
      )}

      {reviewTrack && (
        <TrackReviewModal trackId={reviewTrack.trackId} onClose={() => setReviewTrack(null)} />
      )}
      {listTrack && (
        <AddToListModal trackId={listTrack.trackId} onClose={() => setListTrack(null)} />
      )}
    </>
  );
};

export default Queue;
