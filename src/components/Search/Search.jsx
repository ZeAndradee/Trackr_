import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  FiSearch,
  FiMusic,
  FiDisc,
  FiList,
  FiUsers,
  FiX,
} from "react-icons/fi";
import styles from "./Search.module.css";
import useStickyFollowScroll from "../../hooks/useStickyFollowScroll";
import { searchAll } from "../../services/HandleSearch";
import LoadingIndicator from "../Utils/LoadingIndicator";
import SectionHeader from "../Utils/SectionHeader/SectionHeader";
import SearchTrackItem from "./SearchTrackItem";
import SearchAlbumItem from "./SearchAlbumItem";
import Image from "../Utils/Images/Image/Image";
import ListCovers from "../Utils/Images/ListCovers/ListCovers";
import {
  createTrackSlug,
  createAlbumSlug,
} from "../../utils/formatters/textFormatters";
import { TextInput } from "../Utils/Inputs/Inputs";

const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, delay]);

  return debouncedValue;
};

const Search = () => {
  const navigate = useNavigate();
  const { query: urlQuery } = useParams();

  const initialQuery = urlQuery ? decodeURIComponent(urlQuery) : "";

  const [query, setQuery] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState({
    tracks: [],
    albums: [],
    playlists: [],
    users: [],
  });
  const [hasSearched, setHasSearched] = useState(false);

  const debouncedQuery = useDebounce(query, 300);
  const inputRef = useRef(null);
  const sidebarRef = useRef(null);
  useStickyFollowScroll(sidebarRef);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const performSearch = useCallback(async (searchQuery) => {
    if (!searchQuery.trim()) {
      setResults({ tracks: [], albums: [], playlists: [], users: [] });
      setHasSearched(false);
      return;
    }

    setLoading(true);
    setHasSearched(true);

    try {
      const searchResponse = await searchAll(searchQuery);
      setResults({
        tracks: searchResponse.tracks || [],
        albums: searchResponse.albums || [],
        playlists: searchResponse.playlists || [],
        users: searchResponse.users || [],
      });
    } catch (error) {
      console.error("Search error:", error);
      setResults({ tracks: [], albums: [], playlists: [], users: [] });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    performSearch(debouncedQuery);

    if (debouncedQuery) {
      const encodedQuery = encodeURIComponent(debouncedQuery);
      navigate(`/search/${encodedQuery}`, { replace: true });
    } else if (urlQuery) {
      navigate("/search", { replace: true });
    }
  }, [debouncedQuery, performSearch, navigate, urlQuery]);

  const handleInputChange = useCallback((e) => {
    setQuery(e.target.value);
  }, []);

  const handleClearQuery = useCallback(() => {
    setQuery("");
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleTrackClick = useCallback(
    (track) => {
      navigate(createTrackSlug(track.name, track.artists, track.id), {
        state: { trackId: track.id },
      });
    },
    [navigate]
  );

  const handleUserClick = useCallback(
    (user) => {
      navigate(`/${user.username || user.id}`);
    },
    [navigate]
  );

  const handleAlbumClick = useCallback(
    (album) => {
      navigate(createAlbumSlug(album.name, album.artists, album.id), {
        state: { albumId: album.id },
      });
    },
    [navigate]
  );

  const handlePlaylistClick = useCallback((playlist) => {
    if (playlist.playlistUrl) {
      window.open(playlist.playlistUrl, "_blank");
    }
  }, []);

  const totalMainResults = useMemo(() => {
    return results.tracks.length + results.albums.length;
  }, [results]);

  const hasSidebarContent = useMemo(() => {
    return results.users.length > 0 || results.playlists.length > 0;
  }, [results]);

  const useCenteredLayout =
    !hasSearched || (totalMainResults === 0 && !hasSidebarContent);

  const renderEmptyState = () => {
    if (!hasSearched) {
      return (
        <div className={styles.emptyState}>
          <div className={styles.emptyStateIcon}>
            <FiSearch size={48} />
          </div>
          <h3>Search for music and users</h3>
          <p>Find tracks, albums, and connect with other users on Trackr.</p>
        </div>
      );
    }

    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyStateIcon}>
          <FiMusic size={48} />
        </div>
        <h3>No results found</h3>
        <p>Try a different search term or check your spelling.</p>
      </div>
    );
  };

  const renderMainContent = () => {
    if (loading) {
      return (
        <div className={styles.loadingContainer}>
          <LoadingIndicator />
        </div>
      );
    }

    if (!hasSearched || totalMainResults === 0) {
      return renderEmptyState();
    }

    return (
      <div className={styles.mainResults}>
        {results.tracks.length > 0 && (
          <section className={styles.resultSection}>
            <SectionHeader title="Tracks" />
            <div className={styles.resultsList}>
              {results.tracks.slice(0, 5).map((track) => (
                <SearchTrackItem
                  key={track.id}
                  track={track}
                  to={createTrackSlug(track.name, track.artists, track.id)}
                  state={{ trackId: track.id }}
                />
              ))}
            </div>
          </section>
        )}

        {results.albums.length > 0 && (
          <section className={styles.resultSection}>
            <SectionHeader title="Albums" />
            <div className={styles.resultsList}>
              {results.albums.slice(0, 5).map((album) => (
                <SearchAlbumItem
                  key={album.id}
                  album={album}
                  to={createAlbumSlug(album.name, album.artists, album.id)}
                  state={{ albumId: album.id }}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    );
  };

  const renderSidebar = () => {
    if (!hasSearched || !hasSidebarContent) return null;

    return (
      <aside ref={sidebarRef} className={styles.sidebar}>
        {results.users.length > 0 && (
          <section className={styles.sidebarSection}>
            <SectionHeader title="Users" />
            <div className={styles.facePile}>
              {results.users.slice(0, 6).map((user, idx) => (
                <div
                  key={user._id || user.id}
                  className={styles.facePileAvatar}
                  style={{ zIndex: 6 - idx }}
                  onClick={() => handleUserClick(user)}
                  title={user.name || user.username}
                >
                  <Image
                    src={user?.userimage || user?.image || user?.userImage}
                    name={user?.username}
                    userId={user?._id || user?.id}
                    status={user?.status}
                    size={48}
                    alt={`${user.username}'s profile`}
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {results.playlists.length > 0 && (
          <section className={styles.sidebarSection}>
            <SectionHeader title="Playlists" />
            <div className={styles.listItems}>
              {results.playlists.slice(0, 3).map((playlist) => (
                <div
                  key={playlist.id}
                  className={styles.listItem}
                  onClick={() => handlePlaylistClick(playlist)}
                >
                  <div className={styles.listHeader}>
                    <span className={styles.listName}>{playlist.name}</span>
                  </div>
                  <ListCovers
                    covers={
                      playlist.firstTracks?.length > 0
                        ? playlist.firstTracks.map((t) => ({ coverUrl: t.coverUrl, name: t.name }))
                        : playlist.images?.[0]?.url
                          ? [{ coverUrl: playlist.images[0].url, name: playlist.name || "" }]
                          : []
                    }
                    maxCovers={7}
                    size={80}
                    showTooltip={true}
                    showEmpty={false}
                    className={styles.listCoversRow}
                  />
                </div>
              ))}
            </div>
          </section>
        )}
      </aside>
    );
  };

  return (
    <div className={styles.container}>

      <div
        className={
          useCenteredLayout ? styles.centerLayout : styles.resultsLayout
        }
      >
        <div className={styles.mainColumn}>
          <div className={styles.searchInputContainer}>
            <TextInput
              ref={inputRef}
              type="text"
              icon={<FiSearch />}
              clearable
              onClear={handleClearQuery}
              placeholder="Search for tracks, albums, artists or users..."
              value={query}
              onChange={handleInputChange}
            />
          </div>

          {renderMainContent()}
        </div>
        {renderSidebar()}
      </div>
    </div>
  );
};

export default Search;
