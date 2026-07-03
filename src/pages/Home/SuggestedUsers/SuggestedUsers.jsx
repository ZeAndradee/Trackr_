import { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import Image from "../../../components/Utils/Images/Image/Image";
import { Button } from "../../../components/Utils/Buttons/Button";
import { fetchSuggestedUsers, followUser, unfollowUser } from "../../../services/FetchUser";
import { createTrackSlug, createAlbumSlug } from "../../../utils/formatters/textFormatters";
import { UserLoggedContext } from "../../../contexts/UserLoggedContext";
import styles from "./SuggestedUsers.module.css";

const SuggestedUsers = () => {
  const { userLogged } = useContext(UserLoggedContext);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [followingIds, setFollowingIds] = useState(new Set());

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const data = await fetchSuggestedUsers();
        if (data && data.length > 0) {
          const filtered = data
            .filter((u) => u.username !== userLogged?.username && !u.isFollowing)
            .slice(0, 4);
          setUsers(filtered);
        }
      } catch {
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const handleFollow = async (userId) => {
    const isFollowing = followingIds.has(userId);
    setFollowingIds((prev) => {
      const next = new Set(prev);
      if (isFollowing) {
        next.delete(userId);
      } else {
        next.add(userId);
      }
      return next;
    });

    try {
      if (isFollowing) {
        await unfollowUser(userId);
      } else {
        await followUser(userId);
      }
    } catch {
      setFollowingIds((prev) => {
        const next = new Set(prev);
        if (isFollowing) {
          next.add(userId);
        } else {
          next.delete(userId);
        }
        return next;
      });
    }
  };

  const getCoverLink = (log) => {
    if (log.type === "album" && log.albumId) {
      return createAlbumSlug(
        log.name,
        log.artists,
        log.albumId
      );
    }
    return createTrackSlug(
      log.name,
      log.artists,
      log.trackId
    );
  };

  if (isLoading) {
    return (
      <div className={styles.section}>
        <h3 className={styles.title}>Suggested for you</h3>
        <div className={styles.scrollRow}>
          {[1, 2, 3].map((n) => (
            <div key={n} className={styles.skeletonCard}>
              <div className={styles.skeletonCovers} />
              <div className={styles.skeletonBottom}>
                <div className={styles.skeletonAvatar} />
                <div className={styles.skeletonText}>
                  <div className={styles.skeletonName} />
                  <div className={styles.skeletonGenres} />
                </div>
                <div className={styles.skeletonBtn} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!users || users.length === 0) return null;

  return (
    <div className={styles.section}>
      <h3 className={styles.title}>Suggested for you</h3>
      <div className={styles.scrollRow}>
        {users.map((user) => {
          const isFollowing = followingIds.has(user._id);
          return (
            <div key={user._id} className={styles.userCard}>
              <div className={styles.coversGrid}>
                {(user.recentLogs || []).slice(0, 4).map((log, i) => (
                  <Link key={i} to={getCoverLink(log)} className={styles.coverLink}>
                    <Image
                      src={log.coverUrl}
                      alt={log.title || log.name}
                      fallbackVariant="cover"
                      width="100%"
                      height="100%"
                      tooltip={log.title || log.name}
                      borderLength="2px"
                      className={styles.coverItem}
                    />
                  </Link>
                ))}
              </div>
              <div className={styles.userBottom}>
                <Image
                  src={user?.userimage || user?.image || user?.userImage}
                  name={user?.username}
                  userId={user?._id || user?.id}
                  status={user?.status}
                  to={`/${user.username}`}
                  size={32}
                />
                <div className={styles.userDetails}>
                  <Link to={`/${user.username}`} className={styles.userName}>
                    {user.username}
                  </Link>
                  <span className={styles.userGenres}>
                    {user.bio || ""}
                  </span>
                </div>
                <Button
                  variant={isFollowing ? "secondary" : "outline"}
                  size="sm"
                  onClick={() => handleFollow(user._id)}
                  customPadding="0.3rem 0.7rem"
                  customFontSize="0.75rem"
                  style={{ borderRadius: "0.5rem", fontWeight: 400 }}
                >
                  {isFollowing ? "Following" : "Follow"}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SuggestedUsers;
