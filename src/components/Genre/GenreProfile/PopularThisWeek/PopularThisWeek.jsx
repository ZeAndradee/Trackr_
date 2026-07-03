import React, { useEffect, useRef, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";
import gsap from "gsap";
import Image from "../../../Utils/Images/Image/Image";
import { getTrackCover } from "../../../Utils/Formater/Track";
import TrackCardRow from "../../../Utils/TrackCardRow/TrackCardRow";
import ArtistList from "../../../Utils/ArtistList/ArtistList";
import { fetchGenrePopularTracks } from "../../../../services/Genre/FetchGenre";
import { createTrackSlug } from "../../../../utils/formatters/textFormatters";
import { Tooltip } from "../../../Utils/Tooltip/Tooltip";
import ToggleSlide from "../../../Utils/Toggle/ToggleSlide";
import styles from "./PopularThisWeek.module.css";

const ITEMS_PER_PAGE = 5;

const RANGE_OPTIONS = [
  { key: "week", label: "Week" },
  { key: "month", label: "Month" },
  { key: "year", label: "Year" },
];

const TITLES = {
  week: "Popular This Week",
  month: "Popular This Month",
  year: "Popular This Year",
};

const PopularThisWeek = ({ slug }) => {
  const [range, setRange] = useState("week");
  const [tracks, setTracks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const rowRef = useRef(null);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    setIsLoading(true);
    fetchGenrePopularTracks(slug, { range, limit: 25 })
      .then((data) => {
        if (cancelled) return;
        const list = Array.isArray(data) ? data : data?.tracks || [];
        setTracks(list.filter((t) => t));
        setPage(0);
        setIsLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setTracks([]);
        setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [slug, range]);

  const totalPages = Math.ceil(tracks.length / ITEMS_PER_PAGE);
  const visibleTracks = tracks.slice(
    page * ITEMS_PER_PAGE,
    (page + 1) * ITEMS_PER_PAGE
  );

  const animateTransition = useCallback(
    (newPage) => {
      if (!rowRef.current || newPage === page) return;
      const direction = newPage > page ? 1 : -1;
      gsap.to(rowRef.current.children, {
        opacity: 0,
        x: direction * -30,
        duration: 0.2,
        stagger: 0.03,
        ease: "power2.in",
        onComplete: () => {
          setPage(newPage);
          gsap.fromTo(
            rowRef.current.children,
            { opacity: 0, x: direction * 30 },
            { opacity: 1, x: 0, duration: 0.3, stagger: 0.04, ease: "power2.out" }
          );
        },
      });
    },
    [page]
  );

  const handlePrev = () => {
    animateTransition(page > 0 ? page - 1 : totalPages - 1);
  };

  const handleNext = () => {
    animateTransition(page < totalPages - 1 ? page + 1 : 0);
  };

  return (
    <section className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>{TITLES[range]}</h3>
        <div className={styles.headerActions}>
          {totalPages > 1 && (
            <div className={styles.pagination}>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  type="button"
                  className={`${styles.pageIndicator} ${
                    i === page ? styles.activeIndicator : ""
                  }`}
                  onClick={() => animateTransition(i)}
                  aria-label={`Go to page ${i + 1}`}
                />
              ))}
            </div>
          )}
          <ToggleSlide
            options={RANGE_OPTIONS}
            value={range}
            onChange={setRange}
            ariaLabel="Time range"
          />
        </div>
      </div>

      {isLoading ? (
        <TrackCardRow>
          {[1, 2, 3, 4, 5].map((n) => (
            <div key={n} className={styles.trackItem}>
              <div className={styles.skeletonCover} />
              <div className={styles.skeletonName} />
              <div className={styles.skeletonArtist} />
            </div>
          ))}
        </TrackCardRow>
      ) : tracks.length === 0 ? (
        <div className={styles.empty}>No tracks for this range.</div>
      ) : (
        <div className={styles.rowWrapper}>
          {totalPages > 1 && (
            <>
              <button
                type="button"
                className={`${styles.rowArrow} ${styles.rowArrowLeft}`}
                onClick={handlePrev}
                aria-label="Previous"
              >
                <IoChevronBack size={18} />
              </button>
              <button
                type="button"
                className={`${styles.rowArrow} ${styles.rowArrowRight}`}
                onClick={handleNext}
                aria-label="Next"
              >
                <IoChevronForward size={18} />
              </button>
            </>
          )}
          <div ref={rowRef} className={styles.row}>
            <TrackCardRow>
              {visibleTracks.map((track, i) => {
                const trackArtists = track?.artists || [];
                const trackUrl = createTrackSlug(
                  track?.name || "track",
                  trackArtists,
                  track?.id
                );
                return (
                  <div key={track?.id || i} className={styles.trackItem}>
                    <Link
                      to={trackUrl}
                      state={{ trackId: track?.id }}
                      className={styles.coverWrapper}
                    >
                      <Image
                        src={getTrackCover(track)}
                        alt={track?.name}
                        fallbackVariant="cover"
                        className={styles.cover}
                        width="100%"
                        height="100%"
                      />
                    </Link>
                    <Tooltip
                      text={track?.name}
                      position="bottom"
                      className={styles.trackName}
                    >
                      <Link
                        to={trackUrl}
                        state={{ trackId: track?.id }}
                        className={styles.trackNameLink}
                      >
                        {track?.name}
                      </Link>
                    </Tooltip>
                    <ArtistList
                      artists={trackArtists}
                      className={styles.artistName}
                    />
                  </div>
                );
              })}
            </TrackCardRow>
          </div>
        </div>
      )}
    </section>
  );
};

export default PopularThisWeek;
