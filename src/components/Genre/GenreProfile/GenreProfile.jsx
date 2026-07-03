import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";

import HeroItem from "../../Utils/HeroItem/HeroItem";
import ErrorBoundary from "../../Utils/Error/ErrorBoundary";
import PopularThisWeek from "./PopularThisWeek/PopularThisWeek";
import useStickyFollowScroll from "../../../hooks/useStickyFollowScroll";
import { fetchGenre } from "../../../services/Genre/FetchGenre";
import styles from "./GenreProfile.module.css";

const GenreProfile = ({ genreData, slug: propSlug }) => {
  const socialSidebarRef = useRef(null);
  useStickyFollowScroll(socialSidebarRef);

  const params = useParams();
  const slug = propSlug || params.slug;

  const [genre, setGenre] = useState(genreData || null);
  const [isLoading, setIsLoading] = useState(!genreData);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!slug) {
      setError({ message: "No genre slug provided", status: 404 });
      setIsLoading(false);
      return;
    }
    if (genreData && genreData.slug === slug) {
      setGenre(genreData);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    fetchGenre(slug)
      .then((data) => {
        setGenre(data);
        setIsLoading(false);
      })
      .catch((err) => {
        setError({
          message: err.response?.data?.message || "Error fetching genre",
          status: err.response?.status || 500,
        });
        setIsLoading(false);
      });
  }, [slug, genreData]);

  if (isLoading) return <div className={styles.loading}>Loading...</div>;
  if (error || !genre) return <ErrorBoundary source="genreProfile" error={error} />;

  return (
    <div className={styles.container}>
      <HeroItem
        coverUrl={genre.coverUrl}
        type="Genre"
        title={genre.name}
        showCoverCard={true}
        subtitle={
          <div className={styles.subtitleWrapper}>
            <span className={styles.genreLabel}>Genre</span>
          </div>
        }
        stats={
          <div className={styles.heroRightStats}>
            <div className={styles.statLineItem}>
              <span className={styles.statLineValue}>
                {genre.trackCount || 0}
              </span>
              <span className={styles.statLineLabel}>Tracks</span>
            </div>
          </div>
        }
      />

      <div className={styles.tabContent}>
        <div className={styles.contentContainer}>
          <div className={styles.mainColumn}>
            <PopularThisWeek slug={slug} />
          </div>
          <aside ref={socialSidebarRef} className={styles.sidebar}>
            <div className={styles.infoCard}>
              <h3 className={styles.infoTitle}>About</h3>
              {genre.description ? (
                <p className={styles.infoText}>{genre.description}</p>
              ) : (
                <p className={styles.infoText}>
                  Explore the {genre.name} genre on Trackr. Discover popular
                  tracks, top artists and listener activity.
                </p>
              )}
              <div className={styles.infoMeta}>
                <div className={styles.metaRow}>
                  <span className={styles.metaLabel}>Genre</span>
                  <span className={styles.metaValue}>{genre.name}</span>
                </div>
                <div className={styles.metaRow}>
                  <span className={styles.metaLabel}>Tracks</span>
                  <span className={styles.metaValue}>
                    {genre.trackCount || 0}
                  </span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default GenreProfile;
