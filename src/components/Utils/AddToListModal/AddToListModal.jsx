import { useState, useEffect, useCallback } from "react";
import ReactDOM from "react-dom";
import { useNavigate } from "react-router-dom";
import { FiX, FiPlus, FiSearch } from "react-icons/fi";
import { AiOutlineLoading } from "react-icons/ai";
import { IoMusicalNotesOutline } from "react-icons/io5";
import AddToListModalSkeleton from "../Skeletons/AddToListModalSkeleton";

import styles from "./AddToListModal.module.css";
import { fetchUserLists, addTrackToList } from "../../../services/FetchList";
import { fetchTrack } from "../../../services/FetchTrack";
import { useUserContext } from "../../../contexts/UserContext";
import { useAuthModal } from "../../../contexts/AuthModalContext";
import useScrollLock from "../../../hooks/useScrollLock";
import ListCovers from "../Images/ListCovers/ListCovers";
import Image from "../Images/Image/Image";
import { getTrackCover } from "../Formater/Track";
import showToast from "../Toast/Toast";
import { TextInput } from "../Inputs/Inputs";

const CLOSE_DURATION = 250;

const AddToListModal = ({ trackId, onClose }) => {
  const navigate = useNavigate();
  const { userLogged } = useUserContext();
  const { openModal } = useAuthModal();
  useScrollLock();

  const [track, setTrack] = useState(null);
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isClosing, setIsClosing] = useState(false);
  const [addingToListId, setAddingToListId] = useState(null);
  const [addedListIds, setAddedListIds] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState("");

  const closeModal = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => onClose(), CLOSE_DURATION);
  }, [onClose]);

  useEffect(() => {
    if (!userLogged) {
      closeModal();
      openModal("login-reason", { reason: "list" });
      return;
    }

    const loadData = async () => {
      try {
        const [trackData, listsData] = await Promise.all([
          fetchTrack(trackId),
          fetchUserLists(userLogged.username),
        ]);

        setTrack(trackData);
        const userLists = Array.isArray(listsData) ? listsData : [];
        setLists(userLists);

        if (trackId) {
          const alreadyIn = new Set();
          userLists.forEach((list) => {
            const hasTrack = list.tracks?.some(
              (t) => t.trackId === trackId || t.id === trackId || t._id === trackId
            );
            if (hasTrack) alreadyIn.add(list._id || list.id);
          });
          setAddedListIds(alreadyIn);
        }
      } catch (err) {
        console.error("Failed to load data:", err);
        showToast("Failed to load data", "error");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [userLogged, trackId]);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [closeModal]);

  const handleAddToList = async (list) => {
    const listId = list._id || list.id;
    if (addedListIds.has(listId) || addingToListId) return;

    setAddingToListId(listId);
    try {
      const trackCount = list.tracks?.length || 0;
      const params = { trackId, index: trackCount };
      if (list.isRanked) params.position = trackCount + 1;
      await addTrackToList(listId, params);
      setAddedListIds((prev) => new Set([...prev, listId]));
      showToast(`Added to "${list.name}"`, "success");
    } catch (err) {
      console.error("Failed to add track to list:", err);
      showToast("Failed to add track to list", "error");
    } finally {
      setAddingToListId(null);
    }
  };

  const handleCreateNewList = () => {
    closeModal();
    setTimeout(() => {
      navigate(`/list/create?trackId=${trackId}`);
    }, CLOSE_DURATION);
  };

  const getListCovers = (list) => {
    if (list.tracks && list.tracks.length > 0) {
      return list.tracks.slice(0, 5);
    }
    return [];
  };

  const filteredLists = lists.filter((list) =>
    list.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const content = (
    <div
      className={`${styles.overlay} ${isClosing ? styles.overlayClosing : ""}`}
      onClick={closeModal}
    >
      <div
        className={`${styles.modal} ${isClosing ? styles.modalClosing : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <Image src={getTrackCover(track)} alt={track?.title || track?.name} fallbackVariant="cover" width={44} height={44} className={styles.headerCover} />
            <div className={styles.headerInfo}>
              <h3 className={styles.headerTitle}>Save to List</h3>
              <span className={styles.headerTrackName}>{track?.name}</span>
            </div>
          </div>
          <button className={styles.closeButton} onClick={closeModal}>
            <FiX size={18} />
          </button>
        </div>

        <div className={styles.searchWrapper}>
          <TextInput
            type="text"
            icon={<FiSearch size={18} />}
            clearable
            placeholder="Search lists..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button className={styles.createListButton} onClick={handleCreateNewList}>
            <FiPlus size={15} />
            New List
          </button>
        </div>

        <div className={styles.body}>
          {loading ? (
            <AddToListModalSkeleton count={4} />
          ) : filteredLists.length > 0 ? (
            <>
              {filteredLists.map((list) => {
                const listId = list._id || list.id;
                const isAdded = addedListIds.has(listId);
                const isAdding = addingToListId === listId;
                const covers = getListCovers(list);

                return (
                  <div
                    key={listId}
                    className={`${styles.listItem} ${isAdded ? styles.listItemAdded : ""}`}
                    onClick={() => !isAdded && handleAddToList(list)}
                  >
                    <ListCovers
                      covers={covers}
                      maxCovers={5}
                      size={64}
                      borderRadius={8}
                      showEmpty={true}
                      className={styles.listCovers}
                    />
                    <div className={styles.listInfo}>
                      <span className={styles.listName}>{list.name}</span>
                      <span className={styles.listMeta}>
                        {list.tracks?.length || 0} tracks
                      </span>
                    </div>
                    {isAdding && <AiOutlineLoading className={styles.spinner} size={14} />}
                    {isAdded && !isAdding && (
                      <span className={styles.addedBadge}>Added</span>
                    )}
                  </div>
                );
              })}
            </>
          ) : (
            <div className={styles.emptyState}>
              <IoMusicalNotesOutline size={32} style={{ color: "var(--text-secondary-color)", opacity: 0.4 }} />
              <span className={styles.emptyText}>
                You don't have any lists yet. Create one to start organizing your tracks.
              </span>
            </div>
          )}
        </div>

      </div>
    </div>
  );

  return ReactDOM.createPortal(content, document.body);
};

export default AddToListModal;
