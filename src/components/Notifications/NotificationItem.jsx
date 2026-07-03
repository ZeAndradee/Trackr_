import React, { useState, useEffect, useContext } from "react";
import style from "./NotificationCenter.module.css";
import Image from "../Utils/Images/Image/Image";
import { formatDistanceToNow } from "date-fns";
import { RiHeart3Fill } from "react-icons/ri";
import { FiMail } from "react-icons/fi";
import { UserLoggedContext } from "../../contexts/UserLoggedContext";
import { followUser, unfollowUser } from "../../services/FetchUser";
import { Button } from "../Utils/Buttons/Button";
import { useAuthModal } from "../../contexts/AuthModalContext";

const NotificationItem = ({ notification, onClick }) => {
  const { sender, type, createdAt, read, referenceType, referenceId } =
    notification;
  const { userLogged } = useContext(UserLoggedContext);
  const { openModal } = useAuthModal();

  const [isFollowing, setIsFollowing] = useState(sender?.isFollowing || false);
  const [followLoading, setFollowLoading] = useState(false);
  const [followButtonHover, setFollowButtonHover] = useState(false);

  useEffect(() => {
    setIsFollowing(sender?.isFollowing || false);
  }, [sender?.isFollowing]);

  const logData = referenceId?.logId || referenceId;
  const trackName = logData?.name;
  const coverUrl = logData?.coverUrl;
  const isReply = referenceId?.parentId;
  const username = sender?.name || sender?.username;

  const handleFollowClick = async (e) => {
    e.stopPropagation();
    if (followLoading) return;
    if (!userLogged) {
      openModal("login-reason", {
        reason: "follow",
        title: `Follow ${username} to see what this person shares.`,
      });
      return;
    }

    setFollowLoading(true);
    const previousFollowState = isFollowing;

    try {
      if (isFollowing) {
        setIsFollowing(false);
        await unfollowUser(sender._id);
      } else {
        setIsFollowing(true);
        await followUser(sender._id);
      }
    } catch (error) {
      console.error("Error following/unfollowing user:", error);
      setIsFollowing(previousFollowState);
    } finally {
      setFollowLoading(false);
    }
  };

  const getMessage = () => {
    switch (type) {
      case "LIKE":
        if (referenceType === "Comments") {
          return (
            <>
              <span className={style.highlight}>{username}</span> liked your
              comment on <span className={style.highlight}>{trackName}</span>.
            </>
          );
        }
        if (referenceType === "Logs") {
          return (
            <>
              <span className={style.highlight}>{username}</span> liked your
              review of <span className={style.highlight}>{trackName}</span>.
            </>
          );
        }
        return (
          <>
            <span className={style.highlight}>{username}</span> liked your{" "}
            {referenceType?.toLowerCase() || "post"}.
          </>
        );

      case "COMMENT":
        if (referenceType === "Comments") {
          return (
            <>
              <span className={style.highlight}>{username}</span>{" "}
              {isReply ? "replied to your comment on" : "commented on"}{" "}
              <span className={style.highlight}>{trackName}</span>.
            </>
          );
        }
        return (
          <>
            <span className={style.highlight}>{username}</span> commented on
            your {referenceType?.toLowerCase() || "post"}.
          </>
        );

      case "FOLLOW":
        return (
          <>
            <span className={style.highlight}>{username}</span> started
            following you.
          </>
        );

      case "VERIFIED":
        return (
          <>
            <span className={style.highlight}>Action Required</span>
            <div>Please verify your email address.</div>
          </>
        );

      default:
        return (
          <>
            <span className={style.highlight}>{username}</span> interacted with
            you.
          </>
        );
    }
  };

  const renderFollowButton = () => {
    if (type !== "FOLLOW" || !userLogged || userLogged._id === sender?._id)
      return null;

    return (
      <div className={style.followButtonContainer}>
        {isFollowing ? (
          <Button
            variant="secondary"
            className={`${style.followButton} ${style.following}`}
            onClick={handleFollowClick}
            disabled={followLoading}
            onMouseEnter={() => setFollowButtonHover(true)}
            onMouseLeave={() => setFollowButtonHover(false)}
          >
            {followButtonHover ? "Unfollow" : "Following"}
          </Button>
        ) : (
          <Button
            variant="primary"
            className={style.followButton}
            onClick={handleFollowClick}
            disabled={followLoading}
          >
            Follow
          </Button>
        )}
      </div>
    );
  };

  return (
    <div
      className={`${style.item} ${!read ? style.unread : style.read}`}
      onClick={() => onClick(notification)}
    >
      <div className={style.avatarContainer}>
        {type === "Verified" || type === "VERIFIED" ? (
          <div className={style.verifiedBadgeContainer}>
            <div className={style.verifiedBadge}>
              <FiMail size={20} color="#1976d2" />
            </div>
          </div>
        ) : (
          <>
            <Image
              src={sender?.userimage || sender?.image || sender?.userImage}
              name={sender?.username}
              userId={sender?._id || sender?.id}
              status={sender?.status}
              to={sender?.username ? `/${sender.username}` : undefined}
              size={50}
            />
            {type === "LIKE" && (
              <div className={style.likeBadge}>
                <RiHeart3Fill size={10} fill="white" />
              </div>
            )}
          </>
        )}
      </div>
      <div className={style.content}>
        <div className={style.message}>{getMessage()}</div>
        <span className={style.time}>
          {createdAt
            ? formatDistanceToNow(new Date(createdAt), { addSuffix: true })
            : ""}
        </span>
      </div>

      {type === "FOLLOW" && renderFollowButton()}

      {coverUrl && (
        <img src={coverUrl} alt="Album" className={style.albumCover} />
      )}
    </div>
  );
};

export default NotificationItem;
