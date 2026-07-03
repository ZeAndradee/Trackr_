import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Repeat,
  Repeat1,
  Volume2,
  Volume1,
  VolumeX,
  Settings,
  Fullscreen,
  Minimize,
  Maximize,
  Plus,
  Eye,
} from "lucide-react";
import { PiPaperPlaneTiltBold } from "react-icons/pi";
import { RiPlayListAddLine } from "react-icons/ri";
import { Tooltip } from "../../Utils/Tooltip/Tooltip";
import ActionMenu from "../../Utils/Dropdown/ActionMenu";
import TrackReviewModal from "../../Review/TrackReviewModal/TrackReviewModal";
import AddToListModal from "../../Utils/AddToListModal/AddToListModal";
import showToast from "../../Utils/Toast/Toast";
import { createTrackSlug, formatTime } from "../../../utils/formatters/textFormatters";
import { usePlayer, usePlayerTime } from "../../../contexts/PlayerContext";
import styles from "./PlayerControls.module.css";

const PlayerControls = ({ variant = "bar" }) => {
  const {
    currentTrack,
    queue,
    currentIndex,
    isPlaying,
    repeatMode,
    volume,
    isMuted,
    recommendationsQueue,
    isFullscreen,
    showTheaterMode,
    togglePlay,
    playPrev,
    playNext,
    seekTo,
    setVolume,
    toggleMute,
    cycleRepeatMode,
    toggleFullscreen,
    openTheaterMode,
    closeTheaterMode,
  } = usePlayer();
  const { currentTime, duration } = usePlayerTime();

  const navigate = useNavigate();
  const [isSeeking, setIsSeeking] = useState(false);
  const [seekValue, setSeekValue] = useState(0);
  const [showReview, setShowReview] = useState(false);
  const [showAddToList, setShowAddToList] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState(null);

  const isFs = variant === "fullscreen";
  const trackId = currentTrack?.trackId || currentTrack?.id;
  const trackUrl = currentTrack
    ? createTrackSlug(currentTrack.name || currentTrack.title, currentTrack.artists, trackId)
    : "#";

  const hasNext = currentIndex < queue.length - 1 || repeatMode === "all" || recommendationsQueue.length > 0;
  const hasPrev = currentIndex > 0 || currentTime > 3;

  const progressPercent = duration > 0 ? ((isSeeking ? seekValue : currentTime) / duration) * 100 : 0;
  const volumePercent = isMuted ? 0 : volume;
  const VolumeIcon = isMuted || volume === 0 ? VolumeX : volume < 50 ? Volume1 : Volume2;
  const RepeatIcon = repeatMode === "one" ? Repeat1 : Repeat;
  const repeatTooltip = repeatMode === "none" ? "Repeat" : repeatMode === "all" ? "Repeat one" : "Repeat off";

  const iconSize = isFs ? 20 : 16;

  const handleSeekStart = () => { setIsSeeking(true); setSeekValue(currentTime); };
  const handleSeekChange = (e) => { const v = parseFloat(e.target.value); setSeekValue(v); seekTo(v); };
  const handleSeekEnd = (e) => { seekTo(parseFloat(e.target.value)); setIsSeeking(false); };

  const handleOpenMenu = (e) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setMenuPos({ bottom: window.innerHeight - rect.top + 8, right: window.innerWidth - rect.right });
    setMenuOpen(true);
  };

  const menuItems = [
    { label: "View track", icon: <Eye size={18} />, onClick: () => navigate(trackUrl), section: "user" },
    { label: "Add to list", icon: <RiPlayListAddLine size={18} />, onClick: () => setShowAddToList(true), section: "user" },
    {
      label: "Share", icon: <PiPaperPlaneTiltBold size={18} />, section: "user", onClick: () => {
        navigator.clipboard.writeText(`${window.location.origin}${trackUrl}`);
        showToast("Link copied to clipboard!", "success");
      },
    },
  ];

  return (
    <div className={`${styles.controls} ${styles[variant]}`}>
      <div className={styles.progressRow}>
        <span className={styles.time}>{formatTime(currentTime)}</span>
        <div className={styles.progressContainer}>
          <div className={styles.progressBar}>
            <div className={styles.progressFilled} style={{ width: `${progressPercent}%` }} />
          </div>
          <input
            type="range"
            min={0}
            max={duration || 0}
            step={0.1}
            value={isSeeking ? seekValue : currentTime}
            className={styles.progressInput}
            onMouseDown={handleSeekStart}
            onTouchStart={handleSeekStart}
            onChange={handleSeekChange}
            onMouseUp={handleSeekEnd}
            onTouchEnd={handleSeekEnd}
          />
        </div>
        <span className={styles.time}>{formatTime(duration)}</span>
      </div>

      <div className={styles.row}>
        <div className={styles.left}>
          <Tooltip text="Previous">
            <button className={styles.btn} onClick={playPrev} disabled={!hasPrev}>
              <SkipBack size={iconSize} fill="currentColor" />
            </button>
          </Tooltip>
          <Tooltip text={isPlaying ? "Pause" : "Play"}>
            <button className={`${styles.btn} ${styles.playBtn}`} onClick={togglePlay}>
              {isPlaying ? <Pause size={iconSize + 6} fill="currentColor" /> : <Play size={iconSize + 6} fill="currentColor" />}
            </button>
          </Tooltip>
          <Tooltip text="Next">
            <button className={styles.btn} onClick={playNext} disabled={!hasNext}>
              <SkipForward size={iconSize} fill="currentColor" />
            </button>
          </Tooltip>

          <div className={styles.volumeWrapper}>
            <Tooltip text={isMuted ? "Unmute" : "Mute"}>
              <button className={styles.btn} onClick={toggleMute}>
                <VolumeIcon size={iconSize} />
              </button>
            </Tooltip>
            <div className={`${styles.volumeSlider} ${isFs ? styles.volumeSliderVisible : ""}`}>
              <div className={styles.volumeTrack}>
                <div className={styles.volumeFilled} style={{ width: `${volumePercent}%` }} />
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={isMuted ? 0 : volume}
                className={styles.volumeInput}
                onChange={(e) => setVolume(parseInt(e.target.value, 10))}
              />
            </div>
          </div>
        </div>

        <div className={styles.right}>
          <Tooltip text={repeatTooltip}>
            <button className={`${styles.btn} ${repeatMode !== "none" ? styles.active : ""} ${styles.repeatBtn}`} onClick={cycleRepeatMode}>
              <RepeatIcon size={iconSize} />
              {repeatMode === "one" && <span className={styles.repeatDot} />}
            </button>
          </Tooltip>

          <Tooltip text="Log track">
            <button className={styles.btn} onClick={() => setShowReview(true)}>
              <Plus size={iconSize} />
            </button>
          </Tooltip>

          <Tooltip text="More">
            <button className={styles.btn} onClick={handleOpenMenu}>
              <Settings size={iconSize} />
            </button>
          </Tooltip>

          {!isFs && (
            <Tooltip text={showTheaterMode ? "Exit theater" : "Theater mode"}>
              <button
                className={`${styles.btn} ${showTheaterMode ? styles.active : ""}`}
                onClick={() => (showTheaterMode ? closeTheaterMode() : openTheaterMode())}
              >
                <Fullscreen size={iconSize} />
              </button>
            </Tooltip>
          )}

          <Tooltip text={isFullscreen ? "Exit fullscreen" : "Fullscreen"}>
            <button className={styles.btn} onClick={toggleFullscreen}>
              {isFullscreen ? <Minimize size={iconSize} /> : <Maximize size={iconSize} />}
            </button>
          </Tooltip>
        </div>
      </div>

      {menuOpen && (
        <ActionMenu items={menuItems} onClose={() => setMenuOpen(false)} position={menuPos} anchor="bottom-right" />
      )}
      {showReview && currentTrack && (
        <TrackReviewModal trackId={trackId} onClose={() => setShowReview(false)} />
      )}
      {showAddToList && currentTrack && (
        <AddToListModal trackId={trackId} onClose={() => setShowAddToList(false)} />
      )}
    </div>
  );
};

export default PlayerControls;
