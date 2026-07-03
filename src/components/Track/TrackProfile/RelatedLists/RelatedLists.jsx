import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { fetchTrackLists } from "../../../../services/FetchTrack";
import ListCard from "../../../List/ListCard/ListCard";
import { FiEye, FiFlag } from "react-icons/fi";
import { PiPaperPlaneTiltBold } from "react-icons/pi";
import showToast from "../../../Utils/Toast/Toast";
import styles from "./RelatedLists.module.css";

const RelatedLists = ({ trackId, lists: listsProp, title = "Appears in lists", viewAllLink, coverSize }) => {
  const navigate = useNavigate();
  const [fetchedLists, setFetchedLists] = useState([]);
  const [isLoading, setIsLoading] = useState(!listsProp);

  const handleCopyLink = (list) => {
    const ownerUsername = list.owner?.username || "user";
    const url = `${window.location.origin}/${ownerUsername}/list/${list.slug}`;
    navigator.clipboard.writeText(url);
    showToast("Link copied to clipboard", "success");
  };

  useEffect(() => {
    if (listsProp) return;
    const loadLists = async () => {
      if (!trackId) return;
      setIsLoading(true);
      try {
        const data = await fetchTrackLists(trackId);
        setFetchedLists(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching track lists:", err);
        setFetchedLists([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadLists();
  }, [trackId, listsProp]);

  const lists = listsProp || fetchedLists;

  if (isLoading) return null;
  if (!lists || lists.length === 0) return null;

  const getMenuItems = (list) => {
    const ownerUsername = list.owner?.username || "user";
    return [
      {
        label: "View List",
        icon: <FiEye size={18} />,
        onClick: () => navigate(`/${ownerUsername}/list/${list.slug}`),
      },
      {
        label: "Share",
        icon: <PiPaperPlaneTiltBold size={18} />,
        onClick: () => handleCopyLink(list),
      },
      {
        label: "Report List",
        icon: <FiFlag size={18} />,
        onClick: () => showToast("List reported. Thank you for helping keep Trackr safe.", "success"),
      },
    ];
  };

  return (
    <div className={styles.listsSection}>
      <div className={styles.listsHeader}>
        <h3 className={styles.listsTitle}>{title}</h3>
        {viewAllLink && (
          <Link to={viewAllLink} className={styles.viewAll}>View all</Link>
        )}
      </div>
      <div className={styles.listsContainer}>
        {lists.map((list) => (
          <ListCard
            key={list._id}
            list={list}
            variant="user"
            showDescription
            coverSize={coverSize}
            menuItems={getMenuItems(list)}
          />
        ))}
      </div>
    </div>
  );
};

export default RelatedLists;
