import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import styles from "./LandingPage.module.css";
import { Button } from "../../../components/Utils/Buttons/Button";
import CoverCircle from "./CoverCircle";
import WordStrips from "./WordStrips";
import Image from "../../../components/Utils/Images/Image/Image";
import { fetchPopularLogs } from "../../../services/HandleLogs";
import { useAuthModal } from "../../../contexts/AuthModalContext";
import {
  createTrackSlug,
  createAlbumSlug,
} from "../../../utils/formatters/textFormatters";

const DECK_SIZE = 5;

const normalizeReview = (review) => {
  const isAlbum = review.type === "album";
  const name = isAlbum
    ? review.album?.name || review.name
    : review.track?.name || review.name;

  return {
    logId: review._id,
    name,
    artists: review.artists || [],
    coverUrl: review.coverUrl,
    type: isAlbum ? "album" : "track",
    trackId: review.track?.id || review.trackId,
    albumId: isAlbum ? review.album?.id || review.albumId : null,
  };
};

const itemSlugFor = (item) =>
  item.type === "album"
    ? createAlbumSlug(item.name, item.artists, item.albumId)
    : createTrackSlug(item.name, item.artists, item.trackId);

const LandingPage = () => {
  const { openModal } = useAuthModal();
  const [items, setItems] = useState([]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const result = await fetchPopularLogs({
          sort: "popular",
          limit: 50,
          page: 1,
        });
        const reviews = result?.data?.reviews || [];
        const seen = new Set();
        const usable = [];
        for (const r of reviews.map(normalizeReview)) {
          if (!r.coverUrl || seen.has(r.coverUrl)) continue;
          seen.add(r.coverUrl);
          usable.push(r);
          if (usable.length >= DECK_SIZE) break;
        }
        if (mounted && usable.length) setItems(usable);
      } catch (error) {
        console.error("Error loading landing covers:", error);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroLeft}>
          <h1 className={styles.title}>Where your music lives</h1>
          <p className={styles.subtitle}>
            Trackr is great for finding your next favorite album and obsessing
            over the ones you already love, or even becoming the friend everyone
            asks for recommendations. Your profile, your music. Discover, listen
            and rate.
          </p>
          <div className={styles.ctaButtons}>
            <Button size="lg" variant="primary" onClick={() => openModal("signup")}>
              Get started
            </Button>
            <Button
              size="lg"
              variant="secondary"
              className={styles.loginBtn}
              onClick={() => openModal("login")}
            >
              Log in
            </Button>
          </div>
        </div>

        <div className={styles.heroRight}>
          <div className={styles.deck}>
            {items.map((item, index) => (
              <Link
                key={`${item.logId}-${index}`}
                to={itemSlugFor(item)}
                className={styles.card}
              >
                <Image
                  src={item.coverUrl}
                  alt={item.name}
                  fallbackVariant="cover"
                  radius="var(--border-radius2)"
                  className={styles.cardImg}
                />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <WordStrips />

      <CoverCircle />

      <section className={styles.blankSection} aria-hidden="true" />
    </div>
  );
};

export default LandingPage;
