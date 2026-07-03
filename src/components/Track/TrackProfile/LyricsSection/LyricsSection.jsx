import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import useLyrics from "../../../../hooks/useLyrics";
import { fetchTrackYouTubeLyrics } from "../../../../services/FetchTrack";
import { formatSlug } from "../../../../utils/formatters/textFormatters";
import { TbMicrophone2, TbLanguage, TbAlphabetLatin, TbTextSize, TbEqual } from "react-icons/tb";
import { VolumeX, Glasses, Minus, Plus, Settings, Fullscreen } from "lucide-react";
import { FiCheck } from "react-icons/fi";
import { BsThreeDotsVertical, BsThreeDots } from "react-icons/bs";
import { Tooltip } from "../../../Utils/Tooltip/Tooltip";
import SectionHeader from "../../../Utils/SectionHeader/SectionHeader";
import styles from "./LyricsSection.module.css";
import LyricsSkeleton from "../../../Utils/Skeletons/LyricsSkeleton";
import useClickOutside from "../../../../hooks/useClickOutside";
import Flag from "../../../Utils/Flag/Flag";

const LANG_KEY = "trackr_lyrics_translate_lang";
const TRANSLIT_KEY = "trackr_lyrics_transliterate";
const LYRICS_SIZE_KEY = "trackr_lyrics_size";
const LYRICS_UNIFORM_KEY = "trackr_lyrics_uniform";
const SIZE_STEPS = [0.8, 0.9, 1.0, 1.1, 1.2, 1.3, 1.4];

const LANGUAGES = [
  { code: "BG", label: "Bulgarian", country: "BG" },
  { code: "CS", label: "Czech", country: "CZ" },
  { code: "DA", label: "Danish", country: "DK" },
  { code: "DE", label: "German", country: "DE" },
  { code: "EL", label: "Greek", country: "GR" },
  { code: "EN-GB", label: "English (British)", country: "GB" },
  { code: "EN-US", label: "English (American)", country: "US" },
  { code: "ES", label: "Spanish", country: "ES" },
  { code: "ET", label: "Estonian", country: "EE" },
  { code: "FI", label: "Finnish", country: "FI" },
  { code: "FR", label: "French", country: "FR" },
  { code: "HU", label: "Hungarian", country: "HU" },
  { code: "ID", label: "Indonesian", country: "ID" },
  { code: "IT", label: "Italian", country: "IT" },
  { code: "JA", label: "Japanese", country: "JP" },
  { code: "KO", label: "Korean", country: "KR" },
  { code: "LT", label: "Lithuanian", country: "LT" },
  { code: "LV", label: "Latvian", country: "LV" },
  { code: "NB", label: "Norwegian", country: "NO" },
  { code: "NL", label: "Dutch", country: "NL" },
  { code: "PL", label: "Polish", country: "PL" },
  { code: "PT-BR", label: "Portuguese (Brazil)", country: "BR" },
  { code: "PT-PT", label: "Portuguese (Portugal)", country: "PT" },
  { code: "RO", label: "Romanian", country: "RO" },
  { code: "RU", label: "Russian", country: "RU" },
  { code: "SK", label: "Slovak", country: "SK" },
  { code: "SL", label: "Slovenian", country: "SI" },
  { code: "SV", label: "Swedish", country: "SE" },
  { code: "TR", label: "Turkish", country: "TR" },
  { code: "UK", label: "Ukrainian", country: "UA" },
  { code: "ZH", label: "Chinese (simplified)", country: "CN" },
];

const NO_LYRICS_MESSAGES = [
  "The lyrics went to get milk... still waiting.",
  "Lyrics? In this economy?",
  "The artist wrote the lyrics in invisible ink. Very avant-garde.",
  "Plot twist: the real lyrics were the friends we made along the way.",
  "These lyrics are on a need-to-know basis. And apparently, we don't need to know.",
];

const INSTRUMENTAL_MESSAGES = [
  "This one's instrumental \u2014 let the music do the talking.",
  "No words needed. Just vibes.",
  "The instruments called a meeting and voted the vocals out.",
  "Who needs lyrics when the melody slaps this hard?",
  "Words would only slow this one down.",
];

const LyricsSection = ({
  track,
  currentTime,
  lyrics,
  initialTranslatedLyrics,
  transliteratedLyrics,
  lyricsLoading,
  isInstrumental,
  isSynced,
  onLyricClick,
  onTheaterMode,
  theater,
  duration,
  videoId,
}) => {
  const [selectedLang, setSelectedLang] = useState(() => localStorage.getItem(LANG_KEY) || null);
  const [localTranslatedLyrics, setLocalTranslatedLyrics] = useState(null);
  const [translating, setTranslating] = useState(false);
  const [showTransliterated, setShowTransliterated] = useState(
    () => JSON.parse(localStorage.getItem(TRANSLIT_KEY) || "false")
  );
  const [userScrolled, setUserScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [langExpanded, setLangExpanded] = useState(false);
  const [lyricsSize, setLyricsSize] = useState(
    () => parseFloat(localStorage.getItem(LYRICS_SIZE_KEY)) || 1.0
  );
  const [uniformSize, setUniformSize] = useState(
    () => JSON.parse(localStorage.getItem(LYRICS_UNIFORM_KEY) || "false")
  );
  const [isStuck, setIsStuck] = useState(false);

  const containerRef = useRef(null);
  const scrollRef = useRef(null);
  const sentinelRef = useRef(null);
  const menuRef = useRef(null);
  const isAutoScrolling = useRef(false);
  const scrollTimeout = useRef(null);

  useClickOutside(menuRef, () => {
    setMenuOpen(false);
    setLangExpanded(false);
  });

  useEffect(() => {
    setLocalTranslatedLyrics(initialTranslatedLyrics);
  }, [initialTranslatedLyrics]);

  const translatedLyrics = localTranslatedLyrics;

  const { parsedLyrics, romanizedLines, translatedLines, activeIndex } = useLyrics({
    lyrics,
    transliteratedLyrics,
    translatedLyrics,
    selectedLang,
    currentTime,
  });

  const scrollToActive = useCallback((behavior = "smooth") => {
    if (activeIndex === -1 || !containerRef.current) return;
    const activeElement = containerRef.current.children[activeIndex];
    if (!activeElement) return;

    if (theater && scrollRef.current) {
      const sc = scrollRef.current;
      const containerRect = sc.getBoundingClientRect();
      const activeRect = activeElement.getBoundingClientRect();
      const relativeTop = activeRect.top - containerRect.top + sc.scrollTop;
      const newScrollTop = relativeTop - sc.clientHeight / 2 + activeElement.clientHeight / 2;
      isAutoScrolling.current = true;
      sc.scrollTo({ top: newScrollTop, behavior });
    } else {
      const container = containerRef.current;
      const newScrollTop = activeElement.offsetTop - container.clientHeight / 2 + activeElement.clientHeight / 2;
      isAutoScrolling.current = true;
      container.scrollTo({ top: newScrollTop, behavior });
    }

    clearTimeout(scrollTimeout.current);
    scrollTimeout.current = setTimeout(() => {
      isAutoScrolling.current = false;
    }, 500);
  }, [activeIndex, theater]);

  useEffect(() => {
    if (!userScrolled) scrollToActive();
  }, [activeIndex, userScrolled, scrollToActive]);

  useEffect(() => {
    const sc = theater ? scrollRef.current : containerRef.current;
    if (!sc) return;
    const handleScroll = () => {
      if (!isAutoScrolling.current) setUserScrolled(true);
    };
    sc.addEventListener("scroll", handleScroll);
    return () => sc.removeEventListener("scroll", handleScroll);
  }, [theater]);

  useEffect(() => {
    if (!theater || !sentinelRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsStuck(!entry.isIntersecting),
      { root: scrollRef.current, threshold: 0 }
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [theater]);

  const handleSyncClick = useCallback(() => {
    setUserScrolled(false);
    scrollToActive("smooth");
  }, [scrollToActive]);

  const handleTransliterateToggle = () => {
    if (!transliteratedLyrics) return;
    const next = !showTransliterated;
    setShowTransliterated(next);
    localStorage.setItem(TRANSLIT_KEY, JSON.stringify(next));
  };

  const handleSizeChange = (delta) => {
    const currentIdx = SIZE_STEPS.indexOf(lyricsSize);
    const idx = currentIdx === -1 ? SIZE_STEPS.indexOf(1.0) : currentIdx;
    const newIdx = Math.max(0, Math.min(SIZE_STEPS.length - 1, idx + delta));
    const newSize = SIZE_STEPS[newIdx];
    setLyricsSize(newSize);
    localStorage.setItem(LYRICS_SIZE_KEY, newSize.toString());
  };

  const handleUniformToggle = () => {
    const next = !uniformSize;
    setUniformSize(next);
    localStorage.setItem(LYRICS_UNIFORM_KEY, JSON.stringify(next));
  };

  const handleLangSelect = (code) => {
    if (code === null) {
      setSelectedLang(null);
      localStorage.removeItem(LANG_KEY);
      setLocalTranslatedLyrics(null);
    } else {
      setSelectedLang(code);
      localStorage.setItem(LANG_KEY, code);
      const artistName = track?.primaryArtist?.name || track?.artists?.[0]?.name || track?.artistName;
      const trackId = track?.id || track?.trackId;
      if (artistName && track?.name && trackId) {
        setLocalTranslatedLyrics(null);
        setTranslating(true);
        fetchTrackYouTubeLyrics(
          formatSlug(artistName),
          formatSlug(track.name),
          trackId,
          code
        )
          .then((data) => {
            setLocalTranslatedLyrics(data?.lyrics?.translatedLyrics || null);
          })
          .catch(() => setLocalTranslatedLyrics(null))
          .finally(() => setTranslating(false));
      }
    }
  };

  const cleanLyrics = (text) => {
    if (typeof text !== "string") return "";
    return text
      .replace(/\[\d{2}:\d{2}\.\d{2}\] /g, "")
      .replace(/\[\d{2}:\d{2}\.\d{2}\]/g, "");
  };

  const isLoading = lyricsLoading || translating || (lyrics === null && !!track);
  const lyricsEmpty = !lyricsLoading && lyrics === "";
  const lyricsReady =
    !isLoading &&
    !lyricsEmpty &&
    (parsedLyrics?.length > 0 ||
      (typeof lyrics === "string" && lyrics.trim().length > 0));

  const noLyricsMessage = useMemo(() => {
    const pool = isInstrumental ? INSTRUMENTAL_MESSAGES : NO_LYRICS_MESSAGES;
    return pool[Math.floor(Math.random() * pool.length)];
  }, [isInstrumental]);

  const selectedLangData = selectedLang
    ? LANGUAGES.find((l) => l.code === selectedLang)
    : null;

  const renderLyricsLine = (lineText, index) => {
    const hasTranslation = translatedLines && translatedLines[index];
    const hasRomanized = showTransliterated && romanizedLines && romanizedLines[index];

    if (hasTranslation && hasRomanized) return (
      <>
        <span className={styles.primaryText}>{translatedLines[index]}</span>
        <span className={styles.secondaryText}>{romanizedLines[index]}</span>
        <span className={styles.secondaryText}>{lineText}</span>
      </>
    );
    if (hasTranslation) return (
      <>
        <span className={styles.primaryText}>{translatedLines[index]}</span>
        <span className={styles.secondaryText}>{lineText}</span>
      </>
    );
    if (hasRomanized) return (
      <>
        <span className={styles.primaryText}>{romanizedLines[index]}</span>
        <span className={styles.secondaryText}>{lineText}</span>
      </>
    );
    return lineText;
  };

  const renderLyricsContent = (isTheater) => {
    const lineClass = isTheater ? styles.theaterLyricLine : styles.lyricLine;
    const plainLineClass = `${lineClass} ${isTheater ? styles.theaterPlainLine : styles.plainLine}`;
    const activeClass = isTheater ? styles.theaterActiveLine : styles.activeLine;
    const pastClass = isTheater ? styles.theaterPastLine : styles.pastLine;

    if (isLoading) return <LyricsSkeleton variant={isTheater ? "theater" : undefined} />;

    if (lyricsEmpty) return (
      <div className={isTheater ? styles.theaterNoLyrics : styles.noLyrics}>
        <span className={isTheater ? styles.theaterNoLyricsIcon : styles.noLyricsIcon}>
          {isInstrumental ? <VolumeX size={isTheater ? 40 : 28} /> : <Glasses size={isTheater ? 40 : 28} />}
        </span>
        <span className={isTheater ? styles.theaterNoLyricsText : styles.noLyricsText}>
          {noLyricsMessage}
        </span>
      </div>
    );

    if (parsedLyrics) {
      return parsedLyrics.map((line, index) => (
        <div
          key={index}
          className={`${lineClass} ${
            index === activeIndex ? activeClass : index < activeIndex ? pastClass : ""
          }`}
          onClick={() => {
            setUserScrolled(false);
            onLyricClick && onLyricClick(line.time);
          }}
        >
          {renderLyricsLine(line.text, index)}
        </div>
      ));
    }

    return cleanLyrics(lyrics)
      .split("\n")
      .map((line, index) => {
        const hasTranslation = translatedLines && translatedLines[index];
        const hasRomanized = showTransliterated && romanizedLines && romanizedLines[index];
        if (!line.trim() && !hasTranslation && !hasRomanized) {
          return <div key={index} className={plainLineClass}>&nbsp;</div>;
        }
        return (
          <div key={index} className={plainLineClass}>
            {renderLyricsLine(line, index)}
          </div>
        );
      });
  };

  const optionsMenu = menuOpen && (
    <div className={styles.menu}>
      <button
        className={`${styles.menuItem} ${!transliteratedLyrics ? styles.menuItemDisabled : ""}`}
        onClick={handleTransliterateToggle}
      >
        <TbAlphabetLatin size={16} className={styles.menuIcon} />
        <span className={styles.menuLabel}>
          Romanized{!transliteratedLyrics ? " (Not available)" : ""}
        </span>
        <label className={styles.switch} onClick={(e) => e.preventDefault()}>
          <input type="checkbox" checked={showTransliterated && !!transliteratedLyrics} readOnly />
          <span className={styles.slider} />
        </label>
      </button>
      <button
        className={styles.menuItem}
        onClick={() => setLangExpanded((prev) => !prev)}
      >
        {selectedLangData ? (
          <Flag
            country={selectedLangData.country}
            className={styles.menuFlag}
            showTooltip={false}
          />
        ) : (
          <TbLanguage size={16} className={styles.menuIcon} />
        )}
        <span className={styles.menuLabel}>
          Translate{selectedLangData ? `: ${selectedLangData.label}` : ""}
        </span>
        <span className={`${styles.chevron} ${langExpanded ? styles.chevronUp : ""}`}>›</span>
      </button>
      {langExpanded && (
        <div className={styles.langList}>
          <button
            className={`${styles.langOption} ${!selectedLang ? styles.langOptionActive : ""}`}
            onClick={() => handleLangSelect(null)}
          >
            <span className={styles.langLabel}>No translation</span>
            {!selectedLang && <FiCheck size={14} />}
          </button>
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              className={`${styles.langOption} ${selectedLang === lang.code ? styles.langOptionActive : ""}`}
              onClick={() => handleLangSelect(lang.code)}
            >
              <Flag country={lang.country} className={styles.langFlag} showTooltip={false} />
              <span className={styles.langLabel}>{lang.label}</span>
              {selectedLang === lang.code && <FiCheck size={14} />}
            </button>
          ))}
        </div>
      )}
      <div className={styles.menuSeparator} />
      <div className={styles.menuItem} style={{ cursor: "default" }}>
        <TbTextSize size={16} className={styles.menuIcon} />
        <span className={styles.menuLabel}>Font size</span>
        <div className={styles.sizeControl}>
          <button
            className={styles.sizeButton}
            onClick={(e) => { e.stopPropagation(); handleSizeChange(-1); }}
            disabled={lyricsSize <= SIZE_STEPS[0]}
          >
            <Minus size={12} />
          </button>
          <span className={styles.sizeValue}>{Math.round(lyricsSize * 100)}%</span>
          <button
            className={styles.sizeButton}
            onClick={(e) => { e.stopPropagation(); handleSizeChange(1); }}
            disabled={lyricsSize >= SIZE_STEPS[SIZE_STEPS.length - 1]}
          >
            <Plus size={12} />
          </button>
        </div>
      </div>
      <button className={styles.menuItem} onClick={handleUniformToggle}>
        <TbEqual size={16} className={styles.menuIcon} />
        <span className={styles.menuLabel}>Uniform size</span>
        <label className={styles.switch} onClick={(e) => e.preventDefault()}>
          <input type="checkbox" checked={uniformSize} readOnly />
          <span className={styles.slider} />
        </label>
      </button>
    </div>
  );

  if (theater) {
    return (
      <div className={styles.theaterColumn} ref={scrollRef}>
        <div className={styles.theaterInner}>
          <div
            className={`${styles.theaterContainer} ${uniformSize ? styles.uniformSize : ""}`}
            ref={containerRef}
            style={{ "--lyrics-scale": lyricsSize }}
          >
            {renderLyricsContent(true)}
          </div>
          {userScrolled && parsedLyrics && (
            <button className={styles.theaterSyncButton} onClick={handleSyncClick}>
              <TbMicrophone2 size={18} />
              Sync lyrics
            </button>
          )}
        </div>
      </div>
    );
  }

  if (!track) return null;

  const canFetch = track.artists?.[0]?.name && track.name;
  if (!canFetch && !track.lyrics && !isLoading && !lyricsEmpty) return null;

  return (
    <div className={styles.container}>
      <SectionHeader
        title={
          <div className={styles.headerTitle}>
            Lyrics
            {onTheaterMode && videoId && lyricsReady && (
              <Tooltip text="Theater Mode">
                <button className={styles.headerButton} onClick={onTheaterMode}>
                  <Fullscreen size={16} />
                </button>
              </Tooltip>
            )}
          </div>
        }
        action={
          <div className={styles.menuWrapper} ref={menuRef}>
            <Tooltip text="Options">
              <button
                className={styles.headerButton}
                onClick={() => {
                  setMenuOpen((prev) => !prev);
                  setLangExpanded(false);
                }}
              >
                <Settings size={16} />
              </button>
            </Tooltip>
            {optionsMenu}
          </div>
        }
      />
      <div className={styles.lyricsSidebarWrapper}>
        <div
          className={`${styles.lyricsSidebarContainer} ${uniformSize ? styles.uniformSize : ""}`}
          ref={containerRef}
          style={{ "--lyrics-scale": lyricsSize }}
        >
          {renderLyricsContent(false)}
        </div>
        {userScrolled && parsedLyrics && (
          <button className={styles.syncButton} onClick={handleSyncClick}>
            <TbMicrophone2 size={15} />
            Sync lyrics
          </button>
        )}
      </div>
    </div>
  );
};

export default LyricsSection;
