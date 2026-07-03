import React, { useMemo, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Compass } from "lucide-react";
import { getActivityCount } from "../../../services/HandleLogs";
import styles from "./HomeHero.module.css";

const FEED_TABS = [
  { id: "foryou", label: "For You", icon: Compass },
  { id: "friends", label: "Friends" },
];

const HomeHero = ({ user, activeTab, onTabChange }) => {
  const [activityCount, setActivityCount] = useState(null);

  const getTimeBasedGreeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning,";
    if (hour < 18) return "Good afternoon,";
    return "Good evening,";
  }, []);

  useEffect(() => {
    getActivityCount().then(setActivityCount);
  }, []);

  return (
    <div className={styles.heroContainer}>
      <div className={styles.greetingContent}>
        <div className={styles.greetingDetails}>
          <div className={styles.greetingHeader}>
            <h1 className={styles.greeting}>{getTimeBasedGreeting}</h1>
            <Link to={`/${user?.username}`} className={styles.username}>
              {user?.username || "trackr"}
            </Link>
          </div>
          {activityCount && (
            <p className={styles.friendsSummary}>
              Your friends logged {activityCount.friends} tracks this week — you've logged {activityCount.self}
            </p>
          )}
        </div>
      </div>

      <div className={styles.feedTabs}>
        {FEED_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              className={`${styles.feedTab} ${isActive ? styles.feedTabActive : ""}`}
              onClick={() => onTabChange(tab.id)}
            >
              {isActive && Icon && <Icon size={16} />}
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default React.memo(HomeHero);
