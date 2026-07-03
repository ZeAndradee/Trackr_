import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { handleFriendReviews } from "../../../services/HandleFriendReviews";
import ActivityList, { ActivitySkeleton } from "../../../components/Activity/ActivityList/ActivityList";
import SectionHeader from "../../../components/Utils/SectionHeader/SectionHeader";
import { FaUserFriends } from "react-icons/fa";
import { formatReviewActivity } from "../../../utils/formatters/textFormatters";
import styles from "./FriendsActivity.module.css";

const FriendsActivity = () => {
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadActivities = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await handleFriendReviews({ limit: 5 });
      if (result && result.status === 200 && result.data) {
        const formatted = result.data.reviews.map(formatReviewActivity);
        setActivities(formatted);
      }
    } catch (error) {
      console.error("Error fetching friend reviews:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadActivities();
  }, [loadActivities]);

  if (isLoading) {
    return (
      <div className={styles.section}>
        <SectionHeader title="Recent Reviews" className={styles.noMargin} />
        <ActivitySkeleton />
      </div>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <div className={styles.section}>
        <SectionHeader title="Recent Reviews" className={styles.noMargin} />
        <div className={styles.emptyState}>
          <FaUserFriends size={28} className={styles.emptyIcon} />
          <span className={styles.emptyTitle}>No reviews yet</span>
          <span className={styles.emptyText}>
            Follow friends to see their reviews
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.section}>
      <SectionHeader
        title="From Friends"
        className={styles.noMargin}
        action={
          <Link to="/friends-reviews" className={styles.viewAllLink}>
            View All
          </Link>
        }
      />
      <ActivityList activities={activities} grouped />
    </div>
  );
};

export default FriendsActivity;
