import React, { useState, useEffect, useRef, useCallback } from "react";
import ReactDOM from "react-dom";
import { searchGifs, fetchTrendingGifs } from "../../../services/gifService.jsx";
import classes from "./GifPicker.module.css";
import { TextInput } from "../../Utils/Inputs/Inputs";

const useDebounce = (value, delay) => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
};

const PICKER_WIDTH = 340;
const GAP = 20;
const PER_PAGE = 24;

const GifPicker = ({ onSelect, onClose, anchorRef, buttonRef, placement }) => {
  const [query, setQuery] = useState("");
  const [gifs, setGifs] = useState([]);
  const [status, setStatus] = useState("loading");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const panelRef = useRef(null);
  const inputRef = useRef(null);
  const scrollRef = useRef(null);
  const debouncedQuery = useDebounce(query, 300);
  const [posStyle, setPosStyle] = useState({});

  const updatePosition = useCallback(() => {
    if (placement === "above-left") {
      if (!buttonRef?.current) return;
      const btnRect = buttonRef.current.getBoundingClientRect();
      setPosStyle({
        position: "fixed",
        bottom: `${window.innerHeight - btnRect.bottom}px`,
        left: `${btnRect.left - PICKER_WIDTH - GAP}px`,
        top: "auto",
        width: `${PICKER_WIDTH}px`,
      });
      return;
    }

    if (placement === "above-right") {
      if (!buttonRef?.current) return;
      const btnRect = buttonRef.current.getBoundingClientRect();
      setPosStyle({
        position: "fixed",
        bottom: `${window.innerHeight - btnRect.bottom}px`,
        left: `${btnRect.right + GAP}px`,
        top: "auto",
        width: `${PICKER_WIDTH}px`,
      });
      return;
    }

    if (!anchorRef?.current) return;
    const cardRect = anchorRef.current.getBoundingClientRect();
    const shiftedRight = cardRect.right - 180;
    const spaceRight = window.innerWidth - shiftedRight;

    if (spaceRight >= PICKER_WIDTH + GAP + 16) {
      setPosStyle({
        position: "fixed",
        top: `${cardRect.top}px`,
        left: `${shiftedRight + GAP}px`,
        bottom: "auto",
        width: `${PICKER_WIDTH}px`,
      });
    } else if (buttonRef?.current) {
      const btnRect = buttonRef.current.getBoundingClientRect();
      setPosStyle({
        position: "fixed",
        bottom: `${window.innerHeight - btnRect.top + 8}px`,
        left: `${btnRect.left}px`,
        top: "auto",
        width: `${Math.min(cardRect.width, PICKER_WIDTH)}px`,
      });
    }
  }, [anchorRef, buttonRef, placement]);

  useEffect(() => {
    updatePosition();
    window.addEventListener("resize", updatePosition);

    const handleScroll = (e) => {
      if (panelRef.current && panelRef.current.contains(e.target)) return;
      updatePosition();
    };
    window.addEventListener("scroll", handleScroll, true);

    let observer;
    if (anchorRef?.current) {
      observer = new ResizeObserver(updatePosition);
      observer.observe(anchorRef.current);
    }

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", handleScroll, true);
      if (observer) observer.disconnect();
    };
  }, [updatePosition]);

  useEffect(() => {
    inputRef.current?.focus({ preventScroll: true });
  }, []);

  useEffect(() => {
    setStatus("loading");
    setPage(1);
    fetchTrendingGifs(PER_PAGE, 1)
      .then(({ gifs: results, hasNext }) => {
        setGifs(results);
        setHasMore(hasNext);
        setStatus(results.length === 0 ? "empty" : "results");
      })
      .catch(() => setStatus("error"));
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        if (buttonRef?.current && buttonRef.current.contains(e.target)) return;
        onClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    const timer = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
    }, 100);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  useEffect(() => {
    setPage(1);

    if (!debouncedQuery.trim()) {
      setStatus("loading");
      fetchTrendingGifs(PER_PAGE, 1)
        .then(({ gifs: results, hasNext }) => {
          setGifs(results);
          setHasMore(hasNext);
          setStatus(results.length === 0 ? "empty" : "results");
        })
        .catch(() => setStatus("error"));
      return;
    }

    let cancelled = false;
    setStatus("loading");

    searchGifs(debouncedQuery, PER_PAGE, 1)
      .then(({ gifs: results, hasNext }) => {
        if (cancelled) return;
        setGifs(results);
        setHasMore(hasNext);
        setStatus(results.length === 0 ? "empty" : "results");
      })
      .catch(() => {
        if (cancelled) return;
        setStatus("error");
      });

    return () => { cancelled = true; };
  }, [debouncedQuery]);

  const loadMore = useCallback(() => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    const nextPage = page + 1;

    const fetchFn = debouncedQuery.trim()
      ? searchGifs(debouncedQuery, PER_PAGE, nextPage)
      : fetchTrendingGifs(PER_PAGE, nextPage);

    fetchFn
      .then(({ gifs: results, hasNext }) => {
        setGifs((prev) => [...prev, ...results]);
        setPage(nextPage);
        setHasMore(hasNext);
      })
      .catch(() => { })
      .finally(() => setIsLoadingMore(false));
  }, [isLoadingMore, hasMore, page, debouncedQuery]);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    if (el.scrollHeight - el.scrollTop - el.clientHeight < 200) {
      loadMore();
    }
  }, [loadMore]);

  const leftGifs = gifs.filter((_, i) => i % 2 === 0);
  const rightGifs = gifs.filter((_, i) => i % 2 !== 0);

  const panel = (
    <div
      ref={panelRef}
      className={classes.pickerPanel}
      style={posStyle}
      onClick={(e) => e.stopPropagation()}
    >
      <div className={classes.searchBar}>
        <TextInput
          ref={inputRef}
          type="text"
          clearable
          placeholder="Search on KLIPY..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {status === "loading" && (
        <div className={classes.statusMessage}>Loading...</div>
      )}
      {status === "empty" && (
        <div className={classes.statusMessage}>No GIFs found</div>
      )}
      {status === "error" && (
        <div className={classes.statusMessage}>Couldn't load GIFs</div>
      )}
      {status === "results" && (
        <div ref={scrollRef} className={classes.gifGridScroll} onScroll={handleScroll}>
          <div className={classes.gifGrid}>
            <div className={classes.gifCol}>
              {leftGifs.map((gif) => (
                <button
                  key={gif.id}
                  className={classes.gifItem}
                  onClick={() => onSelect(gif)}
                  type="button"
                  aria-label="Select GIF"
                >
                  <img
                    src={gif.preview}
                    alt=""
                    className={classes.gifThumb}
                    loading="lazy"
                    onError={(e) => { e.target.style.display = "none"; }}
                  />
                </button>
              ))}
            </div>
            <div className={classes.gifCol}>
              {rightGifs.map((gif) => (
                <button
                  key={gif.id}
                  className={classes.gifItem}
                  onClick={() => onSelect(gif)}
                  type="button"
                  aria-label="Select GIF"
                >
                  <img
                    src={gif.preview}
                    alt=""
                    className={classes.gifThumb}
                    loading="lazy"
                    onError={(e) => { e.target.style.display = "none"; }}
                  />
                </button>
              ))}
            </div>
          </div>
          {isLoadingMore && (
            <div className={classes.loadingMore}>Loading...</div>
          )}
        </div>
      )}

      <div className={classes.poweredBy}>
        <img
          src="/images/Powered By KLIPY Horizontal -Yellow&Black Logo.svg"
          alt="Powered by Klipy"
          className={classes.poweredByLogo}
        />
      </div>
    </div>
  );

  return ReactDOM.createPortal(panel, document.body);
};

export default GifPicker;
