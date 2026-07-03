import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import ReactDOM from "react-dom";
import { Link } from "react-router-dom";
import { FiX } from "react-icons/fi";
import { ArrowUp, ArrowDown, Calendar, TrendingUp } from "lucide-react";
import Image from "../../../Utils/Images/Image/Image";
import ActionMenu from "../../../Utils/Dropdown/ActionMenu";
import useScrollLock from "../../../../hooks/useScrollLock";
import { createAlbumSlug } from "../../../../utils/formatters/textFormatters";
import TrackAlbumTitle from "../../../Utils/TrackAlbumTitle/TrackAlbumTitle";
import styles from "./DiscographyModal.module.css";

const CLOSE_DURATION = 250;

const FILTERS = [
  { key: "all", label: "All" },
  { key: "album", label: "Albums" },
  { key: "single", label: "Singles & EPs" },
];

const GROUP_LABELS = {
  album: "Albums",
  single: "Singles & EPs",
};

const GROUP_ORDER = ["album", "single"];

const SORT_LABELS = {
  date: "Release Date",
  popularity: "Popularity",
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

const DiscographyModal = ({ albums, artist, onClose }) => {
  const [isClosing, setIsClosing] = useState(false);
  const [filter, setFilter] = useState("all");
  const [sortType, setSortType] = useState("date");
  const [sortDir, setSortDir] = useState("desc");
  const [sortMenuPos, setSortMenuPos] = useState(null);
  const sortBtnRef = useRef(null);
  useScrollLock();

  const handleSortPick = (type) => {
    if (type === sortType) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortType(type);
      setSortDir("desc");
    }
    setSortMenuPos(null);
  };

  const openSortMenu = () => {
    const rect = sortBtnRef.current.getBoundingClientRect();
    setSortMenuPos({ top: rect.bottom + 4, right: window.innerWidth - rect.right });
  };

  const closeModal = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => onClose(), CLOSE_DURATION);
  }, [onClose]);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [closeModal]);

  const availableFilters = useMemo(() => {
    const groups = new Set(albums.map((a) => a.album_group).filter(Boolean));
    return FILTERS.filter((f) => f.key === "all" || groups.has(f.key));
  }, [albums]);

  const filtered = useMemo(() => {
    const base = filter === "all" ? albums : albums.filter((a) => a.album_group === filter);
    return sortAlbums(base, sortType, sortDir);
  }, [albums, filter, sortType, sortDir]);

  const groupedAll = useMemo(() => {
    const map = {};
    albums.forEach((a) => {
      const g = a.album_group || "album";
      if (!map[g]) map[g] = [];
      map[g].push(a);
    });
    return GROUP_ORDER.filter((g) => map[g] && map[g].length > 0).map((g) => ({
      key: g,
      label: GROUP_LABELS[g],
      items: sortAlbums(map[g], sortType, sortDir),
    }));
  }, [albums, sortType, sortDir]);

  const DirIcon = sortDir === "desc" ? ArrowDown : ArrowUp;

  const sortMenuItems = [
    {
      label: SORT_LABELS.date,
      icon: <Calendar size={18} />,
      onClick: () => handleSortPick("date"),
    },
    {
      label: SORT_LABELS.popularity,
      icon: <TrendingUp size={18} />,
      onClick: () => handleSortPick("popularity"),
    },
  ];

  const artistImage = artist?.images?.[0]?.url || artist?.coverUrl;

  const renderAlbumCard = (album) => {
    const artistsArr = album.artists || (artist ? [artist] : []);
    const slug = createAlbumSlug(album.name, artistsArr, album.id);
    const cover = album.images?.[0]?.url || album.coverUrl;
    const year = (album.release_date || album.releaseDate || "").split("-")[0];

    return (
      <div key={album.id} className={styles.albumCard}>
        <Link
          to={slug}
          state={{ albumId: album.id }}
          className={styles.coverWrapper}
          onClick={closeModal}
        >
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
          state={{ albumId: album.id }}
          onClick={closeModal}
          ellipsis
          className={styles.albumName}
        />
        <div className={styles.albumMeta}>
          {year && <span>{year}</span>}
          {year && album.album_group && <span className={styles.metaDot}>•</span>}
          {album.album_group && (
            <span className={styles.albumType}>{album.album_group}</span>
          )}
        </div>
      </div>
    );
  };

  const content = (
    <div
      className={`${styles.overlay} ${isClosing ? styles.overlayClosing : ""}`}
      onClick={closeModal}
    >
      <div
        className={`${styles.modal} ${isClosing ? styles.modalClosing : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.headerAvatar}>
              <Image
                src={artistImage}
                name={artist?.name}
                size={48}
                showBadge={false}
              />
            </div>
            <div className={styles.headerInfo}>
              <h3 className={styles.headerTitle}>Discography</h3>
              {artist?.name && (
                <span className={styles.headerSub}>{artist.name}</span>
              )}
            </div>
          </div>
          <button className={styles.closeButton} onClick={closeModal}>
            <FiX size={20} />
          </button>
        </div>

        <div className={styles.controlsRow}>
          {availableFilters.length > 2 && (
            <div className={styles.tabs}>
              {availableFilters.map((f) => (
                <button
                  key={f.key}
                  className={`${styles.tabButton} ${filter === f.key ? styles.activeTab : ""}`}
                  onClick={() => setFilter(f.key)}
                >
                  {f.label}
                </button>
              ))}
            </div>
          )}
          <div className={styles.sortWrapper}>
            <button
              ref={sortBtnRef}
              className={styles.sortToggle}
              onClick={openSortMenu}
            >
              {SORT_LABELS[sortType]}
              <DirIcon size={14} />
            </button>
            {sortMenuPos && (
              <ActionMenu
                items={sortMenuItems}
                position={sortMenuPos}
                onClose={() => setSortMenuPos(null)}
              />
            )}
          </div>
        </div>

        <div className={styles.body}>
          {filter === "all" ? (
            groupedAll.length === 0 ? (
              <div className={styles.empty}>No releases found.</div>
            ) : (
              groupedAll.map((group) => (
                <div key={group.key} className={styles.groupSection}>
                  <h4 className={styles.groupTitle}>{group.label}</h4>
                  <div className={styles.grid}>
                    {group.items.map(renderAlbumCard)}
                  </div>
                </div>
              ))
            )
          ) : filtered.length === 0 ? (
            <div className={styles.empty}>No releases in this category.</div>
          ) : (
            <div className={styles.grid}>{filtered.map(renderAlbumCard)}</div>
          )}
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(content, document.body);
};

export default DiscographyModal;
