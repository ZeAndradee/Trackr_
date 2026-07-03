import { useState, useRef, useCallback, useEffect } from "react";

export const usePlaybackTime = (playerRef) => {
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const timerRef = useRef(null);
  const currentTimeRef = useRef(0);

  useEffect(() => {
    currentTimeRef.current = currentTime;
  }, [currentTime]);

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      if (playerRef.current) setCurrentTime(playerRef.current.getCurrentTime());
    }, 200);
  }, [playerRef]);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const resetTime = useCallback(() => {
    setCurrentTime(0);
    setDuration(0);
  }, []);

  useEffect(() => () => stopTimer(), [stopTimer]);

  return {
    currentTime,
    duration,
    setCurrentTime,
    setDuration,
    currentTimeRef,
    startTimer,
    stopTimer,
    resetTime,
  };
};
