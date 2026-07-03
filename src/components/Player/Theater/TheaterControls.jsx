import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  Volume1,
  VolumeX,
} from "lucide-react";
import { Tooltip } from "../../Utils/Tooltip/Tooltip";
import { usePlayer, usePlayerTime } from "../../../contexts/PlayerContext";
import styles from "./TheaterControls.module.css";

const TheaterControls = ({ inline = false }) => {
  const {
    queue,
    currentIndex,
    isPlaying,
    repeatMode,
    volume,
    isMuted,
    recommendationsQueue,
    togglePlay,
    playPrev,
    playNext,
    setVolume,
    toggleMute,
  } = usePlayer();
  const { currentTime } = usePlayerTime();

  const hasNext =
    currentIndex < queue.length - 1 ||
    repeatMode === "all" ||
    recommendationsQueue.length > 0;
  const hasPrev = currentIndex > 0 || currentTime > 3;

  const volumePercent = isMuted ? 0 : volume;
  const VolumeIcon =
    isMuted || volume === 0 ? VolumeX : volume < 50 ? Volume1 : Volume2;

  return (
    <div className={`${styles.bar} ${inline ? styles.inline : ""}`}>
      <div className={styles.controlsRow}>
        <div className={styles.transport}>
          <Tooltip text="Previous">
            <button className={styles.btn} onClick={playPrev} disabled={!hasPrev}>
              <SkipBack size={16} fill="currentColor" />
            </button>
          </Tooltip>
          <Tooltip text={isPlaying ? "Pause" : "Play"}>
            <button className={`${styles.btn} ${styles.playBtn}`} onClick={togglePlay}>
              {isPlaying ? (
                <Pause size={20} fill="currentColor" />
              ) : (
                <Play size={20} fill="currentColor" />
              )}
            </button>
          </Tooltip>
          <Tooltip text="Next">
            <button className={styles.btn} onClick={playNext} disabled={!hasNext}>
              <SkipForward size={16} fill="currentColor" />
            </button>
          </Tooltip>
        </div>

        <div className={styles.volumeWrapper}>
          <div className={styles.volumeSlider}>
            <div className={styles.volumeBarArea}>
              <div className={styles.volumeTrack}>
                <div
                  className={styles.volumeFilled}
                  style={{ width: `${volumePercent}%` }}
                />
              </div>
              <div
                className={styles.volumeThumb}
                style={{ left: `${volumePercent}%` }}
              />
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={isMuted ? 0 : volume}
              className={styles.volumeInput}
              onChange={(e) => setVolume(parseInt(e.target.value, 10))}
              aria-label="Volume"
            />
          </div>
          <Tooltip text={isMuted ? "Unmute" : "Mute"}>
            <button className={styles.btn} onClick={toggleMute}>
              <VolumeIcon size={16} />
            </button>
          </Tooltip>
        </div>
      </div>
    </div>
  );
};

export default TheaterControls;
