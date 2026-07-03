import React, { useContext, useEffect, useState, useCallback } from "react";
import styles from "./TrackRows.module.css";
import TrackCard from "../TrackCard/TrackCard";
import { handleTopTracks } from "../../../services/HandleTopTracks";
import { handleFriendReviews } from "../../../services/HandleFriendReviews";
import { UserLoggedContext } from "../../../contexts/UserLoggedContext";
import { Link } from "react-router-dom";
import { BsStarFill } from "react-icons/bs";
import { FaUserFriends } from "react-icons/fa";
import TrackCardsSkeleton from "../../Utils/Skeletons/TrackCardsSkeleton";
import SectionHeader from "../../Utils/SectionHeader/SectionHeader";
import TrackCardRow from "../../Utils/TrackCardRow/TrackCardRow";

const TrackRows = () => {
  const [topSongs, setTopSongs] = useState(null);
  const [friendsLogs, setFriendsLogs] = useState(null);

  const [isTrendingLoading, setIsTrendingLoading] = useState(true);
  const [isFriendsLoading, setIsFriendsLoading] = useState(true);

  const [trendingError, setTrendingError] = useState(null);
  const [friendsError, setFriendsError] = useState(null);

  const { userLogged } = useContext(UserLoggedContext);

  const getTopTracks = useCallback(async () => {
    try {
      setIsTrendingLoading(true);
      setTrendingError(null);

      const result = await handleTopTracks();
      if (result && result.status === 200 && result) {
        const formattedTracks = result.data.map((track) => ({
          id: track.id,
          type: track.type,
          name: track.name,
          coverUrl: track.albumCover,
          artists: track.artists,
          position: track.position,
          movement: track.movement,
        }));
        setTopSongs(formattedTracks);
      } else {
        console.error("Failed to fetch top tracks");
        setTrendingError("Failed to load trending tracks");
      }
    } catch (error) {
      console.error("Error fetching top tracks:", error);
      setTrendingError("Error loading trending tracks");
    } finally {
      setIsTrendingLoading(false);
    }
  }, []);

  useEffect(() => {
    getTopTracks();
  }, [getTopTracks]);

  const getFriendsLogs = useCallback(async () => {
    if (!userLogged) {
      setFriendsLogs([]);
      setIsFriendsLoading(false);
      return;
    }

    try {
      setIsFriendsLoading(true);
      setFriendsError(null);

      const result = await handleFriendReviews();

      if (result && result.status === 200 && result.data) {
        const formattedReviews = result.data.reviews.map((review) => ({
          id: review.trackId,
          trackId: review.trackId,
          name: review.name,
          coverUrl: review.coverUrl,
          artists: review.artists,
          rating: review.rating,
          review: review.review,
          userId: review.userId._id,
          user: review.userId,
          createdAt: review.createdAt,
          selectedDate: review.selectedDate,
          userInteractions: {
            liked: review.liked,
            listened: review.listened,
            reviewId: review._id,
          },
          liked: review.liked,
          listened: review.listened,
        }));
        setFriendsLogs(formattedReviews);
      } else {
        console.error("Failed to fetch friend reviews");
        setFriendsError("Failed to load friend reviews");
      }
    } catch (error) {
      console.error("Error fetching friends logs:", error);
      setFriendsError("Error loading friend reviews");
    } finally {
      setIsFriendsLoading(false);
    }
  }, [userLogged?._id]);

  useEffect(() => {
    getFriendsLogs();
  }, [getFriendsLogs]);

  const renderFriendsSection = () => {
    if (isFriendsLoading) {
      return <TrackCardsSkeleton />;
    }

    if (friendsError) {
      return <div className={styles.errorMessage}>{friendsError}</div>;
    }

    if (friendsLogs && friendsLogs.length > 0) {
      return friendsLogs.slice(0, 5).map((track) => (
        <div key={track.id + "-" + track.createdAt}>
          <TrackCard track={track} userInfo={true} />
        </div>
      ));
    }

    return (
      <div className={styles.emptyMessage}>
        Follow friends to see their latest reviews
      </div>
    );
  };

  const renderTrendingSection = () => {
    if (isTrendingLoading) {
      return <TrackCardsSkeleton />;
    }

    if (trendingError) {
      return <div className={styles.errorMessage}>{trendingError}</div>;
    }

    if (topSongs && topSongs.length > 0) {
      return topSongs.slice(0, 5).map((track) => (
        <div key={track.id}>
          <TrackCard track={track} isSpotifyTrack={true} />
        </div>
      ));
    }

    return (
      <div className={styles.emptyMessage}>
        No trending tracks available at the moment
      </div>
    );
  };

  return (
    <>
      <section className={styles.trackRowsContainer}>
        {userLogged && (
          <div className={styles.sectionContainer}>
            <SectionHeader
              icon={<FaUserFriends />}
              title="Friends' Recent Reviews"
              action={
                <Link to="/friends-reviews" className="headerViewMoreButton">
                  View All
                </Link>
              }
            />
            <TrackCardRow>{renderFriendsSection()}</TrackCardRow>
          </div>
        )}

        <div className={styles.sectionContainer}>
          <div className={styles.tabsContainer}>
            <SectionHeader
              icon={<BsStarFill />}
              title="Trending Tracks"
              action={
                <Link to="/trackr/list/trending" className="headerViewMoreButton">
                  View All
                </Link>
              }
            />
          </div>

          <TrackCardRow>{renderTrendingSection()}</TrackCardRow>
        </div>
      </section>
    </>
  );
};

export default React.memo(TrackRows);
