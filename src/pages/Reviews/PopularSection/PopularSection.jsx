import React, { useEffect, useState } from "react";
import { Loader } from "lucide-react";
import { fetchPopularLogs } from "../../../services/HandleLogs";
import { ReviewCard } from "../../../components/Review/Review";
import styles from "./PopularSection.module.css";

const formatReview = (review) => {
  const isAlbum = review.type === "album";
  return {
    id: isAlbum ? review.albumId : review._id,
    trackId: review.track?.id,
    name: isAlbum ? review.album?.name : review.track?.name,
    trackTitle: isAlbum ? review.album?.name : review.track?.name,
    artist: review.artists,
    coverUrl: review.coverUrl,
    artists: review.artists,
    rating: review.rating,
    review: review.review,
    createdAt: review.createdAt,
    logId: review._id,
    user: review.user,
    type: review.type || "track",
    albumId: review.albumId,
    albumName: review.album?.name,
    trackName: review.track?.name,
    likesCount: review.likeCount || 0,
    commentsCount: review.commentCount || 0,
  };
};

const PopularSection = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const result = await fetchPopularLogs({
          sort: "popular",
          period: "month",
          page: 1,
          limit: 5,
        });
        if (cancelled) return;
        const reviews = result?.data?.reviews || [];
        setActivities(reviews.map(formatReview));
      } catch (err) {
        console.error("Failed to fetch popular logs", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <h2 className={styles.title}>Popular reviews this month</h2>
      </div>
      {loading ? (
        <div className={styles.loaderWrap}>
          <Loader className={styles.spinner} size={20} />
        </div>
      ) : activities.length === 0 ? (
        <p className={styles.fallback}>
          Even the popular charts are empty. Wild times.
        </p>
      ) : (
        <div className={styles.list}>
          {activities.map((activity) => (
            <ReviewCard
              key={activity.logId}
              activity={activity}
              allActivities={activities}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default PopularSection;
