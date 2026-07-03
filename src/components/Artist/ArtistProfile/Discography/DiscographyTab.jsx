import React, { useMemo, useRef, useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { Link } from "react-router-dom";
import { Check, SlidersHorizontal, Disc3 } from "lucide-react";
import Image from "../../../Utils/Images/Image/Image";
import useClickOutside from "../../../../hooks/useClickOutside";
import { createAlbumSlug } from "../../../../utils/formatters/textFormatters";
import TrackAlbumTitle from "../../../Utils/TrackAlbumTitle/TrackAlbumTitle";
import ToggleSlide from "../../../Utils/Toggle/ToggleSlide";
import styles from "./DiscographyTab.module.css";
import { fetchArtistDiscography } from "../../../../services/FetchArtist";

const CATEGORY_ORDER = ["album", "single", "ep"];

const CATEGORY_LABELS = {
  album: "Albums",
  ep: "EPs",
  single: "Singles",
};

const VIEW_OPTIONS = [
  { key: "", label: "All releases" },
  { key: "full-albums", label: "Full albums" },
  { key: "featured-albums", label: "Featured albums" },
  { key: "live-albums", label: "Live albums" },
];

const TOGGLE_OPTIONS = [
  { key: "album", label: "Albums" },
  { key: "single", label: "Singles & EPs" },
];

const classifyAlbum = (a) => {
  const group = a.album_group || a.album_type || a._bucket;
  if (group === "ep") return "ep";
  if (group === "single") {
    const total = a.total_tracks || a.totalTracks || 0;
    if (total >= 4) return "ep";
    return "single";
  }
  return "album";
};

const classifyView = (a) => {
  const name = (a.name || "").toLowerCase();
  if (/\b(live|unplugged|in concert|concert|acoustic session|sessions live)\b/.test(name)) {
    return "live-albums";
  }
  const group = a.album_group;
  if (group === "appears_on") return "featured-albums";
  return "full-albums";
};

const VIEW_NOUNS = {
  "full-albums": { one: "full album", many: "full albums" },
  "featured-albums": { one: "featured album", many: "featured albums" },
  "live-albums": { one: "live album", many: "live albums" },
};

const sortAlbums = (list, sortType, direction) => {
  const sorted = [...list];
  const mult = direction === "asc" ? 1 : -1;
  if (sortType === "date") {
    return sorted.sort((a, b) => {
      const da = a.release_date || a.releaseDate || "";
      const db = b.release_date || b.releaseDate || "";
      return da.localeCompare(db) * mult;
    });
  }
  if (sortType === "popularity") {
    return sorted.sort((a, b) => ((a.popularity || 0) - (b.popularity || 0)) * mult);
  }
  return sorted;
};

const DiscographyTab = ({
  artist,
  searchQuery = "",
  activeCategory = "all",
  sortOrder = "newest",
  activeView = "",
  activeDecade = "all",
  onCategoryChange,
  onSortChange,
  onViewChange,
  onDecadesChange,
}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const requestIdRef = useRef(0);

  useEffect(() => {
    const currentRequest = ++requestIdRef.current;
    setData([]);
    const loadData = async () => {
      if (!artist?.id) return;
      setLoading(true);
      try {
        const order = sortOrder === "newest" ? "newest" : (sortOrder === "oldest" ? "oldest" : "popularity");
        const params = { order };
        if (activeView) params.view = activeView;
        if (activeCategory && activeCategory !== "all") {
          params.type = Array.isArray(activeCategory) ? activeCategory : [activeCategory];
        }
        const res = await fetchArtistDiscography(artist.id, params);
        if (currentRequest !== requestIdRef.current) return;
        const BUCKETS = { albums: "album", singles: "single", eps: "ep" };
        let normalized = [];
        if (Array.isArray(res)) {
          normalized = res.filter(Boolean);
        } else if (res && typeof res === "object") {
          for (const [key, arr] of Object.entries(res)) {
            if (!Array.isArray(arr)) continue;
            const cat = BUCKETS[key];
            arr.forEach((item) => {
              if (!item) return;
              normalized.push(cat ? { ...item, _bucket: cat } : item);
            });
          }
        }
        setData(normalized);
      } catch (err) {
        console.error("Failed to fetch discography", err);
        if (currentRequest === requestIdRef.current) setData([]);
      } finally {
        if (currentRequest === requestIdRef.current) setLoading(false);
      }
    };
    loadData();
  }, [artist?.id, activeCategory, sortOrder, activeView]);


  const q = searchQuery.trim().toLowerCase();

  const getDecade = (a) => {
    const yr = parseInt((a.release_date || a.releaseDate || "").slice(0, 4), 10);
    if (!yr) return null;
    return Math.floor(yr / 10) * 10;
  };

  const availableDecades = useMemo(() => {
    const set = new Set();
    (Array.isArray(data) ? data : []).forEach((a) => {
      const d = getDecade(a);
      if (d) set.add(d);
    });
    return [...set].sort((a, b) => b - a);
  }, [data]);

  useEffect(() => {
    onDecadesChange?.(availableDecades);
  }, [availableDecades, onDecadesChange]);

  const searchedItems = useMemo(() => {
    let base = data;
    if (activeDecade !== "all") {
      base = base.filter((a) => getDecade(a) === activeDecade);
    }
    if (q) {
      base = base.filter((a) => (a.name || "").toLowerCase().includes(q));
    }
    if (activeView) {
      base = base.filter((a) => classifyAlbum(a) !== "album" || classifyView(a) === activeView);
    }
    const mapped = base.map((a) => ({ ...a, _category: classifyAlbum(a) }));
    if (activeCategory && activeCategory !== "all") {
      const raw = Array.isArray(activeCategory) ? activeCategory : [activeCategory];
      const allowed = new Set(raw);
      if (allowed.has("single")) allowed.add("ep");
      return mapped.filter((a) => allowed.has(a._category));
    }
    return mapped;
  }, [data, q, activeDecade, activeView, activeCategory]);

  const categoryCounts = useMemo(() => {
    const counts = {};
    searchedItems.forEach((a) => {
      counts[a._category] = (counts[a._category] || 0) + 1;
    });
    return counts;
  }, [searchedItems]);

  const availableCategories = useMemo(
    () => CATEGORY_ORDER.filter((k) => categoryCounts[k] > 0),
    [categoryCounts]
  );

  const activeFilters = useMemo(() => {
    if (activeCategory === "all" || !activeCategory) return new Set(availableCategories);
    if (Array.isArray(activeCategory)) {
      return new Set(activeCategory.filter((k) => availableCategories.includes(k)));
    }
    if (availableCategories.includes(activeCategory)) return new Set([activeCategory]);
    return new Set();
  }, [activeCategory, availableCategories]);

  const [menuPos, setMenuPos] = useState(null);
  const menuBtnRef = useRef(null);

  const filtersDisabled = activeCategory === "single" || activeCategory === "ep";

  useEffect(() => {
    if (filtersDisabled && menuPos) setMenuPos(null);
  }, [filtersDisabled, menuPos]);

  const toggleMenu = () => {
    if (filtersDisabled) return;
    if (menuPos) {
      setMenuPos(null);
      return;
    }
    const rect = menuBtnRef.current.getBoundingClientRect();
    setMenuPos({ top: rect.bottom + 4, right: window.innerWidth - rect.right });
  };

  const handleSortPick = (order) => {
    onSortChange?.(order);
  };

  const groupedAll = useMemo(() => {
    const map = {};
    searchedItems.forEach((a) => {
      const g = a._category;
      if (!activeFilters.has(g)) return;
      if (!map[g]) map[g] = [];
      map[g].push(a);
    });
    return CATEGORY_ORDER.filter((g) => map[g] && map[g].length > 0).map((g) => ({
      key: g,
      label: CATEGORY_LABELS[g],
      items: map[g],
    }));
  }, [searchedItems, activeFilters]);

  const showGrouped = activeFilters.size > 1;
  const flatItems = useMemo(() => groupedAll.flatMap((g) => g.items), [groupedAll]);

  const renderAlbumCard = (album) => {
    const artistsArr = album.artists || (artist ? [artist] : []);
    const slug = createAlbumSlug(album.name, artistsArr, album.id);
    const cover = album.images?.[0]?.url || album.coverUrl;
    const year = (album.release_date || album.releaseDate || "").split("-")[0];

    return (
      <div key={album.id} className={styles.albumCard}>
        <Link to={slug} state={{ albumId: album.id, type: album._category }} className={styles.coverWrapper}>
          <Image
            src={cover}
            alt={album.name}
            fallbackVariant="cover"
            borderLength="3px"
            className={styles.cover}
            width="100%"
            height="100%"
          />
        </Link>
        <TrackAlbumTitle
          title={album.name}
          to={slug}
          state={{ albumId: album.id, type: album._category }}
          ellipsis
          className={styles.albumName}
        />
        <div className={styles.albumMeta}>
          {year && <span>{year}</span>}
          {year && album._category && <span className={styles.metaDot}>•</span>}
          {album._category && (
            <span className={styles.albumType}>{CATEGORY_LABELS[album._category]}</span>
          )}
        </div>
      </div>
    );
  };


  const segments = useMemo(() => {
    const showAlbum = activeCategory === "album" || activeCategory === "all";
    const showSingle = activeCategory === "single" || activeCategory === "all";
    const albumCounts = { "full-albums": 0, "featured-albums": 0, "live-albums": 0 };
    let singleCount = 0;
    searchedItems.forEach((a) => {
      if (a._category === "album") albumCounts[classifyView(a)]++;
      else singleCount++;
    });
    const out = [];
    if (showAlbum) {
      ["full-albums", "featured-albums", "live-albums"].forEach((k) => {
        if (activeView && activeView !== k) return;
        const c = albumCounts[k];
        if (c <= 0) return;
        out.push({
          key: k,
          count: c,
          label: c === 1 ? VIEW_NOUNS[k].one : VIEW_NOUNS[k].many,
          onClick: () => onViewChange?.(k),
        });
      });
    }
    if (showSingle && !activeView && singleCount > 0) {
      out.push({
        key: "single",
        count: singleCount,
        label: singleCount === 1 ? "single or EP" : "singles & EPs",
        onClick: () => onCategoryChange?.("single"),
      });
    }
    return out;
  }, [searchedItems, activeCategory, activeView, onViewChange, onCategoryChange]);

  return (
    <div className={styles.container}>
      <div className={styles.controlsRow}>
        <div className={styles.counts}>
          {loading ? (
            <span>Loading...</span>
          ) : segments.length === 0 ? (
            <span>No releases found</span>
          ) : (
            <>
              <span>Showing&nbsp;</span>
              {segments.map((e, i) => (
                <React.Fragment key={e.key}>
                  <span>{e.count}&nbsp;</span>
                  <button
                    type="button"
                    className={styles.countLabel}
                    onClick={e.onClick}
                  >
                    {e.label}
                  </button>
                  {i < segments.length - 1 && (
                    <span>{i < segments.length - 2 ? ",\u00a0" : "\u00a0and\u00a0"}</span>
                  )}
                </React.Fragment>
              ))}
            </>
          )}
        </div>

        <div className={styles.controlsRight}>
          <div className={styles.filterWrapper}>
            <button
              ref={menuBtnRef}
              className={styles.iconButton}
              onClick={toggleMenu}
              disabled={filtersDisabled}
              aria-disabled={filtersDisabled}
              title={filtersDisabled ? "Filters only apply to albums" : undefined}
            >
              Filters
            </button>
            {menuPos && !filtersDisabled && (
              <FilterSortMenu
                position={menuPos}
                sortOrder={sortOrder}
                onSortPick={handleSortPick}
                activeView={activeView}
                onViewPick={(v) => onViewChange?.(v)}
                onClose={() => setMenuPos(null)}
              />
            )}
          </div>
          <ToggleSlide
            options={TOGGLE_OPTIONS}
            value={activeCategory}
            onChange={(k) => onCategoryChange?.(k)}
            ariaLabel="Release type"
          />

        </div>
      </div>

      <div className={styles.body}>
        {loading ? (
          <div className={styles.empty}>Loading...</div>
        ) : groupedAll.length === 0 ? (
          <div className={styles.emptyState}>
            <Disc3 size={32} className={styles.emptyIcon} />
            <span className={styles.emptyTitle}>No releases found</span>
            <span className={styles.emptySubtitle}>
              {q
                ? `Nothing matches "${searchQuery}". Try a different search.`
                : activeDecade !== "all"
                  ? "Nothing in this decade. Try clearing the decade filter."
                  : activeView
                    ? "Nothing in this view. Try a different filter."
                    : "Nothing in this category. Try switching tabs."}
            </span>
          </div>
        ) : showGrouped ? (
          groupedAll.map((group) => (
            <div key={group.key} className={styles.groupSection}>
              <h4 className={styles.groupTitle}>{group.label}</h4>
              <div className={styles.grid}>{group.items.map(renderAlbumCard)}</div>
            </div>
          ))
        ) : (
          <div className={styles.grid}>{flatItems.map(renderAlbumCard)}</div>
        )}
      </div>
    </div>
  );
};


const SORT_OPTIONS = [
  { key: "newest", label: "Newest first" },
  { key: "oldest", label: "Oldest first" },
  { key: "popular", label: "Most popular" },
];

const FilterSortMenu = ({
  position,
  sortOrder,
  onSortPick,
  activeView,
  onViewPick,
  onClose,
}) => {
  const ref = useRef(null);
  useClickOutside(ref, onClose);
  const style = {
    position: "fixed",
    top: position.top,
    right: position.right,
    zIndex: 9999,
  };
  return ReactDOM.createPortal(
    <div ref={ref} className={styles.filterMenu} style={style}>
      <div className={styles.menuSectionTitle}>Type</div>
      {VIEW_OPTIONS.map((opt) => {
        const active = (activeView || "") === opt.key;
        return (
          <button
            key={opt.key || "all"}
            type="button"
            className={styles.sortOption}
            onClick={() => onViewPick(opt.key)}
          >
            <span className={styles.sortOptionCheck}>
              {active && <Check size={14} />}
            </span>
            <span>{opt.label}</span>
          </button>
        );
      })}
      <div className={styles.filterMenuDivider} />
      <div className={styles.menuSectionTitle}>Sort by</div>
      {SORT_OPTIONS.map((opt) => {
        const active = sortOrder === opt.key;
        return (
          <button
            key={opt.key}
            type="button"
            className={styles.sortOption}
            onClick={() => onSortPick(opt.key)}
          >
            <span className={styles.sortOptionCheck}>
              {active && <Check size={14} />}
            </span>
            <span>{opt.label}</span>
          </button>
        );
      })}
    </div>,
    document.body
  );
};

export default DiscographyTab;
