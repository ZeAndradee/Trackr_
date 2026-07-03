import React, { useMemo, useState, useRef, useEffect } from "react";
import ReactDOM from "react-dom";
import { Link } from "react-router-dom";
import { Calendar as CalendarIcon, Check, Ellipsis, Layers, List, Loader, Search, SlidersHorizontal } from "lucide-react";
import Image from "../../../components/Utils/Images/Image/Image";
import Calendar from "../../../components/Utils/Calendar/Calendar/Calendar";
import ArtistList from "../../../components/Utils/ArtistList/ArtistList";
import ActionMenu from "../../../components/Utils/Dropdown/ActionMenu";
import { RatingTag, Tag } from "../../../components/Utils/Tags/Tags";
import ToggleSlide from "../../../components/Utils/Toggle/ToggleSlide";
import useClickOutside from "../../../hooks/useClickOutside";
import AlbumGroup from "./AlbumGroup";
import {
  createTrackSlug,
  createAlbumSlug,
  parseReviewContent,
} from "../../../utils/formatters/textFormatters";
import {
  getTimelineBucket,
  getDayKey,
  formatDayParts,
} from "../../../utils/formatters/dateFormatters";
import useInfiniteScroll from "../../../hooks/useInfiniteScroll";
import styles from "./Timeline.module.css";
import { TextInput } from "../../../components/Utils/Inputs/Inputs";

const REVIEW_MAX_LENGTH = 400;

const TimelineItem = ({ entry, onMoreClick, username }) => {
  const isAlbum = entry.type === "album";
  const slug = isAlbum
    ? createAlbumSlug(entry.name, entry.artists || [], entry.albumId)
    : createTrackSlug(entry.name, entry.artists || [], entry.trackId);
  const rawReview = (entry.review || "").trim();
  const { text: reviewText, gifUrl } = parseReviewContent(rawReview);
  const hasText = reviewText && reviewText.trim().length > 0;
  const hasGif = !!gifUrl;
  const hasRating = entry.rating > 0;
  const shouldTruncate = hasText && reviewText.length > REVIEW_MAX_LENGTH;
  const displayText = shouldTruncate
    ? `${reviewText.slice(0, REVIEW_MAX_LENGTH)}...`
    : reviewText;
  const logUrl = username ? `/${username}/log/${entry._id}` : null;
  const formattedDate = new Date(entry.selectedDate || entry.createdAt).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric"
  });

  return (
    <div className={styles.item}>
      <div className={styles.itemContent}>
        <div className={styles.trackRow}>
          <Link to={slug} className={styles.cover}>
            <Image
              src={entry.coverUrl}
              alt={entry.name}
              fallbackVariant="cover"
              borderLength="2px"
              className={styles.coverImg}
              width="100%"
              height="100%"
            />
          </Link>
          <div className={styles.titleBlock}>
            <div className={styles.titleLine}>
              <Link to={slug} className={styles.titleLink}>
                <span className={styles.title}>{entry.name}</span>
              </Link>
              <Tag size="0.65rem">{isAlbum ? "album" : "track"}</Tag>
            </div>
            {entry.artists && entry.artists.length > 0 && (
              <ArtistList artists={entry.artists} className={styles.artists} />
            )}
          </div>
          <button
            type="button"
            className={styles.moreButton}
            onClick={(event) => onMoreClick(event, entry._id)}
            aria-label="More options"
          >
            <Ellipsis size={16} />
          </button>
        </div>
        <div className={styles.reviewMetaRow}>
          {hasRating && <RatingTag rating={entry.rating} size="0.85rem" />}
          {hasRating && <span className={styles.metaDot}>•</span>}
          <span className={styles.reviewDate}>{formattedDate}</span>
        </div>
        {(hasText || hasGif) && (
          <div className={styles.reviewBlock}>
            {hasText && (
              <p className={styles.reviewText}>
                {displayText}
                {shouldTruncate && logUrl && (
                  <Link to={logUrl} className={styles.readMoreLink}>
                    Read more
                  </Link>
                )}
              </p>
            )}
            {hasGif && (
              <img
                src={gifUrl}
                alt="Review GIF"
                className={styles.reviewGif}
                onError={(event) => {
                  event.target.style.display = "none";
                }}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const Timeline = ({
  entries,
  loading,
  error,
  loadMore,
  hasMore = false,
  isFetchingMore = false,
  username,
  searchValue = "",
  onSearchChange,
  startDate = "",
  endDate = "",
  onStartDateChange,
  onEndDateChange,
  hasActiveFilters = false,
  onResetFilters,
  openEditOverlay,
  openNewLogOverlay,
  openListModal,
}) => {
  const { lastElementRef } = useInfiniteScroll(
    loadMore || (() => { }),
    hasMore,
    loading || isFetchingMore,
    600,
  );

  const [actionMenu, setActionMenu] = useState({
    visible: false,
    position: null,
    itemId: null,
  });

  const [groupingMode, setGroupingMode] = useState("grouped");
  const [filterMenuPos, setFilterMenuPos] = useState(null);
  const filterBtnRef = useRef(null);
  const [activeHeader, setActiveHeader] = useState({
    bucketLabel: "",
    fullDate: "",
  });

  useEffect(() => {
    const handleScroll = () => {
      const headerOffset = parseInt(
        getComputedStyle(document.documentElement).getPropertyValue("--header-offset") || "100",
        10
      );
      const stickyTop = headerOffset - 16;
      const dayDateEls = document.querySelectorAll(`.${styles.dayDate}`);

      const timelineEl = document.querySelector(`.${styles.timeline}`);
      if (timelineEl) {
        const timelineRect = timelineEl.getBoundingClientRect();
        if (timelineRect.top > stickyTop) {
          setActiveHeader({ bucketLabel: "", fullDate: "" });
          return;
        }
      }

      let activeEl = null;
      dayDateEls.forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.top <= stickyTop + 10) {
          activeEl = el;
        }
      });

      if (activeEl) {
        const bucket = activeEl.getAttribute("data-bucket-label");
        const date = activeEl.getAttribute("data-full-date");
        if (bucket && date) {
          setActiveHeader((prev) => {
            if (prev.bucketLabel === bucket && prev.fullDate === date) {
              return prev;
            }
            return { bucketLabel: bucket, fullDate: date };
          });
        }
      } else {
        setActiveHeader({ bucketLabel: "", fullDate: "" });
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [entries, groupingMode]);

  const formatRangeLabel = (iso) => {
    if (!iso) return null;
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
    if (!match) return iso;
    const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const dateButtonLabel = startDate || endDate
    ? `${formatRangeLabel(startDate) || "Any"} - ${formatRangeLabel(endDate) || "Any"}`
    : "Any date";

  const formatNumericDate = (iso) => {
    if (!iso) return null;
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
    if (!match) return iso;
    return `${match[2]}/${match[3]}/${match[1].slice(2)}`;
  };

  const numericRangeLabel = startDate || endDate
    ? `${formatNumericDate(startDate) || "—"} - ${formatNumericDate(endDate) || "—"}`
    : null;

  const handleRangeChange = (next) => {
    onStartDateChange?.(next.start || "");
    onEndDateChange?.(next.end || "");
  };

  const handleMoreClick = (event, itemId) => {
    event.stopPropagation();
    event.preventDefault();
    const rect = event.currentTarget.getBoundingClientRect();

    if (actionMenu.visible && actionMenu.itemId === itemId) {
      setActionMenu({ visible: false, position: null, itemId: null });
      return;
    }

    setActionMenu({
      visible: true,
      position: {
        top: rect.bottom + 4,
        right: window.innerWidth - rect.right,
      },
      itemId,
    });
  };

  const closeMenu = () =>
    setActionMenu({ visible: false, position: null, itemId: null });

  const groups = useMemo(() => {
    const sortedEntries = [...entries].sort((first, second) => {
      const firstTime = new Date(first.selectedDate || first.createdAt).getTime();
      const secondTime = new Date(second.selectedDate || second.createdAt).getTime();
      return secondTime - firstTime;
    });

    const childrenByParent = new Map();
    if (groupingMode === "grouped") {
      sortedEntries.forEach((entry) => {
        if (entry.parentLogId) {
          const list = childrenByParent.get(entry.parentLogId) || [];
          list.push(entry);
          childrenByParent.set(entry.parentLogId, list);
        }
      });
    }

    const bucketMap = new Map();
    sortedEntries.forEach((entry) => {
      if (groupingMode === "grouped" && entry.parentLogId) return;
      const dateValue = entry.selectedDate || entry.createdAt;
      const bucket = getTimelineBucket(dateValue);
      if (!bucketMap.has(bucket.key)) {
        bucketMap.set(bucket.key, {
          key: bucket.key,
          label: bucket.label,
          dayMap: new Map(),
        });
      }
      const currentBucket = bucketMap.get(bucket.key);
      const dayId = getDayKey(dateValue);
      if (!currentBucket.dayMap.has(dayId)) {
        currentBucket.dayMap.set(dayId, { key: dayId, items: [] });
      }
      const children =
        groupingMode === "grouped" && entry.type === "album"
          ? childrenByParent.get(entry._id) || []
          : [];
      currentBucket.dayMap.get(dayId).items.push({ entry, children });
    });
    return Array.from(bucketMap.values()).map((bucket) => ({
      key: bucket.key,
      label: bucket.label,
      days: Array.from(bucket.dayMap.values()),
    }));
  }, [entries, groupingMode]);

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>History</h2>
        {hasActiveFilters && (
          <button
            type="button"
            className={styles.resetButton}
            onClick={onResetFilters}
          >
            Clear filters
          </button>
        )}
      </div>
      <div className={styles.filters}>
        <div className={styles.searchWrap}>
          <TextInput
            type="text"
            icon={<Search size={16} />}
            clearable
            onClear={() => onSearchChange?.("")}
            placeholder="Search tracks..."
            value={searchValue}
            onChange={(event) => onSearchChange?.(event.target.value)}
            containerClassName={styles.searchInputWrapper}
          />
        </div>
        <div className={styles.filterWrapper}>
          <button
            ref={filterBtnRef}
            type="button"
            className={styles.filterButton}
            onClick={() => {
              if (filterMenuPos) {
                setFilterMenuPos(null);
                return;
              }
              const rect = filterBtnRef.current.getBoundingClientRect();
              setFilterMenuPos({ top: rect.bottom + 4, right: window.innerWidth - rect.right });
            }}
            aria-haspopup="menu"
            aria-expanded={!!filterMenuPos}
          >
            <SlidersHorizontal size={14} aria-hidden="true" />
            <span>Filters</span>
          </button>
          {filterMenuPos && (
            <TimelineFilterMenu
              position={filterMenuPos}
              groupingMode={groupingMode}
              onGroupingChange={setGroupingMode}
              onClose={() => setFilterMenuPos(null)}
              startDate={startDate}
              endDate={endDate}
              onRangeChange={handleRangeChange}
              dateButtonLabel={numericRangeLabel || dateButtonLabel}
            />
          )}
        </div>
      </div>
      {loading ? (
        <div className={styles.loaderWrap}>
          <Loader className={styles.spinner} size={24} />
        </div>
      ) : error ? (
        <p className={styles.emptyText}>Failed to load history.</p>
      ) : entries.length === 0 ? (
        <div className={styles.emptyState}>
          <span className={styles.emptyTitle}>
            An empty timeline walks into a bar...
          </span>
          <span className={styles.emptySubtitle}>
            ...there's no punchline until you log something.
          </span>
        </div>
      ) : (
        <div className={styles.timeline}>
          {activeHeader.fullDate && (
            <div className={styles.stickyHeaderContainer}>
              <div className={styles.stickyHeaderContent}>
                <span className={styles.bucketSwap} key={activeHeader.bucketLabel}>
                  <span className={styles.dateLabel}>{activeHeader.bucketLabel}</span>
                </span>
                <span className={styles.dateSeparator}>•</span>
                <span className={styles.dateSwap} key={activeHeader.fullDate}>
                  <span className={styles.fullDate}>{activeHeader.fullDate}</span>
                </span>
              </div>
            </div>
          )}
          {groups.map((group) => (
            <div key={group.key} className={styles.group}>
              {group.days.map((day, dayIndex) => {
                const firstEntry = day.items[0].entry;
                const dateValue = firstEntry.selectedDate || firstEntry.createdAt;
                const fullDateStr = new Date(dateValue).toLocaleDateString(undefined, {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric"
                });
                return (
                  <div key={day.key} className={styles.daySubgroup}>
                    <div
                      className={styles.dayDate}
                      data-bucket-label={group.label}
                      data-full-date={fullDateStr}
                    >
                      <span className={styles.dateLabel}>{group.label}</span>
                      <span className={styles.dateSeparator}>•</span>
                      <span className={styles.fullDate}>{fullDateStr}</span>
                    </div>
                    <div className={styles.items}>
                      {day.items.map(({ entry, children }) => {
                        const useAlbumGroup =
                          groupingMode === "grouped" &&
                          entry.type === "album" &&
                          children.length > 0;
                        return useAlbumGroup ? (
                          <AlbumGroup
                            key={entry._id}
                            album={entry}
                            tracks={children}
                            onMoreClick={handleMoreClick}
                            username={username}
                            totalTracks={entry.totalTracks}
                          />
                        ) : (
                          <TimelineItem
                            key={entry._id}
                            entry={entry}
                            onMoreClick={handleMoreClick}
                            username={username}
                          />
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
          {hasMore && (
            <div ref={lastElementRef} className={styles.sentinel} aria-hidden="true" />
          )}
          {isFetchingMore && (
            <div className={styles.loaderWrap}>
              <Loader className={styles.spinner} size={20} />
            </div>
          )}
        </div>
      )}


      {actionMenu.visible && (
        <ActionMenu
          menuType="reviews"
          itemId={actionMenu.itemId}
          position={actionMenu.position}
          anchor="top-right"
          onClose={closeMenu}
          journalEntries={entries}
          openEditOverlay={openEditOverlay || (() => { })}
          openNewLogOverlay={openNewLogOverlay || (() => { })}
          openListModal={openListModal || (() => { })}
        />
      )}
    </section>
  );
};

const toIso = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const buildPresets = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const minus = (n) => {
    const d = new Date(today);
    d.setDate(d.getDate() - n);
    return d;
  };
  return [
    { key: "any", label: "Any time", range: { start: "", end: "" } },
    { key: "7d", label: "Last 7 days", range: { start: toIso(minus(6)), end: toIso(today) } },
    { key: "30d", label: "Last 30 days", range: { start: toIso(minus(29)), end: toIso(today) } },
    { key: "year", label: "This year", range: { start: `${today.getFullYear()}-01-01`, end: toIso(today) } },
  ];
};

const TimelineFilterMenu = ({
  position,
  groupingMode,
  onGroupingChange,
  onClose,
  startDate,
  endDate,
  onRangeChange,
  dateButtonLabel,
}) => {
  const ref = useRef(null);
  const dateRowRef = useRef(null);
  const [calendarOpen, setCalendarOpen] = useState(false);
  useClickOutside(ref, () => {
    if (calendarOpen) return;
    onClose();
  });
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (calendarOpen && dateRowRef.current && !dateRowRef.current.contains(event.target)) {
        setCalendarOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [calendarOpen]);

  const presets = useMemo(buildPresets, []);
  const matchedPreset = presets.find(
    (p) => p.range.start === startDate && p.range.end === endDate,
  );
  const activeKey = matchedPreset
    ? matchedPreset.key
    : (startDate || endDate ? "custom" : "any");

  const applyPreset = (preset) => {
    setCalendarOpen(false);
    onRangeChange({ start: preset.range.start, end: preset.range.end });
  };

  const menuStyle = {
    position: "fixed",
    top: position.top,
    right: position.right,
    zIndex: 9999,
  };

  return ReactDOM.createPortal(
    <div ref={ref} className={styles.filterMenu} style={menuStyle}>
      <div className={styles.menuHeader}>
        <span className={styles.menuTitle}>Filters</span>
      </div>

      <div className={styles.menuSection}>
        <div className={styles.menuSectionLabel}>Date range</div>
        <div className={styles.presetList}>
          {presets.map((preset) => {
            const isActive = activeKey === preset.key;
            return (
              <button
                key={preset.key}
                type="button"
                className={`${styles.presetItem} ${isActive ? styles.presetActive : ""}`}
                onClick={() => applyPreset(preset)}
              >
                <span className={styles.presetLabel}>{preset.label}</span>
                {isActive && <Check size={14} className={styles.presetCheck} aria-hidden="true" />}
              </button>
            );
          })}
          <div className={styles.customRow} ref={dateRowRef}>
            <button
              type="button"
              className={`${styles.presetItem} ${activeKey === "custom" ? styles.presetActive : ""}`}
              onClick={() => setCalendarOpen((prev) => !prev)}
              aria-haspopup="dialog"
              aria-expanded={calendarOpen}
            >
              <span className={styles.presetLabel}>Custom range</span>
              {activeKey === "custom" ? (
                <span className={styles.presetMeta}>{dateButtonLabel}</span>
              ) : (
                <CalendarIcon size={14} className={styles.presetMetaIcon} aria-hidden="true" />
              )}
            </button>
            <Calendar
              isOpen={calendarOpen}
              mode="range"
              value={{ start: startDate, end: endDate }}
              onChange={(next) => {
                onRangeChange(next);
              }}
              onClose={() => setCalendarOpen(false)}
            />
          </div>
        </div>
      </div>

      <div className={styles.menuDivider} />

      <div className={styles.menuSection}>
        <div className={styles.menuSectionLabel}>Album tracks</div>
        <ToggleSlide
          size="sm"
          className={styles.groupingToggle}
          options={[
            { key: "grouped", icon: <Layers size={12} />, label: "Grouped", title: "Grouped" },
            { key: "split", icon: <List size={12} />, label: "Split", title: "Split" },
          ]}
          value={groupingMode}
          onChange={onGroupingChange}
          ariaLabel="Grouping mode"
        />
      </div>
    </div>,
    document.body
  );
};

export default Timeline;
