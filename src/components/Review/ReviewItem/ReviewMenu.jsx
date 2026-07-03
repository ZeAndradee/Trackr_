import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { TextInitial } from "lucide-react";
import {
  RiMoreFill,
  RiShareForwardLine,
  RiDeleteBinLine,
  RiFlagLine,
  RiEditLine,
  RiEyeLine,
} from "react-icons/ri";
import { _deleteLog } from "../../../services/HandleLogs";
import useClickOutside from "../../../hooks/useClickOutside";
import styles from "./ReviewMenu.module.css";
import showToast from "../../Utils/Toast/Toast";

const ReviewMenu = ({ review, userLogged, isOwner, onEdit, onDelete }) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  useClickOutside(menuRef, () => setShowMenu(false));

  const handleMenuClick = (e) => {
    e.stopPropagation();
    setShowMenu(!showMenu);
  };

  const handleDelete = async () => {
    if (onDelete) {
      onDelete();
      setShowMenu(false);
      return;
    }

    const isConfirmed = await showToast("Are you sure you want to delete this review?", "warning", { confirm: true });
    if (isConfirmed) {
      try {
        const result = await _deleteLog(review._id);
        if (result.success) {
          window.dispatchEvent(new CustomEvent("reviewUpdated"));
        }
      } catch (error) {
        console.error("Failed to delete review:", error);
        showToast("Failed to delete review.", "error");
      }
    }
    setShowMenu(false);
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit();
    }
    setShowMenu(false);
  };

  const handleReport = async () => {
    const isConfirmed = await showToast("Are you sure you want to report this review?", "warning", { confirm: true });
    if (isConfirmed) {
      showToast("Review reported. Thank you for helping keep Trackr safe.", "success");
    }
    setShowMenu(false);
  };

  const handleViewReview = () => {
    navigate(`/${review.username}/log/${review._id}`);
    setShowMenu(false);
  };

  const handleShare = () => {
    const url = `${window.location.origin}/${review.username}`;
    navigator.clipboard.writeText(url);
    showToast("Link copied to clipboard!", "info");
    setShowMenu(false);
  };



  return (
    <div className={styles.menuWrapper} ref={menuRef}>
      <button className={styles.menuButton} onClick={handleMenuClick}>
        <RiMoreFill />
      </button>
      {showMenu && (
        <div className={styles.menuDropdown}>
          {isOwner ? (
            <>
              <button className={styles.menuItem} onClick={handleViewReview}>
                <TextInitial size={18} />
                <span>View review</span>
              </button>
              <button className={styles.menuItem} onClick={handleShare}>
                <RiShareForwardLine />
                <span>Share</span>
              </button>
              {onEdit && (
                <button className={styles.menuItem} onClick={handleEdit}>
                  <RiEditLine />
                  <span>Edit</span>
                </button>
              )}
              <button
                className={`${styles.menuItem} ${styles.dangerItem}`}
                onClick={handleDelete}
              >
                <RiDeleteBinLine />
                <span>Delete</span>
              </button>
            </>
          ) : (
            <>
              <button className={styles.menuItem} onClick={handleViewReview}>
                <TextInitial size={18} />
                <span>View review</span>
              </button>
              <button className={styles.menuItem} onClick={handleShare}>
                <RiShareForwardLine />
                <span>Share</span>
              </button>


              <button
                className={`${styles.menuItem} ${styles.dangerItem}`}
                onClick={handleReport}
              >
                <RiFlagLine />
                <span>Report</span>
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ReviewMenu;
