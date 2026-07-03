import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Play,
  Maximize,
  Minimize,
  Fullscreen,
  Eye,
  Plus,
} from "lucide-react";
import { PiPaperPlaneTiltBold } from "react-icons/pi";
import { RiPlayListAddLine } from "react-icons/ri";
import { ListEnd, ListStart } from "lucide-react";
import ActionMenu from "../../../Utils/Dropdown/ActionMenu";
import AddToListModal from "../../../Utils/AddToListModal/AddToListModal";
import TrackReviewModal from "../../../Review/TrackReviewModal/TrackReviewModal";
import showToast from "../../../Utils/Toast/Toast";
import styles from "./YouTubeSection.module.css";
import YouTubeSkeleton from "../../../Utils/Skeletons/YouTubeSkeleton";
import { usePlayer, usePlayerTime } from "../../../../contexts/PlayerContext";

const YouTubeSection = ({
  track,
  videoId,
  loading,
  onTimeUpdate,
  onPlayerReady: onPlayerReadyProp,
  onTheaterMode,
}) => {
  const [showAddToList, setShowAddToList] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [actionMenuOpen, setActionMenuOpen] = useState(false);
  const [actionMenuPos, setActionMenuPos] = useState(null);

  const navigate = useNavigate();

  const containerRef = useRef(null);
  const inlineSlotRef = useRef(null);

  const player = usePlayer();
  const { currentTime } = usePlayerTime();
  const trackId = track?.id || track?.trackId;
  const isGlobalTrack = player.currentTrack?.trackId === trackId && player.isPlayerVisible;

  useEffect(() => {
    if (isGlobalTrack && onTimeUpdate) {
      onTimeUpdate(currentTime);
    }
  }, [isGlobalTrack, currentTime, onTimeUpdate]);

  useEffect(() => {
    if (isGlobalTrack && onPlayerReadyProp && player.playerRef.current) {
      onPlayerReadyProp(player.playerRef.current);
    }
  }, [isGlobalTrack, onPlayerReadyProp, player.playerRef]);

  useEffect(() => {
    if (!isGlobalTrack) {
      player.unregisterInlineContainer();
      return;
    }

    const slot = inlineSlotRef.current;
    if (!slot) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !player.theaterSlotEl) {
          player.registerInlineContainer(slot);
        } else if (!player.theaterSlotEl) {
          player.unregisterInlineContainer();
        }
      },
      { threshold: 0 }
    );

    observer.observe(slot);

    const rect = slot.getBoundingClientRect();
    const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
    if (isVisible && !player.theaterSlotEl) {
      player.registerInlineContainer(slot);
    }

    return () => {
      observer.disconnect();
      player.unregisterInlineContainer();
    };
  }, [isGlobalTrack, player.theaterSlotEl, loading, videoId]);

  const handlePlay = () => {
    if (isGlobalTrack) {
      player.togglePlay();
    } else {
      player.playTrack({
        ...track,
        videoId: videoId,
      });
    }
  };

  const handleOpenMenu = (e) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setActionMenuPos({
      bottom: window.innerHeight - rect.top + 8,
      right: window.innerWidth - rect.right,
    });
    setActionMenuOpen(true);
  };

  const menuItems = [
    { label: "View track", icon: <Eye size={18} />, onClick: () => navigate(`/track/${trackId}`), section: 'user' },
    { label: "Log track", icon: <Plus size={18} />, onClick: () => setShowReviewModal(true), section: 'user' },
    { label: "Add to list", icon: <RiPlayListAddLine size={18} />, onClick: () => setShowAddToList(true), section: 'user' },
    ...(onTheaterMode ? [{ label: "Theater mode", icon: <Fullscreen size={18} />, onClick: onTheaterMode, section: 'track', order: 11 }] : []),
    { label: player.isFullscreen ? "Exit fullscreen" : "Fullscreen", icon: player.isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />, onClick: player.toggleFullscreen, section: 'track', order: 12 },
    {
      label: "Share", icon: <PiPaperPlaneTiltBold size={18} />, onClick: () => {
        const url = `${window.location.origin}/track/${trackId}`;
        navigator.clipboard.writeText(url);
        showToast("Link copied to clipboard!", "success");
      }, section: 'track', order: 99
    },
    ...(player.isPlayerVisible && !isGlobalTrack ? [
      {
        label: "Play next",
        icon: <ListStart size={18} />,
        onClick: () => {
          player.addNextToQueue({ ...track, videoId: videoId });
          showToast(`Playing next: ${track?.name}`, "success");
        },
        section: "queue",
      },
      {
        label: "Add to queue",
        icon: <ListEnd size={18} />,
        onClick: () => {
          player.addToQueue({ ...track, videoId: videoId });
          showToast(`Added to queue: ${track?.name}`, "success");
        },
        section: "queue",
      },
    ] : []),
  ];

  if (loading) {
    return (
      <div className={styles.container}>
        {isGlobalTrack ? (
          <div className={styles.videoPlayerSlot} ref={inlineSlotRef}>
            <div className={styles.slotVideoArea} />
            <div className={styles.slotControlsArea} />
          </div>
        ) : (
          <YouTubeSkeleton />
        )}
      </div>
    );
  }

  if (!videoId && !isGlobalTrack) return null;

  return (
    <div
      className={styles.container}
      ref={containerRef}
    >
      {isGlobalTrack ? (
        <div className={styles.videoPlayerSlot} ref={inlineSlotRef}>
          <div className={styles.slotVideoArea} />
          <div className={styles.slotControlsArea} />
        </div>
      ) : (
        <div className={styles.videoWrapper}>
          <button className={styles.thumbnail} onClick={handlePlay}>
            <img
              src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
              alt=""
              className={styles.thumbnailImg}
            />
            <Play size={48} className={styles.playButton} fill="white" color="white" />
          </button>
        </div>
      )}

      {actionMenuOpen && (
        <ActionMenu
          items={menuItems}
          onClose={() => setActionMenuOpen(false)}
          position={actionMenuPos}
          anchor="bottom-right"
        />
      )}

      {showAddToList && track && (
        <AddToListModal
          trackId={track.id || track.trackId}
          onClose={() => setShowAddToList(false)}
        />
      )}

      {showReviewModal && track && (
        <TrackReviewModal
          trackId={trackId}
          onClose={() => setShowReviewModal(false)}
        />
      )}
    </div>
  );
};

export default YouTubeSection;
