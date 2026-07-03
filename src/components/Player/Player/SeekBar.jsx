import { useState } from "react";
import { Tooltip } from "../../Utils/Tooltip/Tooltip";
import { formatTime } from "../../../utils/formatters/textFormatters";
import { usePlayer, usePlayerTime } from "../../../contexts/PlayerContext";
import styles from "./SeekBar.module.css";

const SeekBar = ({ pip = false }) => {
  const { seekTo } = usePlayer();
  const { currentTime, duration } = usePlayerTime();
  const [isSeeking, setIsSeeking] = useState(false);
  const [seekValue, setSeekValue] = useState(0);
  const [hoverTime, setHoverTime] = useState(null);

  const value = isSeeking ? seekValue : currentTime;
  const progressPercent = duration > 0 ? (value / duration) * 100 : 0;

  const handleSeekStart = () => { setIsSeeking(true); setSeekValue(currentTime); };
  const handleSeekChange = (e) => { const v = parseFloat(e.target.value); setSeekValue(v); seekTo(v); };
  const handleSeekEnd = (e) => { seekTo(parseFloat(e.target.value)); setIsSeeking(false); };

  const handleHover = (e) => {
    if (!duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    setHoverTime(ratio * duration);
  };

  const bar = (
    <div
      className={`${styles.container} ${pip ? styles.pip : ""}`}
      onMouseMove={handleHover}
      onMouseLeave={() => setHoverTime(null)}
    >
      <div className={styles.track}>
        <div className={styles.filled} style={{ width: `${progressPercent}%` }} />
      </div>
      <div className={styles.thumb} style={{ left: `${progressPercent}%` }} />
      <input
        type="range"
        min={0}
        max={duration || 0}
        step={0.1}
        value={value}
        className={styles.input}
        onMouseDown={handleSeekStart}
        onTouchStart={handleSeekStart}
        onChange={handleSeekChange}
        onMouseUp={handleSeekEnd}
        onTouchEnd={handleSeekEnd}
      />
    </div>
  );

  if (!pip) return bar;

  return (
    <Tooltip
      text={formatTime(hoverTime ?? value)}
      followMouse
      position="top"
      className={styles.tooltipWrap}
    >
      {bar}
    </Tooltip>
  );
};

export default SeekBar;
