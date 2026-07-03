import { createContext, useState, useRef, useCallback, useEffect, useContext, useMemo } from "react";
import { UserLoggedContext } from "./UserLoggedContext";
import { useAuthModal } from "./AuthModalContext";
import { patchItemIn } from "./player/queueItemBuilders";
import { usePlaybackTime } from "./player/usePlaybackTime";
import { useRecommendations } from "./player/useRecommendations";
import { useQueueEngine } from "./player/useQueueEngine";
import { useSingleTabGuard } from "./player/useSingleTabGuard";
import { useYouTubeControls } from "./player/useYouTubeControls";
import { useViewSlots } from "./player/useViewSlots";
import { useEnrichment } from "./player/useEnrichment";
import { usePlayActions } from "./player/usePlayActions";
import { useBackgroundPlayback } from "./player/useBackgroundPlayback";
import { useMediaSession } from "./player/useMediaSession";

export const PlayerContext = createContext();
export const PlayerTimeContext = createContext({ currentTime: 0, duration: 0 });

export const PlayerProvider = ({ children }) => {
  const { userLogged } = useContext(UserLoggedContext);
  const { openModal } = useAuthModal();

  const playerRef = useRef(null);
  const wantsToPlayRef = useRef(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPlayerVisible, setIsPlayerVisible] = useState(false);

  const time = usePlaybackTime(playerRef);
  const recommendationsApi = useRecommendations();

  const engine = useQueueEngine({
    playerRef,
    wantsToPlayRef,
    currentTimeRef: time.currentTimeRef,
    setCurrentTime: time.setCurrentTime,
    resetTime: time.resetTime,
    stopTimer: time.stopTimer,
    setIsPlaying,
    setIsPlayerVisible,
    hasRecommendationItems: recommendationsApi.recommendationsQueue.length > 0,
    takeNextRecommendation: recommendationsApi.takeNext,
  });

  const tabGuard = useSingleTabGuard(playerRef);

  const controls = useYouTubeControls({
    playerRef,
    wantsToPlayRef,
    isPlaying,
    setIsPlaying,
    time,
    notifyPlaying: tabGuard.notifyPlaying,
    endedRef: engine.endedRef,
  });

  const slots = useViewSlots();

  const patchItem = useCallback((queueId, updates) => {
    engine.setQueue((list) => patchItemIn(list, queueId, updates));
    recommendationsApi.setRecommendationsQueue((list) => patchItemIn(list, queueId, updates));
  }, [engine.setQueue, recommendationsApi.setRecommendationsQueue]);

  const enrichment = useEnrichment({ patchItem });

  const requireAuth = useCallback(() => {
    if (!userLogged) {
      wantsToPlayRef.current = false;
      playerRef.current?.stopVideo();
      engine.setQueue([]);
      engine.setCurrentIndex(-1);
      setIsPlaying(false);
      setIsPlayerVisible(false);
      time.resetTime();
      recommendationsApi.clearRecommendationsQueue();
      openModal("login-reason", { reason: "play" });
      return false;
    }
    return true;
  }, [userLogged, openModal, engine.setQueue, engine.setCurrentIndex, time.resetTime, recommendationsApi.clearRecommendationsQueue]);

  const actions = usePlayActions({
    requireAuth,
    queueLength: engine.queue.length,
    setQueue: engine.setQueue,
    setCurrentIndex: engine.setCurrentIndex,
    insertRespectingLoop: engine.insertRespectingLoop,
    insertAfterCurrent: engine.insertAfterCurrent,
    setIsPlaying,
    setIsPlayerVisible,
    resetTime: time.resetTime,
    unmuteForPlay: controls.unmuteForPlay,
    wantsToPlayRef,
    clearRecommendationsQueue: recommendationsApi.clearRecommendationsQueue,
    resetFetchGuard: recommendationsApi.resetFetchGuard,
    enrichSingle: enrichment.enrichSingle,
    enrichAlbum: enrichment.enrichAlbum,
    enrichList: enrichment.enrichList,
  });

  const closePlayer = useCallback(() => {
    wantsToPlayRef.current = false;
    playerRef.current?.stopVideo();
    time.stopTimer();
    engine.setQueue([]);
    engine.setCurrentIndex(-1);
    setIsPlaying(false);
    setIsPlayerVisible(false);
    time.resetTime();
    recommendationsApi.clearRecommendationsQueue();
  }, [time.stopTimer, time.resetTime, engine.setQueue, engine.setCurrentIndex, recommendationsApi.clearRecommendationsQueue]);

  useEffect(() => {
    if (
      recommendationsApi.recommendationsQueue.length > 0 ||
      engine.queue.length === 0 ||
      engine.currentIndex < 0 ||
      engine.repeatMode === "all"
    ) return;
    const currentTrackId = engine.queue[engine.currentIndex]?.trackId;
    if (!currentTrackId || recommendationsApi.hasFetchedFor(currentTrackId)) return;
    recommendationsApi.fetchRecommendations(engine.queue, engine.currentIndex);
  }, [
    recommendationsApi.recommendationsQueue.length,
    engine.queue,
    engine.currentIndex,
    engine.repeatMode,
    recommendationsApi.hasFetchedFor,
    recommendationsApi.fetchRecommendations,
  ]);

  useBackgroundPlayback({ isPlaying, playerRef, wantsToPlayRef });

  useMediaSession({
    currentTrack: engine.currentTrack,
    isPlaying,
    togglePlay: controls.togglePlay,
    playPrev: engine.playPrev,
    playNext: engine.playNext,
  });

  const loadingVideoId = engine.currentTrack?.youtubeStatus === "loading";

  const value = useMemo(() => ({
    queue: engine.queue,
    currentIndex: engine.currentIndex,
    currentTrack: engine.currentTrack,
    isPlaying,
    repeatMode: engine.repeatMode,
    volume: controls.volume,
    isMuted: controls.isMuted,
    isPlayerVisible,
    loadingVideoId,
    isFullscreen: slots.isFullscreen,
    inlineSlotEl: slots.inlineSlotEl,
    theaterSlotEl: slots.theaterSlotEl,
    playerRef,
    pipContainerRef: slots.pipContainerRef,
    initialMuted: controls.initialMuted,

    recommendationsQueue: recommendationsApi.recommendationsQueue,
    recommendationsExhausted: recommendationsApi.recommendationsExhausted,
    recommendationsSeedName: recommendationsApi.recommendationsSeedName,

    playTrack: actions.playTrack,
    playTrackInQueue: actions.playTrackInQueue,
    addToQueue: actions.addToQueue,
    addNextToQueue: actions.addNextToQueue,
    addAlbumToQueue: actions.addAlbumToQueue,
    playAlbumInQueue: actions.playAlbumInQueue,
    addListToQueue: actions.addListToQueue,
    playListInQueue: actions.playListInQueue,
    removeFromQueue: engine.removeFromQueue,
    removeFromRecommendations: recommendationsApi.removeFromRecommendations,
    reorderRecommendations: recommendationsApi.reorderRecommendations,
    playNext: engine.playNext,
    playPrev: engine.playPrev,
    togglePlay: controls.togglePlay,
    seekTo: controls.seekTo,
    setVolume: controls.handleSetVolume,
    toggleMute: controls.toggleMute,
    cycleRepeatMode: engine.cycleRepeatMode,
    closePlayer,
    jumpToIndex: engine.jumpToIndex,
    reorderQueue: engine.reorderQueue,
    clearUpNext: engine.clearUpNext,
    onPlayerReady: controls.onPlayerReady,
    onPlayerStateChange: controls.onPlayerStateChange,
    toggleFullscreen: slots.toggleFullscreen,
    registerInlineContainer: slots.registerInlineContainer,
    unregisterInlineContainer: slots.unregisterInlineContainer,
    registerTheaterContainer: slots.registerTheaterContainer,
    unregisterTheaterContainer: slots.unregisterTheaterContainer,
    showTheaterMode: slots.showTheaterMode,
    openTheaterMode: slots.openTheaterMode,
    closeTheaterMode: slots.closeTheaterMode,
  }), [
    engine.queue,
    engine.currentIndex,
    engine.currentTrack,
    engine.repeatMode,
    engine.removeFromQueue,
    engine.playNext,
    engine.playPrev,
    engine.cycleRepeatMode,
    engine.jumpToIndex,
    engine.reorderQueue,
    engine.clearUpNext,
    isPlaying,
    isPlayerVisible,
    loadingVideoId,
    controls.volume,
    controls.isMuted,
    controls.initialMuted,
    controls.togglePlay,
    controls.seekTo,
    controls.handleSetVolume,
    controls.toggleMute,
    controls.onPlayerReady,
    controls.onPlayerStateChange,
    slots.isFullscreen,
    slots.inlineSlotEl,
    slots.theaterSlotEl,
    slots.pipContainerRef,
    slots.toggleFullscreen,
    slots.registerInlineContainer,
    slots.unregisterInlineContainer,
    slots.registerTheaterContainer,
    slots.unregisterTheaterContainer,
    slots.showTheaterMode,
    slots.openTheaterMode,
    slots.closeTheaterMode,
    recommendationsApi.recommendationsQueue,
    recommendationsApi.recommendationsExhausted,
    recommendationsApi.recommendationsSeedName,
    recommendationsApi.removeFromRecommendations,
    recommendationsApi.reorderRecommendations,
    actions.playTrack,
    actions.playTrackInQueue,
    actions.addToQueue,
    actions.addNextToQueue,
    actions.addAlbumToQueue,
    actions.playAlbumInQueue,
    actions.addListToQueue,
    actions.playListInQueue,
    closePlayer,
  ]);

  const timeValue = useMemo(
    () => ({ currentTime: time.currentTime, duration: time.duration }),
    [time.currentTime, time.duration]
  );

  return (
    <PlayerContext.Provider value={value}>
      <PlayerTimeContext.Provider value={timeValue}>
        {children}
      </PlayerTimeContext.Provider>
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => useContext(PlayerContext);
export const usePlayerTime = () => useContext(PlayerTimeContext);
