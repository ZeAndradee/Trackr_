import { useEffect } from "react";

export const useMediaSession = ({ currentTrack, isPlaying, togglePlay, playPrev, playNext }) => {
  useEffect(() => {
    if (!("mediaSession" in navigator) || !currentTrack) return;
    const artistStr = currentTrack.artists?.map((a) => a.name).join(", ")
      || currentTrack.artist?.name || currentTrack.artist || "";
    navigator.mediaSession.metadata = new MediaMetadata({
      title: currentTrack.title || "",
      artist: artistStr,
      artwork: currentTrack.coverUrl
        ? [{ src: currentTrack.coverUrl, sizes: "512x512", type: "image/jpeg" }]
        : [],
    });
  }, [currentTrack]);

  useEffect(() => {
    if (!("mediaSession" in navigator)) return;
    navigator.mediaSession.playbackState = isPlaying ? "playing" : "paused";
  }, [isPlaying]);

  useEffect(() => {
    if (!("mediaSession" in navigator)) return;
    navigator.mediaSession.setActionHandler("play", () => togglePlay());
    navigator.mediaSession.setActionHandler("pause", () => togglePlay());
    navigator.mediaSession.setActionHandler("previoustrack", () => playPrev());
    navigator.mediaSession.setActionHandler("nexttrack", () => playNext());
    return () => {
      navigator.mediaSession.setActionHandler("play", null);
      navigator.mediaSession.setActionHandler("pause", null);
      navigator.mediaSession.setActionHandler("previoustrack", null);
      navigator.mediaSession.setActionHandler("nexttrack", null);
    };
  }, [togglePlay, playPrev, playNext]);
};
