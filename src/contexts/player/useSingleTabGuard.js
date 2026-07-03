import { useRef, useCallback, useEffect } from "react";

export const useSingleTabGuard = (playerRef) => {
  const channelRef = useRef(null);
  const instanceIdRef = useRef(null);

  useEffect(() => {
    instanceIdRef.current = crypto.randomUUID();
    const channel = new BroadcastChannel("trackr-youtube");
    channelRef.current = channel;
    channel.onmessage = (event) => {
      if (event.data?.type === "playing" && event.data.id !== instanceIdRef.current) {
        playerRef.current?.pauseVideo();
      }
    };
    return () => channel.close();
  }, [playerRef]);

  const notifyPlaying = useCallback(() => {
    channelRef.current?.postMessage({ type: "playing", id: instanceIdRef.current });
  }, []);

  return { notifyPlaying };
};
