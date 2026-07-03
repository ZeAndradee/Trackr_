import React, {
  useState,
  useEffect,
  useContext,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { useIsomorphicLayoutEffect } from "../../hooks/useIsomorphicLayoutEffect";
import { UserLoggedContext } from "../../contexts/UserLoggedContext";
import { useNavigate, Link } from "react-router-dom";
import { useAuthModal } from "../../contexts/AuthModalContext";
import { FiSearch, FiMusic } from "react-icons/fi";
import { FaUserFriends, FaEllipsisH, FaChevronUp } from "react-icons/fa";
import { RiHeart3Fill } from "react-icons/ri";
import { LuText } from "react-icons/lu";
import { Ellipsis } from "lucide-react";
import styles from "./Review.module.css";
import cardStyles from "./ReviewCard.module.css";
import { handleFriendReviews } from "../../services/HandleFriendReviews";
import { likeInteraction, postComment, getComments } from "../../services/Interactions";
import LoadingIndicator from "../Utils/LoadingIndicator";
import { Button } from "../Utils/Buttons/Button";
import Image from "../Utils/Images/Image/Image";
import { RatingComponent } from "./RatingStar/RatingStar";
import { RatingTag, LikeTag } from "../Utils/Tags/Tags";
import {
  getTrackDate,
  getRelativeTime,
  getRelativeTimeCompact,
} from "../../utils/formatters/dateFormatters";
import {
  truncateText,
  formatArtists,
  createTrackSlug,
  createAlbumSlug,
  parseReviewContent,
} from "../../utils/formatters/textFormatters";
import ActionMenu from "../Utils/Dropdown/ActionMenu";
import AddToListModal from "../Utils/AddToListModal/AddToListModal";
import ArtistList from "../Utils/ArtistList/ArtistList";
import InteractionBar from "../Utils/InteractionBar/InteractionBar";
import TrackReviewModal from "./TrackReviewModal/TrackReviewModal";
import { Tooltip } from "../Utils/Tooltip/Tooltip";
import useInfiniteScroll from "../../hooks/useInfiniteScroll";
import ReviewItem from "./ReviewItem/ReviewItem";
import { CommentInput } from "./ReviewItem/ReviewItem";
import reviewItemStyles from "./ReviewItem/ReviewItem.module.css";
import ReviewItemSkeleton from "../Utils/Skeletons/ReviewItemSkeleton";
import showToast from "../Utils/Toast/Toast";
import { TextInput } from "../Utils/Inputs/Inputs";


const mapCommentToReview = (c) => ({
  ...c,
  _id: c._id,
  username: c.username || c.userId?.username || "",
  name: c.name || c.userId?.name || "",
  userImage: c.userImage || c.userId?.userimage,
  userId: c.userId?._id || c.userId,
  review: c.content,
  createdAt: c.createdAt,
  likes: c.interactions?.likeCount || 0,
  comments: c.replies?.length || 0,
  user_like_status: c.interactions?.isLiked || false,
  isDeleted: c.isdeleted || c.isDeleted || false,
});

export const ReviewCard = ({ activity, allActivities, hideHeader = false }) => {
  const { userLogged } = useContext(UserLoggedContext);
  const { openModal } = useAuthModal();
  const [liked, setLiked] = useState(activity.isLiked || false);
  const [likesCount, setLikesCount] = useState(activity.likesCount || 0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const [fetchedComments, setFetchedComments] = useState([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [hasFetchedComments, setHasFetchedComments] = useState(false);
  const [commentsCount, setCommentsCount] = useState(activity.commentsCount || 0);
  const [activeReplyId, setActiveReplyId] = useState(null);

  const commentsToDisplay = useMemo(() => {
    return fetchedComments.map((reply) => mapCommentToReview(reply));
  }, [fetchedComments]);

  const fetchComments = async () => {
    if (isLoadingComments || hasFetchedComments) return;
    setIsLoadingComments(true);
    try {
      const comments = await getComments(activity.logId);
      setFetchedComments(comments || []);
      setHasFetchedComments(true);
    } catch (error) {
      console.error("Failed to fetch comments:", error);
    } finally {
      setIsLoadingComments(false);
    }
  };

  const isAlbum = activity.type === "album";

  const trackSlug = !isAlbum
    ? createTrackSlug(activity.name, activity.artists, activity.trackId || activity.id)
    : null;

  const albumSlug = isAlbum
    ? createAlbumSlug(activity.name, activity.artists, activity.id)
    : null;

  const logUrl =
    activity.user?.username && activity.logId
      ? `/${activity.user.username}/log/${activity.logId}`
      : trackSlug || albumSlug || "#";

  const artists = Array.isArray(activity.artists) ? activity.artists : [];
  const itemSlug = isAlbum ? albumSlug : trackSlug;

  const hasReview = activity.review && activity.review.trim().length > 0;
  const typeLabel = activity.type === "album" ? "an album" : activity.type === "single" ? "a single" : "a track";
  const verb = hasReview ? `reviewed ${typeLabel}` : activity.rating ? `rated ${typeLabel}` : `logged ${typeLabel}`;

  const { text: reviewText, gifUrl } = parseReviewContent(activity.review || "");
  const MAX_LENGTH = 400;
  const shouldTruncate = reviewText.length > MAX_LENGTH;
  const displayReview = shouldTruncate && !isExpanded
    ? `${reviewText.slice(0, MAX_LENGTH)}...`
    : reviewText;

  const toggleExpand = (e) => {
    e.stopPropagation();
    e.preventDefault();
    setIsExpanded(!isExpanded);
  };

  const handleLike = async (e) => {
    e.stopPropagation();
    if (!userLogged) {
      openModal("login-reason", { reason: "like" });
      return;
    }
    const newLiked = !liked;
    setLiked(newLiked);
    setLikesCount((prev) => (newLiked ? prev + 1 : prev - 1));
    try {
      await likeInteraction({ targetId: activity.logId, targetType: "Log" });
    } catch {
      setLiked(!newLiked);
      setLikesCount((prev) => (newLiked ? prev - 1 : prev + 1));
    }
  };

  const handleReplyClick = async (e) => {
    e.stopPropagation();
    if (!userLogged) {
      openModal("login-reason", { reason: "comment" });
      return;
    }
    if (commentsCount > 0 && !showReplies) {
      setShowReplies(true);
      if (!hasFetchedComments) {
        await fetchComments();
      }
      return;
    }
    setShowReplies(true);
    setIsReplying(!isReplying);
  };

  const handleSubmitReply = async (content) => {
    if (!userLogged) {
      openModal("login-reason", { reason: "comment" });
      return;
    }
    try {
      await postComment({
        logId: activity.logId,
        content,
        parentId: null,
      });
      setIsReplying(false);
      setCommentsCount((prev) => prev + 1);
      const comments = await getComments(activity.logId);
      setFetchedComments(comments || []);
      setHasFetchedComments(true);
      setShowReplies(true);
    } catch (error) {
      console.error("Failed to post comment:", error);
      showToast("Failed to post comment", "error");
    }
  };

  const [menuPosition, setMenuPosition] = useState(null);
  const [newLogEntry, setNewLogEntry] = useState(null);
  const [editReviewId, setEditReviewId] = useState(null);
  const [listModalTrackId, setListModalTrackId] = useState(null);

  const handleMenuClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (menuOpen) {
      setMenuOpen(false);
      setMenuPosition(null);
    } else {
      const rect = e.currentTarget.getBoundingClientRect();
      setMenuPosition({ top: rect.bottom, right: window.innerWidth - rect.right });
      setMenuOpen(true);
    }
  };

  return (
    <div className={cardStyles.reviewCard}>
      {!hideHeader && (
        <div className={cardStyles.reviewHeader}>
          <div className={cardStyles.headerLeft}>
            <Image
              src={activity.user?.userimage || activity.user?.image || activity.user?.userImage}
              name={activity.user?.username}
              userId={activity.user?._id || activity.user?.id}
              status={activity.user?.status}
              to={activity.user?.username ? `/${activity.user.username}` : undefined}
              size={22}
            />
            <Link to={`/${activity.user?.username}`} className={cardStyles.username}>
              {activity.user?.username || "User"}
            </Link>
            <Link to={logUrl} className={cardStyles.verb}>{verb}</Link>
          </div>
          <Tooltip
            text={getTrackDate({ createdAtDate: activity.createdAt || activity.selectedDate })}
            position="top"
          >
            <span className={cardStyles.time}>
              {getRelativeTimeCompact(activity.createdAt || activity.selectedDate)}
            </span>
          </Tooltip>
        </div>
      )}

      <div className={cardStyles.cardBody}>
        <div className={cardStyles.cardInner}>
          <Link to={itemSlug || logUrl} className={cardStyles.coverLink}>
            <Image
              src={activity.coverUrl}
              alt={activity.name}
              fallbackVariant="cover"
              width="100%"
              height="100%"
              borderLength="2px"
              className={cardStyles.cover}
            />
          </Link>

          <div className={cardStyles.trackDetails}>
            <div className={cardStyles.trackRow}>
              <Link to={itemSlug || logUrl} className={cardStyles.trackName}>{activity.name}</Link>
              {activity.rating > 0 && <RatingTag rating={activity.rating} size="0.75rem" to={logUrl} />}
              {activity.liked && <LikeTag size="0.75rem" />}
              <div className={cardStyles.moreButtonWrapper}>
                <button
                  className={cardStyles.moreButton}
                  onClick={handleMenuClick}
                  aria-label="More options"
                >
                  <Ellipsis size={18} />
                </button>
                {menuOpen && (
                  <ActionMenu
                    menuType="friends-reviews"
                    itemId={activity.id}
                    onClose={() => { setMenuOpen(false); setMenuPosition(null); }}
                    position={menuPosition}
                    friendsReviews={allActivities}
                    openNewLogOverlay={(entry) => {
                      setMenuOpen(false);
                      setMenuPosition(null);
                      setNewLogEntry(entry);
                    }}
                    openEditOverlay={(entry) => {
                      setMenuOpen(false);
                      setMenuPosition(null);
                      setEditReviewId(entry.logId || entry.id);
                    }}
                    openListModal={(trackId) => {
                      setMenuOpen(false);
                      setMenuPosition(null);
                      setListModalTrackId(trackId);
                    }}
                  />
                )}
              </div>
            </div>
            <ArtistList artists={artists} className={cardStyles.artistName} />
          </div>
        </div>

        {(hasReview || gifUrl) && (
          <>
            {reviewText && (
              <p className={cardStyles.reviewText}>
                {displayReview}
                {shouldTruncate && (
                  <button
                    onClick={toggleExpand}
                    className={cardStyles.readMoreButton}
                  >
                    {isExpanded ? "Show less" : "Read more"}
                  </button>
                )}
              </p>
            )}
            {gifUrl && (
              <img
                src={gifUrl}
                alt="Review GIF"
                className={cardStyles.reviewGif}
                onError={(e) => { e.target.style.display = "none"; }}
              />
            )}
          </>
        )}
      </div>

      <InteractionBar
        liked={liked}
        likesCount={likesCount}
        onLike={handleLike}
        commentCount={commentsCount}
        showComment={false}
        showReply={true}
        onReply={handleReplyClick}
        replyText={commentsCount > 0 && !showReplies
          ? `${commentsCount} ${commentsCount === 1 ? "reply" : "replies"}`
          : "Reply"
        }
        replyExpanded={showReplies}
        showShare={false}
        size={17}
        className={cardStyles.interactionBar}
      />

      {showReplies && (
        <>
          {isReplying && (
            <div onClick={(e) => e.stopPropagation()}>
              <CommentInput
                onSubmit={handleSubmitReply}
                onCancel={() => setIsReplying(false)}
                placeholder="Write a comment..."
                autoFocus
              />
            </div>
          )}
          {isLoadingComments && (
            <div className={reviewItemStyles.repliesList}>
              {Array.from({ length: 3 }).map((_, i) => (
                <ReviewItemSkeleton key={i} />
              ))}
            </div>
          )}
          {!isLoadingComments && commentsToDisplay.length > 0 && (
            <div className={reviewItemStyles.repliesList}>
              {commentsToDisplay.map((reply) => (
                <ReviewItem
                  key={reply._id}
                  review={reply}
                  type="comment"
                  isLast={false}
                  onRefresh={async () => {
                    const comments = await getComments(activity.logId);
                    setFetchedComments(comments || []);
                    setHasFetchedComments(true);
                  }}
                  onCommentAdded={() => setCommentsCount((prev) => prev + 1)}
                  replies={reply.replies}
                  activeReplyId={activeReplyId}
                  setActiveReplyId={setActiveReplyId}
                />
              ))}
            </div>
          )}
          {commentsToDisplay.length > 0 && (
            <button
              className={reviewItemStyles.hideRepliesButton}
              onClick={(e) => {
                e.stopPropagation();
                setShowReplies(false);
                setIsReplying(false);
              }}
            >
              <FaChevronUp size={10} />
              Hide replies
            </button>
          )}
        </>
      )}

      {newLogEntry && (
        <TrackReviewModal
          trackId={newLogEntry.trackId}
          onClose={() => setNewLogEntry(null)}
        />
      )}

      {editReviewId && (
        <TrackReviewModal
          reviewId={editReviewId}
          onClose={() => setEditReviewId(null)}
        />
      )}

      {listModalTrackId && (
        <AddToListModal
          trackId={listModalTrackId}
          onClose={() => setListModalTrackId(null)}
        />
      )}
    </div>
  );
};

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

const Review = () => {
  const { userLogged } = useContext(UserLoggedContext);
  const navigate = useNavigate();
  const { openModal } = useAuthModal();

  const [friendsReviews, setFriendsReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [actionMenu, setActionMenu] = useState({
    visible: false,
    position: { top: 0, right: 0 },
    itemId: null,
  });
  const [newLogEntry, setNewLogEntry] = useState(null);
  const [listModalTrackId, setListModalTrackId] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalEntries: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [isFetchingLocal, setIsFetchingLocal] = useState(false);

  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const isMounted = useRef(true);
  const currentRequestRef = useRef(null);
  const requestedPagesRef = useRef(new Set());

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const loadMoreEntries = useCallback(() => {
    if (!pagination.hasNextPage || loading || isFetchingLocal) {
      return;
    }

    const nextPage = pagination.currentPage + 1;

    if (requestedPagesRef.current.has(nextPage)) {
      return;
    }

    setIsFetchingLocal(true);

    setTimeout(() => {
      requestedPagesRef.current.add(nextPage);

      setPagination((prev) => ({
        ...prev,
        currentPage: nextPage,
      }));
    }, 100);
  }, [
    pagination.hasNextPage,
    loading,
    isFetchingLocal,
    pagination.currentPage,
  ]);

  const { lastElementRef } = useInfiniteScroll(
    loadMoreEntries,
    pagination.hasNextPage,
    loading || isFetchingLocal,
    100
  );

  useEffect(() => {
    if (!loading && isFetchingLocal) {
      setIsFetchingLocal(false);
    }
  }, [loading, isFetchingLocal]);

  useEffect(() => {
    if (currentRequestRef.current) {
      currentRequestRef.current.cancelled = true;
    }

    const requestId = {};
    currentRequestRef.current = requestId;

    async function fetchEntries() {
      if (!userLogged) {
        setFriendsReviews([]);
        setLoading(false);
        return;
      }

      if (requestId.cancelled || !isMounted.current) return;

      const currentPage = pagination.currentPage;

      if (currentPage > 1 && friendsReviews.length > (currentPage - 1) * 20) {
        if (isFetchingLocal) setIsFetchingLocal(false);
        return;
      }

      try {
        if (currentPage === 1) {
          setLoading(true);
        }
        setError(null);

        const params = {
          page: currentPage,
          limit: 20,
          search: debouncedSearchQuery || undefined,
          sortBy: "selectedDate",
          sortOrder: -1,
        };

        const result = await handleFriendReviews(params);

        if (requestId.cancelled || !isMounted.current) {
          return;
        }

        if (result && result.status === 200 && result.data) {
          const { reviews, pagination: paginationData } = result.data;

          const isAlbumReview = (r) => r.type === "album";
          const formattedReviews = reviews.map((review) => ({
            id: review._id,
            logId: review._id,
            trackId: review.track?.id || review.trackId,
            name: review.type === "album" ? (review.album?.name || review.name) : (review.track?.name || review.name),
            trackTitle: review.type === "album" ? (review.album?.name || review.name) : (review.track?.name || review.name),
            artist: formatArtists(review.artists),
            artists: review.artists,
            albumCover: review.coverUrl,
            coverUrl: review.coverUrl,
            rating: review.rating,
            review: review.review,
            liked: review.liked,
            listened: review.listened,
            hasReview: Boolean(review.review),
            date: review.selectedDate || review.createdAt,
            type: review.type || "track",
            albumId: review.album?.id || review.albumId,
            albumName: review.album?.name || review.albumName,
            user: {
              id: review.userId._id,
              username: review.userId.username,
              userimage: review.userId.userimage,
            },
          }));

          if (currentPage === 1) {
            setFriendsReviews(formattedReviews);
          } else {
            setFriendsReviews((prev) => {
              if (prev.length >= currentPage * 20) {
                return prev;
              }

              const newEntries = [...prev, ...formattedReviews];
              return newEntries;
            });
          }

          setPagination({
            currentPage: paginationData.page,
            totalPages: paginationData.pages,
            totalEntries: paginationData.total,
            hasNextPage: paginationData.page < paginationData.pages,
            hasPrevPage: paginationData.page > 1,
          });
        } else {
          setError("Failed to load friends reviews");
        }

        if (!requestId.cancelled && isMounted.current) {
          setLoading(false);
          setIsFetchingLocal(false);
        }
      } catch (err) {
        console.error("Error fetching friends reviews:", err);

        if (!requestId.cancelled && isMounted.current) {
          setError("Error loading friends reviews. Please try again later.");
          setLoading(false);
          setIsFetchingLocal(false);
        }
      }
    }

    fetchEntries();

    return () => {
      requestId.cancelled = true;

      if (isMounted.current) {
        setLoading(false);
        setIsFetchingLocal(false);
      }
    };
  }, [userLogged, pagination.currentPage, debouncedSearchQuery]);

  const filteredReviews = useMemo(() => {
    if (!debouncedSearchQuery) return friendsReviews;

    const query = debouncedSearchQuery.toLowerCase();
    return friendsReviews.filter(
      (review) =>
        review.name.toLowerCase().includes(query) ||
        review.artist.some((a) => a.name.toLowerCase().includes(query)) ||
        review.user.username.toLowerCase().includes(query) ||
        (review.review && review.review.toLowerCase().includes(query))
    );
  }, [friendsReviews, debouncedSearchQuery]);

  const groupedByYearMonth = useMemo(() => {
    return filteredReviews.reduce((groups, entry) => {
      const date = new Date(entry.date);
      const year = date.getFullYear();
      const month = date.getMonth();

      if (!groups[year]) {
        groups[year] = {};
      }

      if (!groups[year][month]) {
        groups[year][month] = [];
      }

      groups[year][month].push(entry);
      return groups;
    }, {});
  }, [filteredReviews]);

  const handleSearchChange = useCallback((e) => {
    setSearchQuery(e.target.value);
    setPagination({
      currentPage: 1,
      totalPages: 1,
      totalEntries: 0,
      hasNextPage: false,
      hasPrevPage: false,
    });
    requestedPagesRef.current.clear();
  }, []);

  const handleTrackClick = useCallback(
    (trackOrId) => {
      if (trackOrId) {
        if (typeof trackOrId === "string") {
          navigate(`/track/${trackOrId}`);
        } else {
          const trackTitle =
            trackOrId.name || trackOrId.title;
          navigate(
            createTrackSlug(trackTitle, trackOrId.artists, trackOrId.trackId || trackOrId.id),
            { state: { trackId: trackOrId.trackId || trackOrId.id } }
          );
        }
      }
    },
    [navigate]
  );

  const handleUserClick = useCallback(
    (username) => {
      navigate(`/${username}`);
    },
    [navigate]
  );

  const handleActionClick = (event, itemId) => {
    event.stopPropagation();
    event.preventDefault();
    const rect = event.currentTarget.getBoundingClientRect();

    if (actionMenu.visible && actionMenu.itemId === itemId) {
      setActionMenu({
        visible: false,
        position: { top: 0, right: 0 },
        itemId: null,
      });
      return;
    }

    setActionMenu({
      visible: true,
      position: {
        top: rect.top - 5,
        right: window.innerWidth - rect.right + 10,
      },
      itemId,
    });
  };

  const closeActionMenu = () => {
    setActionMenu({
      visible: false,
      position: { top: 0, right: 0 },
      itemId: null,
    });
  };

  const openNewLogOverlay = (entry) => {
    setNewLogEntry({
      trackId: entry.trackId,
      trackTitle: entry.name,
      artist: entry.artist,
      albumCover: entry.coverUrl,
    });
  };

  const closeOverlay = () => {
    setNewLogEntry(null);
  };

  const getMonthName = useMemo(() => {
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    return (monthIndex) => months[monthIndex];
  }, []);


  if (!userLogged) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Friends' Reviews</h1>
        </div>
        <div className={styles.emptyState}>
          <div className={styles.emptyStateIcon}>
            <FaUserFriends size={40} />
          </div>
          <h3>Please log in to see friends' reviews</h3>
          <p>You need to be logged in to view your friends' music reviews.</p>
          <Button variant="primary" size="md" onClick={() => openModal()}>
            Log In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Friends' Reviews</h1>
      </div>

      <div className={styles.controls}>
        <div className={styles.searchContainer}>
          <TextInput
            type="text"
            icon={<FiSearch />}
            clearable
            placeholder="Search friends' reviews..."
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>
      </div>

      {loading ? (
        <div className={styles.loadingContainer}>
          <LoadingIndicator />
        </div>
      ) : error ? (
        <div className={styles.errorContainer}>
          <p className={styles.errorMessage}>{error}</p>
          <Button
            variant="primary"
            size="md"
            onClick={() => {
              setPagination({
                currentPage: 1,
                totalPages: 1,
                totalEntries: 0,
                hasNextPage: false,
                hasPrevPage: false,
              });
              requestedPagesRef.current.clear();
            }}
          >
            Try Again
          </Button>
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyStateIcon}>
            <FiMusic size={40} />
          </div>
          <h3>No reviews found</h3>
          <p>
            {searchQuery
              ? `No reviews match "${searchQuery}". Try a different search term.`
              : "Follow friends to see their latest reviews or ask them to start logging music!"}
          </p>
          {searchQuery && (
            <Button
              variant="primary"
              size="md"
              onClick={() => setSearchQuery("")}
            >
              Clear Search
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className={styles.tableView}>
            <div className={styles.tableHeader}>
              <div className={styles.tableHeaderCell + " " + styles.dateColumn}>
                USER
              </div>
              <div
                className={styles.tableHeaderCell + " " + styles.trackColumn}
              >
                TRACK
              </div>
              <div
                className={styles.tableHeaderCell + " " + styles.ratingColumn}
              >
                RATING
              </div>
              <div
                className={styles.tableHeaderCell + " " + styles.reviewsColumn}
              >
                REVIEW
              </div>
              <div
                className={styles.tableHeaderCell + " " + styles.likesColumn}
              >
                LIKED
              </div>
              <div
                className={styles.tableHeaderCell + " " + styles.actionsColumn}
              ></div>
            </div>

            {Object.keys(groupedByYearMonth)
              .sort((a, b) => b - a)
              .map((year) => (
                <div key={year} className={styles.yearGroup}>
                  {Object.keys(groupedByYearMonth[year])
                    .sort((a, b) => b - a)
                    .map((monthIndex, monthArrayIndex) => {
                      const monthName = getMonthName(parseInt(monthIndex));
                      const entries = groupedByYearMonth[year][monthIndex];

                      return (
                        <div
                          key={`${year}-${monthIndex}`}
                          className={styles.monthGroup}
                        >
                          <div className={styles.headerRow}>
                            {monthArrayIndex === 0 && (
                              <div className={styles.yearHeader}>
                                {year}{" "}
                                <span style={{ fontSize: "1.15rem" }}>•</span>
                              </div>
                            )}
                            <div className={styles.monthHeader}>
                              {monthName}
                            </div>
                          </div>

                          {entries.map((entry, index) => {
                            const isLastEntry = index === entries.length - 1;

                            const isVeryLastEntry =
                              year ===
                              Object.keys(groupedByYearMonth).sort(
                                (a, b) => b - a
                              )[Object.keys(groupedByYearMonth).length - 1] &&
                              monthIndex ===
                              Object.keys(groupedByYearMonth[year]).sort(
                                (a, b) => b - a
                              )[
                              Object.keys(groupedByYearMonth[year]).length -
                              1
                              ] &&
                              index === entries.length - 1;

                            return (
                              <Link
                                key={entry.id}
                                ref={isVeryLastEntry ? lastElementRef : null}
                                className={`${styles.tableRow} ${isLastEntry ? styles.lastEntry : ""
                                  }`}
                                to={`/${entry.user.username}/log/${entry.id}`}
                              >
                                <div
                                  className={
                                    styles.tableCell + " " + styles.dateColumn
                                  }
                                >
                                  <div
                                    className={styles.userInfo}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleUserClick(entry.user.username);
                                    }}
                                    style={{ cursor: "pointer" }}
                                    title={`${getTrackDate({
                                      createdAtDate: entry.date,
                                    })} • View ${entry.user.username
                                      }'s profile`}
                                  >
                                    <Image
                                      src={entry.user?.userimage || entry.user?.image || entry.user?.userImage}
                                      name={entry.user?.username}
                                      userId={entry.user?._id || entry.user?.id}
                                      status={entry.user?.status}
                                      size={32}
                                    />
                                    <div className={styles.userDetails}>
                                      <span className={styles.username}>
                                        {truncateText(entry.user.username, 12)}
                                      </span>
                                      <span className={styles.relativeTime}>
                                        {getRelativeTime(entry.date)}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                <div
                                  className={
                                    styles.tableCell + " " + styles.trackColumn
                                  }
                                >
                                  <div className={styles.trackInfo}>
                                    <div className={styles.trackCover}>
                                      {entry.albumCover ? (
                                        <img
                                          src={entry.albumCover}
                                          alt={entry.trackTitle}
                                          loading="lazy"
                                          onError={(e) =>
                                            (e.target.style.display = "none")
                                          }
                                        />
                                      ) : (
                                        <div
                                          className={styles.fallbackCover}
                                        ></div>
                                      )}
                                    </div>
                                    <div className={styles.trackDetails}>
                                      <span className={styles.trackTitle}>
                                        {entry.trackTitle}
                                      </span>
                                      <ArtistList
                                        artists={entry.artist}
                                        className={styles.trackArtist}
                                        fontSize="0.85rem"
                                      />
                                      <div className={styles.mobileTags}>
                                        {entry.rating > 0 && (
                                          <RatingTag
                                            rating={entry.rating}
                                            size="0.75rem"
                                          />
                                        )}
                                        {entry.liked && (
                                          <LikeTag size="0.75rem" />
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                <div
                                  className={
                                    styles.tableCell + " " + styles.ratingColumn
                                  }
                                >
                                  <RatingComponent
                                    value={entry.rating}
                                    setValue={() => { }}
                                    changeStatus={false}
                                    size="1.5rem"
                                    borderColor="var(--star-empty-border)"
                                    ecolor="var(--star-empty-fill)"
                                  />
                                </div>

                                <div
                                  className={
                                    styles.tableCell +
                                    " " +
                                    styles.reviewsColumn
                                  }
                                >
                                  {entry.hasReview && (
                                    <button
                                      className={`${styles.actionButton} ${styles.reviewIndicator}`}
                                      title="Has Review"
                                    >
                                      <LuText />
                                    </button>
                                  )}
                                </div>

                                <div
                                  className={
                                    styles.tableCell + " " + styles.likesColumn
                                  }
                                >
                                  {entry.liked ? (
                                    <button
                                      className={`${styles.actionButton} ${styles.likedIndicator}`}
                                      title="Liked"
                                    >
                                      <RiHeart3Fill />
                                    </button>
                                  ) : null}
                                </div>

                                <div
                                  className={
                                    styles.tableCell +
                                    " " +
                                    styles.actionsColumn
                                  }
                                >
                                  <div className={styles.actionButtons}>
                                    <button
                                      className={styles.actionButton}
                                      title="More"
                                      onMouseDown={(e) => e.stopPropagation()}
                                      onClick={(e) =>
                                        handleActionClick(e, entry.id)
                                      }
                                    >
                                      <FaEllipsisH />
                                    </button>
                                  </div>
                                </div>
                              </Link>
                            );
                          })}
                        </div>
                      );
                    })}
                </div>
              ))}
          </div>

          {isFetchingLocal && (
            <div className={styles.loadingContainer}>
              <LoadingIndicator />
            </div>
          )}
        </>
      )}

      {actionMenu.visible && (
        <ActionMenu
          menuType="friends-reviews"
          itemId={actionMenu.itemId}
          handleTrackClick={handleTrackClick}
          friendsReviews={friendsReviews}
          position={actionMenu.position}
          anchor="top-right"
          onClose={closeActionMenu}
          openNewLogOverlay={openNewLogOverlay}
          openListModal={(trackId) => setListModalTrackId(trackId)}
        />
      )}

      {listModalTrackId && (
        <AddToListModal
          trackId={listModalTrackId}
          onClose={() => setListModalTrackId(null)}
        />
      )}

      {newLogEntry && (
        <TrackReviewModal
          trackId={newLogEntry.trackId}
          onClose={closeOverlay}
        />
      )}
    </div>
  );
};

export default Review;
