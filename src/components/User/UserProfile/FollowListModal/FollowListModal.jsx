import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import ReactDOM from "react-dom";
import { useNavigate } from "react-router-dom";
import { FiX } from "react-icons/fi";
import { fetchUserFollowers, fetchUserFollowing } from "../../../../services/FetchUser";
import Image from "../../../Utils/Images/Image/Image";
import useScrollLock from "../../../../hooks/useScrollLock";
import useInfiniteScroll from "../../../../hooks/useInfiniteScroll";
import styles from "./FollowListModal.module.css";

const CLOSE_DURATION = 250;
const PAGE_SIZE = 20;

const TABS = [
    { key: "followers", label: "Followers" },
    { key: "following", label: "Following" },
    { key: "friends", label: "Friends" },
];

const extractPayload = (res, key) => {
    const payload = res?.data ?? res;
    const list =
        payload?.[key] ||
        payload?.users ||
        (Array.isArray(payload) ? payload : []);
    const pagination = payload?.pagination || {};
    return {
        items: Array.isArray(list) ? list : [],
        hasNextPage: !!pagination.hasNextPage,
        page: pagination.page || 1,
    };
};

const initialTabState = { items: [], page: 0, hasMore: true, loading: false };

const FollowListModal = ({ user, type, onClose }) => {
    const navigate = useNavigate();
    const [isClosing, setIsClosing] = useState(false);
    const [activeTab, setActiveTab] = useState(
        type === "following" ? "following" : type === "friends" ? "friends" : "followers"
    );
    const [followers, setFollowers] = useState(initialTabState);
    const [following, setFollowing] = useState(initialTabState);
    const [initialLoading, setInitialLoading] = useState(true);
    useScrollLock();

    const requestedRef = useRef({ followers: new Set(), following: new Set() });

    const closeModal = useCallback(() => {
        setIsClosing(true);
        setTimeout(() => onClose(), CLOSE_DURATION);
    }, [onClose]);

    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === "Escape") closeModal();
        };
        window.addEventListener("keydown", handleEsc);
        return () => window.removeEventListener("keydown", handleEsc);
    }, [closeModal]);

    const fetchPage = useCallback(
        async (which, page) => {
            if (!user?._id) return;
            const reqSet = requestedRef.current[which];
            if (reqSet.has(page)) return;
            reqSet.add(page);

            const setter = which === "followers" ? setFollowers : setFollowing;
            const fetcher = which === "followers" ? fetchUserFollowers : fetchUserFollowing;

            setter((prev) => ({ ...prev, loading: true }));
            try {
                const res = await fetcher(user._id, page, PAGE_SIZE);
                const { items, hasNextPage } = extractPayload(res, which);
                setter((prev) => ({
                    items: page === 1 ? items : [...prev.items, ...items],
                    page,
                    hasMore: hasNextPage,
                    loading: false,
                }));
            } catch {
                reqSet.delete(page);
                setter((prev) => ({ ...prev, loading: false }));
            }
        },
        [user]
    );

    useEffect(() => {
        if (!user?._id) return;
        requestedRef.current = { followers: new Set(), following: new Set() };
        setFollowers(initialTabState);
        setFollowing(initialTabState);
        setInitialLoading(true);
        Promise.all([fetchPage("followers", 1), fetchPage("following", 1)]).finally(() =>
            setInitialLoading(false)
        );
    }, [user, fetchPage]);

    const friends = useMemo(() => {
        const followingIds = new Set(following.items.map((u) => u._id));
        return followers.items.filter((u) => followingIds.has(u._id));
    }, [followers.items, following.items]);

    const counts = {
        followers: followers.items.length,
        following: following.items.length,
        friends: friends.length,
    };

    const list =
        activeTab === "followers" ? followers.items :
        activeTab === "following" ? following.items :
        friends;

    const tabHasMore =
        activeTab === "followers" ? followers.hasMore :
        activeTab === "following" ? following.hasMore :
        followers.hasMore || following.hasMore;

    const tabLoading =
        activeTab === "followers" ? followers.loading :
        activeTab === "following" ? following.loading :
        followers.loading || following.loading;

    const loadMore = useCallback(() => {
        if (activeTab === "followers" && followers.hasMore && !followers.loading) {
            fetchPage("followers", followers.page + 1);
        } else if (activeTab === "following" && following.hasMore && !following.loading) {
            fetchPage("following", following.page + 1);
        } else if (activeTab === "friends") {
            if (followers.hasMore && !followers.loading) fetchPage("followers", followers.page + 1);
            if (following.hasMore && !following.loading) fetchPage("following", following.page + 1);
        }
    }, [activeTab, followers, following, fetchPage]);

    const { lastElementRef } = useInfiniteScroll(loadMore, tabHasMore, tabLoading, 150);

    const emptyMsg =
        activeTab === "followers" ? "No followers yet." :
        activeTab === "following" ? "Not following anyone yet." :
        "No mutual friends.";

    const handleUserClick = (username) => {
        closeModal();
        setTimeout(() => navigate(`/${username}`), CLOSE_DURATION);
    };

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
                        <div className={styles.headerAvatar}>
                            <Image
                                src={user?.userimage}
                                name={user?.name || user?.username}
                                size={40}
                                showBadge={false}
                            />
                        </div>
                        <div className={styles.headerInfo}>
                            <h3 className={styles.headerTitle}>{user?.name || user?.username}</h3>
                            <span className={styles.headerSub}>{user?.username}</span>
                        </div>
                    </div>
                    <button className={styles.closeButton} onClick={closeModal}>
                        <FiX size={20} />
                    </button>
                </div>

                <div className={styles.tabs} role="tablist">
                    {TABS.map((tab) => (
                        <button
                            key={tab.key}
                            role="tab"
                            aria-selected={activeTab === tab.key}
                            className={`${styles.tab} ${activeTab === tab.key ? styles.tabActive : ""}`}
                            onClick={() => setActiveTab(tab.key)}
                        >
                            <span className={styles.tabLabel}>
                                {!initialLoading && (
                                    <span className={styles.tabCount}>{counts[tab.key]}</span>
                                )}
                                {tab.label}
                            </span>
                        </button>
                    ))}
                </div>

                <div className={styles.body}>
                    {initialLoading ? (
                        <div className={styles.loading}>
                            <span className={styles.empty}>Loading…</span>
                        </div>
                    ) : list.length === 0 ? (
                        <div className={styles.empty}>{emptyMsg}</div>
                    ) : (
                        <>
                            {list.map((u, idx) => {
                                const isLast = idx === list.length - 1;
                                return (
                                    <div
                                        key={u._id || u.id}
                                        ref={isLast && tabHasMore ? lastElementRef : null}
                                        className={styles.userRow}
                                        onClick={() => handleUserClick(u.username)}
                                    >
                                        <Image
                                            src={u?.userimage || u?.image || u?.userImage}
                                            name={u?.username}
                                            userId={u?._id || u?.id}
                                            status={u?.status}
                                            size={48}
                                        />
                                        <div className={styles.userRowInfo}>
                                            <span className={styles.userRowName}>
                                                {u.name || u.username}
                                            </span>
                                            {u.username && (
                                                <span className={styles.userRowHandle}>
                                                    {u.username}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                            {tabLoading && (
                                <div className={styles.loading}>
                                    <span className={styles.empty}>Loading…</span>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );

    return ReactDOM.createPortal(content, document.body);
};

export default FollowListModal;
