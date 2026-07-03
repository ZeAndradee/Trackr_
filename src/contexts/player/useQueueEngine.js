import { useState, useRef, useCallback, useEffect } from "react";
import { MAX_HISTORY } from "./queueItemBuilders";

export const useQueueEngine = ({
  playerRef,
  wantsToPlayRef,
  currentTimeRef,
  setCurrentTime,
  resetTime,
  stopTimer,
  setIsPlaying,
  setIsPlayerVisible,
  hasRecommendationItems,
  takeNextRecommendation,
}) => {
  const [queue, setQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [repeatMode, setRepeatMode] = useState("none");
  const currentIndexRef = useRef(-1);
  const endedRef = useRef(null);

  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  const currentTrack = queue[currentIndex] || null;

  const insertRespectingLoop = useCallback((items) => {
    setQueue((prev) => {
      const loopStart = prev.findIndex((t, i) => t.isRepeatLoop && i > currentIndexRef.current);
      const next = [...prev];
      if (loopStart >= 0) next.splice(loopStart, 0, ...items);
      else next.push(...items);
      return next;
    });
  }, []);

  const insertAfterCurrent = useCallback((items) => {
    setQueue((prev) => {
      const next = [...prev];
      next.splice(currentIndexRef.current + 1, 0, ...items);
      return next;
    });
  }, []);

  const advance = useCallback((allowRepeatAll = true) => {
    const idx = currentIndexRef.current;
    if (allowRepeatAll && repeatMode === "all" && queue.length > 0) {
      const ended = queue[idx];
      if (ended) setQueue((prev) => [...prev, { ...ended, isRepeatLoop: true }]);
      setCurrentIndex((prev) => prev + 1);
      return true;
    }
    if (idx < queue.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      return true;
    }
    if (hasRecommendationItems) {
      const next = takeNextRecommendation();
      if (!next) return false;
      setQueue((prev) => [...prev, { ...next, isRecommendation: true }]);
      setCurrentIndex((prev) => prev + 1);
      return true;
    }
    return false;
  }, [queue, repeatMode, hasRecommendationItems, takeNextRecommendation]);

  const handleTrackEnded = useCallback(() => {
    if (repeatMode === "one") {
      playerRef.current?.seekTo(0, true);
      playerRef.current?.playVideo();
      return;
    }
    playerRef.current?.stopVideo();
    const advanced = advance(true);
    wantsToPlayRef.current = advanced;
  }, [repeatMode, advance, playerRef, wantsToPlayRef]);

  useEffect(() => {
    endedRef.current = handleTrackEnded;
  }, [handleTrackEnded]);

  const playNext = useCallback(() => {
    advance(true);
    resetTime();
  }, [advance, resetTime]);

  const playPrev = useCallback(() => {
    if (currentTimeRef.current > 3 && playerRef.current) {
      playerRef.current.seekTo(0, true);
      setCurrentTime(0);
    } else if (currentIndexRef.current > 0) {
      setCurrentIndex((prev) => prev - 1);
      resetTime();
    }
  }, [playerRef, currentTimeRef, setCurrentTime, resetTime]);

  const jumpToIndex = useCallback((index) => {
    if (index >= 0 && index < queue.length) {
      setCurrentIndex(index);
      resetTime();
    }
  }, [queue.length, resetTime]);

  const removeFromQueue = useCallback((index) => {
    setQueue((prev) => {
      const next = prev.filter((_, i) => i !== index);
      if (next.length === 0) {
        setCurrentIndex(-1);
        setIsPlayerVisible(false);
        setIsPlaying(false);
        stopTimer();
        return [];
      }
      setCurrentIndex((ci) => {
        if (index < ci) return ci - 1;
        if (index === ci) return Math.min(ci, next.length - 1);
        return ci;
      });
      return next;
    });
  }, [stopTimer, setIsPlaying, setIsPlayerVisible]);

  const reorderQueue = useCallback((fromIndex, toIndex) => {
    setQueue((prev) => {
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      setCurrentIndex((ci) => {
        if (ci === fromIndex) return toIndex;
        if (fromIndex < ci && toIndex >= ci) return ci - 1;
        if (fromIndex > ci && toIndex <= ci) return ci + 1;
        return ci;
      });
      return next;
    });
  }, []);

  const clearUpNext = useCallback(() => {
    setQueue((prev) => prev.slice(0, currentIndexRef.current + 1));
  }, []);

  const cycleRepeatMode = useCallback(() => {
    setRepeatMode((prev) => {
      const next = prev === "none" ? "all" : prev === "all" ? "one" : "none";
      if (prev === "all" && next !== "all") {
        setQueue((q) => {
          const filtered = q.filter((t) => !t.isRepeatLoop);
          setCurrentIndex((ci) => {
            const inFiltered = filtered.indexOf(q[ci]);
            return inFiltered >= 0 ? inFiltered : Math.min(ci, filtered.length - 1);
          });
          return filtered;
        });
      }
      return next;
    });
  }, []);

  useEffect(() => {
    if (currentIndex <= MAX_HISTORY) return;
    const trimCount = currentIndex - MAX_HISTORY;
    setQueue((prev) => prev.slice(trimCount));
    setCurrentIndex(MAX_HISTORY);
  }, [currentIndex]);

  useEffect(() => {
    if (queue[currentIndex]?.youtubeStatus !== "error") return;
    advance(false);
  }, [queue, currentIndex, advance]);

  return {
    queue,
    setQueue,
    currentIndex,
    setCurrentIndex,
    currentIndexRef,
    currentTrack,
    repeatMode,
    endedRef,
    insertRespectingLoop,
    insertAfterCurrent,
    playNext,
    playPrev,
    jumpToIndex,
    removeFromQueue,
    reorderQueue,
    clearUpNext,
    cycleRepeatMode,
  };
};
