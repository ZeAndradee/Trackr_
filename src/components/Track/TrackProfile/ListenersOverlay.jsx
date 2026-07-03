import React, { useState, useEffect, useCallback, useMemo } from "react";
import ReactDOM from "react-dom";
import { FaTimes, FaChevronLeft, FaChevronRight, FaStar } from "react-icons/fa";
import { FiUsers, FiHeadphones } from "react-icons/fi";
import { RiHeart3Line } from "react-icons/ri";
import style from "./ListenersOverlay.module.css";
import {
  fetchTrackListeners,
  fetchTrackLikes,
  fetchFriendsListened,
} from "../../../services/FetchTrack";
import { fetchAlbumFriendsListened } from "../../../services/FetchAlbum";
import { useNavigate } from "react-router-dom";
import Image from "../../Utils/Images/Image/Image";
import useScrollLock from "../../../hooks/useScrollLock";
import { truncateText } from "../../../utils/formatters/textFormatters";
import { RatingTag } from "../../Utils/Tags/Tags";
import ListenersOverlaySkeleton from "../../Utils/Skeletons/ListenersOverlaySkeleton";

const ListenersOverlay = ({ onClose, track, initialTab = "listeners" }) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [listenersData, setListenersData] = useState([]);
  const [likesData, setLikesData] = useState([]);
  const [friendsData, setFriendsData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    listeners: { total: 0, page: 1, limit: 20, pages: 1 },
    likes: { total: 0, page: 1, limit: 20, pages: 1 },
    friends: { total: 0, page: 1, limit: 20, pages: 1 },
  });

  const [dataFetched, setDataFetched] = useState({
    listeners: false,
    likes: false,
    friends: false,
  });

  const navigate = useNavigate();

  useScrollLock();

  const fetchData = useCallback(
    async (tab, page = 1) => {
      setIsLoading(true);
      setError(null);

      try {
        const trackId = track?.id || track?.trackId || track?.track_id;

        if (!trackId) {
          setError("Track ID not found");
          setIsLoading(false);
          return;
        }

        if (tab === "listeners") {
          const response = await fetchTrackListeners(trackId, page);
          if (response?.status === 200) {
            const listenersArray = response.data?.listeners || [];
            setListenersData(
              Array.isArray(listenersArray) ? listenersArray : []
            );

            if (response.data?.pagination) {
              setPagination((prev) => ({
                ...prev,
                listeners: response.data.pagination,
              }));
            }

            setDataFetched((prev) => ({ ...prev, listeners: true }));
          } else {
            setError("Failed to load listeners");
          }
        } else if (tab === "likes") {
          const response = await fetchTrackLikes(trackId, page);
          if (response?.status === 200) {
            const likesArray = response.data?.likes || [];
            setLikesData(Array.isArray(likesArray) ? likesArray : []);

            if (response.data?.pagination) {
              setPagination((prev) => ({
                ...prev,
                likes: response.data.pagination,
              }));
            }

            setDataFetched((prev) => ({ ...prev, likes: true }));
          } else {
            setError("Failed to load likes");
          }
        } else if (tab === "friends") {
          let response;
          if (track.album_type || track.type === "album") {
            response = await fetchAlbumFriendsListened(trackId, page);
          } else {
            response = await fetchFriendsListened(trackId, page);
          }

          if (response) {
            const friendsArray = response.data?.friends || response.friends || (Array.isArray(response) ? response : []) || (Array.isArray(response.data) ? response.data : []);
            setFriendsData(Array.isArray(friendsArray) ? friendsArray : []);

            if (response.data?.pagination || response.pagination) {
              setPagination((prev) => ({
                ...prev,
                friends: response.data?.pagination || response.pagination,
              }));
            }
            setDataFetched((prev) => ({ ...prev, friends: true }));
          } else {
            setError("Failed to load friends");
          }
        }
      } catch (err) {
        console.error(`Error fetching ${tab}:`, err);
        setError(`Failed to load ${tab}`);
      } finally {
        setIsLoading(false);
      }
    },
    [track]
  );

  useEffect(() => {
    const trackId = track?.id || track?.trackId || track?.track_id;

    if (trackId) {
      const hasDataBeenFetched = dataFetched[activeTab];

      if (!hasDataBeenFetched) {
        fetchData(activeTab, currentPage);
      } else {
        setIsLoading(false);
      }
    } else {
      console.error("No track ID found in track object:", track);
      setError("Track information is incomplete");
      setIsLoading(false);
    }
  }, [activeTab, track, currentPage, dataFetched, fetchData]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination[activeTab].pages) {
      setCurrentPage(newPage);
      fetchData(activeTab, newPage);
    }
  };

  const handleClose = useCallback(() => {
    if (typeof onClose === "function") {
      onClose();
    }
  }, [onClose]);

  const handleOverlayClick = useCallback(
    (e) => {
      if (e.target === e.currentTarget) {
        handleClose();
      }
    },
    [handleClose]
  );

  const handleCardClick = useCallback((e) => {
    e.stopPropagation();
  }, []);

  const navigateToProfile = useCallback(
    (username) => {
      handleClose();
      navigate(`/${username}`);
    },
    [handleClose, navigate]
  );

  const currentPaginationInfo = useMemo(
    () => pagination[activeTab],
    [pagination, activeTab]
  );

  const currentData = useMemo(() => {
    if (activeTab === "listeners") return listenersData;
    if (activeTab === "likes") return likesData;
    if (activeTab === "friends") return friendsData;
    return [];
  }, [activeTab, listenersData, likesData, friendsData]);

  const renderPagination = useMemo(() => {
    if (isLoading || !currentPaginationInfo || currentPaginationInfo.pages <= 1)
      return null;

    return (
      <div className={style.pagination}>
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={style.paginationButton}
        >
          <FaChevronLeft />
        </button>
        <span className={style.pageInfo}>
          {currentPage} of {currentPaginationInfo.pages}
        </span>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === currentPaginationInfo.pages}
          className={style.paginationButton}
        >
          <FaChevronRight />
        </button>
      </div>
    );
  }, [currentPage, currentPaginationInfo, isLoading, handlePageChange]);

  const renderUserList = useMemo(() => {
    if (isLoading) {
      return <ListenersOverlaySkeleton />;
    }

    if (error) {
      return <div className={style.errorMessage}>{error}</div>;
    }

    if (!Array.isArray(currentData) || currentData.length === 0) {
      return (
        <div className={style.emptyState}>
          <div className={style.emptyStateIconContainer}>
            {activeTab === "listeners" ? (
              <FiHeadphones className={style.emptyIcon} />
            ) : (
              <RiHeart3Line className={style.emptyIcon} />
            )}
          </div>
          <h3 className={style.emptyStateTitle}>No {activeTab} yet</h3>
          <p className={style.emptyStateMessage}>
            Be the first to{" "}
            {activeTab === "listeners"
              ? "listen to"
              : activeTab === "likes"
                ? "like"
                : "friend who listened to"}{" "}
            this track
          </p>
        </div>
      );
    }

    return (
      <div className={style.userList}>
        {currentData.map((user) => (
          <div
            key={user._id}
            className={style.userCard}
            onClick={() => {
              if (activeTab === "friends") {
                navigate(`/${user.username}/log/${user.logId || user._id}`);
                handleClose();
              } else {
                navigateToProfile(user.username);
              }
            }}
          >
            <div className={style.userAvatar}>
              <Image
                src={user.userimage}
                name={user.name || user.username}
                userId={user._id}
                size={48}
                showBadge={false}
              />
            </div>
            <div className={style.userInfo}>
              <h3 className={style.userName}>{user.name || user.username}</h3>
              <p className={style.userUsername}>@{user.username}</p>
            </div>
            {activeTab === "friends" && user.rating !== undefined && (
              <div className={style.userRating}>
                <RatingTag rating={user.rating} size="0.75rem" />
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }, [
    currentData,
    isLoading,
    error,
    activeTab,
    navigateToProfile,
    navigate,
    handleClose,
  ]);

  const overlayContent = useMemo(
    () => (
      <div className={style.overlay} onClick={handleOverlayClick}>
        <div className={style.listenersCard} onClick={handleCardClick}>
          <div className={style.listenersHeader}>
            <h2>{truncateText(track?.name || "Track", 36)}</h2>
            <button
              className={style.closeButton}
              onClick={handleClose}
              aria-label="Close listeners overlay"
            >
              <FaTimes />
            </button>
          </div>

          <div className={style.tabButtons}>
            <button
              className={`${style.tabButton} ${activeTab === "listeners" ? style.activeTab : ""
                }`}
              onClick={() => handleTabChange("listeners")}
            >
              Listeners ({track?.stats?.listens || 0})
            </button>
            <button
              className={`${style.tabButton} ${activeTab === "likes" ? style.activeTab : ""
                }`}
              onClick={() => handleTabChange("likes")}
            >
              Likes ({track?.stats?.likes || 0})
            </button>
            <button
              className={`${style.tabButton} ${activeTab === "friends" ? style.activeTab : ""
                }`}
              onClick={() => handleTabChange("friends")}
            >
              Friends
            </button>
          </div>

          <div className={style.listenersContent}>
            {renderUserList}
            {renderPagination}
          </div>
        </div>
      </div>
    ),
    [
      activeTab,
      track,
      handleOverlayClick,
      handleCardClick,
      handleClose,
      renderUserList,
      renderPagination,
    ]
  );

  return ReactDOM.createPortal(overlayContent, document.body);
};

export default ListenersOverlay;
