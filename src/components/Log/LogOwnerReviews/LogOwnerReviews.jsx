import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import styles from "./LogOwnerReviews.module.css";
import { getUserPopularLogs } from "../../../services/HandleLogs";
import SectionHeader from "../../Utils/SectionHeader/SectionHeader";
import { parseReviewContent } from "../../../utils/formatters/textFormatters";

const seedRandom = (seed) => {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  return () => {
    hash = (hash * 1664525 + 1013904223) | 0;
    return ((hash >>> 0) / 4294967296);
  };
};

const LogOwnerReviews = ({ username, userId, currentLogId }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      let userReviews = [];

      try {
        const response = await getUserPopularLogs(userId);
        if (
          response &&
          response.data &&
          response.data.logs &&
          Array.isArray(response.data.logs)
        ) {
          const filtered = response.data.logs
            .filter((log) => log._id !== currentLogId && log.review);

          const random = seedRandom(currentLogId || "default");
          const shuffled = [...filtered].sort(() => random() - 0.5);
          userReviews = shuffled.slice(0, 3);
        }
      } catch (error) {
        console.error("Failed to fetch user popular reviews:", error);
      }

      setReviews(userReviews);
      setLoading(false);
    };

    fetchReviews();
  }, [userId, currentLogId]);

  if (loading) {
    return (
      <div className={styles.sidebarSection}>
        <div className={styles.skeletonTitle}></div>
        <div className={styles.skeletonList}>
          {[1, 2, 3].map((i) => (
            <div key={i} className={styles.skeletonItem}>
              <div className={styles.skeletonHeader}>
                <div className={styles.skeletonImage}></div>
                <div className={styles.skeletonInfo}>
                  <div className={styles.skeletonText}></div>
                  <div className={styles.skeletonTextSmall}></div>
                </div>
              </div>
              <div className={styles.skeletonContent}></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className={styles.sidebarSection}>
        <SectionHeader title={`More from ${username}`} />
        <p className={styles.emptyState}>No other reviews found.</p>
      </div>
    );
  }

  return (
    <div className={styles.sidebarSection}>
      <SectionHeader title={`More from ${username}`} />

      <div className={styles.sidebarList}>
        {reviews.map((review) => (
          <Link
            key={review._id}
            to={`/${username}/log/${review._id}`}
            className={styles.reviewCard}
          >
            <div className={styles.cardHeader}>
              <img
                src={review.coverUrl}
                alt={review.name}
                className={styles.coverImage}
              />
              <div className={styles.headerInfo}>
                <span className={styles.trackName}>{review.name}</span>
              </div>
            </div>
            {review.review && (() => {
              const { text, gifUrl } = parseReviewContent(review.review);
              return (
                <>
                  {text && <p className={styles.reviewContent}>{text}</p>}
                  {gifUrl && (
                    <img
                      src={gifUrl}
                      alt="Review GIF"
                      className={styles.reviewGif}
                      onError={(e) => { e.target.style.display = "none"; }}
                    />
                  )}
                </>
              );
            })()}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default LogOwnerReviews;
