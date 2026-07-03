import { useState, useEffect, useRef, useCallback, useContext } from "react";
import { X } from "lucide-react";
import ArtistList from "../../Utils/ArtistList/ArtistList";
import Image from "../../Utils/Images/Image/Image";
import { getTrackCover } from "../../Utils/Formater/Track";
import LyricsSection from "../../Track/TrackProfile/LyricsSection/LyricsSection";
import { formatSlug, createTrackSlug } from "../../../utils/formatters/textFormatters";
import { fetchTrackYouTubeLyrics, fetchTrack } from "../../../services/FetchTrack";
import { usePlayer, usePlayerTime } from "../../../contexts/PlayerContext";
import { useTheme } from "../../../contexts/ThemeContext";
import { UserLoggedContext } from "../../../contexts/UserLoggedContext";
import Queue from "../Queue/Queue";
import TheaterControls from "./TheaterControls";
import Credits from "./Credits";
import SimilarTracks from "./SimilarTracks";
import ToggleSlide from "../../Utils/Toggle/ToggleSlide";
import { Tooltip } from "../../Utils/Tooltip/Tooltip";
import TrackAlbumTitle from "../../Utils/TrackAlbumTitle/TrackAlbumTitle";
import TrackReviewModal from "../../Review/TrackReviewModal/TrackReviewModal";
import styles from "./Theater.module.css";

const LANG_KEY = "trackr_lyrics_translate_lang";

const TABS = [
  { key: "lyrics", label: "Lyrics" },
  { key: "similar", label: "Recommendations" },
  { key: "credits", label: "Credits" },
];

const medianCut = (pixels, depth) => {
  if (depth === 0 || pixels.length === 0) {
    const avg = [0, 0, 0];
    pixels.forEach((p) => { avg[0] += p[0]; avg[1] += p[1]; avg[2] += p[2]; });
    const len = pixels.length || 1;
    return [[Math.round(avg[0] / len), Math.round(avg[1] / len), Math.round(avg[2] / len)]];
  }
  let minR = 255, maxR = 0, minG = 255, maxG = 0, minB = 255, maxB = 0;
  pixels.forEach(([r, g, b]) => {
    if (r < minR) minR = r; if (r > maxR) maxR = r;
    if (g < minG) minG = g; if (g > maxG) maxG = g;
    if (b < minB) minB = b; if (b > maxB) maxB = b;
  });
  const rangeR = maxR - minR, rangeG = maxG - minG, rangeB = maxB - minB;
  const channel = rangeR >= rangeG && rangeR >= rangeB ? 0 : rangeG >= rangeB ? 1 : 2;
  pixels.sort((a, b) => a[channel] - b[channel]);
  const mid = Math.floor(pixels.length / 2);
  return [...medianCut(pixels.slice(0, mid), depth - 1), ...medianCut(pixels.slice(mid), depth - 1)];
};

const extractDominantColor = (imgSrc) =>
  new Promise((resolve) => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 64;
      canvas.height = 36;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, 64, 36);
      const data = ctx.getImageData(0, 0, 64, 36).data;
      const pixels = [];
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i], g = data[i + 1], b = data[i + 2];
        if (r + g + b > 30 && r + g + b < 720) pixels.push([r, g, b]);
      }
      const colors = medianCut(pixels, 2);
      resolve(colors[0] || [0, 0, 0]);
    };
    img.onerror = () => resolve([0, 0, 0]);
    img.src = imgSrc;
  });

const lerpColor = (from, to, t) => [
  Math.round(from[0] + (to[0] - from[0]) * t),
  Math.round(from[1] + (to[1] - from[1]) * t),
  Math.round(from[2] + (to[2] - from[2]) * t),
];

const parseColor = (color) => {
  if (!color) return null;
  const value = color.trim();
  if (value.startsWith("#")) {
    const hex = value.slice(1);
    const full = hex.length === 3 ? hex.split("").map((c) => c + c).join("") : hex;
    if (full.length < 6) return null;
    const n = parseInt(full.slice(0, 6), 16);
    if (Number.isNaN(n)) return null;
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  const match = value.match(/rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)/);
  if (match) return [Number(match[1]), Number(match[2]), Number(match[3])];
  return null;
};

const getTheaterTextColors = (color) => {
  const rgb = parseColor(color);
  if (!rgb) return null;
  const [r, g, b] = rgb.map((v) => v / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let hue = 0;
  if (max !== min) {
    const d = max - min;
    if (max === r) hue = ((g - b) / d + (g < b ? 6 : 0)) * 60;
    else if (max === g) hue = ((b - r) / d + 2) * 60;
    else hue = ((r - g) / d + 4) * 60;
  }
  const rawLightness = (max + min) / 2;
  const saturation =
    max === min ? 0 : (max - min) / (1 - Math.abs(2 * rawLightness - 1));
  const linear = (v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
  const luminance = 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b);
  const h = Math.round(hue);
  const s = Math.min(Math.round(saturation * 100), 40);
  const darkText = `hsl(${h}, ${s}%, 10%)`;
  const darkSecondary = `hsla(${h}, ${s}%, 22%, 0.85)`;
  const lightText = `hsl(${h}, ${s}%, 96%)`;
  const lightSecondary = `hsla(${h}, ${s}%, 88%, 0.78)`;
  const useDarkText = luminance > 0.45;
  return {
    text: useDarkText ? darkText : lightText,
    secondary: useDarkText ? darkSecondary : lightSecondary,
  };
};

const clampThemeBg = (color, isLight) => {
  const rgb = parseColor(color);
  if (!rgb) return null;
  const [r, g, b] = rgb.map((v) => v / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  const l = (max + min) / 2;
  let s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  let h = 0;
  if (d !== 0) {
    if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
  }
  let L = l;
  if (isLight) {
    L = Math.min(Math.max(L, 0.72), 0.86);
    s = Math.min(s, 0.45);
  } else {
    L = Math.min(L, 0.3);
    s = Math.min(s, 0.7);
  }
  return `hsl(${Math.round(h)}, ${Math.round(Math.min(s, 1) * 100)}%, ${Math.round(L * 100)}%)`;
};

const Theater = () => {
  const {
    currentTrack,
    seekTo,
    registerTheaterContainer,
    unregisterTheaterContainer,
    closeTheaterMode,
  } = usePlayer();
  const { currentTime, duration } = usePlayerTime();
  const { theme } = useTheme();
  const { userLogged } = useContext(UserLoggedContext);

  const overlayRef = useRef(null);
  const glowARef = useRef(null);
  const glowBRef = useRef(null);
  const activeGlowRef = useRef(0);
  const glowVideoIdRef = useRef(null);
  const lyricsFetchRef = useRef({ trackId: null, duration: null, lang: null });

  const [isClosing, setIsClosing] = useState(false);
  const [activeTab, setActiveTab] = useState("lyrics");
  const [showQueue] = useState(true);
  const [videoColors, setVideoColors] = useState([]);
  const [trackDetails, setTrackDetails] = useState(null);
  const [localRating, setLocalRating] = useState(0);
  const [localLiked, setLocalLiked] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);

  const [lyrics, setLyrics] = useState(null);
  const [translatedLyrics, setTranslatedLyrics] = useState(null);
  const [transliteratedLyrics, setTransliteratedLyrics] = useState(null);
  const [isSynced, setIsSynced] = useState(false);
  const [isInstrumental, setIsInstrumental] = useState(false);
  const [lyricsLoading, setLyricsLoading] = useState(false);

  const trackId = currentTrack?.trackId || currentTrack?.id;
  const videoId = currentTrack?.videoId;
  const lyricsDuration = duration || currentTrack?.videoDuration || 0;
  const bgColor = trackDetails?.bgColor || currentTrack?.bgColor || null;
  const reviewId = trackDetails?.userInteractions?.reviewId || trackDetails?.logId || null;
  const reviewLogUrl = reviewId && userLogged?.username ? `/${userLogged.username}/log/${reviewId}` : undefined;
  const hasReviewed = !!reviewId || localRating > 0 || localLiked;
  const trackSlug = createTrackSlug(currentTrack?.name, currentTrack?.artists, trackId);

  useEffect(() => {
    if (trackDetails?.userInteractions) {
      setLocalRating(trackDetails.userInteractions.rating || 0);
      setLocalLiked(trackDetails.userInteractions.liked || false);
    } else {
      setLocalRating(0);
      setLocalLiked(false);
    }
  }, [trackDetails]);

  useEffect(() => {
    setTrackDetails(null);
    if (!trackId) return;
    let active = true;
    fetchTrack(trackId)
      .then((data) => {
        if (active) setTrackDetails(data);
      })
      .catch(() => { });
    return () => {
      active = false;
    };
  }, [trackId]);

  useEffect(() => {
    const overlay = overlayRef.current;
    if (!overlay) return;
    const isLight = theme === "light";
    const clampedBg = bgColor ? clampThemeBg(bgColor, isLight) : null;
    const colors = clampedBg ? getTheaterTextColors(clampedBg) : null;
    if (clampedBg) {
      overlay.style.setProperty("--theater-bg", clampedBg);
    } else {
      overlay.style.removeProperty("--theater-bg");
    }
    if (colors) {
      overlay.style.setProperty("--theater-text", colors.text);
      overlay.style.setProperty("--theater-sub", colors.secondary);
    } else {
      overlay.style.removeProperty("--theater-text");
      overlay.style.removeProperty("--theater-sub");
    }
  }, [bgColor, theme]);

  const videoSlotRef = useCallback((el) => {
    if (el) registerTheaterContainer(el);
    else unregisterTheaterContainer();
  }, [registerTheaterContainer, unregisterTheaterContainer]);

  useEffect(() => {
    setLyrics(null);
    setTranslatedLyrics(null);
    setTransliteratedLyrics(null);
    setIsSynced(false);
    setIsInstrumental(false);
    lyricsFetchRef.current = { trackId: null, duration: null, lang: null };
  }, [trackId]);

  useEffect(() => {
    if (!currentTrack || !trackId) return;
    const artists = Array.isArray(currentTrack.artists) ? currentTrack.artists.filter((a) => a && a.name) : [];
    const artistName = artists[0]?.name ||
      currentTrack.primaryArtist?.name ||
      (typeof currentTrack.artist === "object" ? currentTrack.artist?.name : currentTrack.artist) || "";
    const title = currentTrack.name || currentTrack.title || "";
    if (!artistName || !title) return;

    const currentLang = localStorage.getItem(LANG_KEY) || null;
    const prev = lyricsFetchRef.current;
    if (prev.trackId === trackId && prev.lang === currentLang && prev.duration === lyricsDuration && (lyrics !== null || lyricsLoading)) return;

    lyricsFetchRef.current = { trackId, duration: lyricsDuration, lang: currentLang };
    if (lyrics === null) setLyricsLoading(true);
    fetchTrackYouTubeLyrics(formatSlug(artistName), formatSlug(title), trackId, currentLang)
      .then((data) => {
        if (!data) {
          setLyrics("");
          setTranslatedLyrics(null);
          return;
        }
        const ly = data.lyrics;
        setLyrics(ly.lyrics);
        setTranslatedLyrics(ly.translatedLyrics || null);
        setTransliteratedLyrics(ly.transliteratedLyrics || null);
        setIsSynced(ly.isSynced);
        setIsInstrumental(ly.instrumental);
      })
      .catch(() => {
        setLyrics("");
        setTranslatedLyrics(null);
      })
      .finally(() => setLyricsLoading(false));
  }, [currentTrack, trackId, videoId, lyricsDuration]);

  useEffect(() => {
    if (!videoId) return;
    Promise.all(["1.jpg", "2.jpg", "3.jpg"].map((frame) =>
      extractDominantColor(`https://img.youtube.com/vi/${videoId}/${frame}`)
    )).then(setVideoColors);
  }, [videoId]);

  useEffect(() => {
    const layers = [glowARef.current, glowBRef.current];
    if (!layers[0] || !layers[1]) return;
    if (theme === "light") {
      layers[0].style.background = "none";
      layers[1].style.background = "none";
      return;
    }
    if (videoColors.length === 0) return;
    let color = videoColors[0];
    if (videoColors.length >= 2 && lyricsDuration) {
      const progress = Math.max(0, Math.min(currentTime / lyricsDuration, 1));
      const position = progress * (videoColors.length - 1);
      const index = Math.min(Math.floor(position), videoColors.length - 2);
      const t = position - index;
      const fromColor = videoColors[index];
      const toColor = videoColors[index + 1];
      if (Array.isArray(fromColor) && Array.isArray(toColor)) {
        color = lerpColor(fromColor, toColor, t);
      }
    }
    if (!Array.isArray(color)) return;
    const gradient = `radial-gradient(ellipse at 30% 25%, rgba(${color[0]}, ${color[1]}, ${color[2]}, 0.45) 0%, rgba(${color[0]}, ${color[1]}, ${color[2]}, 0.12) 40%, transparent 70%)`;
    if (glowVideoIdRef.current !== videoId) {
      glowVideoIdRef.current = videoId;
      const next = activeGlowRef.current === 0 ? 1 : 0;
      layers[next].style.background = gradient;
      layers[next].style.opacity = "1";
      layers[activeGlowRef.current].style.opacity = "0";
      activeGlowRef.current = next;
    } else {
      layers[activeGlowRef.current].style.background = gradient;
    }
  }, [currentTime, lyricsDuration, videoColors, theme, videoId]);

  const handleClose = useCallback(() => {
    unregisterTheaterContainer();
    setIsClosing(true);
    setTimeout(() => closeTheaterMode(), 250);
  }, [closeTheaterMode, unregisterTheaterContainer]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") handleClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleClose]);

  if (!currentTrack) return null;

  const videoSlot = (
    <div className={styles.videoColumn}>
      <div className={styles.slotActions}>
        <Tooltip text="Close" position="bottom">
          <button className={styles.iconButton} onClick={handleClose} aria-label="Close theater mode">
            <X size={18} />
          </button>
        </Tooltip>
      </div>
      <div ref={videoSlotRef} className={`${styles.videoSlot} ${showQueue ? "" : styles.videoSlotInline}`}>
        <div className={styles.slotVideoArea} />
      </div>
      <TheaterControls inline={!showQueue} />
    </div>
  );

  return (
    <div ref={overlayRef} className={`${styles.overlay} ${isClosing ? styles.closing : ""}`}>
      <div className={styles.ambientGlow}>
        <div ref={glowARef} className={styles.glowLayer} />
        <div ref={glowBRef} className={styles.glowLayer} />
      </div>

      <div className={`${styles.content} ${showQueue ? "" : styles.contentNoSide}`}>
        <div className={styles.coverColumn}>
          <div className={styles.coverInner}>
            <div key={trackId} className={styles.giantCover}>
              <Image
                src={getTrackCover(currentTrack)}
                alt={currentTrack?.name}
                fallbackVariant="cover"
                className={styles.giantCoverImage}
              />
            </div>
            <div
              className={styles.trackMeta}
              onClickCapture={(e) => {
                if (e.target.closest("a")) handleClose();
              }}
            >
              <TrackAlbumTitle
                title={currentTrack?.name}
                to={trackSlug}
                state={{ trackId }}
                className={styles.trackTitle}
                hero
                heroMaxLines={2}
                fontSize="1.75rem"
                minFontSize="1.25rem"
                onClick={handleClose}
                rating={hasReviewed ? localRating : undefined}
                liked={hasReviewed ? localLiked : undefined}
                logUrl={reviewLogUrl}
                tagSize="0.8rem"
                trailing={!hasReviewed ? (
                  <button
                    type="button"
                    className={styles.reviewTagButton}
                    onClick={() => setShowReviewModal(true)}
                  >
                    Review
                  </button>
                ) : undefined}
              />
              <ArtistList
                artists={currentTrack.artists || []}
                className={styles.metaArtist}
                maxVisible={3}
              />
            </div>
          </div>
        </div>

        <section className={styles.infoColumn}>
          <div className={styles.tabs}>
            <ToggleSlide
              options={TABS}
              value={activeTab}
              onChange={setActiveTab}
              ariaLabel="Theater panel"
              className={styles.glassToggle}
            />
          </div>

          {!showQueue && videoSlot}

          {activeTab === "lyrics" && (
            <div className={styles.lyricsPanel}>
              <LyricsSection
                theater
                track={currentTrack}
                currentTime={currentTime}
                lyrics={lyrics}
                initialTranslatedLyrics={translatedLyrics}
                transliteratedLyrics={transliteratedLyrics}
                isSynced={isSynced}
                lyricsLoading={lyricsLoading}
                isInstrumental={isInstrumental}
                onLyricClick={seekTo}
                duration={lyricsDuration}
                videoId={videoId}
              />
            </div>
          )}
          {activeTab === "similar" && (
            <div className={styles.scrollPanel}>
              <SimilarTracks onNavigate={handleClose} />
            </div>
          )}
          {activeTab === "credits" && (
            <div className={styles.scrollPanel}>
              <Credits track={currentTrack} onNavigate={handleClose} />
            </div>
          )}
        </section>

        {showQueue && (
          <aside className={styles.sideColumn}>
            {videoSlot}

            <div className={styles.queuePanel}>
              <div className={styles.queueHeaderRow}>
                <span className={styles.queueHeader}>Queue</span>
              </div>
              <div className={styles.scrollPanel}>
                <Queue />
              </div>
            </div>
          </aside>
        )}
      </div>

      {showReviewModal && (
        <TrackReviewModal
          trackId={trackId}
          reviewId={reviewId || undefined}
          onClose={() => setShowReviewModal(false)}
        />
      )}
    </div>
  );
};

export default Theater;
