import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useSearchParams, useOutletContext } from "react-router-dom";
import { useLoaderData } from "react-router";
import styles from "./Reviews.module.css";
import { fetchJournalEntries } from "../../services/FetchUser";
import { loaderFetch } from "../../services/ssrLoader";
import { buildMeta, collectionPageLd } from "../../services/seo";
import { useUserContext } from "../../contexts/UserContext";
import useStickyFollowScroll from "../../hooks/useStickyFollowScroll";
import ThisMonth from "./ThisMonth/ThisMonth";
import Timeline from "./Timeline/Timeline";
import PopularSection from "./PopularSection/PopularSection";
import Chart from "../../components/Utils/Chart/Chart";
import chartStyles from "../../components/Utils/Chart/Chart.module.css";
import TrackReviewModal from "../../components/Review/TrackReviewModal/TrackReviewModal";
import AddToListModal from "../../components/Utils/AddToListModal/AddToListModal";
import UserSidebarCard from "../../components/User/UserProfile/UserSidebarCard/UserSidebarCard";

export async function loader({ params, request }) {
  const { username } = params;
  if (!username) return { initialReviews: null };

  const query = new URLSearchParams({
    page: "1",
    limit: "20",
    sortBy: "selectedDate",
    sortOrder: "-1",
    username,
  }).toString();

  const initialReviews = await loaderFetch(`/${username}/journal?${query}`, request);
  return { initialReviews: initialReviews || null };
}

export function meta({ params }) {
  const username = params.username;
  const canonical = username ? `/${username}/reviews` : undefined;
  const description = username
    ? `Read all of @${username}'s music reviews and ratings on Trackr — tracks, albums and listening diary.`
    : "Music reviews and ratings on Trackr.";
  return buildMeta({
    title: username ? `${username}'s Reviews & Ratings | Trackr` : "Reviews | Trackr",
    description,
    canonical,
    jsonLd: username
      ? collectionPageLd({
          name: `${username}'s Reviews`,
          description,
          url: canonical,
        })
      : undefined,
  });
}

const Reviews = () => {
  const { initialReviews } = useLoaderData();
  const { username } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { userLogged } = useUserContext();
  const outletContext = useOutletContext();
  const user = outletContext?.user;
  const targetUser = username || userLogged?.username;

  const sidebarStats = useMemo(
    () => user
      ? [
          { label: "This year", value: user.yearTotalTracks ?? 0 },
          { label: "Reviews", value: user.totalTracks ?? 0 },
          { label: "Likes", value: user.totalLikes ?? 0 },
        ]
      : null,
    [user],
  );

  const PAGE_LIMIT = 20;
  const [entries, setEntries] = useState(initialReviews?.logs || []);
  const [loading, setLoading] = useState(!initialReviews);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [hasMore, setHasMore] = useState(() => {
    const p = initialReviews?.pagination;
    if (!p) return true;
    return (
      p.hasNextPage ??
      (p.currentPage ?? 1) < (p.totalPages ?? 0)
    );
  });
  const [error, setError] = useState(null);
  const [monthEntries, setMonthEntries] = useState([]);
  const [monthLoading, setMonthLoading] = useState(true);
  const [monthError, setMonthError] = useState(null);
  const initialSearch = searchParams.get("search") || "";
  const initialStart = searchParams.get("start") || "";
  const initialEnd = searchParams.get("end") || "";

  const [editReviewId, setEditReviewId] = useState(null);
  const [newLogTrackId, setNewLogTrackId] = useState(null);
  const [listModalTrackId, setListModalTrackId] = useState(null);

  const [searchInput, setSearchInput] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);
  const [startDate, setStartDate] = useState(initialStart);
  const [endDate, setEndDate] = useState(initialEnd);
  const pageRef = useRef(1);
  const requestIdRef = useRef(0);
  const skipInitialFetch = useRef(
    Boolean(initialReviews) && !initialSearch && !initialStart && !initialEnd,
  );
  const sidebarRef = useRef(null);
  useStickyFollowScroll(sidebarRef);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (debouncedSearch) next.set("search", debouncedSearch);
      else next.delete("search");
      
      if (startDate) next.set("start", startDate);
      else next.delete("start");
      
      if (endDate) next.set("end", endDate);
      else next.delete("end");
      
      return next;
    }, { replace: true });
  }, [debouncedSearch, startDate, endDate, setSearchParams]);

  const loadPage = useCallback(
    async (pageNum, append) => {
      if (!targetUser) return;
      const requestId = ++requestIdRef.current;

      if (append) setIsFetchingMore(true);
      else setLoading(true);
      setError(null);

      try {
        const params = {
          page: pageNum,
          limit: PAGE_LIMIT,
          sortBy: "selectedDate",
          sortOrder: -1,
          username: targetUser,
        };
        if (debouncedSearch) params.search = debouncedSearch;
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;

        const response = await fetchJournalEntries(params, targetUser);
        if (requestId !== requestIdRef.current) return;

        const payload = response?.data?.data || {};
        const logs = payload.logs || [];
        const pagination = payload.pagination;
        const nextHasMore = pagination
          ? pagination.hasNextPage ??
            (pagination.currentPage ?? pageNum) < (pagination.totalPages ?? 0)
          : logs.length === PAGE_LIMIT;

        setEntries((prev) => (append ? [...prev, ...logs] : logs));
        setHasMore(nextHasMore);
        pageRef.current = pageNum;
      } catch (err) {
        if (requestId !== requestIdRef.current) return;
        console.error("Failed to load reviews", err);
        setError(err);
        setHasMore(false);
      } finally {
        if (requestId === requestIdRef.current) {
          setLoading(false);
          setIsFetchingMore(false);
        }
      }
    },
    [targetUser, debouncedSearch, startDate, endDate],
  );

  useEffect(() => {
    if (!targetUser) return;
    if (skipInitialFetch.current) {
      skipInitialFetch.current = false;
      return;
    }
    pageRef.current = 1;
    setEntries([]);
    setHasMore(true);
    loadPage(1, false);
  }, [targetUser, loadPage]);

  const loadMore = useCallback(() => {
    if (loading || isFetchingMore || !hasMore) return;
    loadPage(pageRef.current + 1, true);
  }, [loading, isFetchingMore, hasMore, loadPage]);

  useEffect(() => {
    if (!targetUser) return;
    let cancelled = false;
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const pad = (n) => String(n).padStart(2, "0");
    const monthStart = `${year}-${pad(month + 1)}-01`;
    const lastDay = new Date(year, month + 1, 0).getDate();
    const monthEnd = `${year}-${pad(month + 1)}-${pad(lastDay)}`;

    setMonthLoading(true);
    setMonthError(null);
    fetchJournalEntries(
      {
        page: 1,
        limit: 100,
        sortBy: "selectedDate",
        sortOrder: -1,
        username: targetUser,
        startDate: monthStart,
        endDate: monthEnd,
      },
      targetUser,
    )
      .then((response) => {
        if (cancelled) return;
        const logs = response?.data?.data?.logs || [];
        setMonthEntries(logs);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("Failed to load this month's reviews", err);
        setMonthError(err);
      })
      .finally(() => {
        if (!cancelled) setMonthLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [targetUser]);

  const chartData = useMemo(() => {
    if (!entries.length) return [];
    const map = new Map();
    entries.forEach((e) => {
      const d = new Date(e.selectedDate || e.createdAt);
      d.setHours(0, 0, 0, 0);
      const key = d.getTime();
      if (!map.has(key)) map.set(key, { date: d, items: [] });
      map.get(key).items.push(e);
    });
    const sorted = Array.from(map.values()).sort((a, b) => a.date - b.date);
    if (!sorted.length) return [];
    const out = [];
    const cur = new Date(sorted[0].date);
    const end = new Date(sorted[sorted.length - 1].date);
    while (cur <= end) {
      const found = map.get(cur.getTime());
      out.push({
        date: new Date(cur),
        value: found ? found.items.length : 0,
        meta: found?.items || [],
      });
      cur.setDate(cur.getDate() + 1);
    }
    return out;
  }, [entries]);

  const renderReviewHover = useCallback((point) => {
    const items = point.meta || [];
    const first = items[0];
    const dateLabel = point.date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    if (!first) {
      return (
        <div className={chartStyles.hoverText}>
          <span className={chartStyles.hoverTrack}>No reviews</span>
          <span className={chartStyles.hoverMeta}>{dateLabel}</span>
        </div>
      );
    }
    return (
      <>
        <img
          src={first.coverUrl}
          alt=""
          className={chartStyles.hoverCover}
          onError={(e) => {
            e.target.style.visibility = "hidden";
          }}
        />
        <div className={chartStyles.hoverText}>
          <span className={chartStyles.hoverTrack}>{first.name}</span>
          <span className={chartStyles.hoverArtist}>
            {first.artists?.map((a) => a.name).join(", ")}
          </span>
          <span className={chartStyles.hoverMeta}>
            {dateLabel}
            {items.length > 1 ? ` · +${items.length - 1} more` : ""}
          </span>
        </div>
      </>
    );
  }, []);

  const hasActiveFilters = Boolean(debouncedSearch || startDate || endDate);

  const resetFilters = useCallback(() => {
    setSearchInput("");
    setDebouncedSearch("");
    setStartDate("");
    setEndDate("");
  }, []);

  return (
    <>
      <div className={styles.container}>
        <div className={styles.contentWrapper}>
          <div className={styles.leftColumn}>
            <ThisMonth entries={monthEntries} loading={monthLoading} error={monthError} />
            <Timeline
              entries={entries}
              loading={loading}
              error={error}
              loadMore={loadMore}
              hasMore={hasMore}
              isFetchingMore={isFetchingMore}
              username={targetUser}
              searchValue={searchInput}
              onSearchChange={setSearchInput}
              startDate={startDate}
              endDate={endDate}
              onStartDateChange={setStartDate}
              onEndDateChange={setEndDate}
              hasActiveFilters={hasActiveFilters}
              onResetFilters={resetFilters}
              openEditOverlay={(entry) => setEditReviewId(entry._id || entry.id)}
              openNewLogOverlay={(entry) => setNewLogTrackId(entry.trackId)}
              openListModal={(trackId) => setListModalTrackId(trackId)}
            />
            {!loading && !error && entries.length === 0 && <PopularSection />}
          </div>

          <aside ref={sidebarRef} className={styles.rightColumn}>
            {user && (
              <UserSidebarCard
                user={user}
                showBio={false}
                showMeta={false}
                stats={sidebarStats}
                sticky={false}
              />
            )}
            <Chart
              data={chartData}
              type="user"
              title="Review Activity"
              renderHover={renderReviewHover}
              onRangeChange={({ start, end }) => {
                setStartDate(start);
                setEndDate(end);
              }}
            />
          </aside>
        </div>
      </div>

      {editReviewId && (
        <TrackReviewModal
          reviewId={editReviewId}
          onClose={() => {
            setEditReviewId(null);
            loadPage(1, false);
          }}
        />
      )}

      {newLogTrackId && (
        <TrackReviewModal
          trackId={newLogTrackId}
          onClose={() => {
            setNewLogTrackId(null);
            loadPage(1, false);
          }}
        />
      )}

      {listModalTrackId && (
        <AddToListModal
          trackId={listModalTrackId}
          onClose={() => setListModalTrackId(null)}
        />
      )}
    </>
  );
};

export default Reviews;
