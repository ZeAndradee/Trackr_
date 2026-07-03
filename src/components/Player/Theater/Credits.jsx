import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import ArtistList from "../../Utils/ArtistList/ArtistList";
import { GenreTag } from "../../Utils/Tags/Tags";
import { fetchTrack } from "../../../services/FetchTrack";
import { createAlbumSlug } from "../../../utils/formatters/textFormatters";
import styles from "./Credits.module.css";

const Credits = ({ track, onNavigate }) => {
  const trackId = track?.trackId || track?.id;
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!trackId) return;
    let cancelled = false;
    setLoading(true);
    setDetails(null);
    fetchTrack(trackId)
      .then((data) => {
        if (!cancelled) setDetails(data);
      })
      .catch(() => {
        if (!cancelled) setDetails(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [trackId]);

  const source = details || track;
  if (!source) return null;

  const title = source.name || source.title;
  const artists = source.artists || track?.artists || [];
  const album = source.album || track?.album;
  const albumId = album?.id || album?.albumId;
  const released = album?.releaseDate || album?.releaseYear || source.releaseYear;
  const genres = details?.genres || [];
  const label = album?.label;
  const duration = details?.duration;
  const crewByRole = (details?.crew || []).reduce((acc, member) => {
    if (!member?.role || !member?.name) return acc;
    const role = member.role.charAt(0).toUpperCase() + member.role.slice(1);
    if (!acc[role]) acc[role] = [];
    if (!acc[role].includes(member.name)) acc[role].push(member.name);
    return acc;
  }, {});

  const rows = [
    { label: "Title", content: <span className={styles.value}>{title}</span> },
    artists.length > 0 && {
      label: "Artists",
      content: <ArtistList artists={artists} className={styles.artistValue} />,
    },
    album?.name && {
      label: "Album",
      content: albumId ? (
        <Link
          to={createAlbumSlug(album.name, album.artists || artists, albumId)}
          className={styles.linkValue}
          onClick={onNavigate}
        >
          {album.name}
        </Link>
      ) : (
        <span className={styles.value}>{album.name}</span>
      ),
    },
    released && { label: "Released", content: <span className={styles.value}>{released}</span> },
    duration && { label: "Duration", content: <span className={styles.value}>{duration}</span> },
    ...Object.entries(crewByRole).map(([role, names]) => ({
      label: role,
      content: <span className={styles.value}>{names.join(", ")}</span>,
    })),
    genres.length > 0 && {
      label: "Genres",
      content: (
        <div className={styles.genreTags}>
          {genres.map((genre) => (
            <GenreTag key={genre} genre={genre} />
          ))}
        </div>
      ),
    },
    label && { label: "Label", content: <span className={styles.value}>{label}</span> },
  ].filter(Boolean);

  return (
    <div className={styles.credits}>
      {rows.map((row) => (
        <div key={row.label} className={styles.row}>
          <span className={styles.label}>{row.label}</span>
          {row.content}
        </div>
      ))}
      {loading && !details && <div className={styles.loading}>Loading credits...</div>}
    </div>
  );
};

export default Credits;
