import { Flame, Star, Play, LayoutGrid } from "lucide-react";
import styles from "./YourWeek.module.css";

const MOCK_STATS = {
  tracks: 22,
  reviews: 4,
  streak: 3,
  lists: 2,
};

const STAT_CONFIG = [
  { key: "streak", Icon: Flame, isStreak: true },
  { key: "reviews", Icon: Star, color: "var(--rating-medium)" },
  { key: "tracks", Icon: Play, color: "var(--rating-high)" },
  { key: "lists", Icon: LayoutGrid, color: "var(--primary-color)" },
];

const YourWeek = () => {
  const stats = MOCK_STATS;
  const streakActive = stats.streak > 0;

  return (
    <div className={styles.section}>
      <h3 className={styles.title}>This week</h3>
      <div className={styles.statsRow}>
        {STAT_CONFIG.map(({ key, Icon, isStreak, color }) => {
          const iconColor = isStreak
            ? streakActive ? "#f97316" : "var(--text-secondary-color)"
            : color;

          return (
            <div key={key} className={styles.statItem}>
              <Icon
                className={`${styles.statIcon} ${isStreak && !streakActive ? styles.fireInactive : ""}`}
                style={{ color: iconColor }}
                fill="currentColor"
                strokeWidth={0}
              />
              <span className={styles.statValue}>{stats[key]}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default YourWeek;
