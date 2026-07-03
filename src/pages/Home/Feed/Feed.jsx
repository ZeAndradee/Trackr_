import React, { useState, useEffect, useCallback, useRef } from "react";
import { fetchPopularLogs } from "../../../services/HandleLogs";
import ActivityList, { ActivitySkeleton } from "../../../components/Activity/ActivityList/ActivityList";
import { Loader, ChevronDown } from "lucide-react";
import styles from "../FriendsActivity/FriendsActivity.module.css";
import feedStyles from "./Feed.module.css";
import ActionMenu from "../../../components/Utils/Dropdown/ActionMenu";
import { formatReviewActivity } from "../../../utils/formatters/textFormatters";

const PERIOD_OPTIONS = [
  { value: "week", label: "This week" },
  { value: "month", label: "This month" },
  { value: "alltime", label: "All time" },
];

const ORDER_OPTIONS = [
  { value: "popular", label: "Popular" },
  { value: "latest", label: "Latest" },
];

const PAGE_LIMIT = 10;

const Feed = () => {
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [period, setPeriod] = useState("");
  const [order, setOrder] = useState("latest");
  const [activeMenu, setActiveMenu] = useState(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const sentinelRef = useRef(null);
  const observerRef = useRef(null);

  const handleMenuClick = (e, menuType) => {
    e.preventDefault();
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setMenuPosition({
      top: rect.bottom + 8,
      left: rect.left - 60,
    });
    setActiveMenu((prev) => (prev === menuType ? null : menuType));
  };

  const periodItems = PERIOD_OPTIONS.map((opt) => ({
    label: opt.label,
    onClick: () => {
      setPeriod(opt.value);
      setActiveMenu(null);
    },
  }));

  const orderItems = ORDER_OPTIONS.map((opt) => ({
    label: opt.label,
    onClick: () => {
      setOrder(opt.value);
      setActiveMenu(null);
    },
  }));

  const loadPage = useCallback(async (pageNum, append) => {
    if (pageNum === 1) setIsLoading(true);
    else setIsFetchingMore(true);

    try {
      const result = await fetchPopularLogs({
        period,
        sort: order,
        page: pageNum,
        limit: PAGE_LIMIT,
      });

      const { reviews, pagination } = result.data;
      const formatted = reviews.map(formatReviewActivity);
      setActivities((prev) => (append ? [...prev, ...formatted] : formatted));
      setHasMore(pagination.hasNextPage);
    } catch (error) {
      console.error("Error fetching popular logs:", error);
      setHasMore(false);
    } finally {
      setIsLoading(false);
      setIsFetchingMore(false);
    }
  }, [period, order]);

  useEffect(() => {
    setActivities([]);
    setPage(1);
    setHasMore(true);
    loadPage(1, false);
  }, [period, order]);

  useEffect(() => {
    if (page === 1) return;
    loadPage(page, true);
  }, [page]);

  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isFetchingMore && !isLoading) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 0.1 }
    );

    if (sentinelRef.current) observerRef.current.observe(sentinelRef.current);

    return () => observerRef.current?.disconnect();
  }, [hasMore, isFetchingMore, isLoading]);

  if (isLoading) {
    return (
      <div className={styles.section}>
        <ActivitySkeleton />
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className={styles.section}>
        <div className={styles.emptyState}>
          <Loader size={28} className={styles.emptyIcon} />
          <span className={styles.emptyTitle}>We couldn't load your feed</span>
          <span className={styles.emptyText}>
            Try refreshing the page or check back later.
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.section}>
      <div className={feedStyles.header}>
        <div className={feedStyles.periodFilter}>
          {order !== "latest" && (
            <button
              className={feedStyles.periodButton}
              onClick={(e) => handleMenuClick(e, "period")}
            >
              {PERIOD_OPTIONS.find((o) => o.value === period)?.label || "This week"}
              <ChevronDown size={14} />
            </button>
          )}
          <button
            className={feedStyles.periodButton}
            onClick={(e) => handleMenuClick(e, "order")}
          >
            {ORDER_OPTIONS.find((o) => o.value === order)?.label || "Popular"}
            <ChevronDown size={14} />
          </button>
        </div>
      </div>

      {activeMenu === "period" && order !== "latest" && (
        <ActionMenu
          items={periodItems}
          onClose={() => setActiveMenu(null)}
          position={menuPosition}
        />
      )}
      {activeMenu === "order" && (
        <ActionMenu
          items={orderItems}
          onClose={() => setActiveMenu(null)}
          position={menuPosition}
        />
      )}

      <ActivityList activities={activities} />

      <div ref={sentinelRef} />

      {isFetchingMore && (
        <div className={feedStyles.loadingMore}>
          <Loader size={18} className={feedStyles.loadingMoreIcon} />
        </div>
      )}
    </div>
  );
};

export default Feed;
