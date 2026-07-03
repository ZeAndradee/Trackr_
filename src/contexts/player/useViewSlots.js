import { useState, useRef, useCallback, useEffect } from "react";

export const useViewSlots = () => {
  const [inlineSlotEl, setInlineSlotEl] = useState(null);
  const [theaterSlotEl, setTheaterSlotEl] = useState(null);
  const [showTheaterMode, setShowTheaterMode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const pipContainerRef = useRef(null);

  const registerInlineContainer = useCallback((el) => setInlineSlotEl(el), []);
  const unregisterInlineContainer = useCallback(() => setInlineSlotEl(null), []);
  const registerTheaterContainer = useCallback((el) => setTheaterSlotEl(el), []);
  const unregisterTheaterContainer = useCallback(() => setTheaterSlotEl(null), []);

  const openTheaterMode = useCallback(() => setShowTheaterMode(true), []);
  const closeTheaterMode = useCallback(() => setShowTheaterMode(false), []);

  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) document.exitFullscreen();
    else pipContainerRef.current?.requestFullscreen();
  }, []);

  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  return {
    inlineSlotEl,
    theaterSlotEl,
    showTheaterMode,
    isFullscreen,
    pipContainerRef,
    registerInlineContainer,
    unregisterInlineContainer,
    registerTheaterContainer,
    unregisterTheaterContainer,
    openTheaterMode,
    closeTheaterMode,
    toggleFullscreen,
  };
};
