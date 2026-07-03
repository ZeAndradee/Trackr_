import React, {
  useState,
  useEffect,
  forwardRef,
  useRef,
  useCallback,
} from "react";
import { createPortal } from "react-dom";
import style from "./FloatLog.module.css";
import { searchAll } from "../../../services/HandleSearch";
import FloatLogItem from "./FloatLogItem/FloatLogItem";
import useScrollLock from "../../../hooks/useScrollLock";
import { TextInput } from "../../Utils/Inputs/Inputs";
import { FiSearch } from "react-icons/fi";

const FloatLog = forwardRef(({ onClose, onTrackSelect }, ref) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [debounceTimeout, setDebounceTimeout] = useState(null);
  const [tracksResults, setTracksResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const inputRef = useRef();
  const resultsRef = useRef();

  useScrollLock();

  const handleSearch = useCallback(async (query, pageToLoad = 1) => {
    if (!query.trim()) {
      setTracksResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await searchAll(query, {
        type: "track",
        page: pageToLoad,
        limit: 20,
      });
      const tracks = response?.tracks || [];

      setTracksResults((prev) =>
        pageToLoad === 1 ? tracks : [...prev, ...tracks]
      );
      setHasMore(tracks.length === 20);
    } catch (error) {
      console.error("Search error:", error);
      if (pageToLoad === 1) setTracksResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleInputChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    setPage(1);
    setHasMore(true);

    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }

    const newTimeout = setTimeout(() => {
      handleSearch(query, 1);
    }, 300);

    setDebounceTimeout(newTimeout);
  };

  const handleScroll = useCallback(() => {
    if (resultsRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = resultsRef.current;
      if (
        scrollTop + clientHeight >= scrollHeight - 50 &&
        !isLoading &&
        hasMore
      ) {
        const nextPage = page + 1;
        setPage(nextPage);
        handleSearch(searchQuery, nextPage);
      }
    }
  }, [isLoading, hasMore, page, searchQuery, handleSearch]);

  useEffect(() => {
    const resultsElement = resultsRef.current;
    if (resultsElement) {
      resultsElement.addEventListener("scroll", handleScroll);
    }
    return () => {
      if (resultsElement) {
        resultsElement.removeEventListener("scroll", handleScroll);
      }
    };
  }, [handleScroll]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }

    const handleLogCreated = (event) => {
      if (searchQuery.trim()) {
        handleSearch(searchQuery, 1);
      }
    };

    window.addEventListener("logCreated", handleLogCreated);

    return () => {
      window.removeEventListener("logCreated", handleLogCreated);
      if (debounceTimeout) {
        clearTimeout(debounceTimeout);
      }
    };
  }, [searchQuery, debounceTimeout, handleSearch]);

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const floatLogContent = (
    <div className={style.floatLogContainer} onClick={handleOverlayClick}>
      <div className={style.logContainer} ref={ref}>
        <div className={style.headerSection}>
          <h2>Review a Track</h2>
          <p className={style.subtitle}>Find a track to add to your reviews</p>
          <button
            className={style.closeButton}
            onClick={handleClose}
            aria-label="Close search"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M18 6L6 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M6 6L18 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        <div className={style.searchSection}>
          <div className={style.searchBar}>
            <TextInput
              type="text"
              icon={<FiSearch />}
              clearable
              onClear={() => {
                setSearchQuery("");
                setTracksResults([]);
                setPage(1);
                setHasMore(true);
                if (inputRef.current) {
                  inputRef.current.focus();
                }
              }}
              value={searchQuery}
              onChange={handleInputChange}
              placeholder="Search for tracks, artists, or albums"
              ref={inputRef}
            />
          </div>
        </div>

        <div className={style.resultsSection} ref={resultsRef}>
          {searchQuery && tracksResults.length === 0 && !isLoading ? (
            <div className={style.emptyState}>
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M9 18V5L21 3V16"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M6 21C7.65685 21 9 19.6569 9 18C9 16.3431 7.65685 15 6 15C4.34315 15 3 16.3431 3 18C3 19.6569 4.34315 21 6 21Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M18 19C19.6569 19 21 17.6569 21 16C21 14.3431 19.6569 13 18 13C16.3431 13 15 14.3431 15 16C15 17.6569 16.3431 19 18 19Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <p>No tracks found. Try a different search term.</p>
            </div>
          ) : (
            <div className={style.searchResults}>
              {tracksResults.map((track, index) => (
                <FloatLogItem
                  key={`${track.id}-${index}`}
                  track={track}
                  onItemClick={handleClose}
                  onTrackSelect={onTrackSelect}
                />
              ))}
              {isLoading && (
                <div className={style.loadingState}>
                  <div className={style.spinner}></div>
                  <p>Searching tracks...</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(floatLogContent, document.body);
});

export default FloatLog;
