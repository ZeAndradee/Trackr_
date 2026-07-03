import { useCallback } from "react";
import { fetchAlbum } from "../../services/FetchAlbum";
import { makeItem, buildAlbumItems, buildListItems } from "./queueItemBuilders";

export const usePlayActions = ({
  requireAuth,
  queueLength,
  setQueue,
  setCurrentIndex,
  insertRespectingLoop,
  insertAfterCurrent,
  setIsPlaying,
  setIsPlayerVisible,
  resetTime,
  unmuteForPlay,
  wantsToPlayRef,
  clearRecommendationsQueue,
  resetFetchGuard,
  enrichSingle,
  enrichAlbum,
  enrichList,
}) => {
  const startPlayback = useCallback(() => {
    setCurrentIndex(0);
    setIsPlayerVisible(true);
    setIsPlaying(true);
    unmuteForPlay();
  }, [setCurrentIndex, setIsPlayerVisible, setIsPlaying, unmuteForPlay]);

  const playItems = useCallback((items) => {
    if (!items.length) return;
    if (queueLength === 0) {
      setQueue(items);
      setCurrentIndex(0);
      setIsPlayerVisible(true);
      setIsPlaying(true);
    } else {
      insertAfterCurrent(items);
      setCurrentIndex((prev) => prev + 1);
    }
    resetTime();
    unmuteForPlay();
  }, [queueLength, setQueue, setCurrentIndex, setIsPlayerVisible, setIsPlaying, insertAfterCurrent, resetTime, unmuteForPlay]);

  const playTrack = useCallback(async (track) => {
    if (!requireAuth()) return;
    wantsToPlayRef.current = true;
    const item = makeItem(track);
    setQueue([item]);
    setCurrentIndex(0);
    setIsPlayerVisible(true);
    setIsPlaying(true);
    resetTime();
    clearRecommendationsQueue();
    resetFetchGuard();
    unmuteForPlay();
    enrichSingle(item._queueId, item.trackId, track);
  }, [requireAuth, wantsToPlayRef, setQueue, setCurrentIndex, setIsPlayerVisible, setIsPlaying, resetTime, clearRecommendationsQueue, resetFetchGuard, unmuteForPlay, enrichSingle]);

  const addToQueue = useCallback(async (track) => {
    if (!requireAuth()) return;
    const item = makeItem(track);
    const wasEmpty = queueLength === 0;
    insertRespectingLoop([item]);
    if (wasEmpty) startPlayback();
    enrichSingle(item._queueId, item.trackId, track);
  }, [requireAuth, queueLength, insertRespectingLoop, startPlayback, enrichSingle]);

  const addNextToQueue = useCallback(async (track) => {
    if (!requireAuth()) return;
    const item = makeItem(track);
    insertAfterCurrent([item]);
    enrichSingle(item._queueId, item.trackId, track);
  }, [requireAuth, insertAfterCurrent, enrichSingle]);

  const playTrackInQueue = useCallback(async (track) => {
    if (!requireAuth()) return;
    if (queueLength === 0) return playTrack(track);
    const item = makeItem(track);
    insertAfterCurrent([item]);
    setCurrentIndex((prev) => prev + 1);
    resetTime();
    unmuteForPlay();
    enrichSingle(item._queueId, item.trackId, track);
  }, [requireAuth, queueLength, playTrack, insertAfterCurrent, setCurrentIndex, resetTime, unmuteForPlay, enrichSingle]);

  const addAlbumToQueue = useCallback(async (albumId) => {
    if (!requireAuth()) return 0;
    try {
      const album = await fetchAlbum({ albumId });
      if (!album?.tracks?.length) return 0;
      const items = buildAlbumItems(album, albumId);
      const wasEmpty = queueLength === 0;
      insertRespectingLoop(items);
      if (wasEmpty) startPlayback();
      enrichAlbum(albumId, items);
      return items.length;
    } catch {
      return 0;
    }
  }, [requireAuth, queueLength, insertRespectingLoop, startPlayback, enrichAlbum]);

  const playAlbumInQueue = useCallback(async (albumId, startTrackId) => {
    if (!requireAuth()) return 0;
    try {
      const album = await fetchAlbum({ albumId });
      if (!album?.tracks?.length) return 0;
      let items = buildAlbumItems(album, albumId);
      if (startTrackId && items.length > 1) {
        const startIdx = items.findIndex((item) => item.trackId === startTrackId);
        if (startIdx > 0) items = [...items.slice(startIdx), ...items.slice(0, startIdx)];
      }
      playItems(items);
      enrichAlbum(albumId, items);
      return items.length;
    } catch {
      return 0;
    }
  }, [requireAuth, playItems, enrichAlbum]);

  const addListToQueue = useCallback(async (listData) => {
    if (!requireAuth()) return 0;
    const items = buildListItems(listData);
    if (!items.length) return 0;
    const wasEmpty = queueLength === 0;
    insertRespectingLoop(items);
    if (wasEmpty) startPlayback();
    enrichList(items);
    return items.length;
  }, [requireAuth, queueLength, insertRespectingLoop, startPlayback, enrichList]);

  const playListInQueue = useCallback(async (listData) => {
    if (!requireAuth()) return 0;
    const items = buildListItems(listData);
    if (!items.length) return 0;
    playItems(items);
    enrichList(items);
    return items.length;
  }, [requireAuth, playItems, enrichList]);

  return {
    playTrack,
    playTrackInQueue,
    addToQueue,
    addNextToQueue,
    addAlbumToQueue,
    playAlbumInQueue,
    addListToQueue,
    playListInQueue,
  };
};
