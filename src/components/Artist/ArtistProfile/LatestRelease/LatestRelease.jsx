import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { MoreVertical, Play, ListEnd } from "lucide-react";
import Image from "../../../Utils/Images/Image/Image";
import ActionMenu from "../../../Utils/Dropdown/ActionMenu";
import { GenreTag } from "../../../Utils/Tags/Tags";
import { fetchArtistLatestRelease } from "../../../../services/FetchArtist";
import { createAlbumSlug } from "../../../../utils/formatters/textFormatters";
import { usePlayer } from "../../../../contexts/PlayerContext";
import showToast from "../../../Utils/Toast/Toast";
import styles from "./LatestRelease.module.css";

const formatRelease = (iso) => {
  const d = new Date(iso);
  const year = d.getFullYear();
  if (year === new Date().getFullYear()) {
    return d.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }
  return String(year);
};

const freshnessBadge = (iso) => {
  const d = new Date(iso);
  const days = Math.floor((Date.now() - d.getTime()) / (24 * 3600 * 1000));
  if (days < 0) return "Coming soon";
  if (days <= 7) return "this week";
  if (days <= 30) return "this month";
  if (days <= 90) return "Recent";
  return null;
};

const LatestRelease = ({ artist }) => {
  const [release, setRelease] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState(null);
  const moreBtnRef = useRef(null);
  const { playAlbumInQueue, addAlbumToQueue } = usePlayer();

  useEffect(() => {
    let active = true;
    const load = async () => {
      if (!artist?.id) return;
      try {
        const res = await fetchArtistLatestRelease(artist.id);
        const data = Array.isArray(res) ? res[0] : null;
        if (active) setRelease(data);
      } catch (e) {
        console.error("Failed to load latest release", e);
        if (active) setRelease(null);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [artist?.id]);

  if (!release) return null;

  const slug = createAlbumSlug(release.name, [artist], release.id);
  const badge = freshnessBadge(release.release_date);

  const handleOpenMenu = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setMenuPos({
      top: rect.bottom + 8,
      right: window.innerWidth - rect.right,
    });
    setMenuOpen(true);
  };

  const menuItems = [
    {
      label: "Play album",
      icon: <Play size={18} />,
      onClick: () => playAlbumInQueue(release.id),
      section: "queue",
    },
    {
      label: "Add album to queue",
      icon: <ListEnd size={18} />,
      onClick: () => {
        addAlbumToQueue(release.id);
        showToast(`Added to queue: ${release.name}`, "success");
      },
      section: "queue",
    },
  ];

  return (
    <section className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>Latest Release</h3>
        {badge && <GenreTag genre={badge} size="0.68rem" />}
      </div>
      <div className={styles.card}>
        <Link
          to={slug}
          state={{ albumId: release.id, type: "album" }}
          className={styles.coverLink}
        >
          <Image
            src={release.images?.[0]?.url}
            alt={release.name}
            fallbackVariant="cover"
            width="100%"
            height="100%"
            className={styles.cover}
            borderLength="2px"
          />
        </Link>
        <div className={styles.info}>
          <Link
            to={slug}
            state={{ albumId: release.id, type: "album" }}
            className={styles.name}
          >
            {release.name}
          </Link>
          <div className={styles.meta}>
            <span>{formatRelease(release.release_date)}</span>
            <span className={styles.dot}>•</span>
            <span>{release.total_tracks} tracks</span>
          </div>
        </div>
        <button
          ref={moreBtnRef}
          className={styles.moreBtn}
          onClick={handleOpenMenu}
          aria-label="More options"
        >
          <MoreVertical size={18} />
        </button>
      </div>
      {menuOpen && (
        <ActionMenu
          items={menuItems}
          onClose={() => setMenuOpen(false)}
          position={menuPos}
          anchor="top-right"
        />
      )}
    </section>
  );
};

export default LatestRelease;
