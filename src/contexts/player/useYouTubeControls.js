import { useState, useRef, useCallback, useEffect } from "react";
import { VOLUME_KEY, MUTED_KEY, store } from "./queueItemBuilders";

export const useYouTubeControls = ({
  playerRef,
  wantsToPlayRef,
  isPlaying,
  setIsPlaying,
  time,
  notifyPlaying,
  endedRef,
}) => {
  const [volume, setVolume] = useState(() => {
    if (typeof window === "undefined") return 50;
    const saved = localStorage.getItem(VOLUME_KEY);
    return saved !== null ? parseInt(saved, 10) : 50;
  });
  const [isMuted, setIsMuted] = useState(true);
  const initialMuted = useRef(true);
  const volumeRef = useRef(volume);

  useEffect(() => {
    volumeRef.current = volume;
  }, [volume]);

  const unmuteForPlay = useCallback(() => {
    initialMuted.current = false;
    setIsMuted(false);
    store(MUTED_KEY, "false");
  }, []);

  const togglePlay = useCallback(() => {
    if (!playerRef.current) return;
    if (isPlaying) {
      wantsToPlayRef.current = false;
      playerRef.current.pauseVideo();
    } else {
      wantsToPlayRef.current = true;
      unmuteForPlay();
      playerRef.current.unMute();
      playerRef.current.setVolume(volume);
      playerRef.current.playVideo();
    }
  }, [playerRef, isPlaying, volume, unmuteForPlay]);

  const seekTo = useCallback((seconds) => {
    if (playerRef.current) {
      playerRef.current.seekTo(seconds, true);
      time.setCurrentTime(seconds);
    }
  }, [playerRef, time.setCurrentTime]);

  const handleSetVolume = useCallback((newVol) => {
    setVolume(newVol);
    store(VOLUME_KEY, newVol.toString());
    if (!playerRef.current) return;
    playerRef.current.setVolume(newVol);
    if (newVol === 0) {
      playerRef.current.mute();
      setIsMuted(true);
      store(MUTED_KEY, "true");
    } else if (isMuted) {
      playerRef.current.unMute();
      setIsMuted(false);
      store(MUTED_KEY, "false");
    }
  }, [playerRef, isMuted]);

  const toggleMute = useCallback(() => {
    if (!playerRef.current) return;
    if (isMuted) {
      playerRef.current.unMute();
      playerRef.current.setVolume(volume || 50);
      if (!volume) {
        setVolume(50);
        store(VOLUME_KEY, "50");
      }
      setIsMuted(false);
      store(MUTED_KEY, "false");
    } else {
      playerRef.current.mute();
      setIsMuted(true);
      store(MUTED_KEY, "true");
    }
  }, [playerRef, isMuted, volume]);

  const onPlayerReady = useCallback((event) => {
    playerRef.current = event.target;
    const dur = event.target.getDuration();
    if (dur) time.setDuration(dur);
    if (initialMuted.current) {
      event.target.mute();
    } else {
      event.target.unMute();
      event.target.setVolume(volume);
    }
  }, [playerRef, volume, time.setDuration]);

  const onPlayerStateChange = useCallback((event) => {
    if (event.data === 1) {
      wantsToPlayRef.current = true;
      setIsPlaying(true);
      notifyPlaying();
      const dur = playerRef.current?.getDuration();
      if (dur) time.setDuration(dur);
      if (!initialMuted.current) {
        playerRef.current?.unMute();
        playerRef.current?.setVolume(volumeRef.current);
      }
      time.startTimer();
    } else if (event.data === 2) {
      if (document.visibilityState === "visible") wantsToPlayRef.current = false;
      setIsPlaying(false);
      time.stopTimer();
    } else if (event.data === 0) {
      setIsPlaying(false);
      time.stopTimer();
      endedRef.current?.();
    } else if (event.data === -1 || event.data === 5) {
      if (event.data === 5) {
        time.resetTime();
        playerRef.current?.unMute();
        playerRef.current?.setVolume(volumeRef.current);
        setIsMuted(false);
      }
      if (wantsToPlayRef.current) playerRef.current?.playVideo();
    } else {
      time.stopTimer();
    }
  }, [playerRef, setIsPlaying, notifyPlaying, endedRef, time.setDuration, time.startTimer, time.stopTimer, time.resetTime]);

  return {
    volume,
    isMuted,
    initialMuted,
    wantsToPlayRef,
    unmuteForPlay,
    togglePlay,
    seekTo,
    handleSetVolume,
    toggleMute,
    onPlayerReady,
    onPlayerStateChange,
  };
};
