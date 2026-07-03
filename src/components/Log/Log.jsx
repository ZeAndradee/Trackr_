import {
   useState,
   useEffect,
   useContext,
   useMemo,
   useRef,
   useCallback,
} from "react";
import { useParams, Link } from "react-router-dom";
import { useIsomorphicLayoutEffect } from "../../hooks/useIsomorphicLayoutEffect";
import styles from "./Log.module.css";
import useStickyFollowScroll from "../../hooks/useStickyFollowScroll";
import { fetchLog } from "../../services/HandleLogs";
import {
   likeInteraction,
   postComment,
   getComments,
} from "../../services/Interactions";
import { UserLoggedContext } from "../../contexts/UserLoggedContext";
import { useAuthModal } from "../../contexts/AuthModalContext";
import Image from "../Utils/Images/Image/Image";
import { formatDate } from "../../utils/formatters/dateFormatters";
import TrackProfileSkeleton from "../Utils/Skeletons/TrackProfileSkeleton";
import ErrorBoundary from "../Utils/Error/ErrorBoundary";
import InteractionBar from "../Utils/InteractionBar/InteractionBar";
import LogOwnerReviews from "./LogOwnerReviews/LogOwnerReviews";
import { LikeTag, RatingTag } from "../Utils/Tags/Tags";
import TrackReviewModal from "../Review/TrackReviewModal/TrackReviewModal";
import {
   formatArtists,
   createTrackSlug,
   createAlbumSlug,
   parseReviewContent,
} from "../../utils/formatters/textFormatters";
import ArtistList from "../Utils/ArtistList/ArtistList";
import ShareModal from "../Track/TrackProfile/ShareModal/ShareModal";
import { Button } from "../Utils/Buttons/Button";
import ReviewItem from "../Review/ReviewItem/ReviewItem";
import { CommentInput } from "../Review/ReviewItem/ReviewItem";
import HeroItem from "../Utils/HeroItem/HeroItem";
import FriendsFacePile from "../Utils/FriendsFacePile/FriendsFacePile";
import { fetchFriendsListened } from "../../services/FetchTrack";
import { fetchAlbumFriendsListened } from "../../services/FetchAlbum";
import showToast from "../Utils/Toast/Toast";

const Log = ({ initialLog = null }) => {
   const { logId } = useParams();
   const sidebarRef = useRef(null);
   useStickyFollowScroll(sidebarRef);
   const { userLogged } = useContext(UserLoggedContext);
   const { openModal } = useAuthModal();
   const [log, setLog] = useState(initialLog);
   const [isLoading, setIsLoading] = useState(!initialLog);
   const [error, setError] = useState(null);
   const [liked, setLiked] = useState(initialLog?.interactions?.isLiked || false);
   const [likesCount, setLikesCount] = useState(initialLog?.interactions?.likeCount || 0);
   const [commentCount, setCommentCount] = useState(initialLog?.interactions?.commentCount || 0);
   const hasInitialLog = useRef(Boolean(initialLog));
   const [isExpanded, setIsExpanded] = useState(false);
   const [comments, setComments] = useState([]);

   const [newComment, setNewComment] = useState("");
   const [replyingTo, setReplyingTo] = useState(null);
   const [isShareModalOpen, setIsShareModalOpen] = useState(false);
   const [showTrackReviewModal, setShowTrackReviewModal] = useState(false);
   const [friendsActivity, setFriendsActivity] = useState([]);

   const mappedComments = useMemo(() => {
      return comments.map((c) => ({
         ...c,
         _id: c._id,
         username: c.username || c.userId?.username || "Unknown",
         name: c.name || c.userId?.name || "Unknown",
         userImage: c.userImage || c.userId?.userimage,
         userId: c.userId?._id || c.userId,
         review: c.content,
         createdAt: c.createdAt,
         likes: c.interactions?.likeCount || 0,
         comments: c.replies?.length || 0,
         user_like_status: c.interactions?.isLiked || false,
      }));
   }, [comments]);

   const loadData = useCallback(async () => {
      if (!logId) return;

      if (hasInitialLog.current) {
         hasInitialLog.current = false;
         const commentsData = await getComments(logId).catch((err) => {
            console.error("Failed to load comments:", err);
            return [];
         });
         setComments(commentsData || []);
         setIsLoading(false);
         return;
      }

      setIsLoading(true);
      try {
         const [logResponse, commentsData] = await Promise.all([
            fetchLog(logId),
            getComments(logId).catch((err) => {
               console.error("Failed to load comments:", err);
               return [];
            }),
         ]);

         const logData = logResponse.data;
         setLog(logData);
         setLiked(logData.interactions?.isLiked || false);
         setLikesCount(logData.interactions?.likeCount || 0);
         setCommentCount(logData.interactions?.commentCount || 0);
         setComments(commentsData || []);
      } catch (err) {
         console.error("Error loading log page data:", err);
         setError(err);
      } finally {
         setIsLoading(false);
      }
   }, [logId]);

   useEffect(() => {
      loadData();
   }, [loadData]);

   useEffect(() => {
      if (!log) return;

      const fetchFriends = async () => {
         try {
            let response;
            if (log.type === "album") {
               const albumId = log.albumId || log.album?.id;
               if (albumId) {
                  response = await fetchAlbumFriendsListened(albumId);
               }
            } else {
               const trackId = log.trackId || log.track?.id;
               if (trackId) {
                  response = await fetchFriendsListened(trackId);
               }
            }

            if (response) {
               const friendsArray = response.data?.friends || response.friends || (Array.isArray(response) ? response : null) || (Array.isArray(response.data) ? response.data : null);
               if (friendsArray && friendsArray.length > 0) {
                  setFriendsActivity(friendsArray);
               }
            }
         } catch (error) {
            console.error("Error fetching friends activity:", error);
         }
      };

      fetchFriends();
   }, [log]);

   const handleLike = async () => {
      if (!userLogged) {
         openModal("login-reason", {
            reason: "like",
         });
         return;
      }

      const newLikedStatus = !liked;
      setLiked(newLikedStatus);
      setLikesCount((prev) => (newLikedStatus ? prev + 1 : prev - 1));
      try {
         await likeInteraction({
            targetId: log._id,
            targetType: "Log",
         });
      } catch (error) {
         console.error("Error updating like status:", error);
         setLiked(!newLikedStatus);
         setLikesCount((prev) => (newLikedStatus ? prev - 1 : prev + 1));
      }
   };

   const handleShare = () => {
      setIsShareModalOpen(true);
   };

   const toggleExpand = () => {
      setIsExpanded(!isExpanded);
   };

   const [isSubmitting, setIsSubmitting] = useState(false);
   const commentInputRef = useRef(null);

   useIsomorphicLayoutEffect(() => {
      if (commentInputRef.current) {
         commentInputRef.current.style.height = "auto";
         commentInputRef.current.style.height = `${commentInputRef.current.scrollHeight}px`;
      }
   }, [newComment]);

   const handlePostComment = async (e) => {
      e.preventDefault();
      if (!newComment.trim()) return;

      if (!userLogged) {
         openModal("login-reason", {
            reason: "comment",
         });
         return;
      }

      setIsSubmitting(true);
      try {
         await postComment({ logId: log._id, content: newComment });
         const updatedComments = await getComments(log._id);
         setComments(updatedComments);
         setNewComment("");
         setReplyingTo(null);
      } catch (error) {
         console.error("Failed to post comment:", error);
         if (error.response?.status === 401) {
            openModal("login-reason", {
               reason: "comment",
            });
         } else {
            showToast("Failed to post comment", "error");
         }
      } finally {
         setIsSubmitting(false);
      }
   };

   if (isLoading) return <TrackProfileSkeleton />;
   if (error || !log) return <ErrorBoundary error={error || "Log not found"} />;

   const isAlbum = log.type === "album";

   const trackId = log.trackId || log.track?.id;
   const albumId = log.albumId || log.album?.id;

   const coverUrl = log.coverUrl || log.images?.[0]?.url;

   const title = isAlbum
      ? log.album?.name || log.title || "Unknown Album"
      : log.track?.name || log.title || "Unknown Track";

   const artists = log.artists ? formatArtists(log.artists) : [];

   const releaseYear =
      log.releaseYear || log.releaseDate?.split("-")[0] || log.year;

   const albumName = log.album?.name;

   const { text: reviewText, gifUrl } = parseReviewContent(log.review || "");
   const MAX_LENGTH = 350;
   const shouldTruncate = reviewText.length > MAX_LENGTH;
   const displayReview =
      shouldTruncate && !isExpanded
         ? `${reviewText.slice(0, MAX_LENGTH)}...`
         : reviewText;

   return (
      <div className={styles.container}>
         <HeroItem
            coverUrl={coverUrl}
            title={title}
            type={isAlbum ? "Album" : "Track"}
            totalTracks={isAlbum ? 2 : undefined}
            imageTo={isAlbum
               ? createAlbumSlug(title, artists, albumId)
               : createTrackSlug(title, artists, trackId)
            }
            imageState={isAlbum ? { albumId: albumId } : { trackId: trackId }}
            titleTo={isAlbum
               ? createAlbumSlug(title, artists, albumId)
               : createTrackSlug(title, artists, trackId)
            }
            titleState={isAlbum ? { albumId: albumId } : { trackId: trackId }}
            releaseYear={releaseYear}
            textWrapperClassName={styles.headerTextWrapper}
            coverWrapperClassName={styles.coverHover}
            infoClassName={styles.headerInfo}
            subtitle={
               <div className={styles.subtitleWrapper}>
                  <ArtistList
                     artists={artists}
                     className={styles.artistName}
                  />
                  {!isAlbum && albumName && (
                     <>
                        <span className={styles.separator}>•</span>
                        <Link
                           to={createAlbumSlug(albumName, artists, albumId)}
                           state={{ albumId: albumId }}
                           className={styles.albumLink}
                        >
                           {albumName}
                        </Link>
                     </>
                  )}
               </div>
            }
         >
            <FriendsFacePile users={friendsActivity} activityText="Listened by" />
         </HeroItem>

         <div className={styles.mainContent}>
            <div className={styles.reviewSection}>
               <div className={styles.reviewContentWrapper}>
                  <div className={styles.userInfo}>
                     <Image
                        src={log.userImage}
                        name={log.username}
                        alt={log.username}
                        size={60}
                        className={styles.userAvatar}
                        userId={log.userId}
                        to={log.username ? `/${log.username}` : undefined}
                     />
                     <div className={styles.userDetails}>
                        <div className={styles.nameRow}>
                           <Link to={`/${log.username}`} className={styles.userName}>
                              {log.name || log.username}
                           </Link>
                           <div className={styles.statusWrapper}>
                              {log.rating > 0 && <RatingTag rating={log.rating} />}
                              {log.liked && <LikeTag likes={log.likes} />}
                           </div>
                        </div>
                        <div className={styles.ratingDate}>
                           <span>Reviewed on {formatDate(log.createdAt)}</span>
                        </div>
                     </div>
                  </div>
                  <div className={styles.reviewText}>
                     {log.review ? (
                        <>
                           <p>
                              {displayReview}
                              {shouldTruncate && (
                                 <button
                                    onClick={toggleExpand}
                                    className={styles.readMoreButton}
                                 >
                                    {isExpanded ? "Show less" : "Read more"}
                                 </button>
                              )}
                           </p>
                           {gifUrl && (
                              <img
                                 src={gifUrl}
                                 alt="Review GIF"
                                 className={styles.reviewGif}
                                 onError={(e) => { e.target.style.display = "none"; }}
                              />
                           )}
                        </>
                     ) : (
                        <div className={styles.emptyReviewCta}>
                           <p>
                              {userLogged && log.userId === userLogged.id
                                 ? `You logged this ${isAlbum ? "album" : "track"
                                 } without a review.`
                                 : `${log.name || log.username} logged this ${isAlbum ? "album" : "track"
                                 } without a review.`}
                           </p>
                           {userLogged && log.userId === userLogged.id && (
                              <Button
                                 variant="primary"
                                 size="md"
                                 onClick={() => setShowTrackReviewModal(true)}
                              >
                                 Write a Review
                              </Button>
                           )}
                        </div>
                     )}
                  </div>
               </div>

               <InteractionBar
                  liked={liked}
                  likesCount={likesCount}
                  onLike={handleLike}
                  commentCount={commentCount}
                  onComment={() => {
                     commentInputRef.current?.focus();
                  }}
                  showShare={true}
                  onShare={handleShare}
                  className={styles.mainInteractions}
               />
               <div className={styles.commentsSection}>
                  <h3>Comments</h3>
                  <CommentInput
                     onSubmit={async (content) => {
                        if (!userLogged) {
                           openModal("login-reason", { reason: "comment" });
                           return;
                        }
                        await postComment({ logId: log._id, content });
                        const updatedComments = await getComments(log._id);
                        setComments(updatedComments);
                        setCommentCount((prev) => prev + 1);
                     }}
                     onCancel={() => setNewComment("")}
                     placeholder="Write a comment..."
                     submitLabel="Post"
                  />

                  <div className={styles.commentsList}>
                     {mappedComments.map((review) => (
                        <ReviewItem
                           key={review._id}
                           review={review}
                           type="comment"
                           isLast={false}
                           onRefresh={async () => {
                              const updatedComments = await getComments(log._id);
                              setComments(updatedComments);
                           }}
                           replies={review.replies}
                        />
                     ))}
                  </div>
               </div>
            </div>

            <div ref={sidebarRef} className={styles.sidebar}>
               <LogOwnerReviews
                  username={log.username}
                  userId={log.userId}
                  currentLogId={log._id}
               />
            </div>
         </div>
         <ShareModal
            isOpen={isShareModalOpen}
            onClose={() => setIsShareModalOpen(false)}
            logId={log._id}
            trackName={title}
            artistName={artists[0]?.name || "Unknown Artist"}
         />

         {showTrackReviewModal && (
            <TrackReviewModal
               trackId={isAlbum ? albumId : trackId}
               reviewId={log._id}
               onClose={() => {
                  setShowTrackReviewModal(false);
                  loadData();
               }}
               activeAction={"review"}
            />
         )}
      </div>
   );
};

export default Log;
