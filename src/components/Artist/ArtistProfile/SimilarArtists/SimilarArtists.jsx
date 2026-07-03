import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";
import gsap from "gsap";
import Image from "../../../../components/Utils/Images/Image/Image";
import { getTrackCover } from "../../../../components/Utils/Formater/Track";
import TrackCardRow from "../../../../components/Utils/TrackCardRow/TrackCardRow";
import ArtistList from "../../../../components/Utils/ArtistList/ArtistList";
import SimilarSectionSkeleton from "../../../../components/Utils/Skeletons/SimilarSectionSkeleton";
import { fetchSimilarArtists } from "../../../../services/FetchArtist";
import { createArtistSlug } from "../../../../utils/formatters/textFormatters";
import { Tooltip } from "../../../../components/Utils/Tooltip/Tooltip";
import styles from "./SimilarArtists.module.css";

const ITEMS_PER_PAGE = 5;

const normalizeArtist = (a) => ({
  ...a,
  coverUrl: a.coverUrl || a.images?.[0]?.url || null,
});

const SimilarArtists = ({ artistId }) => {
  const [artists, setArtists] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const rowRef = useRef(null);

  useEffect(() => {
    const loadSimilar = async () => {
      if (!artistId) return;
      setIsLoading(true);
      try {
        const data = await fetchSimilarArtists(artistId);
        const list =
          (Array.isArray(data) ? data : null) ||
          (Array.isArray(data?.data) ? data.data : null) ||
          data?.artists ||
          data?.similar ||
          [];
        setArtists(list.map(normalizeArtist).filter((a) => a.coverUrl));
      } catch (err) {
        console.error("Error fetching similar artists:", err);
        setArtists([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadSimilar();
  }, [artistId]);

  const totalPages = Math.ceil(artists.length / ITEMS_PER_PAGE);
  const visibleArtists = artists.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE);

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

  if (isLoading) return <SimilarSectionSkeleton count={5} />;
  if (!artists || artists.length === 0) return null;

  return (
    <section className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>Similar Artists</h3>
        {totalPages > 1 && (
          <div className={styles.pagination}>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                type="button"
                className={`${styles.pageIndicator} ${i === page ? styles.activeIndicator : ""}`}
                onClick={() => animateTransition(i)}
                aria-label={`Go to page ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
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
            {visibleArtists.map((artist) => {
              const artistUrl = createArtistSlug(artist.name, artist.id);
              return (
                <div key={artist.id} className={styles.artistItem}>
                  <Link to={artistUrl} className={styles.imageLink}>
                    <div className={styles.circularCoverWrapper}>
                      <Image
                        src={getTrackCover(artist)}
                        alt={artist?.name}
                        fallbackVariant="cover"
                        width="100%"
                        height="100%"
                        className={styles.circularCoverImage}
                      />
                    </div>
                  </Link>
                  <Tooltip text={artist.name} position="bottom" className={styles.artistName}>
                    <ArtistList artists={[artist]} maxVisible={1} fontSize={"0.9rem"} />
                  </Tooltip>
                </div>
              );
            })}
          </TrackCardRow>
        </div>
      </div>
    </section>
  );
};

export default SimilarArtists;
