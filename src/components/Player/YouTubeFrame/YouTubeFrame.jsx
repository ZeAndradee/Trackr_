import YouTube from "react-youtube";
import styles from "./YouTubeFrame.module.css";

const opts = {
  height: "100%",
  width: "100%",
  playerVars: {
    autoplay: 1,
    controls: 0,
    rel: 0,
    modestbranding: 1,
    loop: 0,
    disablekb: 1,
    iv_load_policy: 3,
    showinfo: 0,
  },
};

const YouTubeFrame = ({ videoId, initialMuted, onReady, onStateChange, isLoading, frameRef, fill, className = "" }) => {
  return (
    <div ref={frameRef} className={`${styles.videoFrame} ${fill ? styles.fill : ""} ${className}`}>
      {videoId && (
        <YouTube
          key={videoId}
          videoId={videoId}
          opts={{ ...opts, playerVars: { ...opts.playerVars, mute: initialMuted ? 1 : 0 } }}
          onReady={onReady}
          onStateChange={onStateChange}
          className={styles.youtubeContainer}
        />
      )}
      {isLoading && (
        <div className={styles.skeleton}>
          <div className={styles.spinner} />
        </div>
      )}
    </div>
  );
};

export default YouTubeFrame;
