import React, {
  useState,
  useEffect,
  useRef,
  useContext,
  useCallback,
} from "react";
import { useParams, Link, useSearchParams } from "react-router-dom";
import {
  IoInformationCircle,
  IoAlbums,
} from "react-icons/io5";


import TrackReviewModal from "../../Review/TrackReviewModal/TrackReviewModal";
import useStickyFollowScroll from "../../../hooks/useStickyFollowScroll";
import ListenersOverlay from "./ListenersOverlay";
import ErrorBoundary from "../../Utils/Error/ErrorBoundary";
import SectionHeader from "../../Utils/SectionHeader/SectionHeader";
import { Button } from "../../Utils/Buttons/Button";
import { fetchTrack, fetchFriendsListened, fetchTrackYouTubeLyrics, fetchTrackTrending } from "../../../services/FetchTrack";
import { fetchAlbum } from "../../../services/FetchAlbum";
import styles from "./TrackProfile.module.css";
import { UserLoggedContext } from "../../../contexts/UserLoggedContext";
import { usePlayer } from "../../../contexts/PlayerContext";
import { useAuthModal } from "../../../contexts/AuthModalContext";
import TrackProfileSkeleton from "../../Utils/Skeletons/TrackProfileSkeleton.jsx";
import {
  createTrackSlug,
  createAlbumSlug,
  createArtistSlug,
  formatSlug,
} from "../../../utils/formatters/textFormatters";
import ReviewsSection from "../../Review/ReviewsSection/ReviewsSection";
import AlbumSection from "./AlbumSection/AlbumSection";
import LyricsSection from "./LyricsSection/LyricsSection";
import DetailsSection from "./DetailsSection/DetailsSection";
import YouTubeSection from "./YouTubeSection/YouTubeSection";
import FriendsFacePile from "../../Utils/FriendsFacePile/FriendsFacePile";
import HeroItem from "../../Utils/HeroItem/HeroItem";
import { getAverageColor } from "../../../utils/color/getAverageColor";
import { TrendingTag } from "../../Utils/Tags/Tags";
import SimilarSection from "../../Utils/SimilarSection/SimilarSection";
import RelatedLists from "./RelatedLists/RelatedLists";
import VersionsSection from "./VersionsSection/VersionsSection";
import { PopularReviews } from "../../Review/ReviewsSection/ReviewsSection";
import { Tabs, TabPanels, TabPanel } from "../../Utils/Tabs/Tabs";
import ArtistList from "../../Utils/ArtistList/ArtistList";
import TrackAlbumTitle from "../../Utils/TrackAlbumTitle/TrackAlbumTitle";
import { setImageResolution } from "../../../utils/handlers/image.js";

const TrackProfile = ({ trackData, trackId: propTrackId }) => {
  const socialSidebarRef = useRef(null);
  useStickyFollowScroll(socialSidebarRef);
  const [activeTab, setActiveTab] = useState("overview");
  const [isLoading, setIsLoading] = useState(true);
  const [track, setTrack] = useState(trackData || null);
  const [rating, setRating] = useState(0);
  const [liked, setLiked] = useState(false);
  const [listened, setListened] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showTrackReviewModal, setShowTrackReviewModal] = useState(false);
  const [showListenersOverlay, setShowListenersOverlay] = useState(false);
  const [listenersOverlayTab, setListenersOverlayTab] = useState("listeners");
  const [error, setError] = useState(null);
  const [activeAction, setActiveAction] = useState(null);
  const [pendingRating, setPendingRating] = useState(0);
  const [pendingLiked, setPendingLiked] = useState(false);
  const [pendingListened, setPendingListened] = useState(true);
  const [editingReview, setEditingReview] = useState(null);
  const [searchParams] = useSearchParams();


  const { userLogged, loading: authLoading } = useContext(UserLoggedContext);
  const globalPlayer = usePlayer();
  const { openModal } = useAuthModal();

  const params = useParams();
  const trackId = propTrackId || params.trackId;

  const [currentTime, setCurrentTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [videoId, setVideoId] = useState(null);
  const [lyrics, setLyrics] = useState(null);
  const [translatedLyrics, setTranslatedLyrics] = useState(null);
  const [transliteratedLyrics, setTransliteratedLyrics] = useState(null);
  const [isSynced, setIsSynced] = useState(false);
  const [isInstrumental, setIsInstrumental] = useState(false);
  const [lyricsLoading, setLyricsLoading] = useState(false);
  const [albumTracks, setAlbumTracks] = useState(null);
  const [trendingData, setTrendingData] = useState(null);
  const [topReviewIds, setTopReviewIds] = useState([]);
  const playerRef = useRef(null);
  const lastFetchRef = useRef({ id: null, userId: undefined });

  useEffect(() => {
    if (authLoading) return;

    if (trackData) {
      const data = { ...trackData };
      if (data.userInteractions) {
        if (data.userInteractions.reviewId) {
          data.logId = data.userInteractions.reviewId;
        }
        setRating(data.userInteractions.rating || 0);
        setLiked(data.userInteractions.liked || false);
        setListened(data.userInteractions.listened || false);
      }
      setTrack(data);
      if (isLoading) setIsLoading(false);
    }

    const idToFetch = trackId || trackData?.id || trackData?.trackId;

    if (idToFetch) {
      if (trackData && (trackData.id === idToFetch || trackData.trackId === idToFetch) && trackData.duration) {
        if (isLoading) setIsLoading(false);
      }

      const currentUserId = userLogged?.id || null;
      if (lastFetchRef.current.id === idToFetch && lastFetchRef.current.userId === currentUserId) {
        if (isLoading) setIsLoading(false);
        return;
      }

      lastFetchRef.current = { id: idToFetch, userId: currentUserId };

      if (!trackData && !track) {
        setIsLoading(true);
      }

      fetchTrack(idToFetch)
        .then((data) => {
          if (data) {
            if (data.userInteractions && data.userInteractions.reviewId) {
              data.logId = data.userInteractions.reviewId;
            }

            setTrack(data);
            if (data.userInteractions) {
              setRating(data.userInteractions.rating || 0);
              setLiked(data.userInteractions.liked || false);
              setListened(data.userInteractions.listened || false);
            } else {
              setRating(0);
              setLiked(false);
              setListened(false);
            }

            fetchFriendsListened(idToFetch)
              .then((friendsData) => {
                const friendsArray = friendsData?.data?.friends || friendsData?.friends || (Array.isArray(friendsData) ? friendsData : null);
                if (friendsArray && friendsArray.length > 0) {
                  setTrack(prev => ({ ...prev, friendsListened: friendsArray }));
                }
              })
              .catch((error) => {
                console.error("Error fetching extra track data:", error);
              });
          }
          setIsLoading(false);
        })
        .catch((err) => {
          console.error("Error fetching track details", err);
          if (!trackData) {
            setError({
              message: err.response?.data?.message || "Error fetching track",
              status: err.response?.status || 500,
            });
          }
          setIsLoading(false);
        });
    } else if (!trackData) {
      setError({
        message: "No track ID provided in the URL",
        status: 404,
      });
      setIsLoading(false);
    }
  }, [trackData, trackId, userLogged?.id]);

  useEffect(() => {
    setLyrics(null);
    setTranslatedLyrics(null);
    setTransliteratedLyrics(null);
    setIsSynced(false);
    setIsInstrumental(false);
    setLyricsLoading(false);
    if (track?.lyrics) {
      setLyrics(track.lyrics);
    }
  }, [track?.id, track?.lyrics]);

  useEffect(() => {
    const id = track?.id || track?.trackId;
    const artistName = track?.artists?.[0]?.name;
    if (!id || !artistName || !track?.name) return;

    const currentLang = localStorage.getItem("trackr_lyrics_translate_lang") || null;
    let cancelled = false;
    setLyricsLoading(true);
    fetchTrackYouTubeLyrics(formatSlug(artistName), formatSlug(track.name), id, currentLang)
      .then((data) => {
        if (cancelled) return;
        if (!data) {
          setLyrics("");
          setTranslatedLyrics(null);
          return;
        }
        setVideoId(data.ytMusicVideoId);
        setVideoDuration(data.videoDuration);
        const ly = data.lyrics;
        setLyrics(ly.lyrics);
        setTranslatedLyrics(ly.translatedLyrics || null);
        setTransliteratedLyrics(ly.transliteratedLyrics || null);
        setIsSynced(ly.isSynced);
        setIsInstrumental(ly.instrumental);
      })
      .catch(() => {
        if (cancelled) return;
        setLyrics("");
        setTranslatedLyrics(null);
      })
      .finally(() => {
        if (!cancelled) setLyricsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [track?.id, track?.trackId, track?.artists?.[0]?.name, track?.name]);

  const [ambientColor, setAmbientColor] = useState(null);

  useEffect(() => {
    const albumCover =
      track?.album?.images?.[0]?.url ||
      track?.album?.coverUrl ||
      track?.albumCover ||
      track?.coverUrl;
    if (!albumCover) {
      setAmbientColor(null);
      return;
    }
    let cancelled = false;
    getAverageColor(setImageResolution(albumCover)).then((color) => {
      if (!cancelled) setAmbientColor(color);
    });
    return () => { cancelled = true; };
  }, [track?.album?.images?.[0]?.url, track?.album?.coverUrl, track?.albumCover, track?.coverUrl]);

  useEffect(() => {
    const albumId = track?.album?.id || track?.album?.albumId || track?.albumId;
    if (!albumId) return;
    setAlbumTracks(null);
    fetchAlbum({ id: albumId })
      .then((data) => {
        if (data?.tracks) setAlbumTracks(data.tracks);
      })
      .catch(() => { });
  }, [track?.album?.id, track?.album?.albumId, track?.albumId]);

  useEffect(() => {
    const id = track?.id || track?.trackId;
    if (!id) return;
    setTrendingData(null);
    fetchTrackTrending(id)
      .then((data) => setTrendingData(data))
      .catch(() => { });
  }, [track?.id, track?.trackId]);

  const handleOpenLog = useCallback(() => {
    if (!userLogged) {
      openModal("login-reason", { reason: "review" });
      return;
    }
    setActiveAction(null);
    setPendingRating(0);
    setPendingLiked(false);
    setPendingListened(true);
    setEditingReview(null);
    setShowTrackReviewModal(true);
  }, [userLogged, openModal]);

  const handleEditReview = useCallback((review) => {
    setActiveAction(null);
    setPendingRating(0);
    setPendingLiked(false);
    setPendingListened(true);
    setEditingReview(review);
    setShowTrackReviewModal(true);
  }, []);

  const handleCloseTrackReviewModal = useCallback(() => {
    setShowTrackReviewModal(false);
    setActiveAction(null);
    setPendingRating(0);
    setPendingLiked(false);
    setPendingListened(true);
    setEditingReview(null);
  }, []);

  const handleOpenListenersOverlay = useCallback((tab) => {
    setListenersOverlayTab(tab);
    setShowListenersOverlay(true);
  }, []);

  const handleCloseListenersOverlay = useCallback(() => {
    setShowListenersOverlay(false);
  }, []);

  const handlePlayerReady = useCallback((player) => {
    playerRef.current = player;
  }, []);

  const handleSeek = useCallback((time) => {
    const currentTrackId = track?.id || track?.trackId;
    if (globalPlayer.currentTrack?.trackId === currentTrackId && globalPlayer.isPlayerVisible) {
      globalPlayer.seekTo(time);
    } else if (playerRef.current) {
      playerRef.current.seekTo(time, true);
    }
  }, [track, globalPlayer]);


  const handleTheaterOpen = useCallback(() => {
    const currentTrackId = track?.id || track?.trackId;
    const isGlobalTrack = globalPlayer.currentTrack?.trackId === currentTrackId && globalPlayer.isPlayerVisible;
    if (!isGlobalTrack && track && videoId) {
      globalPlayer.playTrack({ ...track, videoId });
    }
    globalPlayer.openTheaterMode();
  }, [track, videoId, globalPlayer]);

  useEffect(() => {
    const isTheater = searchParams.get("theater") === "true";
    if (isTheater && track && videoId) {
      const currentTrackId = track?.id || track?.trackId;
      const isGlobalTrack = globalPlayer.currentTrack?.trackId === currentTrackId && globalPlayer.isPlayerVisible;
      if (!isGlobalTrack) {
        globalPlayer.playTrack({ ...track, videoId });
      }
      globalPlayer.openTheaterMode();
    }
  }, [searchParams, track?.id, videoId]);

  if (isLoading) {
    return <TrackProfileSkeleton />;
  }

  if (error || !track) {
    return <ErrorBoundary source="trackProfile" error={error} />;
  }

  return (
    <div
      className={styles.container}
      style={{
        "--page-ambient-color": ambientColor
          ? `rgb(${ambientColor.r}, ${ambientColor.g}, ${ambientColor.b})`
          : "transparent",
      }}
    >
      <div className={styles.pageAmbient} aria-hidden="true" />
      <HeroItem
        showCoverCard={true}
        coverUrl={track.coverUrl}
        textWrapperClassName={styles.headerTextWrapper}
        type="Track"
        typeBadge={trendingData?.isTrending && trendingData.appearances?.length > 0 ? (() => {
          const best = trendingData.appearances.find(a => a.country === "global")
            || [...trendingData.appearances].sort((a, b) => b.streams - a.streams)[0];
          return (
            <TrendingTag
              position={best.position}
              movement={best.movement}
              country={best.country}
              to="/trackr/list/trending"
            />
          );
        })() : null}
        title={track.name}
        releaseYear={track.album?.releaseYear || track.releaseYear}
        userRating={rating}
        userLogUrl={track.logId && userLogged?.username ? `/${userLogged.username}/log/${track.logId}` : undefined}
        subtitle={
          <div className={styles.subtitleWrapper}>
            <ArtistList
              artists={track.artists || []}
              className={styles.artistLink}
              maxVisible={3}
            />
            {track.album && (
              <>
                <span className={styles.headerSeparator}>•</span>
                <TrackAlbumTitle
                  title={track.album.name}
                  to={createAlbumSlug(
                    track.album.name,
                    track.album?.artists || track.artists,
                    track.album?.id || track.album?.albumId || track.albumId
                  )}
                  state={{ albumId: track.album?.id || track.album?.albumId || track.albumId }}
                  fontSize="1.5rem"
                  className={styles.albumLink}
                />
              </>
            )}
          </div>
        }
        stats={
          <div className={styles.heroRightStats}>
            <div
              className={styles.statLineItem}
              onClick={() => handleOpenListenersOverlay("listeners")}
            >
              <span className={styles.statLineValue}>{track.stats?.listens || 0}</span>
              <span className={styles.statLineLabel}>Reviews</span>
            </div>
            <div className={styles.statSeparator} />
            <div
              className={styles.statLineItem}
              onClick={() => handleOpenListenersOverlay("likes")}
            >
              <span className={styles.statLineValue}>{track.stats?.likes || 0}</span>
              <span className={styles.statLineLabel}>Likes</span>
            </div>
            <div className={styles.statSeparator} />
            <div className={styles.statLineItem}>
              <span className={styles.statLineValue}>{track.stats?.averageRating || 0}</span>
              <span className={styles.statLineLabel}>Avg. Rating</span>
            </div>
          </div>
        }
        actions={
          <Button variant="primary" size="lg" onClick={handleOpenLog}>
            {track.logId ? "Review again" : "Write a Review"}
          </Button>
        }
      >
        <FriendsFacePile
          users={track.friendsListened}
          onOpenModal={handleOpenListenersOverlay}
        />
      </HeroItem>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          { key: "overview", label: "Overview" },
          { key: "details", label: "Details" },
        ]}
      />

      <div className={styles.tabContent}>
        <TabPanels activeKey={activeTab}>
          <TabPanel tabKey="overview" activeKey={activeTab}>
            <div className={styles.socialTab}>
              <div className={styles.mainSocialContent}>
                <AlbumSection track={track} />
                <SimilarSection
                  type="track"
                  name={track.name}
                  artist={track.artists?.[0]?.name}
                />
                <PopularReviews
                  trackId={track.id || track.trackId}
                  onReviewsLoaded={setTopReviewIds}
                  onEditReview={handleEditReview}
                />
                <RelatedLists trackId={track.id || track.trackId} />
                <ReviewsSection
                  id={track.id || track.trackId}
                  type="track"
                  title={track.name}
                  onWriteReview={handleOpenLog}
                  onEditReview={handleEditReview}
                  excludeIds={topReviewIds}
                />

              </div>
              <div ref={socialSidebarRef} className={styles.socialSidebar}>
                <YouTubeSection
                  track={track}
                  videoId={videoId}
                  loading={lyricsLoading && !videoId}
                  onTimeUpdate={setCurrentTime}
                  onPlayerReady={handlePlayerReady}
                  onTheaterMode={handleTheaterOpen}
                />
                <LyricsSection
                  track={track}
                  currentTime={currentTime}
                  lyrics={lyrics}
                  initialTranslatedLyrics={translatedLyrics}
                  transliteratedLyrics={transliteratedLyrics}
                  lyricsLoading={lyricsLoading}
                  isInstrumental={isInstrumental}
                  isSynced={isSynced}
                  onLyricClick={handleSeek}
                  onTheaterMode={handleTheaterOpen}
                  duration={videoDuration}
                  videoId={videoId}
                />
                <DetailsSection track={track} />
                <VersionsSection track={track} />
              </div>
            </div>
          </TabPanel>

          <TabPanel tabKey="details" activeKey={activeTab}>
            <div className={styles.detailsTab}>
              {track.album && (
                <div className={styles.detailSection}>
                  <SectionHeader icon={<IoAlbums />} title="Album Information" />
                  <div className={styles.detailGrid}>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Album</span>
                      <span className={styles.detailValue}>
                        {track.album.name}
                      </span>
                    </div>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Release Date</span>
                      <span className={styles.detailValue}>
                        {track.album.releaseDate ||
                          track.album.releaseYear ||
                          "Unknown"}
                      </span>
                    </div>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Label</span>
                      <span className={styles.detailValue}>
                        {track.album.label || "Unknown"}
                      </span>
                    </div>
                  </div>
                </div>
              )}
              <div className={styles.detailSection}>
                <SectionHeader
                  icon={<IoInformationCircle />}
                  title="Track Information"
                />
                <div className={styles.detailGrid}>
                  {track.duration && (
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Duration</span>
                      <span className={styles.detailValue}>{track.duration}</span>
                    </div>
                  )}
                  {track.genres && track.genres.length > 0 && (
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Genres</span>
                      <span className={styles.detailValue}>
                        {track.genres.join(", ")}
                      </span>
                    </div>
                  )}
                  {track.producers && track.producers.length > 0 && (
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Producers</span>
                      <span className={styles.detailValue}>
                        {track.producers.join(", ")}
                      </span>
                    </div>
                  )}
                  {track.writers && track.writers.length > 0 && (
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Writers</span>
                      <span className={styles.detailValue}>
                        {track.writers.join(", ")}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </TabPanel>
        </TabPanels>
      </div>

      {showTrackReviewModal && (
        <TrackReviewModal
          trackId={track?.id || track?.trackId}
          reviewId={editingReview?._id}
          onClose={handleCloseTrackReviewModal}
          showTrackReviewModal={showTrackReviewModal}
          setShowTrackReviewModal={setShowTrackReviewModal}
          rating={activeAction === "rating" ? pendingRating : editingReview ? editingReview.rating : 0}
          liked={activeAction === "liked" ? pendingLiked : editingReview ? editingReview.liked : false}
          listened={activeAction === "listened" ? pendingListened : editingReview ? (editingReview.listened !== undefined ? editingReview.listened : true) : true}
          activeAction={activeAction}
        />
      )}

      {showListenersOverlay && (
        <ListenersOverlay
          track={track}
          onClose={handleCloseListenersOverlay}
          initialTab={listenersOverlayTab}
        />
      )}
    </div>
  );
};

export default TrackProfile;
