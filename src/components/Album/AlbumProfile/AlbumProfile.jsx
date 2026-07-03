import React, { useState, useEffect, useCallback, useRef } from "react";
import useStickyFollowScroll from "../../../hooks/useStickyFollowScroll";
import useClickOutside from "../../../hooks/useClickOutside";
import { Link, useNavigate } from "react-router-dom";
import { useUserContext } from "../../../contexts/UserContext";
import { IoAlbums, IoInformationCircle } from "react-icons/io5";
import { IoIosCheckmarkCircle } from "react-icons/io";
import { FiShare } from "react-icons/fi";
import styles from "./AlbumProfile.module.css";
import {
  fetchAlbumFriendsListened,
  fetchAlbumStreams,
} from "../../../services/FetchAlbum";
import FriendsFacePile from "../../Utils/FriendsFacePile/FriendsFacePile";
import ListenersOverlay from "../../Track/TrackProfile/ListenersOverlay";
import { createAlbumSlug, createArtistSlug } from "../../../utils/formatters/textFormatters";
import AlbumReviewModal from "../../Review/AlbumReviewModal/AlbumReviewModal";
import TrackList from "../../Utils/TrackList/TrackList";
import ArtistList from "../../Utils/ArtistList/ArtistList";
import TrackAlbumTitle from "../../Utils/TrackAlbumTitle/TrackAlbumTitle";
import HeroItem from "../../Utils/HeroItem/HeroItem";
import { Button } from "../../Utils/Buttons/Button";
import { fetchArtistById } from "../../../services/FetchArtist";
import SectionHeader from "../../Utils/SectionHeader/SectionHeader";
import { GenreTag } from "../../Utils/Tags/Tags";
import ReviewsSection from "../../Review/ReviewsSection/ReviewsSection";
import YouTubeSection from "../../Track/TrackProfile/YouTubeSection/YouTubeSection";
import WikipediaSection from "./WikipediaSection/WikipediaSection";
import SimilarSection from "../../Utils/SimilarSection/SimilarSection";
import showToast from "../../Utils/Toast/Toast";
import { Play, ListEnd } from "lucide-react";
import { usePlayer } from "../../../contexts/PlayerContext";
import { useAuthModal } from "../../../contexts/AuthModalContext";
import { Tabs, TabPanels, TabPanel } from "../../Utils/Tabs/Tabs";

const TYPE_LABELS = { album: "Album", ep: "EP", single: "Single" };

const classifyAlbumType = (a) => {
  const group = a.album_group || a.album_type;
  if (group === "single") {
    const total = a.total_tracks || a.totalTracks || 0;
    if (total >= 4) return "ep";
    return "single";
  }
  return "album";
};

const SidebarAlbumList = ({ title, albums, onViewAll, viewAllLink }) => {
  const navigate = useNavigate();
  if (!albums || albums.length === 0) return null;

  return (
    <div className={styles.sidebarSection}>
      <div className={styles.sidebarHeader}>
        <h3 className={styles.sidebarTitle}>{title}</h3>
      </div>
      <div className={styles.sidebarList}>
        {albums.slice(0, 6).map((album) => {
          const type = classifyAlbumType(album);
          return (
            <div
              key={album.id}
              className={styles.sidebarCard}
              onClick={() => navigate(createAlbumSlug(album.name, album.artists, album.id), { state: { albumId: album.id } })}
            >
              <img
                src={album.images?.[0]?.url || album.coverUrl}
                alt={album.name}
                className={styles.sidebarCardCover}
              />
              <div className={styles.sidebarCardInfo}>
                <TrackAlbumTitle title={album.name} ellipsis className={styles.sidebarCardTitle} />
                <div className={styles.sidebarCardMeta}>
                  <Link
                    to={`/year/${album.release_date?.split("-")[0] || album.releaseYear}`}
                    onClick={(e) => e.stopPropagation()}
                    className={styles.sidebarYearLink}
                  >
                    {album.release_date?.split("-")[0] || album.releaseYear}
                  </Link>
                </div>
              </div>
              <span className={styles.albumType}>{TYPE_LABELS[type]}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const AlbumProfile = ({ albumData }) => {
  const { userLogged } = useUserContext();
  const { playAlbumInQueue, addAlbumToQueue } = usePlayer();
  const { openModal } = useAuthModal();
  const sidebarRef = useRef(null);
  useStickyFollowScroll(sidebarRef);
  const [activeTab, setActiveTab] = useState("overview");
  const [moreAlbums, setMoreAlbums] = useState([]);
  const [listenedTracks, setListenedTracks] = useState(new Set());

  const [showGenreDropdown, setShowGenreDropdown] = useState(false);
  const genreDropdownRef = useRef(null);
  useClickOutside(genreDropdownRef, () => setShowGenreDropdown(false));

  const [showReviewModal, setShowReviewModal] = useState(false);

  const [artistImage, setArtistImage] = useState(null);

  const [rating, setRating] = useState(0);
  const [listened, setListened] = useState(false);
  const [friendsListened, setFriendsListened] = useState([]);
  const [showListenersOverlay, setShowListenersOverlay] = useState(false);
  const [listenersOverlayTab, setListenersOverlayTab] = useState("listeners");
  const [streamsMap, setStreamsMap] = useState({});

  useEffect(() => {
    const loadStreams = async () => {
      if (albumData?.id) {
        const data = await fetchAlbumStreams(albumData.id);
        if (data && Array.isArray(data)) {
          const map = {};
          data.forEach((item) => { map[item.id] = item.streams; });
          setStreamsMap(map);
        }
      }
    };
    loadStreams();
  }, [albumData?.id]);

  useEffect(() => {
    const loadExtras = async (id) => {
      if (albumData?.artists?.[0]?.id) {
        try {
          const artistInfo = await fetchArtistById(albumData.artists[0].id);

          if (artistInfo) {
            if (artistInfo.images?.[0]?.url) {
              setArtistImage(artistInfo.images[0].url);
            }

            if (artistInfo.albums && Array.isArray(artistInfo.albums)) {
              setMoreAlbums(artistInfo.albums.filter((a) => a.id !== id));
            }
          }
        } catch (e) {
          console.error("Failed to load extra album info", e);
        }
      }
    };

    const loadFriends = async (id) => {
      try {
        const friendsData = await fetchAlbumFriendsListened(id);
        const friendsArray = friendsData?.data?.friends || friendsData?.friends || (Array.isArray(friendsData) ? friendsData : null) || (Array.isArray(friendsData?.data) ? friendsData.data : null);
        if (friendsArray && friendsArray.length > 0) {
          setFriendsListened(friendsArray);
        }
      } catch (e) {
        console.error("Failed to load album friends", e);
      }
    };

    if (albumData) {
      const id = albumData.id;
      loadExtras(id);
      loadFriends(id);

      const initialListened = new Set();
      albumData.tracks?.forEach((track) => {
        if (track.userInteractions?.listened) {
          initialListened.add(track.id);
        }
      });
      setListenedTracks(initialListened);

      if (albumData.userInteractions) {
        setRating(albumData.userInteractions.rating || 0);
        setListened(albumData.userInteractions.listened || false);
      }
    }
  }, [albumData]);

  useEffect(() => {
    const handleLogCreated = (event) => {
      const logData = event.detail;
      if (logData && logData.track_id) {
        setListenedTracks((prev) => {
          const newSet = new Set(prev);
          newSet.add(logData.track_id);
          return newSet;
        });
      }
    };

    window.addEventListener("logCreated", handleLogCreated);
    return () => {
      window.removeEventListener("logCreated", handleLogCreated);
    };
  }, []);



  const handleShare = useCallback(() => {
    navigator.clipboard.writeText(window.location.href);
    showToast("Link copied to clipboard", "success");
  }, []);

  const handleOpenLog = useCallback(() => {
    if (!userLogged) {
      openModal("login-reason", { reason: "review" });
      return;
    }
    setShowReviewModal(true);
  }, [userLogged, openModal]);

  const handleCloseReviewModal = useCallback(() => {
    setShowReviewModal(false);
  }, []);

  if (!albumData) return null;


  const releaseYear = albumData.releaseDate
    ? albumData.releaseDate.split("-")[0]
    : "";

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const totalTracks = albumData.tracks?.length || 0;
  const listenedCount = listenedTracks.size;
  const completionPercent =
    totalTracks > 0 ? Math.round((listenedCount / totalTracks) * 100) : 0;


  return (
    <div className={styles.container}>
      <HeroItem
        showCoverCard={true}
        coverUrl={albumData.images?.[0]?.url || albumData.coverUrl}
        title={albumData.name}
        releaseYear={releaseYear}
        textWrapperClassName=""
        type={albumData.album_type || albumData.type || "ALBUM"}
        userRating={rating}
        userLogUrl={albumData.userInteractions?.reviewId && userLogged?.username ? `/${userLogged.username}/log/${albumData.userInteractions.reviewId}` : undefined}
        totalTracks={albumData.tracks?.length || 0}
        subtitle={
          <div className={styles.subtitleContainer}>
            <div className={styles.artistRow}>
              {artistImage && (
                <img
                  src={artistImage}
                  alt={albumData.primaryArtist?.name}
                  className={styles.artistImage}
                />
              )}
              <ArtistList
                artists={albumData.artists || []}
                className={styles.artistLink}
              />
              <div className={styles.genresRow}>
                {albumData.genres && albumData.genres.length > 0 && (
                  <>
                    <span className={styles.separation}>•</span>
                    {albumData.genres.slice(0, 3).map((genre) => (
                      <GenreTag key={genre} genre={genre} />
                    ))}
                    {albumData.genres.length > 3 && (
                      <div className={styles.genreDropdownWrapper} ref={genreDropdownRef}>
                        <button
                          type="button"
                          className={styles.moreGenres}
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowGenreDropdown(!showGenreDropdown);
                          }}
                        >
                          +{albumData.genres.length - 3}
                        </button>
                        {showGenreDropdown && (
                          <div className={styles.genreDropdown}>
                            {albumData.genres.slice(3).map(genre => (
                              <GenreTag key={genre} genre={genre} />
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        }
        stats={
          <div className={styles.heroRightStats}>
            <div className={styles.statLineItem}>
              <span className={styles.statLineValue}>{albumData.stats?.listens || 0}</span>
              <span className={styles.statLineLabel}>Reviews</span>
            </div>
            <div className={styles.statSeparator} />
            <div className={styles.statLineItem}>
              <span className={styles.statLineValue}>{albumData.stats?.likes || 0}</span>
              <span className={styles.statLineLabel}>Likes</span>
            </div>
            <div className={styles.statSeparator} />
            <div className={styles.statLineItem}>
              <span className={styles.statLineValue}>{albumData.stats?.averageRating || 0}</span>
              <span className={styles.statLineLabel}>Avg. Rating</span>
            </div>
          </div>
        }
        actions={
          <Button variant="primary" size="lg" onClick={handleOpenLog}>
            {albumData.userInteractions?.reviewId ? "Review again" : "Review this album"}
          </Button>
        }
      >
        <FriendsFacePile
          users={friendsListened}
          onOpenModal={() => {
            setListenersOverlayTab("friends");
            setShowListenersOverlay(true);
          }}
        />
      </HeroItem>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          { key: "overview", label: "Overview" },
          { key: "details", label: "Details" },
        ]}
        rightSlot={
          <button className={styles.shareButton} onClick={handleShare}>
            <FiShare />
            Share
          </button>
        }
      />

      <div className={styles.tabContent}>
        <TabPanels activeKey={activeTab}>
          <TabPanel tabKey="overview" activeKey={activeTab}>
            <div className={styles.contentContainer}>
              <div className={styles.mainColumn}>
                <TrackList
                  tracks={albumData.tracks || []}
                  album={{ ...albumData, totalDuration: albumData.totalDuration }}
                  streamsMap={streamsMap}
                  showHeader={true}
                  albumMenuItems={[
                    {
                      label: "Play album",
                      icon: <Play size={18} />,
                      onClick: () => playAlbumInQueue(albumData.id),
                      section: "queue",
                    },
                    {
                      label: "Add album to queue",
                      icon: <ListEnd size={18} />,
                      onClick: () => {
                        addAlbumToQueue(albumData.id);
                        showToast(`Added to queue: ${albumData.name}`, "success");
                      },
                      section: "queue",
                    },
                  ]}
                />
                <SimilarSection
                  type="album"
                  id={albumData.id}
                  tracks={albumData.tracks}
                />
                <ReviewsSection
                  id={albumData.id}
                  type="album"
                  title={albumData.name}
                  onWriteReview={handleOpenLog}
                />
              </div>

              <div ref={sidebarRef} className={styles.sidebar}>

                <div className={styles.completionSection}>
                  <div className={styles.completionRow}>
                    {completionPercent === 100 ? (
                      <>
                        <div className={styles.countWrapper}>
                          <span className={styles.completionCount}>
                            {listenedCount}/{totalTracks}
                          </span>
                          <span className={styles.separationDot}>•</span>
                          <span className={styles.listenedLabel}>you've listened</span>
                        </div>
                        <div className={styles.completedBadge}>
                          <IoIosCheckmarkCircle />
                          <span>Completed</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className={styles.countWrapper}>
                          <span className={styles.completionCount}>
                            {listenedCount}/{totalTracks}
                          </span>
                          <span className={styles.separationDot}>•</span>
                          <span className={styles.listenedLabel}>you've listened</span>
                        </div>
                        <span className={`${styles.completionPercent} ${completionPercent >= 66 ? styles.completionHigh : completionPercent >= 33 ? styles.completionMedium : styles.completionLow}`}>
                          {completionPercent}%
                        </span>
                      </>
                    )}
                  </div>
                  <div className={styles.completionBarTrack}>
                    <div
                      className={`${styles.completionBarFill} ${completionPercent === 100 ? styles.fillDone : completionPercent >= 66 ? styles.fillHigh : completionPercent >= 33 ? styles.fillMedium : styles.fillLow}`}
                      style={{ width: `${completionPercent}%` }}
                    />
                  </div>
                </div>

                <WikipediaSection
                  albumName={albumData.name}
                  artistName={albumData.artists?.[0]?.name}
                />

                <YouTubeSection album={albumData} />
                <SidebarAlbumList
                  title={`Albums by ${albumData.artists?.[0]?.name}`}
                  albums={moreAlbums}
                  viewAllLink={createArtistSlug(albumData.artists?.[0]?.name, albumData.artists?.[0]?.id)}
                />
              </div>
            </div>
          </TabPanel>

          <TabPanel tabKey="details" activeKey={activeTab}>
            <div className={styles.detailsTab}>
              <div className={styles.detailSection}>
                <SectionHeader icon={<IoAlbums />} title="Album Information" />
                <div className={styles.detailGrid}>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Album</span>
                    <span className={styles.detailValue}>{albumData.name}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Release Date</span>
                    <span className={styles.detailValue}>
                      {formatDate(albumData.release_date)}
                    </span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Label</span>
                    <span className={styles.detailValue}>
                      {albumData.label || "Unknown"}
                    </span>
                  </div>
                  {albumData.total_tracks && (
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Total Tracks</span>
                      <span className={styles.detailValue}>
                        {albumData.total_tracks}
                      </span>
                    </div>
                  )}
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Popularity</span>
                    <span className={styles.detailValue}>
                      {albumData.popularity}
                    </span>
                  </div>

                  {albumData.externalUrls?.spotify && (
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Spotify</span>
                      <a
                        href={albumData.externalUrls.spotify}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.detailLinkValue}
                      >
                        Open on Spotify
                      </a>
                    </div>
                  )}
                </div>
              </div>
              <div className={styles.detailSection}>
                <SectionHeader
                  icon={<IoInformationCircle />}
                  title="Copyrights"
                />
                <div className={styles.copyrightList}>
                  {albumData.copyrights?.map((c, i) => (
                    <div key={i} className={styles.copyrightItem}>
                      <span className={styles.copyrightType}>{c.type}</span>
                      <span>{c.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabPanel>
        </TabPanels>
      </div>

      {
        showReviewModal && (
          <AlbumReviewModal
            album={albumData}
            show={showReviewModal}
            onClose={handleCloseReviewModal}
            onSave={(data) => {
              if (data?.rating !== undefined) setRating(data.rating);
              if (data?.listened !== undefined) setListened(data.listened);
              handleCloseReviewModal();
            }}
            initialData={{
              logId: albumData.userInteractions?.reviewId || null,
              rating: albumData.userInteractions?.rating || 0,
              liked: albumData.userInteractions?.liked || false,
              listened: true,
              review: albumData.userInteractions?.review || "",
              trackRatings: Object.fromEntries(
                (albumData.tracks || [])
                  .filter((t) => t.userInteractions?.rating)
                  .map((t) => [t.id, t.userInteractions.rating])
              ),
              trackLikes: (albumData.tracks || [])
                .filter((t) => t.userInteractions?.liked)
                .map((t) => t.id),
              trackReviews: Object.fromEntries(
                (albumData.tracks || [])
                  .filter((t) => t.userInteractions?.review)
                  .map((t) => [t.id, t.userInteractions.review])
              ),
            }}
          />
        )
      }

      {
        showListenersOverlay && (
          <ListenersOverlay
            onClose={() => setShowListenersOverlay(false)}
            track={albumData}
            initialTab={listenersOverlayTab}
          />
        )
      }
    </div >
  );
};

export default AlbumProfile;
