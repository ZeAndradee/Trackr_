import { useRef, useCallback, useEffect } from "react";

export const useBackgroundPlayback = ({ isPlaying, playerRef, wantsToPlayRef }) => {
  const audioCtxRef = useRef(null);
  const keepaliveNodeRef = useRef(null);

  const startAudioKeepalive = useCallback(() => {
    if (audioCtxRef.current) return;
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      gain.gain.value = 0;
      oscillator.connect(gain);
      gain.connect(ctx.destination);
      oscillator.start();
      audioCtxRef.current = ctx;
      keepaliveNodeRef.current = { oscillator, gain };
    } catch {}
  }, []);

  const stopAudioKeepalive = useCallback(() => {
    if (keepaliveNodeRef.current) {
      keepaliveNodeRef.current.oscillator.stop();
      keepaliveNodeRef.current = null;
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close();
      audioCtxRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (isPlaying) startAudioKeepalive();
    else stopAudioKeepalive();
  }, [isPlaying, startAudioKeepalive, stopAudioKeepalive]);

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState !== "visible") return;
      if (wantsToPlayRef.current && playerRef.current) {
        const state = playerRef.current.getPlayerState();
        if (state !== 1 && state !== 3) playerRef.current.playVideo();
      }
      if (audioCtxRef.current?.state === "suspended") audioCtxRef.current.resume();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [playerRef, wantsToPlayRef]);
};
