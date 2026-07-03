import { useState, useRef, useCallback, useEffect } from "react";
import { fetchSimilarTrackYouTube } from "../../services/FetchTrack";
import { makeItem } from "./queueItemBuilders";

export const useRecommendations = () => {
  const [recommendationsQueue, setRecommendationsQueue] = useState([]);
  const [recommendationsExhausted, setRecommendationsExhausted] = useState(false);
  const [recommendationsSeedName, setRecommendationsSeedName] = useState("");
  const loadingRef = useRef(false);
  const fetchedForRef = useRef(null);
  const queueRef = useRef([]);

  useEffect(() => {
    queueRef.current = recommendationsQueue;
  }, [recommendationsQueue]);

  const takeNext = useCallback(() => {
    const [next, ...rest] = queueRef.current;
    if (!next) return null;
    queueRef.current = rest;
    setRecommendationsQueue(rest);
    return next;
  }, []);

  const removeFromRecommendations = useCallback((index) => {
    setRecommendationsQueue((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const reorderRecommendations = useCallback((fromIndex, toIndex) => {
    setRecommendationsQueue((prev) => {
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
  }, []);

  const clearRecommendationsQueue = useCallback(() => {
    setRecommendationsQueue([]);
    setRecommendationsSeedName("");
  }, []);

  const resetFetchGuard = useCallback(() => {
    fetchedForRef.current = null;
  }, []);

  const hasFetchedFor = useCallback((trackId) => fetchedForRef.current === trackId, []);

  const fetchRecommendations = useCallback(async (queue, currentIdx) => {
    if (loadingRef.current) return;
    const nowPlaying = queue[currentIdx];
    if (!nowPlaying) return;
    if (fetchedForRef.current === nowPlaying.trackId) return;

    loadingRef.current = true;
    fetchedForRef.current = nowPlaying.trackId;

    try {
      const candidates = [nowPlaying, ...queue.filter((_, i) => i !== currentIdx).reverse()];
      let similarItems = [];

      for (const track of candidates) {
        const seedId = track.trackId || track.id;
        if (!seedId) continue;
        const results = await fetchSimilarTrackYouTube(seedId);
        if (results?.length) {
          const existingIds = new Set(queue.map((q) => q.trackId));
          similarItems = results.filter((r) => r.id && !existingIds.has(r.id) && r.youtubeId);
          if (similarItems.length) {
            setRecommendationsSeedName(track.name || track.title || "");
            break;
          }
        }
      }

      if (!similarItems.length) {
        setRecommendationsExhausted(true);
        return;
      }

      const items = similarItems.slice(0, 10).map((item) => makeItem(item, { youtubeStatus: "ready" }));
      setRecommendationsQueue(items);
    } catch (e) {
      console.error("Failed to fetch recommendations:", e);
    } finally {
      loadingRef.current = false;
    }
  }, []);

  return {
    recommendationsQueue,
    setRecommendationsQueue,
    recommendationsExhausted,
    recommendationsSeedName,
    removeFromRecommendations,
    reorderRecommendations,
    clearRecommendationsQueue,
    resetFetchGuard,
    hasFetchedFor,
    fetchRecommendations,
    takeNext,
  };
};
