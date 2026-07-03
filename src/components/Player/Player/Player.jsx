import { useRef, useEffect, useState } from "react";
import { usePlayer } from "../../../contexts/PlayerContext";
import useFollowSlot from "../hooks/useFollowSlot";
import usePiPDrag from "../hooks/usePiPDrag";
import YouTubeFrame from "../YouTubeFrame/YouTubeFrame";
import PlayerControls from "./PlayerControls";
import PiPInfo from "./PiPInfo";
import SeekBar from "./SeekBar";
import styles from "./Player.module.css";

const Player = () => {
  const {
    currentTrack,
    isPlayerVisible,
    loadingVideoId,
    theaterSlotEl,
    inlineSlotEl,
    isFullscreen,
    pipContainerRef,
    initialMuted,
    onPlayerReady,
    onPlayerStateChange,
    toggleFullscreen,
  } = usePlayer();

  const frameRef = useRef(null);
  const [hovered, setHovered] = useState(false);

  const isTheater = !!theaterSlotEl;
  const isInline = !isTheater && !!inlineSlotEl;
  const isFloating = !isTheater && !isInline;
  const isDocked = isTheater || isInline;
  const isRendered = isPlayerVisible && !!(currentTrack?.videoId || loadingVideoId);

  const targetSlot = theaterSlotEl || inlineSlotEl;

  useFollowSlot(pipContainerRef, isFullscreen ? null : targetSlot, {
    isTheater,
    reflowKey: `${currentTrack?.videoId || ""}|${loadingVideoId ? 1 : 0}`,
  });

  const { onMoveDown, onResizeDown } = usePiPDrag(pipContainerRef, {
    enabled: isFloating && !isFullscreen && isRendered,
  });

  useEffect(() => {
    if (!isFullscreen) return;
    const handleKey = (e) => {
      if (e.key === "f" || e.key === "F") {
        e.preventDefault();
        toggleFullscreen();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isFullscreen, toggleFullscreen]);

  if (!isRendered) return null;

  const variant = isFullscreen ? "fullscreen" : "bar";

  const containerClass = [
    styles.pip,
    isFloating ? styles.floating : "",
    isDocked ? styles.docked : "",
    isFullscreen ? styles.fullscreen : "",
  ].filter(Boolean).join(" ");

  const isPiP = isFloating && !isFullscreen;
  const isInlinePip = isInline && !isFullscreen;
  const seekOnly = isPiP || isInlinePip;
  const headerActive = isPiP && hovered;

  const frame = (
    <YouTubeFrame
      videoId={currentTrack?.videoId}
      initialMuted={initialMuted.current}
      onReady={onPlayerReady}
      onStateChange={onPlayerStateChange}
      isLoading={loadingVideoId}
      frameRef={frameRef}
      fill={isFullscreen || isTheater}
    />
  );

  return (
    <div
      className={containerClass}
      ref={pipContainerRef}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {isPiP && <PiPInfo onMoveDown={onMoveDown} visible={hovered} />}

      <div className={`${styles.body} ${headerActive ? styles.bodyTopSquare : ""}`}>
        {frame}
        {(seekOnly || (isTheater && !isFullscreen)) && <SeekBar pip />}
      </div>

      {isPiP && ["e", "w"].map((dir) => (
        <div
          key={dir}
          className={`${styles.resizeHandle} ${styles[`rz_${dir}`]}`}
          onPointerDown={onResizeDown(dir)}
        />
      ))}

      {!seekOnly && !(isTheater && !isFullscreen) && <PlayerControls variant={variant} />}
    </div>
  );
};

export default Player;
