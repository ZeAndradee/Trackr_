import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import YourWeek from "../YourWeek/YourWeek";
import Image from "../../../components/Utils/Images/Image/Image";
import { getTrackCover } from "../../../components/Utils/Formater/Track";
import { RiHeart3Line, RiHeart3Fill } from "react-icons/ri";
import { IoChatbubbleOutline } from "react-icons/io5";
import { useAuthModal } from "../../../contexts/AuthModalContext";
import { fetchPopularLists, likeList } from "../../../services/FetchList";
import styles from "./PopularLists.module.css";

const PopularLists = ({ userLogged }) => {
  const { openModal } = useAuthModal();
  const [lists, setLists] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [likedMap, setLikedMap] = useState({});
  const [likeCountMap, setLikeCountMap] = useState({});

  useEffect(() => {
    const loadLists = async () => {
      setIsLoading(true);
      try {
        const data = await fetchPopularLists();
        const publicLists = Array.isArray(data) ? data : [];
        setLists(publicLists);

        const liked = {};
        const counts = {};
        publicLists.forEach((l) => {
          liked[l._id] = l.userInteractions?.liked || false;
          counts[l._id] = l.likeCount || 0;
        });
        setLikedMap(liked);
        setLikeCountMap(counts);
      } catch (err) {
        console.error("Error fetching lists:", err);
        setLists([]);
      } finally {
        setIsLoading(false);
      }
    };
    loadLists();
  }, []);

  const handleLike = async (listId) => {
    if (!userLogged) {
      openModal("login-reason", {
        title: "Like a list to save it.",
        message: "Join Trackr to let the author know you enjoyed their list.",
      });
      return;
    }

    const prevLiked = likedMap[listId];
    const prevCount = likeCountMap[listId];
    const newLiked = !prevLiked;

    setLikedMap((prev) => ({ ...prev, [listId]: newLiked }));
    setLikeCountMap((prev) => ({
      ...prev,
      [listId]: newLiked ? prevCount + 1 : prevCount - 1,
    }));

    try {
      await likeList(listId);
    } catch (error) {
      setLikedMap((prev) => ({ ...prev, [listId]: prevLiked }));
      setLikeCountMap((prev) => ({ ...prev, [listId]: prevCount }));
      console.error("Failed to update like status", error);
    }
  };

  const getListCovers = (list) => {
    if (list.covers && list.covers.length > 0) {
      return list.covers.slice(0, 4).map((url) => ({ coverUrl: url }));
    }
    return [];
  };

  if (isLoading) {
    return (
      <div className={styles.listsSection}>
        <h3 className={styles.listsTitle}>Popular Lists</h3>
        <div className={styles.listsContainer}>
          {[1, 2, 3].map((n) => (
            <div key={n} className={styles.skeletonItem}>
              <div className={styles.skeletonCovers} />
              <div className={styles.skeletonContent}>
                <div className={styles.skeletonLine} />
                <div className={styles.skeletonLineShort} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!lists || lists.length === 0) return null;

  return (
    <div className={styles.listsSection}>
      <h3 className={styles.listsTitle}>Popular Lists</h3>
      <div className={styles.listsContainer}>
        {lists.slice(0, 4).map((list) => {
          const covers = getListCovers(list);
          const ownerUsername = list.owner?.username || "user";
          const isLiked = likedMap[list._id];
          const count = likeCountMap[list._id] || 0;

          return (
            <div key={list._id} className={styles.listItem}>
              <div className={styles.listContent}>
                <div className={styles.listHeader}>
                  <Link
                    to={`/${ownerUsername}/list/${list.slug}`}
                    className={styles.listCoversLink}
                  >
                    <div className={styles.coversGrid}>
                      {Array.from({ length: 4 }).map((_, idx) =>
                        covers[idx] ? (
                          <Image key={idx} src={getTrackCover(covers[idx])} alt={covers[idx]?.name} fallbackVariant="cover" width="100%" height="100%" radius="none" />
                        ) : (
                          <div key={idx} className={styles.emptyCoverCell} />
                        )
                      )}
                    </div>
                  </Link>
                  <div className={styles.listHeaderInfo}>
                    <Link
                      to={`/${ownerUsername}/list/${list.slug}`}
                      className={styles.listName}
                    >
                      {list.name}
                    </Link>
                    <span className={styles.trackCount}>
                      {list.trackCount || 0} tracks
                    </span>
                  </div>
                </div>

                {list.description && (
                  <span className={styles.listDescription}>
                    {list.description.length > 150
                      ? list.description.slice(0, 150) + "..."
                      : list.description}
                  </span>
                )}
              </div>

              <div className={styles.listFooter}>
                <Link
                  to={`/${ownerUsername}`}
                  className={styles.userLink}
                >
                  <Image
                    src={(list.owner || list.user)?.userimage || (list.owner || list.user)?.image || (list.owner || list.user)?.userImage}
                    name={ownerUsername}
                    size={20}
                  />
                  <span className={styles.username}>{ownerUsername}</span>
                </Link>

                <div className={styles.interactionGroup}>
                  <button
                    className={`${styles.actionButton} ${isLiked ? styles.liked : ""}`}
                    onClick={() => handleLike(list._id)}
                  >
                    {isLiked ? <RiHeart3Fill /> : <RiHeart3Line />}
                    <span>{count}</span>
                  </button>
                  <button className={styles.actionButton}>
                    <IoChatbubbleOutline />
                    <span>{list.commentCount || 0}</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PopularLists;
