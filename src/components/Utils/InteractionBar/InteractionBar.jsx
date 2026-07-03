import {
  RiHeart3Fill,
  RiHeart3Line,
  RiChat1Line,
  RiShareForwardLine,
} from "react-icons/ri";
import { FaChevronDown } from "react-icons/fa";
import styles from "./InteractionBar.module.css";

const InteractionBar = ({
  liked,
  likesCount,
  onLike,
  commentCount,
  onComment,
  showComment = true,
  showReply = false,
  onReply,
  replyText,
  replyExpanded = false,
  showShare = true,
  onShare,
  size = 20,
  className = "",
}) => {
  const proportionalFontSize = `${(size / 20) * 0.9}rem`;
  const actionStyle = { fontSize: proportionalFontSize };

  return (
    <div className={`${styles.interactions} ${className}`}>
      <div className={styles.actions}>
        <button
          className={`${styles.actionButton} ${liked ? styles.liked : ""}`}
          onClick={onLike}
          style={actionStyle}
        >
          {liked ? <RiHeart3Fill size={size} /> : <RiHeart3Line size={size} />}
          <span key={likesCount} className={styles.count}>
            {likesCount}
          </span>
        </button>

        {showComment && (
          <div className={styles.actionButton} onClick={onComment} style={actionStyle}>
            <RiChat1Line size={size} />
            <span key={commentCount} className={styles.count}>
              {commentCount}
            </span>
          </div>
        )}

        {showReply && (
          <button className={styles.actionButton} onClick={onReply} style={actionStyle}>
            <span>{replyText || "Reply"}</span>
            {!replyExpanded && replyText && replyText !== "Reply" && (
              <FaChevronDown size={size * 0.5} className={styles.chevron} />
            )}
          </button>
        )}
      </div>

      {showShare && (
        <button className={styles.shareButton} onClick={onShare} style={actionStyle}>
          <RiShareForwardLine size={size} />
          <span>Share</span>
        </button>
      )}
    </div>
  );
};

export default InteractionBar;
