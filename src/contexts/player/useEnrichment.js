import { useCallback } from "react";
import { fetchTrackYouTubeLyrics, fetchTrack } from "../../services/FetchTrack";
import { fetchAlbumQueue } from "../../services/FetchAlbum";
import { formatSlug } from "../../utils/formatters/textFormatters";
import { resolveArtistName, resolveArtists } from "./queueItemBuilders";

export const useEnrichment = ({ patchItem }) => {
  const fetchVideoId = useCallback(async (artist, trackname, trackId) => {
    try {
      const response = await fetchTrackYouTubeLyrics(
        formatSlug(artist),
        formatSlug(trackname),
        trackId
      );
      return {
        videoId: response?.ytMusicVideoId || null,
        videoDuration: response?.videoDuration || null,
      };
    } catch {
      return { videoId: null, videoDuration: null };
    }
  }, []);

  const enrichSingle = useCallback(async (queueId, trackId, source) => {
    try {
      let full = source;
      try { full = await fetchTrack(trackId); } catch {}

      const name = full?.title || source.title || source.name || "";
      const artistName = resolveArtistName(full) || resolveArtistName(source) || "Unknown Artist";

      let videoId = source.videoId || full?.videoId || null;
      let videoDuration = source.videoDuration || null;
      if (!videoId) {
        const yt = await fetchVideoId(artistName, name, trackId);
        videoId = yt.videoId;
        videoDuration = yt.videoDuration;
      }
      if (!videoId) {
        patchItem(queueId, { youtubeStatus: "error" });
        return;
      }
      patchItem(queueId, {
        ...full,
        trackId: full?.id || trackId,
        name,
        title: name,
        artist: artistName,
        artists: full?.artists?.length || full?.primaryArtist
          ? resolveArtists(full, artistName)
          : resolveArtists(source, artistName),
        coverUrl: full?.coverUrl || source.coverUrl || "",
        videoId,
        videoDuration,
        youtubeStatus: "ready",
        slug: full?.slug || source.slug || null,
      });
    } catch {
      patchItem(queueId, { youtubeStatus: "error" });
    }
  }, [fetchVideoId, patchItem]);

  const enrichAlbum = useCallback((albumId, items) => {
    fetchAlbumQueue(albumId).then((queueData) => {
      const map = new Map();
      queueData.forEach((entry) => {
        if (entry.trackId) map.set(String(entry.trackId), entry);
      });
      items.forEach((item) => {
        const entry = map.get(String(item.trackId));
        if (!entry?.videoId) {
          patchItem(item._queueId, { youtubeStatus: "error" });
          return;
        }
        const updates = { videoId: entry.videoId, videoDuration: entry.videoDuration || null, youtubeStatus: "ready" };
        if (!item.name && entry.trackName) { updates.name = entry.trackName; updates.title = entry.trackName; }
        if (!item.artists?.length && entry.artistName) {
          updates.artists = [{ name: entry.artistName }];
          updates.artist = entry.artistName;
        }
        patchItem(item._queueId, updates);
      });
    }).catch(() => {
      items.forEach((item) => patchItem(item._queueId, { youtubeStatus: "error" }));
    });
  }, [patchItem]);

  const enrichList = useCallback((items) => {
    items.forEach((item) => {
      const artistName = resolveArtistName(item) || "Unknown Artist";
      const name = item.name || item.title || "";
      fetchVideoId(artistName, name, item.trackId)
        .then(({ videoId, videoDuration }) =>
          patchItem(item._queueId, videoId ? { videoId, videoDuration, youtubeStatus: "ready" } : { youtubeStatus: "error" })
        )
        .catch(() => patchItem(item._queueId, { youtubeStatus: "error" }));
    });
  }, [fetchVideoId, patchItem]);

  return { enrichSingle, enrichAlbum, enrichList };
};
