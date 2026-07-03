import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";
import gsap from "gsap";
import Image from "../../../components/Utils/Images/Image/Image";
import SectionHeader from "../../../components/Utils/SectionHeader/SectionHeader";
import { fetchPopularAlbums, fetchTrendingAlbums } from "../../../services/FetchAlbum";
import ArtistList from "../../../components/Utils/ArtistList/ArtistList";
import { createAlbumSlug } from "../../../utils/formatters/textFormatters";
import styles from "./PopularAlbums.module.css";

const ITEMS_PER_PAGE = 5;

const PopularAlbums = ({ variant = "popular" }) => {
  const isTrending = variant === "trending";
  const title = isTrending ? "Trending Albums" : "Popular Albums";
  const [albums, setAlbums] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const rowRef = useRef(null);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const data = isTrending ? await fetchTrendingAlbums() : await fetchPopularAlbums();
        setAlbums((data || []).filter((a) => a.coverUrl));
      } catch {
        setAlbums([]);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const totalPages = Math.ceil(albums.length / ITEMS_PER_PAGE);
  const visibleAlbums = albums.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE);

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

  const paginationControls = totalPages > 1 && (
    <div className={styles.pagination}>
      {Array.from({ length: totalPages }, (_, i) => (
        <button
          key={i}
          className={`${styles.pageIndicator} ${i === page ? styles.activeIndicator : ""}`}
          onClick={() => animateTransition(i)}
        />
      ))}
    </div>
  );

  if (isLoading) {
    return (
      <div className={styles.section}>
        <SectionHeader title={title} className={styles.noMargin} />
        <div className={styles.scrollRow}>
          {[1, 2, 3, 4, 5].map((n) => (
            <div key={n} className={styles.albumCard}>
              <div className={styles.skeletonCover} />
              <div className={styles.skeletonName} />
              <div className={styles.skeletonArtist} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!albums || albums.length === 0) return null;

  return (
    <div className={styles.section}>
      <SectionHeader title={title} className={styles.noMargin} action={paginationControls} />
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
        <div className={styles.scrollRow} ref={rowRef}>
        {visibleAlbums.map((album, index) => {
          const slug = createAlbumSlug(
            album?.name || album?.title || "album",
            album?.artists || [],
            album.id || album.albumId
          );
          const artists = album?.artists || [];

          return (
            <div
              key={album.id || album.albumId || index}
              className={styles.albumCard}
            >
              <Link to={slug} className={styles.coverWrapper}>
                <Image
                  src={album.coverUrl || album.albumCover}
                  alt={album.name || album.title}
                  fallbackVariant="cover"
                  borderLength="3px"
                  className={styles.cover}
                  width="100%"
                  height="100%"
                />
              </Link>
              <Link to={slug} className={styles.albumName}>{album.name || album.title}</Link>
              <ArtistList artists={artists} className={styles.artistName} />
            </div>
          );
        })}
        </div>
      </div>
    </div>
  );
};

export default PopularAlbums;
