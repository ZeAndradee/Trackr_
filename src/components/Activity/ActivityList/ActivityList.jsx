import React from "react";
import { ReviewCard } from "../../Review/Review";
import styles from "./ActivityList.module.css";

const getDateGroup = (dateStr) => {
  const date = new Date(dateStr);
  const now = new Date();

  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);

  const dayOfWeek = now.getDay();
  const startOfWeek = new Date(startOfToday);
  startOfWeek.setDate(startOfWeek.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfYear = new Date(now.getFullYear(), 0, 1);

  if (date >= startOfToday) return "TODAY";
  if (date >= startOfYesterday) return "YESTERDAY";
  if (date >= startOfWeek) return "THIS WEEK";
  if (date >= startOfMonth) return "THIS MONTH";
  if (date >= startOfYear) return "THIS YEAR";
  return "EARLIER";
};

const groupByDate = (items) => {
  const order = ["TODAY", "YESTERDAY", "THIS WEEK", "THIS MONTH", "THIS YEAR", "EARLIER"];
  const groups = {};

  items.forEach((item) => {
    const group = getDateGroup(item.createdAt || item.selectedDate);
    if (!groups[group]) groups[group] = [];
    groups[group].push(item);
  });

  return order.filter((g) => groups[g]).map((g) => ({ label: g, items: groups[g] }));
};

export const ActivitySkeleton = ({ count = 3 }) => (
  <div className={styles.skeletonList}>
    {Array.from({ length: count }).map((_, n) => (
      <div key={n} className={styles.skeletonItem}>
        <div className={styles.skeletonHeader}>
          <div className={styles.skeletonAvatar} />
          <div className={styles.skeletonUsername} />
        </div>
        <div className={styles.skeletonCard}>
          <div className={styles.skeletonCover} />
          <div className={styles.skeletonContent}>
            <div className={styles.skeletonLine} />
            <div className={styles.skeletonLineShort} />
          </div>
        </div>
      </div>
    ))}
  </div>
);

const ActivityList = ({ activities, hideHeader = false, grouped = false }) => {
  if (grouped) {
    return groupByDate(activities).map((group) => (
      <div key={group.label} className={styles.dateGroup}>
        <span className={styles.dateLabel}>{group.label}</span>
        {group.items.map((activity) => (
          <ReviewCard
            key={activity.logId}
            activity={activity}
            allActivities={activities}
            hideHeader={hideHeader}
          />
        ))}
      </div>
    ));
  }

  return activities.map((activity) => (
    <ReviewCard
      key={activity.logId}
      activity={activity}
      allActivities={activities}
      hideHeader={hideHeader}
    />
  ));
};

export default ActivityList;
