import React, {
  useState,
  useEffect,
  useContext,
  useMemo,
  useRef,
} from "react";
import { useIsomorphicLayoutEffect } from "../../../hooks/useIsomorphicLayoutEffect";
import { Link, useNavigate } from "react-router-dom";
import { FaChevronUp } from "react-icons/fa";
import { HiGif } from "react-icons/hi2";
import { Ellipsis, Eye, TextInitial, Send, Pencil, Trash2, Flag } from "lucide-react";
import Image from "../../Utils/Images/Image/Image";
import { RatingTag, LikeTag } from "../../Utils/Tags/Tags";
import { Tooltip } from "../../Utils/Tooltip/Tooltip";
import {
  likeInteraction,
  postComment,
  editComment,
  deleteComment,
  getComments,
} from "../../../services/Interactions";
import { _deleteLog } from "../../../services/HandleLogs";
import { UserLoggedContext } from "../../../contexts/UserLoggedContext";
import { useAuthModal } from "../../../contexts/AuthModalContext";
import { formatDate, getRelativeTimeCompact } from "../../../utils/formatters/dateFormatters";
import InteractionBar from "../../Utils/InteractionBar/InteractionBar";
import ActionMenu from "../../Utils/Dropdown/ActionMenu";
import showToast from "../../Utils/Toast/Toast";
import { Button } from "../../Utils/Buttons/Button";
import ReviewItemSkeleton from "../../Utils/Skeletons/ReviewItemSkeleton";
import { parseReviewContent } from "../../../utils/formatters/textFormatters";
import GifPicker from "../GifPicker/GifPicker";
import { TextArea } from "../../Utils/Inputs/Inputs";
import styles from "./ReviewItem.module.css";

const CommentInput = ({
  onSubmit,
  onCancel,
  placeholder,
  autoFocus,
  initialValue = "",
  submitLabel = "Reply",
}) => {
  const [content, setContent] = useState(initialValue);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedGif, setSelectedGif] = useState(null);
  const [showGifPicker, setShowGifPicker] = useState(false);
  const textareaRef = useRef(null);
  const gifButtonRef = useRef(null);

  useIsomorphicLayoutEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, selectedGif ? 170 : 9999)}px`;
    }
  }, [content, selectedGif]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (content.trim() || selectedGif) {
      setIsSubmitting(true);
      try {
        const finalContent = content + (selectedGif ? `[gif:${selectedGif.url}]` : "");
        await onSubmit(finalContent);
        setContent("");
        setSelectedGif(null);
      } catch (error) {
        console.error("Error submitting comment:", error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.inlineCommentForm}>
      <div className={`${styles.inputContainer} ${styles.pickerAnchor}`}>
        <div className={styles.textareaWrapper}>
          <TextArea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={placeholder}
            className={`${styles.inlineInput} ${styles.inlineInputWrapped} ${selectedGif ? styles.inlineInputAutoGrow : ""}`}
            autoFocus={autoFocus}
            maxLength={5000}
            disabled={isSubmitting}
          />
          {selectedGif && (
            <div className={styles.gifPreview}>
              <img
                src={selectedGif.url}
                alt="Selected GIF"
                className={styles.gifPreviewImage}
                onError={(e) => { e.target.style.display = "none"; }}
              />
              <button
                className={styles.removeGifButton}
                onClick={() => setSelectedGif(null)}
                aria-label="Remove GIF"
                type="button"
              >
                ×
              </button>
            </div>
          )}
        </div>
        <button
          ref={gifButtonRef}
          className={`${styles.gifButton} ${showGifPicker ? styles.gifButtonActive : ""}`}
          onClick={(e) => { e.stopPropagation(); e.preventDefault(); setShowGifPicker((prev) => !prev); }}
          aria-label="Add GIF"
          type="button"
        >
          <HiGif size={18} />
        </button>
        {showGifPicker && (
          <GifPicker
            onSelect={(gif) => { setSelectedGif(gif); setShowGifPicker(false); }}
            onClose={() => setShowGifPicker(false)}
            buttonRef={gifButtonRef}
            placement="above-right"
          />
        )}
        {content.length > 4500 && (
          <span
            className={`${styles.charCounter} ${content.length >= 5000 ? styles.limitReached : ""
              }`}
          >
            {content.length}/5000
          </span>
        )}
      </div>
      <div className={styles.inlineActions}>
        <button
          type="button"
          onClick={onCancel}
          className={styles.cancelButton}
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <Button
          type="submit"
          variant="primary"
          disabled={(!content.trim() && !selectedGif) || isSubmitting}
          className={styles.submitButton}
          size="sm"
          customPadding="9px 18px"
        >
          {submitLabel}
        </Button>
      </div>
    </form>
  );
};

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

const SIZE_PRESETS = { sm: 0.85, md: 1 };

const resolveScale = (size) => {
  if (size === undefined || size === null) return 1;
  if (typeof size === "string") return SIZE_PRESETS[size] ?? 1;
  return size;
};

const ReviewItem = ({
  review,
  isLast,
  type = "review",
  onReply,
  onRefresh,
  onCommentAdded,
  activeReplyId,
  setActiveReplyId,
  replies = [],
  loading = false,
  onEdit,
  size,
}) => {
  const scale = resolveScale(size);
  const avatarSize = Math.round(40 * scale);
  const usernameFontSize = `${1 * scale}rem`;
  const tagSize = `${0.8 * scale}rem`;
  const reviewFontSize = `${0.93 * scale}rem`;
  const interactionIconSize = Math.round(20 * scale);
  const timestampFontSize = `${12 * scale}px`;
  const { userLogged } = useContext(UserLoggedContext);
  const { openModal } = useAuthModal();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState(null);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [commentsCount, setCommentsCount] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [localIsReplying, setLocalIsReplying] = useState(false);

  const isReplying = activeReplyId !== undefined ? activeReplyId === review._id : localIsReplying;

  const [isEditing, setIsEditing] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const [fetchedComments, setFetchedComments] = useState([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [hasFetchedComments, setHasFetchedComments] = useState(false);


  const commentsToDisplay = useMemo(() => {
    const activeReplies = replies.length > 0 ? replies : fetchedComments;
    return activeReplies.map((reply) => mapCommentToReview(reply));
  }, [replies, fetchedComments]);

  useEffect(() => {
    if (!review) return;
    setLiked(review.user_like_status || review.interactions?.isLiked || false);
    setLikesCount(review.likes || review.interactions?.likeCount || 0);
    setCommentsCount(review.comments || review.interactions?.commentCount || 0);
  }, [review?._id]);

  const fetchComments = async () => {
    if (isLoadingComments || hasFetchedComments || replies.length > 0) return;
    setIsLoadingComments(true);
    try {
      const comments = await getComments(review._id);
      setFetchedComments(comments || []);
      setHasFetchedComments(true);
    } catch (error) {
      console.error("Failed to fetch comments for review:", error);
    } finally {
      setIsLoadingComments(false);
    }
  };

  const handleLike = async (e) => {
    e.stopPropagation();

    if (!userLogged) {
      openModal("login-reason", {
        reason: "like",
      });
      return;
    }

    const newLiked = !liked;
    setLiked(newLiked);
    setLikesCount((prev) => (newLiked ? prev + 1 : prev - 1));

    try {
      await likeInteraction({
        targetId: review._id,
        targetType: type === "review" ? "Log" : "Comment",
      });
    } catch (error) {
      console.error("Failed to like review:", error);
      setLiked(!newLiked);
      setLikesCount((prev) => (newLiked ? prev - 1 : prev + 1));
    }
  };

  const handleReplyClick = async (e) => {
    e.stopPropagation();
    if (!userLogged) {
      openModal("login-reason", {
        reason: "comment",
      });
      return;
    }

    if (type === "review") {
      if (displayCount > 0 && !showReplies) {
        setShowReplies(true);
        if (!hasFetchedComments && replies.length === 0) {
          await fetchComments();
        }
        return;
      }
      setShowReplies(true);
      if (setActiveReplyId) {
        setActiveReplyId(isReplying ? null : review._id);
      } else {
        setLocalIsReplying(!localIsReplying);
      }
    } else {
      setShowReplies(true);
      if (setActiveReplyId) {
        setActiveReplyId(isReplying ? null : review._id);
      } else {
        setLocalIsReplying(!localIsReplying);
      }
    }

    if (onReply && type !== "review") {
      onReply();
    }
  };

  const handleCommentAdded = () => {
    if (type === "review") {
      setCommentsCount((prev) => prev + 1);
    } else if (onCommentAdded) {
      onCommentAdded();
    }
  };

  const handleSubmitReply = async (content) => {
    if (!userLogged) {
      openModal("login-reason", {
        reason: "comment",
      });
      return;
    }
    try {
      await postComment({
        logId: review.logId || review._id,
        content,
        parentId: type === "comment" ? review._id : null,
      });

      if (setActiveReplyId) {
        setActiveReplyId(null);
      } else {
        setLocalIsReplying(false);
      }

      handleCommentAdded();

      if (type === "review") {
        const comments = await getComments(review._id);
        setFetchedComments(comments || []);
        setHasFetchedComments(true);
        setShowReplies(true);
      } else if (onRefresh) {
        onRefresh();
        setShowReplies(true);
      }
    } catch (error) {
      console.error("Failed to post reply:", error);
      showToast("Failed to post reply", "error");
    }
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleDeleteClick = async () => {
    const itemType = type === "review" ? "review" : "comment";
    const isConfirmed = await showToast(
      `Are you sure you want to delete this ${itemType}?`,
      "warning",
      { confirm: true, confirmText: "Delete" }
    );
    if (isConfirmed) {
      try {
        if (type === "review") {
          const result = await _deleteLog(review._id);
          if (result.success) {
            window.dispatchEvent(new CustomEvent("reviewUpdated"));
            showToast("Review deleted successfully", "success");
          }
        } else {
          await deleteComment(review._id);
          showToast("Comment deleted successfully", "success");
          if (onRefresh) onRefresh();
          if (type === "comment" && !onRefresh) {
          }
        }
      } catch (error) {
        console.error(`Failed to delete ${itemType}:`, error);
        showToast(`Failed to delete ${itemType}`, "error");
      }
    }
  };

  const handleSubmitEdit = async (content) => {
    try {
      await editComment(review._id, content);
      setIsEditing(false);
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error("Failed to edit comment:", error);
      showToast("Failed to edit comment", "error");
    }
  };

  const toggleExpand = (e) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };



  const displayCount = replies.length > 0 ? replies.length : commentsCount;

  const toggleMenu = (e) => {
    e.stopPropagation();
    if (menuOpen) {
      setMenuOpen(false);
      setMenuPosition(null);
    } else {
      const rect = e.currentTarget.getBoundingClientRect();
      setMenuPosition({ top: rect.bottom, right: window.innerWidth - rect.right });
      setMenuOpen(true);
    }
  };

  if (loading) {
    return <ReviewItemSkeleton />;
  }

  const rawContent = review.isDeleted
    ? "Comment deleted"
    : review.review || review.content || "";
  const { text: content, gifUrl } = parseReviewContent(rawContent);
  const MAX_LENGTH = 200;
  const shouldTruncate = content && content.length > MAX_LENGTH;
  const displayReview =
    shouldTruncate && !isExpanded
      ? `${content.slice(0, MAX_LENGTH)}...`
      : content;

  const isOwner =
    userLogged?.id &&
    review.userId &&
    String(userLogged.id) === String(review.userId);

  const menuItems = isOwner
    ? [
            ...(type === "review"
          ? [
              {
                label: "View review",
                icon: <TextInitial size={18} />,
                onClick: () => navigate(`/${review.username}/log/${review._id}`),
              },
              {
                label: "Share",
                icon: <Send size={18} />,
                onClick: () => {
                  navigator.clipboard.writeText(`${window.location.origin}/${review.username}`);
                  showToast("Link copied to clipboard!", "info");
                },
              },
            ]
          : []),
        ...((type === "comment" || onEdit)
          ? [
              {
                label: "Edit",
                icon: <Pencil size={18} />,
                onClick: type === "comment" ? handleEditClick : () => onEdit(review),
              },
            ]
          : []),
        {
          label: "Delete",
          icon: <Trash2 size={18} />,
          onClick: handleDeleteClick,
          danger: true,
        },
      ]
    : [
        ...(type === "review"
          ? [
              {
                label: "View review",
                icon: <TextInitial size={18} />,
                onClick: () => navigate(`/${review.username}/log/${review._id}`),
              },
              {
                label: "Share",
                icon: <Send size={18} />,
                onClick: () => {
                  navigator.clipboard.writeText(`${window.location.origin}/${review.username}`);
                  showToast("Link copied to clipboard!", "info");
                },
              },
            ]
          : []),
        {
          label: "Report",
          icon: <Flag size={18} />,
          onClick: async () => {
            const confirmed = await showToast(
              "Are you sure you want to report this review?",
              "warning",
              { confirm: true }
            );
            if (confirmed)
              showToast(
                "Review reported. Thank you for helping keep Trackr safe.",
                "success"
              );
          },
          danger: true,
        },
      ];

  return (
    <div
      className={`${styles.reviewItemWrapper} ${isLast ? styles.noBorder : ""}`}
    >
      <div
        className={`${styles.reviewItem} ${type === "comment" ? styles.commentItem : ""
          }`}
      >
        <div className={styles.avatarColumn}>
          <Image
            src={review?.userImage || (review?.userData || review?.user)?.userimage || (review?.userData || review?.user)?.image}
            name={(review?.userData || review?.user)?.username || review?.username}
            userId={review?.userId || (review?.userData || review?.user)?._id || (review?.userData || review?.user)?.id}
            status={(review?.userData || review?.user)?.status}
            to={(review?.userData || review?.user)?.username ? `/${(review?.userData || review?.user).username}` : (review?.username ? `/${review.username}` : undefined)}
            size={avatarSize}
          />
        </div>
        <div className={styles.contentColumn}>
          <div className={styles.header}>
            <div className={styles.userInfo}>
              <div className={styles.nameRow}>
                <Tooltip
                  text={
                    <span style={{ color: "var(--text-secondary-color)" }}>
                      @{review.username}
                    </span>
                  }
                  position="top"
                >
                  <Link
                    to={`/${review.username}`}
                    className={styles.displayName}
                    style={{ fontSize: usernameFontSize }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {review.name || review.username}
                  </Link>
                </Tooltip>
                <div className={styles.statusWrapper}>
                  {type === "review" && review.rating > 0 && (
                    <RatingTag rating={review.rating} size={tagSize} to={`/${review.username}/log/${review._id}`} />
                  )}
                  {type === "review" && review.liked && <LikeTag size={tagSize} to={`/${review.username}/log/${review._id}`} />}
                  {type === "review" && (
                    <Link
                      to={`/${review.username}/log/${review._id}`}
                      className={styles.reviewedLink}
                      style={{ fontSize: timestampFontSize }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      • {getRelativeTimeCompact(review.createdAt)}
                    </Link>
                  )}
              </div>
            </div>
            </div>
            {!review.isDeleted && (
              <div
                className={styles.menuContainer}
                style={{ marginLeft: "auto" }}
              >
                <button
                  className={styles.menuMoreButton}
                  onClick={toggleMenu}
                  aria-label="More options"
                >
                  <Ellipsis size={16} />
                </button>
                {menuOpen && (
                  <ActionMenu
                    items={menuItems}
                    onClose={() => { setMenuOpen(false); setMenuPosition(null); }}
                    position={menuPosition}
                    anchor="top-right"
                  />
                )}
              </div>
            )}
          </div>
          <div className={styles.reviewText} style={{ fontSize: reviewFontSize }}>
            {isEditing ? (
              <div onClick={(e) => e.stopPropagation()}>
                <CommentInput
                  onSubmit={handleSubmitEdit}
                  onCancel={() => setIsEditing(false)}
                  placeholder="Edit your comment..."
                  initialValue={content}
                  autoFocus
                  submitLabel="Save"
                />
              </div>
            ) : (
              <>
                <p
                  style={
                    review.isDeleted
                      ? {
                        fontStyle: "italic",
                        color: "var(--text-secondary-color)",
                      }
                      : {}
                  }
                >
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
                {gifUrl && !review.isDeleted && (
                  <img
                    src={gifUrl}
                    alt="Review GIF"
                    className={styles.reviewGif}
                    onError={(e) => { e.target.style.display = "none"; }}
                  />
                )}
              </>
            )}
          </div>

          <div className={styles.footer}>
            <InteractionBar
              liked={liked}
              likesCount={likesCount}
              onLike={handleLike}
              commentCount={commentsCount}
              showComment={false}
              onComment={handleReplyClick}
              showReply={true}
              onReply={handleReplyClick}
              replyText={
                type === "review"
                  ? (displayCount > 0 && !showReplies
                    ? `${displayCount} ${displayCount === 1 ? "reply" : "replies"}`
                    : "Reply")
                  : (displayCount > 0 && !showReplies
                    ? `${displayCount} ${displayCount === 1 ? "reply" : "replies"}`
                    : "Reply")
              }
              replyExpanded={showReplies}
              showShare={false}
              size={interactionIconSize}
            />
          </div>

          {showReplies && (
            <>
              {isReplying && (
                <div onClick={(e) => e.stopPropagation()}>
                  <CommentInput
                    onSubmit={handleSubmitReply}
                    onCancel={() => {
                      if (setActiveReplyId) {
                        setActiveReplyId(null);
                      } else {
                        setLocalIsReplying(false);
                      }
                    }}
                    placeholder={type === "review" ? "Write a comment..." : `Reply to @${review.username}...`}
                    autoFocus
                  />
                </div>
              )}
              {isLoadingComments && (
                <div className={styles.repliesList}>
                  {Array.from({ length: 3 }).map((_, i) => (
                    <ReviewItemSkeleton key={i} />
                  ))}
                </div>
              )}
              {!isLoadingComments && commentsToDisplay.length > 0 && (
                <div className={styles.repliesList}>
                  {commentsToDisplay.map((reply) => (
                    <ReviewItem
                      key={reply._id}
                      review={reply}
                      type="comment"
                      isLast={false}
                      onRefresh={type === "review" ? async () => {
                        const comments = await getComments(review._id);
                        setFetchedComments(comments || []);
                        setHasFetchedComments(true);
                      } : onRefresh}
                      onCommentAdded={handleCommentAdded}
                      replies={reply.replies}
                      activeReplyId={activeReplyId}
                      setActiveReplyId={setActiveReplyId}
                      size={size}
                    />
                  ))}
                </div>
              )}
              {commentsToDisplay.length > 0 && (
                <button
                  className={styles.hideRepliesButton}
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowReplies(false);
                    if (setActiveReplyId) setActiveReplyId(null);
                    else setLocalIsReplying(false);
                  }}
                >
                  <FaChevronUp size={10} />
                  Hide replies
                </button>
              )}
            </>
          )}
        </div>
      </div>

    </div>
  );
};
export { CommentInput };
export default ReviewItem;
