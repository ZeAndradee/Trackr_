import React, { useState, useRef, useCallback, useEffect } from "react";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";
import gsap from "gsap";
import Image from "../../../components/Utils/Images/Image/Image";
import LoadingIndicator from "../../../components/Utils/LoadingIndicator";
import ArtistList from "../../../components/Utils/ArtistList/ArtistList";
import TrackAlbumTitle from "../../../components/Utils/TrackAlbumTitle/TrackAlbumTitle";
import { createTrackSlug, createAlbumSlug } from "../../../utils/formatters/textFormatters";
import styles from "./ThisMonth.module.css";

const ITEMS_PER_PAGE = 5;

const ThisMonth = ({ entries, loading, error }) => {
  const [page, setPage] = useState(0);
  const rowRef = useRef(null);

  const totalPages = Math.ceil(entries.length / ITEMS_PER_PAGE);
  const visibleEntries = entries.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE);

  useEffect(() => {
    setPage(0);
  }, [entries.length]);

  const animateTransition = useCallback((newPage) => {
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
  }, [page]);

  const handlePrev = () => {
    animateTransition(page > 0 ? page - 1 : totalPages - 1);
  };

  const handleNext = () => {
    animateTransition(page < totalPages - 1 ? page + 1 : 0);
  };

  return (
    <section className={styles.monthSection}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>This month</h2>
        {totalPages > 1 && (
          <div className={styles.pagination}>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                className={`${styles.pageIndicator} ${i === page ? styles.activeIndicator : ""}`}
                onClick={() => animateTransition(i)}
              />
            ))}
          </div>
        )}
      </div>
      {loading ? (
        <LoadingIndicator />
      ) : error ? (
        <p className={styles.errorText}>Failed to load reviews.</p>
      ) : entries.length === 0 ? (
        <div className={styles.emptyState}>
          <span className={styles.emptyTitle}>Crickets this month.</span>
          <span className={styles.emptySubtitle}>
            Your speakers called. They miss you.
          </span>
        </div>
      ) : (
        <div className={styles.rowWrapper}>
          {totalPages > 1 && (
            <>
              <button className={`${styles.rowArrow} ${styles.rowArrowLeft}`} onClick={handlePrev}>
                <IoChevronBack size={18} />
              </button>
              <button className={`${styles.rowArrow} ${styles.rowArrowRight}`} onClick={handleNext}>
                <IoChevronForward size={18} />
              </button>
            </>
          )}
          <div className={styles.coverRow} ref={rowRef}>
            {visibleEntries.map((entry) => {
              const isAlbum = entry.type === "album";
              const entryName = isAlbum ? entry.albumName : entry.trackName;
              const entryId = isAlbum ? entry.albumId : entry.trackId;
              const slug = isAlbum
                ? createAlbumSlug(entryName, entry.artists, entryId)
                : createTrackSlug(entryName, entry.artists, entryId);
              return (
                <div key={entry._id} className={styles.coverItem}>
                  <Image
                    src={entry.coverUrl}
                    alt={entryName}
                    to={slug}
                    fallbackVariant="cover"
                    borderLength="2px"
                    className={styles.cover}
                  />
                  <div className={styles.itemInfo}>
                    <TrackAlbumTitle title={entryName} to={slug} ellipsis />
                    <span className={styles.artistText}>
                      <ArtistList artists={entry.artists} />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
};

export default ThisMonth;
