import React, { useEffect, useState, useMemo, useCallback, useRef } from "react";
import ReactDOM from "react-dom";
import { useParams, useNavigate } from "react-router-dom";
import { useLoaderData } from "react-router";
import EmptyShelfIcon from "../../../components/Icons/EmptyShelfIcon/EmptyShelfIcon";
import { FiSearch } from "react-icons/fi";
import { Check } from "lucide-react";
import styles from "./Lists.module.css";
import { deleteList } from "../../../services/FetchList";
import { loaderFetch } from "../../../services/ssrLoader";
import { buildMeta, collectionPageLd } from "../../../services/seo";
import { GenreTag } from "../../../components/Utils/Tags/Tags";
import { Button } from "../../../components/Utils/Buttons/Button";
import ErrorBoundary from "../../../components/Utils/Error/ErrorBoundary";
import { useUserContext } from "../../../contexts/UserContext";
import showToast from "../../../components/Utils/Toast/Toast";
import ListCard from "../../../components/List/ListCard/ListCard";
import ListsIndexSkeleton from "../../../components/Utils/Skeletons/ListsIndexSkeleton";
import useStickyFollowScroll from "../../../hooks/useStickyFollowScroll";
import useClickOutside from "../../../hooks/useClickOutside";
import { TextInput } from "../../../components/Utils/Inputs/Inputs";

const SORT_OPTIONS = [
    { key: "recent", label: "Most recent" },
    { key: "tracks", label: "Tracks" },
    { key: "artist", label: "Artist" },
];

const getPrimaryArtist = (list) => {
    const t = list?.tracks?.[0];
    const a = t?.artists?.[0];
    return (a?.name || t?.artist || list?.name || "").toLowerCase();
};

const getYear = (list) => {
    if (!list?.createdAt) return null;
    const y = new Date(list.createdAt).getFullYear();
    return Number.isNaN(y) ? null : y;
};

const normalizeLists = (data, username) =>
    (Array.isArray(data) ? data : []).map((list) => {
        const hasOwner = list.owner && typeof list.owner === "object" && list.owner.username;
        const hasUser = list.user && typeof list.user === "object" && list.user.username;
        if (hasOwner || hasUser) return list;
        return {
            ...list,
            owner: { ...list.owner, username },
        };
    });

const sortLists = (list, sortKey) => {
    const arr = [...list];
    if (sortKey === "recent") {
        return arr.sort((a, b) => {
            const da = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const db = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return db - da;
        });
    }
    if (sortKey === "tracks") {
        const count = (l) => l.trackCount ?? l.tracks?.length ?? 0;
        return arr.sort((a, b) => count(b) - count(a));
    }
    if (sortKey === "artist") {
        return arr.sort((a, b) => getPrimaryArtist(a).localeCompare(getPrimaryArtist(b)));
    }
    return arr;
};

export async function loader({ params, request }) {
    const { username } = params;
    if (!username) {
        throw new Response("User not found", { status: 404 });
    }

    const lists = await loaderFetch(`/lists/user/${username}`, request);
    return { lists: normalizeLists(lists, username) };
}

export function meta({ params }) {
    const canonical = `/${params.username}/lists`;
    const description = `Browse @${params.username}'s music lists and playlists on Trackr.`;
    return buildMeta({
        title: `${params.username}'s Lists | Trackr`,
        description,
        canonical,
        jsonLd: collectionPageLd({
            name: `${params.username}'s Lists`,
            description,
            url: canonical,
        }),
    });
}

const ListsIndex = () => {
    const { username } = useParams();
    const navigate = useNavigate();
    const { userLogged } = useUserContext();
    const sidebarRef = useRef(null);
    useStickyFollowScroll(sidebarRef);

    const { lists: initialLists } = useLoaderData();

    const [lists, setLists] = useState(initialLists);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeTag, setActiveTag] = useState(null);
    const [activeYear, setActiveYear] = useState(null);
    const [sortKey, setSortKey] = useState("recent");
    const [menuPos, setMenuPos] = useState(null);
    const inputRef = useRef(null);
    const filterBtnRef = useRef(null);

    const isOwnProfile = userLogged?.username?.toLowerCase() === username?.toLowerCase();

    useEffect(() => {
        setLists(initialLists);
    }, [initialLists]);

    const allTags = useMemo(() => {
        const tagSet = new Set();
        lists.forEach((list) => {
            list.tags?.forEach((tag) => tagSet.add(tag));
        });
        return Array.from(tagSet);
    }, [lists]);

    const allYears = useMemo(() => {
        const set = new Set();
        lists.forEach((list) => {
            const y = getYear(list);
            if (y) set.add(y);
        });
        return [...set].sort((a, b) => b - a);
    }, [lists]);

    const filteredLists = useMemo(() => {
        let result = lists;

        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            result = result.filter((list) =>
                list.name?.toLowerCase().includes(q)
            );
        }

        if (activeTag) {
            result = result.filter((list) =>
                list.tags?.includes(activeTag)
            );
        }

        if (activeYear) {
            result = result.filter((list) => getYear(list) === activeYear);
        }

        return sortLists(result, sortKey);
    }, [lists, searchQuery, activeTag, activeYear, sortKey]);

    const handleClearQuery = useCallback(() => {
        setSearchQuery("");
        if (inputRef.current) inputRef.current.focus();
    }, []);

    const handleTagClick = useCallback((tag) => {
        setActiveTag((prev) => (prev === tag ? null : tag));
    }, []);

    const handleYearClick = useCallback((year) => {
        setActiveYear((prev) => (prev === year ? null : year));
    }, []);

    const toggleFilterMenu = () => {
        if (menuPos) {
            setMenuPos(null);
            return;
        }
        const rect = filterBtnRef.current.getBoundingClientRect();
        setMenuPos({ top: rect.bottom + 4, right: window.innerWidth - rect.right });
    };

    const handleDeleteListClick = async (listId) => {
        const isConfirmed = await showToast("Are you sure you want to delete this list?", "warning", { confirm: true });
        if (isConfirmed) {
            try {
                await deleteList(listId);
                setLists((prev) => prev.filter((l) => l._id !== listId));
                showToast("List deleted successfully", "success");
            } catch (err) {
                console.error("Failed to delete list", err);
                showToast("Failed to delete list", "error");
            }
        }
    };

    const handleReportListClick = async () => {
        const isConfirmed = await showToast("Are you sure you want to report this list?", "warning", { confirm: true });
        if (isConfirmed) {
            showToast("List reported. Thank you for helping keep Trackr safe.", "success");
        }
    };

    const getMenuItems = (list) => (
        isOwnProfile ? [
            { label: "View List", onClick: () => navigate(`/${username}/list/${list.slug}`) },
            { label: "Edit List", onClick: () => navigate(`/${username}/list/${list.slug}/edit`) },
            { label: "Delete List", onClick: () => handleDeleteListClick(list._id) },
        ] : [
            { label: "View List", onClick: () => navigate(`/${username}/list/${list.slug}`) },
            { label: "Report List", onClick: () => handleReportListClick() },
        ]
    );

    if (loading) return (
        <div className={styles.page}>
            <ListsIndexSkeleton />
        </div>
    );

    if (error) return <ErrorBoundary source="listsIndex" error={error} />;

    return (
        <div className={styles.page}>

            <div className={styles.columnsLayout}>
                <div className={styles.leftColumn}>
                    <div className={styles.controlsRow}>
                        <div className={styles.searchInputContainer}>
                            <TextInput
                                ref={inputRef}
                                type="text"
                                icon={<FiSearch />}
                                clearable
                                onClear={handleClearQuery}
                                placeholder="Search lists..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <button
                            ref={filterBtnRef}
                            className={styles.filterButton}
                            onClick={toggleFilterMenu}
                        >
                            Filters
                        </button>

                        {menuPos && (
                            <FiltersMenu
                                position={menuPos}
                                sortKey={sortKey}
                                onSortPick={(k) => setSortKey(k)}
                                years={allYears}
                                activeYear={activeYear}
                                onYearPick={handleYearClick}
                                tags={allTags}
                                activeTag={activeTag}
                                onTagPick={handleTagClick}
                                onClose={() => setMenuPos(null)}
                            />
                        )}

                        {isOwnProfile && (
                            <div className={styles.createListWrapper}>
                                <Button
                                    variant="primary"
                                    onClick={() => navigate("/list/create")}
                                >
                                    Create List
                                </Button>
                            </div>
                        )}
                    </div>

                    <div className={styles.resultsCount}>
                        {filteredLists.length} list{filteredLists.length === 1 ? "" : "s"} found
                    </div>

                    {filteredLists.length > 0 ? (
                        filteredLists.map((list) => (
                            <ListCard
                                key={list._id}
                                list={list}
                                variant="visibility"
                                showTags
                                coverSize={110}
                                menuItems={getMenuItems(list)}
                            />
                        ))
                    ) : (
                        <div className={styles.emptyState}>
                            <EmptyShelfIcon />
                            <span className={styles.emptyTitle}>No lists found</span>
                            <span className={styles.emptyText}>
                                {searchQuery || activeTag || activeYear
                                    ? "Try adjusting your search or filters."
                                    : isOwnProfile
                                        ? "Your music library is currently a chaotic pile on the floor. Let's get some shelves up."
                                        : `${username} hasn't created any lists yet.`}
                            </span>
                        </div>
                    )}
                </div>

                <div ref={sidebarRef} className={styles.rightColumn}>
                    {allTags.length > 0 && (
                        <div className={styles.sidebarSection}>
                            <span className={styles.sidebarSectionTitle}>Tags</span>
                            <div className={styles.tagsCloud}>
                                {allTags.map((tag) => (
                                    <div
                                        key={tag}
                                        className={activeTag === tag ? styles.tagChipActive : styles.tagChip}
                                        onClick={() => handleTagClick(tag)}
                                    >
                                        <GenreTag genre={tag} size="0.75rem" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const FiltersMenu = ({
    position,
    sortKey,
    onSortPick,
    years,
    activeYear,
    onYearPick,
    tags,
    activeTag,
    onTagPick,
    onClose,
}) => {
    const ref = useRef(null);
    useClickOutside(ref, onClose);
    const style = {
        position: "fixed",
        top: position.top,
        right: position.right,
        zIndex: 9999,
    };
    return ReactDOM.createPortal(
        <div ref={ref} className={styles.filterMenu} style={style}>
            {years.length > 0 && (
                <>
                    <div className={styles.menuSectionTitle}>Year</div>
                    <div className={styles.menuScrollSection}>
                        <button
                            type="button"
                            className={styles.sortOption}
                            onClick={() => onYearPick(activeYear)}
                        >
                            <span className={styles.sortOptionCheck}>
                                {!activeYear && <Check size={14} />}
                            </span>
                            <span>All years</span>
                        </button>
                        {years.map((y) => {
                            const active = activeYear === y;
                            return (
                                <button
                                    key={y}
                                    type="button"
                                    className={styles.sortOption}
                                    onClick={() => onYearPick(y)}
                                >
                                    <span className={styles.sortOptionCheck}>
                                        {active && <Check size={14} />}
                                    </span>
                                    <span>{y}</span>
                                </button>
                            );
                        })}
                    </div>
                    <div className={styles.filterMenuDivider} />
                </>
            )}

            {tags.length > 0 && (
                <>
                    <div className={styles.menuSectionTitle}>Tags</div>
                    <div className={styles.menuScrollSection}>
                        <button
                            type="button"
                            className={styles.sortOption}
                            onClick={() => onTagPick(activeTag)}
                        >
                            <span className={styles.sortOptionCheck}>
                                {!activeTag && <Check size={14} />}
                            </span>
                            <span>All tags</span>
                        </button>
                        {tags.map((t) => {
                            const active = activeTag === t;
                            return (
                                <button
                                    key={t}
                                    type="button"
                                    className={styles.sortOption}
                                    onClick={() => onTagPick(t)}
                                >
                                    <span className={styles.sortOptionCheck}>
                                        {active && <Check size={14} />}
                                    </span>
                                    <span>{t}</span>
                                </button>
                            );
                        })}
                    </div>
                    <div className={styles.filterMenuDivider} />
                </>
            )}

            <div className={styles.menuSectionTitle}>Sort by</div>
            {SORT_OPTIONS.map((opt) => {
                const active = sortKey === opt.key;
                return (
                    <button
                        key={opt.key}
                        type="button"
                        className={styles.sortOption}
                        onClick={() => onSortPick(opt.key)}
                    >
                        <span className={styles.sortOptionCheck}>
                            {active && <Check size={14} />}
                        </span>
                        <span>{opt.label}</span>
                    </button>
                );
            })}
        </div>,
        document.body
    );
};

export default ListsIndex;
