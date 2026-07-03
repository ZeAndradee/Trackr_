import React, { useEffect, useRef, useState, useCallback } from "react";
import { IoMusicalNotesOutline, IoGlobeOutline, IoCloseCircle, IoGrid, IoEllipsisHorizontal } from "react-icons/io5";
import { BiLockAlt } from "react-icons/bi";
import { FiSearch, FiList, FiX, FiDownload, FiArrowRight } from "react-icons/fi";
import { useNavigate, useBlocker, useParams, useSearchParams } from "react-router-dom";
import { formatDurationCompact, createTrackSlug } from "../../../utils/formatters/textFormatters";
import { createList, fetchList, updateList } from "../../../services/FetchList";
import { fetchTrack } from "../../../services/FetchTrack";
import { fetchRecentTrackLogs } from "../../../services/FetchUser";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, rectSortingStrategy, useSortable, arrayMove } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import styles from "./CreateList.module.css";
import CreateListModal from "./CreateListModal";
import CreateListSkeleton from "../../../components/Utils/Skeletons/CreateListSkeleton";
import { Button } from "../../../components/Utils/Buttons/Button";
import Image from "../../../components/Utils/Images/Image/Image";
import { getTrackCover } from "../../../components/Utils/Formater/Track";
import ArtistList from "../../../components/Utils/ArtistList/ArtistList";
import TrackCard from "../../../components/Track/TrackCard/TrackCard";
import ActionMenu from "../../../components/Utils/Dropdown/ActionMenu";
import { GenreTag, RatingTag, LikeTag } from "../../../components/Utils/Tags/Tags";
import HeroItem from "../../../components/Utils/HeroItem/HeroItem";
import { useUserContext } from "../../../contexts/UserContext";
import useApi from "../../../hooks/Api";
import useClickOutside from "../../../hooks/useClickOutside";
import showToast, { showUnsavedChangesToast, dismissUnsavedChangesToast } from "../../../components/Utils/Toast/Toast";
import { TextInput, TextArea } from "../../../components/Utils/Inputs/Inputs";

const SortableTrackItem = ({ track, index, ranked, onRemove, navigate, openMenuId, setOpenMenuId }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: track.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });

    const handleMenuClick = (e) => {
        e.stopPropagation();
        const rect = e.currentTarget.getBoundingClientRect();
        setMenuPosition({ top: rect.bottom, left: rect.left - 150 });
        setOpenMenuId(openMenuId === track.id ? null : track.id);
    };

    const handleViewTrack = () => {
        const artists = track?.artists || [];
        navigate(createTrackSlug(track?.name || "track", artists, track?.id), {
            state: { trackId: track.id }
        });
    };

    const handleShare = () => {
        const artists = track?.artists || [];
        const slug = createTrackSlug(track?.name || "track", artists, track?.id);
        navigator.clipboard.writeText(`${window.location.origin}${slug}`);
        showToast("Link copied to clipboard", "success");
    };

    const menuItems = [
        { label: `View ${track.type === 'album' ? 'Album' : 'Track'}`, onClick: handleViewTrack },
        { label: 'Share', onClick: handleShare },
        { label: 'Remove', onClick: () => onRemove(track.id), section: 'danger' },
    ];

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`${styles.trackListItem} ${ranked ? styles.trackListItemRanked : ""} ${isDragging ? styles.trackListItemDragging : ""}`}
            {...attributes}
            {...listeners}
        >
            {ranked && (
                <div className={styles.trackRank}>
                    <span className={styles.rankHash}>#</span> {index + 1}
                </div>
            )}

            <Image
                src={getTrackCover(track)}
                alt={track?.name}
                fallbackVariant="cover"
                width="100%"
                height="100%"
                className={styles.trackCover}
            />

            <div className={styles.trackInfo}>
                <div className={styles.titleRow}>
                    <span className={styles.trackName}>{track.name}</span>
                    {(track?.userRating || 0) > 0 && <RatingTag rating={track.userRating} showBackground={true} size="0.8rem" />}
                    {track?.userLiked && <LikeTag showBackground={true} size="0.8rem" />}
                </div>
                <span className={styles.trackArtist}>
                    <ArtistList artists={track?.artists || []} />
                </span>
            </div>

            <div className={styles.trackActions}>
                <button
                    className={styles.moreButton}
                    onClick={handleMenuClick}
                >
                    <IoEllipsisHorizontal />
                </button>
                {openMenuId === track.id && (
                    <ActionMenu
                        items={menuItems}
                        onClose={() => setOpenMenuId(null)}
                        position={menuPosition}
                    />
                )}
            </div>
        </div>
    );
};

const SortableGridItem = ({ track, index, ranked }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: track.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={styles.trackGridItem}
            {...attributes}
            {...listeners}
        >
            <TrackCard
                track={{
                    ...track,
                    id: track.id,
                    name: track.name,
                    artists: track.artists,
                    coverUrl: track.coverUrl || track?.albumCover,
                    userRating: track.userRating,
                    userLiked: track.userLiked,
                }}
                isSpotifyTrack={true}
                disableLink={true}
                showRank={ranked}
                rank={ranked ? index + 1 : undefined}
            />
        </div>
    );
};

export function meta({ params }) {
  const editing = !!params.listname;
  const title = editing ? "Edit List | Trackr" : "Create List | Trackr";
  return [
    { title },
    {
      name: "description",
      content:
        "Create a new list on Trackr to organize your favorite tracks and albums.",
    },
  ];
}

const ListCreate = () => {
    const navigate = useNavigate();
    const { userLogged, loading } = useUserContext();

    useEffect(() => {
        if (!loading && !userLogged) {
            navigate("/");
        }
    }, [userLogged, loading, navigate]);

    const defaultName = `${userLogged?.username || "User"}'s list`;

    const [listName, setListName] = useState("");
    const [description, setDescription] = useState("");
    const [ranked, setRanked] = useState(false);
    const [isPublic, setIsPublic] = useState(true);
    const [tracks, setTracks] = useState([]);
    const [tags, setTags] = useState([]);
    const { username, listname } = useParams();
    const [searchParams] = useSearchParams();
    const preloadTrackId = searchParams.get("trackId");
    const isEditMode = Boolean(username && listname);
    const [listIdToEdit, setListIdToEdit] = useState(null);
    const [tagInput, setTagInput] = useState("");
    const [showModal, setShowModal] = useState(!isEditMode && !preloadTrackId);
    const [viewMode, setViewMode] = useState("list");
    const [openMenuId, setOpenMenuId] = useState(null);
    const [saving, setSaving] = useState(false);
    const [loadingList, setLoadingList] = useState(isEditMode);
    const [initialState, setInitialState] = useState(null);

    useEffect(() => {
        if (isEditMode) {
            setLoadingList(true);
            fetchList(username, listname).then(data => {
                setListIdToEdit(data._id || data.id);
                setListName(data.name || "");
                setDescription(data.description || "");
                setRanked(data.isRanked || false);
                setIsPublic(data.isPublic !== false);
                setTags(data.tags || []);
                let fetchedTracks = [];
                if (data.tracks) {
                    fetchedTracks = data.tracks.map(t => ({ ...t, id: t.trackId || t._id }));
                    setTracks(fetchedTracks);
                }
                setInitialState(JSON.stringify({
                    listName: data.name || "",
                    description: data.description || "",
                    ranked: data.isRanked || false,
                    isPublic: data.isPublic !== false,
                    tags: data.tags || [],
                    tracks: fetchedTracks.map(t => t.id)
                }));
                setLoadingList(false);
            }).catch(err => {
                console.error(err);
                showToast("Failed to load list data", "error");
                setLoadingList(false);
            });
        }
    }, [username, listname, isEditMode]);

    useEffect(() => {
        if (!preloadTrackId || isEditMode) return;
        fetchTrack(preloadTrackId).then((trackData) => {
            if (trackData && !tracks.find((t) => t.id === trackData.id)) {
                setTracks([{
                    ...trackData,
                    name: trackData.name,
                    artists: trackData.artists || [],
                    type: "track",
                }]);
            }
        }).catch((err) => {
            console.error("Failed to preload track:", err);
            showToast("Failed to load track", "error");
        });
    }, [preloadTrackId]);

    const hasUnsavedChanges = !saving && (() => {
        if (isEditMode) {
            if (!initialState) return false;
            const currentState = JSON.stringify({
                listName,
                description,
                ranked,
                isPublic,
                tags,
                tracks: tracks.map(t => t.id)
            });
            return currentState !== initialState;
        }
        return tracks.length > 0 || listName !== "" || description !== "" || tags.length > 0;
    })();

    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (hasUnsavedChanges) {
                e.preventDefault();
                e.returnValue = "";
            }
        };

        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => window.removeEventListener("beforeunload", handleBeforeUnload);
    }, [hasUnsavedChanges]);

    const blocker = useBlocker(
        ({ currentLocation, nextLocation }) =>
            hasUnsavedChanges && currentLocation.pathname !== nextLocation.pathname
    );

    useEffect(() => {
        if (blocker.state === "blocked") {
            showUnsavedChangesToast({
                onSave: () => {
                    handleCreateList();
                    blocker.proceed();
                },
                onDiscard: () => blocker.proceed(),
            });
        }
    }, [blocker]);

    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isSearchActive, setIsSearchActive] = useState(false);
    const [lastTracks, setLastTracks] = useState([]);

    const searchRef = useRef(null);
    const searchInputRef = useRef(null);
    useClickOutside(searchRef, () => setIsSearchActive(false));

    const handleOpenSearch = () => {
        setIsSearchActive(true);
        searchInputRef.current?.focus();
    };

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
    );

    const listType = tracks.length > 0
        ? (tracks[0]?.type === "album" ? "albums" : "tracks")
        : null;

    const displayName = listName || defaultName;
    const firstTrackCover = tracks[0]?.coverUrl || tracks[0]?.albumCover;

    const totalDurationMs = tracks.reduce((total, t) => {
        if (!t.duration) return total;
        const parts = t.duration.split(":").map(Number);
        if (parts.length === 2) return total + (parts[0] * 60 + parts[1]) * 1000;
        if (parts.length === 3) return total + (parts[0] * 3600 + parts[1] * 60 + parts[2]) * 1000;
        return total;
    }, 0);

    const searchPlaceholder = listType === "albums"
        ? "Search albums..."
        : "Search tracks...";

    const submitTag = () => {
        if (tagInput.trim() && tags.length < 10) {
            const newTag = tagInput.trim().toLowerCase();
            if (!tags.includes(newTag)) {
                setTags([...tags, newTag]);
            }
            setTagInput("");
        }
    };

    const handleAddTag = (e) => {
        if (e.key === "Enter") {
            submitTag();
            e.preventDefault();
        }
    };

    const handleRemoveTag = (tagToRemove) => {
        setTags(tags.filter(tag => tag !== tagToRemove));
    };

    const handleCreateList = async () => {
        dismissUnsavedChangesToast();
        if (tracks.length === 0 || saving) return;
        setSaving(true);
        try {
            const listPayload = {
                name: listName || defaultName,
                description,
                tags,
                isPublic,
                isRanked: ranked,
                tracks: tracks.map((t, index) => ({
                    trackId: t.id,
                    ...(ranked ? { position: index + 1 } : {})
                })),
            };

            let list;
            if (isEditMode && listIdToEdit) {
                list = await updateList(listIdToEdit, listPayload);
            } else {
                list = await createList(listPayload);
            }

            showToast(isEditMode ? "List updated successfully" : "List created successfully", "success");
            navigate(`/${userLogged.username}/list/${list?.slug || listPayload.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`);
        } catch (error) {
            console.error(isEditMode ? "Failed to update list:" : "Failed to create list:", error);
            const apiMessage = error?.response?.data?.message;
            let toastMessage = isEditMode ? "Failed to update list" : "Failed to create list";
            if (apiMessage === "You already have a list with this name") {
                toastMessage = "You already have a list with this name. Try a different one.";
            }
            showToast(toastMessage, "error");
            setSaving(false);
        }
    };

    useEffect(() => {
        const api = useApi();
        const delayDebounceFn = setTimeout(async () => {
            if (searchQuery.length > 1) {
                setIsSearching(true);
                try {
                    const { data } = await api.get("/search", {
                        params: {
                            q: searchQuery,
                            type: listType === "albums" ? "album" : "track",
                            limit: 5,
                        },
                    });
                    setSearchResults(
                        listType === "albums"
                            ? data?.albums || data?.data?.albums || []
                            : data?.tracks || data?.data?.tracks || []
                    );
                } catch (error) {
                    console.error("Search error:", error);
                    setSearchResults([]);
                } finally {
                    setIsSearching(false);
                }
            } else {
                setSearchResults([]);
                setIsSearching(false);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery, listType]);

    useEffect(() => {
        const userId = userLogged?._id || userLogged?.id;
        if (!userId) return;
        fetchRecentTrackLogs(userId, 5).then((logs) => {
            setLastTracks(logs.filter((log) => log.type !== "album").slice(0, 5));
        });
    }, [userLogged?.id]);

    const handleAddTrack = (item) => {
        if (!tracks.find((t) => t.id === item.id)) {
            setTracks([...tracks, { ...item, type: listType === "albums" ? "album" : "track" }]);
        }
        setSearchQuery("");
        setSearchResults([]);
        setIsSearchActive(false);
    };

    const handleRemoveTrack = (trackId) => {
        setTracks(tracks.filter((t) => t.id !== trackId));
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (active.id !== over?.id) {
            setTracks((items) => {
                const oldIndex = items.findIndex((i) => i.id === active.id);
                const newIndex = items.findIndex((i) => i.id === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    const handleModalComplete = useCallback(({ tracks: modalTracks }) => {
        if (modalTracks.length > 0) {
            setTracks(modalTracks);
        }
        setShowModal(false);
    }, []);

    if (loadingList) {
        return (
            <>
                <CreateListSkeleton />
            </>
        );
    }

    return (
        <>
            {showModal && <CreateListModal onComplete={handleModalComplete} />}

            <div className={styles.page}>
                <HeroItem
                    coverUrl={firstTrackCover}
                    stackedCovers={tracks.slice(1, 4).map(t => t?.coverUrl || t?.albumCover)}
                    title={displayName}
                    type="List"
                    subtitle={
                        <div className={styles.subtitleRow}>
                            {isPublic ? (
                                <IoGlobeOutline className={styles.visibilityIcon} />
                            ) : (
                                <BiLockAlt className={styles.visibilityIcon} />
                            )}
                            <span>{isPublic ? "Public" : "Private"}</span>
                            {tracks.length > 0 && (
                                <>
                                    <span className={styles.heroDivider}>·</span>
                                    <span>{formatDurationCompact(totalDurationMs)}</span>
                                </>
                            )}
                        </div>
                    }
                    stats={
                        <div className={styles.heroRightStats}>
                            <div className={styles.statLineItem}>
                                <span className={styles.statLineValue}>{tracks.length}</span>
                                <span className={styles.statLineLabel}>
                                    {listType ? (listType === "albums" ? "Albums" : "Tracks") : "Items"}
                                </span>
                            </div>
                        </div>
                    }
                />

                <div className={styles.contentWrapper}>
                    <div className={styles.leftColumn}>

                        <div className={styles.toolbarRow}>
                            <div
                                ref={searchRef}
                                className={`${styles.searchBarWrapper} ${(isSearchActive && searchQuery.length > 1) || (isSearchActive && !searchQuery && lastTracks.length > 0) ? styles.searchActive : ""}`}
                            >
                                <div className={styles.searchBar}>
                                    <TextInput
                                        ref={searchInputRef}
                                        type="text"
                                        icon={<FiSearch />}
                                        clearable
                                        onClear={() => {
                                            setSearchQuery("");
                                            setSearchResults([]);
                                            setIsSearchActive(false);
                                        }}
                                        placeholder={searchPlaceholder}
                                        value={searchQuery}
                                        onChange={(e) => {
                                            setSearchQuery(e.target.value);
                                            setIsSearchActive(true);
                                        }}
                                        onFocus={() => setIsSearchActive(true)}
                                    />
                                </div>
                                {isSearchActive && searchQuery.length > 1 && (
                                    <div className={styles.searchResultsDropdown}>
                                        {isSearching ? (
                                            <div className={styles.searchMessage}>Searching...</div>
                                        ) : searchResults.length > 0 ? (
                                            searchResults.map((item) => (
                                                <div
                                                    key={item.id}
                                                    className={styles.searchResultItem}
                                                    onClick={() => handleAddTrack(item)}
                                                >
                                                    <Image
                                                        src={getTrackCover(item, 1)}
                                                        alt={item?.name}
                                                        fallbackVariant="cover"
                                                        className={styles.searchResultImg}
                                                    />
                                                    <div className={styles.searchResultInfo}>
                                                        <span className={styles.searchResultName}>
                                                            {item.name}
                                                        </span>
                                                        <span className={styles.searchResultArtist}>
                                                            <ArtistList artists={item?.artists || (item?.primaryArtist ? [item.primaryArtist] : [])} />
                                                        </span>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className={styles.searchMessage}>No results found</div>
                                        )}
                                    </div>
                                )}
                                {isSearchActive && !searchQuery && lastTracks.length > 0 && (
                                    <div className={styles.searchResultsDropdown}>
                                        {lastTracks.map((item) => (
                                            <div
                                                key={item._id}
                                                className={styles.searchResultItem}
                                                onClick={() => handleAddTrack({ ...item, id: item.trackId || item._id })}
                                            >
                                                <Image
                                                    src={item.coverUrl || item.images?.[0]?.url}
                                                    alt={item?.name}
                                                    fallbackVariant="cover"
                                                    className={styles.searchResultImg}
                                                />
                                                <div className={styles.searchResultInfo}>
                                                    <span className={styles.searchResultName}>
                                                        {item.name}
                                                    </span>
                                                    <span className={styles.searchResultArtist}>
                                                        <ArtistList artists={item?.artists || (item?.primaryArtist ? [item.primaryArtist] : [])} />
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className={styles.toolbarRight}>
                                <div className={styles.viewToggle}>
                                    <button
                                        className={`${styles.viewToggleBtn} ${viewMode === "list" ? styles.viewToggleBtnActive : ""}`}
                                        onClick={() => setViewMode("list")}
                                        aria-label="List View"
                                    >
                                        <FiList size={18} />
                                    </button>
                                    <button
                                        className={`${styles.viewToggleBtn} ${viewMode === "cards" ? styles.viewToggleBtnActive : ""}`}
                                        onClick={() => setViewMode("cards")}
                                        aria-label="Cards View"
                                    >
                                        <IoGrid size={16} />
                                    </button>
                                </div>
                                <button className={styles.importButton}>
                                    <FiDownload size={14} />
                                    Import
                                </button>
                            </div>
                        </div>

                        {tracks.length > 0 ? (
                            viewMode === "list" ? (
                                <DndContext
                                    sensors={sensors}
                                    collisionDetection={closestCenter}
                                    onDragEnd={handleDragEnd}
                                >
                                    <SortableContext
                                        items={tracks.map(t => t.id)}
                                        strategy={verticalListSortingStrategy}
                                    >
                                        <span className={styles.listDisclaimer}>Drag to reorder items</span>
                                        <div className={styles.trackList}>
                                            {tracks.map((track, index) => (
                                                <SortableTrackItem
                                                    key={track.id}
                                                    track={track}
                                                    index={index}
                                                    ranked={ranked}
                                                    onRemove={handleRemoveTrack}
                                                    navigate={navigate}
                                                    openMenuId={openMenuId}
                                                    setOpenMenuId={setOpenMenuId}
                                                />
                                            ))}
                                        </div>
                                    </SortableContext>
                                </DndContext>
                            ) : (
                                <DndContext
                                    sensors={sensors}
                                    collisionDetection={closestCenter}
                                    onDragEnd={handleDragEnd}
                                >
                                    <SortableContext
                                        items={tracks.map(t => t.id)}
                                        strategy={rectSortingStrategy}
                                    >
                                        <span className={styles.listDisclaimer}>Drag to reorder items</span>
                                        <div className={styles.trackGrid}>
                                            {tracks.map((track, index) => (
                                                <SortableGridItem
                                                    key={track.id}
                                                    track={track}
                                                    index={index}
                                                    ranked={ranked}
                                                />
                                            ))}
                                        </div>
                                    </SortableContext>
                                </DndContext>
                            )
                        ) : (
                            <div className={styles.emptyState}>
                                <IoMusicalNotesOutline className={styles.emptyIcon} />
                                <span className={styles.emptyText}>
                                    No items added yet. Search and add {listType || "tracks"} above.
                                </span>
                                <Button
                                    variant="primary"
                                    size="sm"
                                    leftIcon={<FiSearch />}
                                    onClick={handleOpenSearch}
                                >
                                    Add {listType === "albums" ? "album" : "track"}
                                </Button>
                            </div>
                        )}
                    </div>

                    <div className={styles.rightColumn}>
                        <div className={styles.card}>
                            <span className={styles.cardTitle}>Details</span>
                            <div className={styles.fieldGroup}>
                                <TextInput
                                    label="List Name"
                                    type="text"
                                    placeholder={defaultName}
                                    value={listName}
                                    onChange={(e) => setListName(e.target.value)}
                                    maxLength={75}
                                />
                            </div>
                            <div className={styles.fieldGroup}>
                                <TextArea
                                    label="Description"
                                    placeholder="What's this list about?"
                                    rows={4}
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    maxLength={500}
                                    showCounter
                                />
                            </div>
                            <div className={styles.fieldGroup}>
                                <label className={styles.fieldLabel}>Tags</label>
                                <div className={styles.tagsContainer}>
                                    {tags.map(tag => (
                                        <div key={tag} className={styles.tagItem}>
                                            <GenreTag genre={tag} size="0.75rem" />
                                            <button
                                                className={styles.tagRemove}
                                                onClick={() => handleRemoveTag(tag)}
                                            >
                                                <IoCloseCircle />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                {tags.length < 10 && (
                                    <div className={styles.tagInputWrapper}>
                                        <TextInput
                                            type="text"
                                            placeholder="Add a tag..."
                                            value={tagInput}
                                            onChange={(e) => setTagInput(e.target.value)}
                                            onKeyDown={handleAddTag}
                                            className={styles.tagInputField}
                                        />
                                        <button
                                            className={`${styles.tagSubmitBtn} ${tagInput.trim() ? styles.tagSubmitBtnActive : ""}`}
                                            onClick={submitTag}
                                            type="button"
                                        >
                                            <FiArrowRight />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className={styles.card}>
                            <span className={styles.cardTitle}>Settings</span>
                            <div className={styles.settingRow}>
                                <div className={styles.settingInfo}>
                                    <span className={styles.settingLabel}>{ranked ? "Ranked List" : "Unranked List"}</span>
                                    <span className={styles.settingDescription}>
                                        {ranked ? "Number items to show ranking" : "Items are not numbered"}
                                    </span>
                                </div>
                                <label className={styles.toggle}>
                                    <input
                                        type="checkbox"
                                        className={styles.toggleInput}
                                        checked={ranked}
                                        onChange={() => setRanked(!ranked)}
                                    />
                                    <span className={styles.toggleSlider} />
                                </label>
                            </div>
                            <div className={styles.settingRow}>
                                <div className={styles.settingInfo}>
                                    <span className={styles.settingLabel}>
                                        {isPublic ? "Public List" : "Private List"}
                                        {isPublic ? <IoGlobeOutline className={styles.settingLabelIcon} /> : <BiLockAlt className={styles.settingLabelIcon} />}
                                    </span>
                                    <span className={styles.settingDescription}>
                                        {isPublic ? "Anyone can discover this list" : "Only you can see this list"}
                                    </span>
                                </div>
                                <label className={styles.toggle}>
                                    <input
                                        type="checkbox"
                                        className={styles.toggleInput}
                                        checked={isPublic}
                                        onChange={() => setIsPublic(!isPublic)}
                                    />
                                    <span className={styles.toggleSlider} />
                                </label>
                            </div>
                        </div>

                        <div className={styles.actions}>
                            <div className={styles.actionsButtons}>
                                <div className={styles.cancelWrapper}>
                                    {tracks.length === 0 && (
                                        <span className={styles.actionsMuted}>Add at least one track to {isEditMode ? 'update' : 'create'} a list.</span>
                                    )}
                                    <Button variant="secondary" size="sm" onClick={() => navigate(-1)}>
                                        Cancel
                                    </Button>
                                </div>
                                <Button variant="primary" size="sm" disabled={tracks.length === 0 || saving || loadingList} onClick={handleCreateList}>
                                    {isEditMode ? (saving ? "Saving..." : "Save Changes") : (saving ? "Creating..." : "Create List")}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ListCreate;
