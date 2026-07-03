import React, { useRef, useContext, useState, useEffect, useCallback } from "react";
import ReactDOM from "react-dom";
import { useIsomorphicLayoutEffect } from "../../../hooks/useIsomorphicLayoutEffect";
import styles from "./ActionMenu.module.css";
import { Pencil, Plus, Eye, Trash2, Flag, Send, CircleUserRound, TextInitial, ListStart, ListEnd, Play } from "lucide-react";
import { RiPlayListAddLine } from "react-icons/ri";

import { Link, useNavigate, useParams } from "react-router-dom";
import useClickOutside from "../../../hooks/useClickOutside";
import { UserLoggedContext } from "../../../contexts/UserLoggedContext";
import { _deleteLog } from "../../../services/HandleLogs";
import { createTrackSlug, createAlbumSlug } from "../../../utils/formatters/textFormatters";
import showToast from "../../../components/Utils/Toast/Toast";
import { usePlayer } from "../../../contexts/PlayerContext";

const getDefaultIcon = (label) => {
  if (!label) return null;
  const lowerLabel = label.toLowerCase();
  if (lowerLabel.includes("view")) return <Eye size={18} />;
  if (lowerLabel.includes("edit")) return <Pencil size={18} />;
  if (lowerLabel.includes("delete")) return <Trash2 size={18} />;
  if (lowerLabel.includes("report")) return <Flag size={18} />;
  if (lowerLabel.includes("share")) return <Send size={18} />;
  return null;
};

const ActionMenu = ({
  items,
  onClose,
  position,
  anchor = "top-right",
  menuType,
  itemId,
  handleTrackClick,
  journalEntries,
  friendsReviews,
  openEditOverlay,
  openNewLogOverlay,
  openListModal,
}) => {
  const menuRef = useRef(null);
  const [adjustedStyle, setAdjustedStyle] = useState({});
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = useCallback(() => setIsClosing(true), []);

  const handleAnimationEnd = (e) => {
    if (e.target !== menuRef.current?.firstChild) return;
    if (isClosing) onClose();
  };

  useClickOutside(menuRef, handleClose);

  useEffect(() => {
    const handleScroll = () => handleClose();
    window.addEventListener("scroll", handleScroll, true);
    window.addEventListener("resize", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", handleScroll);
    };
  }, [handleClose]);

  useIsomorphicLayoutEffect(() => {
    if (menuRef.current && position) {
      const rect = menuRef.current.getBoundingClientRect();
      const style = {};
      const padding = 8;

      if (position.top !== undefined) {
        if (position.top + rect.height > window.innerHeight - padding) {
          style.bottom = `${padding}px`;
        } else {
          style.top = `${Math.max(padding, position.top)}px`;
        }
      } else if (position.bottom !== undefined) {
        if (position.bottom + rect.height > window.innerHeight - padding) {
          style.top = `${padding}px`;
        } else {
          style.bottom = `${Math.max(padding, position.bottom)}px`;
        }
      }

      if (position.left !== undefined) {
        if (position.left + rect.width > window.innerWidth - padding) {
          style.right = `${padding}px`;
        } else {
          style.left = `${Math.max(padding, position.left)}px`;
        }
      }

      if (position.right !== undefined) {
        if (position.right + rect.width > window.innerWidth - padding) {
          style.left = `${padding}px`;
        } else {
          style.right = `${Math.max(padding, position.right)}px`;
        }
      }

      setAdjustedStyle(style);
    }
  }, [position]);

  const getPositionStyle = () => {
    if (Object.keys(adjustedStyle).length > 0) {
      return adjustedStyle;
    }

    const style = {};
    if (position) {
      if (position.top !== undefined) style.top = `${position.top}px`;
      if (position.left !== undefined) style.left = `${position.left}px`;
      if (position.right !== undefined) style.right = `${position.right}px`;
      if (position.bottom !== undefined) style.bottom = `${position.bottom}px`;
    }
    return style;
  };

  const menu = (
    <div
      className={`${styles.menuContainer} ${styles[anchor]}`}
      ref={menuRef}
      style={getPositionStyle()}
      onAnimationEnd={handleAnimationEnd}
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      <div className={`${styles.menu} ${isClosing ? styles.closing : ""}`}>
        {menuType === "reviews" ? (
          <JournalActionMenu
            itemId={itemId}
            onClose={handleClose}
            handleTrackClick={handleTrackClick}
            journalEntries={journalEntries}
            openEditOverlay={openEditOverlay}
            openNewLogOverlay={openNewLogOverlay}
            openListModal={openListModal}
          />
        ) : menuType === "friends-reviews" ? (
          <FriendsReviewsActionMenu
            itemId={itemId}
            onClose={handleClose}
            handleTrackClick={handleTrackClick}
            friendsReviews={friendsReviews}
            openNewLogOverlay={openNewLogOverlay}
            openEditOverlay={openEditOverlay}
            openListModal={openListModal}
          />
        ) : (
          items && (() => {
            const dangerItems = items.filter(i => i.section === 'danger' || (!i.section && (i.danger || (i.label && (i.label.toLowerCase().includes("delete") || i.label.toLowerCase().includes("report"))))));
            const userItems = items.filter(i => {
              if (i.section === 'user') return true;
              if (i.section) return false;
              const l = i.label?.toLowerCase() || "";
              return (l.includes("profile") || (l.includes("log") && !l.includes("edit")));
            });
            const queueItems = items.filter(i => i.section === 'queue');
            const trackItems = items.filter(i => !dangerItems.includes(i) && !userItems.includes(i) && !queueItems.includes(i));

            trackItems.sort((a, b) => {
              const order = (item) => {
                if (item.order !== undefined) return item.order;
                const l = item.label?.toLowerCase() || "";
                if (l.includes("view")) return 0;
                if (l.includes("review") || l.includes("edit log")) return 1;
                if (l.includes("save") || l.includes("add to list")) return 2;
                if (l.includes("share")) return 99;
                return 50;
              };
              return order(a) - order(b);
            });

            const renderItemsSection = (sectionItems) => {
              return sectionItems.map((item, index) => {
                const iconToUse = item.icon || getDefaultIcon(item.label);
                const isDanger = item.danger || (item.label && (item.label.toLowerCase().includes("delete") || item.label.toLowerCase().includes("report")));
                return (
                  <button
                    key={index}
                    className={`${styles.menuItem} ${isDanger ? styles.dangerItem : ""}`}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      item.onClick(e);
                      handleClose();
                    }}
                  >
                    {iconToUse && (
                      <span className={styles.itemIcon}>{iconToUse}</span>
                    )}
                    <span className={styles.itemLabel}>{item.label}</span>
                  </button>
                );
              });
            };

            return (
              <>
                {userItems.length > 0 && renderItemsSection(userItems)}
                {userItems.length > 0 && (trackItems.length > 0 || queueItems.length > 0 || dangerItems.length > 0) && <div className={styles.divider} />}

                {trackItems.length > 0 && renderItemsSection(trackItems)}
                {trackItems.length > 0 && (queueItems.length > 0 || dangerItems.length > 0) && <div className={styles.divider} />}

                {queueItems.length > 0 && renderItemsSection(queueItems)}
                {queueItems.length > 0 && dangerItems.length > 0 && <div className={styles.divider} />}

                {dangerItems.length > 0 && renderItemsSection(dangerItems)}
              </>
            );
          })()
        )}
      </div>
    </div>
  );

  return ReactDOM.createPortal(menu, document.body);
};

const JournalActionMenu = ({
  itemId,
  onClose,
  handleTrackClick,
  journalEntries,
  openEditOverlay,
  openNewLogOverlay,
  openListModal,
}) => {
  const navigate = useNavigate();
  const { userLogged } = useContext(UserLoggedContext);
  const { username } = useParams();
  const { isPlayerVisible, currentTrack, isPlaying, playTrackInQueue, addToQueue, addNextToQueue } = usePlayer();

  const isUserReviews = !username || username === userLogged?.username;

  const handleMenuItemClick = (e, onClick) => {
    e.stopPropagation();
    onClick();
    onClose();
  };

  const handleEditClick = (e) => {
    e.stopPropagation();
    e.preventDefault();

    const entry = journalEntries.find((entry) => (entry._id || entry.id) === itemId);
    if (entry) {
      openEditOverlay(entry);
      onClose();
    } else {
      console.error("Entry not found:", itemId);
    }
  };

  const handleLogNewTrack = (e) => {
    e.stopPropagation();
    e.preventDefault();

    const entry = journalEntries.find((entry) => (entry._id || entry.id) === itemId);
    if (entry) {
      openNewLogOverlay(entry);
      onClose();
    } else {
      console.error("Entry not found:", itemId);
    }
  };

  const handleDeleteLog = async (e) => {
    e.stopPropagation();
    e.preventDefault();

    const isConfirmed = await showToast("Are you sure you want to delete this review?", "warning", { confirm: true });
    if (isConfirmed) {
      try {
        const result = await _deleteLog(itemId);
        if (result.success) {
          window.dispatchEvent(new CustomEvent("reviewUpdated"));
        }
      } catch (error) {
        console.error("Failed to delete log:", error);
        showToast("Failed to delete review. Please try again.", "error");
      }
      onClose();
    }
  };

  const log = journalEntries.find((entry) => (entry._id || entry.id) === itemId);
  const logTitle = log?.name || log?.trackTitle;
  const logArtists = log?.artists || log?.artist;
  const logCover = log?.coverUrl || log?.albumCover;
  const isCurrentTrack = currentTrack?.trackId === log?.trackId && isPlaying;

  return (
    <>
      {log && (() => {
        const trackUrl = createTrackSlug(logTitle, logArtists, log.trackId);
        return (
          <Link
            className={styles.menuItem}
            to={trackUrl}
            state={{ trackId: log.trackId }}
            onClick={onClose}
          >
            <span className={styles.itemIcon}><Eye size={18} /></span>
            <span className={styles.itemLabel}>View track</span>
          </Link>
        );
      })()}

      <button className={styles.menuItem} onClick={handleLogNewTrack}>
        <span className={styles.itemIcon}><Plus size={18} /></span>
        <span className={styles.itemLabel}>Review this track</span>
      </button>

      {isUserReviews && (
        <button className={styles.menuItem} onClick={handleEditClick}>
          <span className={styles.itemIcon}><Pencil size={18} /></span>
          <span className={styles.itemLabel}>Edit review</span>
        </button>
      )}

      {log && (
        <button
          className={styles.menuItem}
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            if (openListModal) openListModal(log.trackId);
            onClose();
          }}
        >
          <span className={styles.itemIcon}><RiPlayListAddLine size={18} /></span>
          <span className={styles.itemLabel}>Save to List</span>
        </button>
      )}

      {log && (!isCurrentTrack || isPlayerVisible) && <div className={styles.divider} />}

      {log && !isCurrentTrack && (
        <button
          className={styles.menuItem}
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            playTrackInQueue({ id: log.trackId, title: logTitle, artist: logArtists, coverUrl: logCover });
            onClose();
          }}
        >
          <span className={styles.itemIcon}><Play size={18} /></span>
          <span className={styles.itemLabel}>Play track</span>
        </button>
      )}

      {log && isPlayerVisible && (
        <>
          <button
            className={styles.menuItem}
            onClick={() => {
              addNextToQueue({ id: log.trackId, title: logTitle, artist: logArtists, coverUrl: logCover });
              showToast(`Playing next: ${logTitle}`, "success");
              onClose();
            }}
          >
            <span className={styles.itemIcon}><ListStart size={18} /></span>
            <span className={styles.itemLabel}>Play next</span>
          </button>
          <button
            className={styles.menuItem}
            onClick={() => {
              addToQueue({ id: log.trackId, title: logTitle, artist: logArtists, coverUrl: logCover });
              showToast(`Added to queue: ${logTitle}`, "success");
              onClose();
            }}
          >
            <span className={styles.itemIcon}><ListEnd size={18} /></span>
            <span className={styles.itemLabel}>Add to queue</span>
          </button>
        </>
      )}

      <div className={styles.divider} />

      {isUserReviews ? (
        <button
          className={`${styles.menuItem} ${styles.dangerItem}`}
          onClick={handleDeleteLog}
        >
          <span className={styles.itemIcon}><Trash2 size={18} /></span>
          <span className={styles.itemLabel}>Delete review</span>
        </button>
      ) : (
        <button
          className={`${styles.menuItem} ${styles.dangerItem}`}
          onClick={(e) =>
            handleMenuItemClick(e, () => {
              showToast("Review reported. Thank you for helping keep Trackr safe.", "success");
            })
          }
        >
          <span className={styles.itemIcon}><Flag size={18} /></span>
          <span className={styles.itemLabel}>Report review</span>
        </button>
      )}
    </>
  );
};

const FriendsReviewsActionMenu = ({
  itemId,
  onClose,
  handleTrackClick,
  friendsReviews,
  openNewLogOverlay,
  openEditOverlay,
  openListModal,
}) => {
  const navigate = useNavigate();
  const { userLogged } = useContext(UserLoggedContext);
  const { isPlayerVisible, currentTrack, isPlaying, playTrackInQueue, addToQueue, addNextToQueue, playAlbumInQueue, addAlbumToQueue } = usePlayer();

  const review = friendsReviews.find((entry) => entry.id === itemId);
  const isAlbum = review?.type === "album";
  const isCurrentTrack = !isAlbum && currentTrack?.trackId === review?.trackId && isPlaying;
  const reviewUserId = review?.user?._id || review?.user?.id;
  const loggedUserId = userLogged?._id || userLogged?.id;
  const isOwnReview = !!userLogged && !!review?.user && (
    (!!reviewUserId && !!loggedUserId && String(reviewUserId) === String(loggedUserId)) ||
    (!!review.user.username && !!userLogged.username && review.user.username === userLogged.username)
  );

  const handleMenuItemClick = (e, onClick) => {
    e.stopPropagation();
    onClick();
    onClose();
  };

  const handleLogNewTrack = (e) => {
    e.stopPropagation();
    e.preventDefault();

    if (review && openNewLogOverlay) {
      const logEntry = {
        trackId: review.trackId,
        trackTitle: review.trackTitle,
        artist: review.artist,
        albumCover: review.albumCover,
      };
      openNewLogOverlay(logEntry);
      onClose();
    }
  };

  const handleEditReview = (e) => {
    e.stopPropagation();
    e.preventDefault();

    if (review && openEditOverlay) {
      openEditOverlay(review);
      onClose();
    }
  };

  const handleDeleteLog = async (e) => {
    e.stopPropagation();
    e.preventDefault();

    const isConfirmed = await showToast("Are you sure you want to delete this review?", "warning", { confirm: true });
    if (isConfirmed) {
      try {
        const logId = review?.logId || itemId;
        const result = await _deleteLog(logId);
        if (result.success) {
          window.dispatchEvent(new CustomEvent("reviewUpdated"));
        }
      } catch (error) {
        showToast("Failed to delete review. Please try again.", "error");
      }
      onClose();
    }
  };

  const handleReportLog = async (e) => {
    e.stopPropagation();
    e.preventDefault();

    const isConfirmed = await showToast("Are you sure you want to report this review?", "warning", { confirm: true });
    if (isConfirmed) {
      showToast("Review reported. Thank you for helping keep Trackr safe.", "success");
      onClose();
    }
  };

  return (
    <>
      {review && (() => {
        const profileUrl = review.user?.username ? `/${review.user.username}` : "#";
        const logUrl = review.user?.username && review.logId ? `/${review.user.username}/log/${review.logId}` : "#";
        return (
          <>
            {!isOwnReview && (
              <Link className={styles.menuItem} to={profileUrl} onClick={onClose}>
                <span className={styles.itemIcon}><CircleUserRound size={18} /></span>
                <span className={styles.itemLabel}>{review.user?.username || "User"}'s profile</span>
              </Link>
            )}
            <Link className={styles.menuItem} to={logUrl} onClick={onClose}>
              <span className={styles.itemIcon}><TextInitial size={18} /></span>
              <span className={styles.itemLabel}>View review</span>
            </Link>
            {isOwnReview && (
              <button className={styles.menuItem} onClick={handleEditReview}>
                <span className={styles.itemIcon}><Pencil size={18} /></span>
                <span className={styles.itemLabel}>Edit review</span>
              </button>
            )}
          </>
        );
      })()}

      <div className={styles.divider} />

      {review && (() => {
        const itemUrl = isAlbum
          ? createAlbumSlug(review.trackTitle, review.artist, review.albumId || review.id)
          : createTrackSlug(review.trackTitle, review.artist, review.trackId);
        return (
          <Link className={styles.menuItem} to={itemUrl} state={!isAlbum ? { trackId: review.trackId } : undefined} onClick={onClose}>
            <span className={styles.itemIcon}><Eye size={18} /></span>
            <span className={styles.itemLabel}>{isAlbum ? "Access album" : "Access track"}</span>
          </Link>
        );
      })()}

      <button className={styles.menuItem} onClick={handleLogNewTrack}>
        <span className={styles.itemIcon}><Plus size={18} /></span>
        <span className={styles.itemLabel}>{isAlbum ? "Review this album" : "Review this track"}</span>
      </button>

      {review && !isAlbum && (
        <button
          className={styles.menuItem}
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            if (openListModal) openListModal(review.trackId);
            onClose();
          }}
        >
          <span className={styles.itemIcon}><RiPlayListAddLine size={18} /></span>
          <span className={styles.itemLabel}>Save to List</span>
        </button>
      )}

      {review && (!isCurrentTrack || isPlayerVisible) && <div className={styles.divider} />}

      {review && !isCurrentTrack && (
        <button
          className={styles.menuItem}
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            if (isAlbum) {
              playAlbumInQueue(review.albumId || review.id).then((count) => {
                if (count > 0) showToast(`Playing album`, "success");
              });
            } else {
              playTrackInQueue({ id: review.trackId, title: review.trackTitle, artist: review.artist, coverUrl: review.albumCover });
            }
            onClose();
          }}
        >
          <span className={styles.itemIcon}><Play size={18} /></span>
          <span className={styles.itemLabel}>{isAlbum ? "Play album" : "Play track"}</span>
        </button>
      )}

      {review && isPlayerVisible && (
        <>
          {!isAlbum && (
            <button
              className={styles.menuItem}
              onClick={() => {
                addNextToQueue({ id: review.trackId, title: review.trackTitle, artist: review.artist, coverUrl: review.albumCover });
                showToast(`Playing next: ${review.trackTitle}`, "success");
                onClose();
              }}
            >
              <span className={styles.itemIcon}><ListStart size={18} /></span>
              <span className={styles.itemLabel}>Play next</span>
            </button>
          )}
          <button
            className={styles.menuItem}
            onClick={() => {
              if (isAlbum) {
                addAlbumToQueue(review.albumId || review.id).then((count) => {
                  if (count > 0) showToast(`Added ${count} tracks to queue`, "success");
                });
              } else {
                addToQueue({ id: review.trackId, title: review.trackTitle, artist: review.artist, coverUrl: review.albumCover });
                showToast(`Added to queue: ${review.trackTitle}`, "success");
              }
              onClose();
            }}
          >
            <span className={styles.itemIcon}><ListEnd size={18} /></span>
            <span className={styles.itemLabel}>Add to queue</span>
          </button>
        </>
      )}

      <div className={styles.divider} />

      {isOwnReview ? (
        <button className={`${styles.menuItem} ${styles.dangerItem}`} onClick={handleDeleteLog}>
          <span className={styles.itemIcon}><Trash2 size={18} /></span>
          <span className={styles.itemLabel}>Delete review</span>
        </button>
      ) : (
        <button className={`${styles.menuItem} ${styles.dangerItem}`} onClick={handleReportLog}>
          <span className={styles.itemIcon}><Flag size={18} /></span>
          <span className={styles.itemLabel}>Report review</span>
        </button>
      )}
    </>
  );
};

export default ActionMenu;
