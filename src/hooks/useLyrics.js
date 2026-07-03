import { useMemo } from "react";

const parseSyncedLyrics = (raw) => {
  if (!raw || typeof raw !== "string") return null;
  const lines = raw.split("\n");
  const parsed = [];
  const timeRegex = /\[(\d{2}):(\d{2}\.?\d*)\](.*)/;
  let hasTimestamps = false;
  lines.forEach((line) => {
    const match = line.match(timeRegex);
    if (match) {
      hasTimestamps = true;
      const minutes = parseInt(match[1], 10);
      const seconds = parseFloat(match[2]);
      const text = match[3].trim();
      if (text) parsed.push({ time: minutes * 60 + seconds, text });
    }
  });
  if (!hasTimestamps) return null;
  return parsed;
};

const useLyrics = ({ lyrics, transliteratedLyrics, translatedLyrics, selectedLang, currentTime }) => {
  const parsedLyrics = useMemo(() => parseSyncedLyrics(lyrics), [lyrics]);

  const romanizedLines = useMemo(() => {
    if (!transliteratedLyrics) return null;
    const parsed = parseSyncedLyrics(transliteratedLyrics);
    if (parsed) return parsed.map((l) => l.text);
    return transliteratedLyrics.split("\n").filter((l) => l.trim());
  }, [transliteratedLyrics]);

  const translatedLines = useMemo(() => {
    if (!translatedLyrics || !selectedLang) return null;
    return translatedLyrics.replace(/\n{2,}/g, "\n").split("\n");
  }, [translatedLyrics, selectedLang]);

  const activeIndex = useMemo(() => {
    if (!parsedLyrics) return -1;
    let active = -1;
    for (let i = 0; i < parsedLyrics.length; i++) {
      if (parsedLyrics[i].time <= currentTime) active = i;
      else break;
    }
    return active;
  }, [parsedLyrics, currentTime]);

  return { parsedLyrics, romanizedLines, translatedLines, activeIndex };
};

export default useLyrics;
