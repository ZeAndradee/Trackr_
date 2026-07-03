import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";

import { checkFollowStatus, followUser, unfollowUser } from "../../../../services/FetchUser";
import { useAuthModal } from "../../../../contexts/AuthModalContext";
import { Button } from "../../../Utils/Buttons/Button";
import Image from "../../../Utils/Images/Image/Image";
import ImageModal from "../../../Utils/HeroItem/ImageModal/ImageModal";
import FollowListModal from "../FollowListModal/FollowListModal";
import styles from "./UserProfileHero.module.css";

const StatItem = ({ label, value, to, onClick }) => {
    const inner = (
        <>
            <span className={styles.statLineValue}>{value ?? 0}</span>
            <span className={styles.statLineLabel}>{label}</span>
        </>
    );
    if (to) {
        return (
            <Link to={to} className={`${styles.statLineItem} ${styles.clickable}`}>
                {inner}
            </Link>
        );
    }
    return (
        <div
            className={`${styles.statLineItem} ${onClick ? styles.clickable : ""}`}
            onClick={onClick}
            role={onClick ? "button" : undefined}
            tabIndex={onClick ? 0 : undefined}
        >
            {inner}
        </div>
    );
};

const UserProfileHero = ({ user, userLogged, badges }) => {
    const navigate = useNavigate();
    const { openModal } = useAuthModal();
    const avatarUrl = user?.userimage;

    const [followModal, setFollowModal] = useState(null);

    const [layerA, setLayerA] = useState(avatarUrl);
    const [layerB, setLayerB] = useState(null);
    const [activeLayer, setActiveLayer] = useState("A");
    const prevBgRef = useRef(avatarUrl);

    const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
    const [isAvatarHovered, setIsAvatarHovered] = useState(false);
    const [isFollowing, setIsFollowing] = useState(false);
    const [followLoading, setFollowLoading] = useState(false);
    const [followStatusResolved, setFollowStatusResolved] = useState(false);
    const [hoveringFollow, setHoveringFollow] = useState(false);

    const isOwnProfile = userLogged && user && userLogged.username === user.username;

    useEffect(() => {
        if (avatarUrl === prevBgRef.current) return;
        prevBgRef.current = avatarUrl;

        if (activeLayer === "A") {
            setLayerB(avatarUrl);
            setActiveLayer("B");
        } else {
            setLayerA(avatarUrl);
            setActiveLayer("A");
        }
    }, [avatarUrl]);

    useEffect(() => {
        if (isOwnProfile) {
            setFollowStatusResolved(true);
            return;
        }
        if (user?._id && userLogged) {
            checkFollowStatus(user._id).then((res) => {
                if (res?.data?.isFollowing !== undefined) {
                    setIsFollowing(res.data.isFollowing);
                }
                setFollowStatusResolved(true);
            });
        } else if (!userLogged) {
            setFollowStatusResolved(true);
        }
    }, [user, userLogged, isOwnProfile]);

    const handleFollowToggle = async () => {
        if (!userLogged) {
            openModal("login", { reason: `Follow ${user.username}` });
            return;
        }
        if (followLoading) return;

        const wasFollowing = isFollowing;
        setIsFollowing(!wasFollowing);
        setFollowLoading(true);

        try {
            if (wasFollowing) {
                await unfollowUser(user._id);
            } else {
                await followUser(user._id);
            }
        } catch {
            setIsFollowing(wasFollowing);
        } finally {
            setFollowLoading(false);
        }
    };

    const reviewsThisYear = user?.yearTotalTracks ?? 0;
    const totalReviews = user?.totalTracks ?? 0;
    const lists = user?.listCount ?? 0;
    const followers = user?.follower_count ?? 0;
    const following = user?.following_count ?? 0;

    const displayName = user?.name;
    const username = user?.username;
    const currentYear = new Date().getFullYear();

    const actionButton = followStatusResolved ? (
        isOwnProfile ? (
            <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/settings/profile`)}
                customPadding="0.35rem 0.8rem"
                customFontSize="0.8rem"
                style={{ background: "var(--dark-bg-color)", borderColor: "var(--dark-border2)", borderRadius: "0.5rem" }}
            >
                Edit profile
            </Button>
        ) : (
            <Button
                variant={isFollowing ? "outline" : "primary"}
                size="sm"
                onClick={handleFollowToggle}
                onMouseEnter={() => isFollowing && setHoveringFollow(true)}
                onMouseLeave={() => setHoveringFollow(false)}
                customPadding="0.35rem 0.8rem"
                customFontSize="0.8rem"
                className={isFollowing ? styles.followingBtn : ""}
                style={isFollowing ? { background: "var(--dark-bg-color)", borderColor: "var(--dark-border2)", borderRadius: "0.5rem" } : { borderRadius: "0.5rem" }}
            >
                {isFollowing ? (hoveringFollow ? "Unfollow" : "Following") : "Follow"}
            </Button>
        )
    ) : null;



    return (
        <>
            <div className={styles.header} data-user-hero>
                <div
                    className={`${styles.headerBackground} ${styles.bgLayer}`}
                    style={{
                        backgroundImage: layerA ? `url(${layerA})` : "none",
                        opacity: activeLayer === "A" ? 1 : 0,
                    }}
                />
                <div
                    className={`${styles.headerBackground} ${styles.bgLayer}`}
                    style={{
                        backgroundImage: layerB ? `url(${layerB})` : "none",
                        opacity: activeLayer === "B" ? 1 : 0,
                    }}
                />

                <div className={styles.headerOverlay}>
                    <div className={styles.headerContent}>
                        <div
                            className={`${styles.avatarWrapper} ${isAvatarHovered && avatarUrl ? styles.avatarHovered : ""}`}
                            onMouseEnter={() => avatarUrl && setIsAvatarHovered(true)}
                            onMouseLeave={() => setIsAvatarHovered(false)}
                        >
                            <Image
                                src={user?.userimage || user?.image || user?.userImage}
                                name={user?.username}
                                userId={user?._id || user?.id}
                                status={user?.status}
                                size={150}
                                onClick={avatarUrl ? () => setIsAvatarModalOpen(true) : undefined}
                            />
                        </div>

                        <div className={styles.info}>
                            <div className={styles.infoLeft}>
                                <div className={styles.textWrapper}>
                                    {badges && <div className={styles.badgeRow}>{badges}</div>}
                                    <div className={styles.nameRow}>
                                        <h1 className={styles.title}>{displayName}</h1>
                                        {actionButton}
                                    </div>
                                    {username && (
                                        <div className={styles.handle}>{username}</div>
                                    )}
                                </div>
                            </div>

                            <div className={styles.infoRight}>
                                <div className={styles.heroRightStats}>
                                    <StatItem
                                        label={`${currentYear} Reviews`}
                                        value={reviewsThisYear}
                                        to={`/${username}/reviews?year=${currentYear}`}
                                    />
                                    <StatItem
                                        label="Reviews"
                                        value={totalReviews}
                                        to={`/${username}/reviews`}
                                    />
                                    <StatItem
                                        label="Lists"
                                        value={lists}
                                        to={`/${username}/lists`}
                                    />
                                    <StatItem
                                        label="Followers"
                                        value={followers}
                                        onClick={() => setFollowModal("followers")}
                                    />
                                    <StatItem
                                        label="Following"
                                        value={following}
                                        onClick={() => setFollowModal("following")}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <ImageModal
                    isOpen={isAvatarModalOpen}
                    onClose={() => setIsAvatarModalOpen(false)}
                    imageUrl={avatarUrl}
                    altText={displayName || username}
                />
            </div>
            {followModal && (
                <FollowListModal
                    user={user}
                    type={followModal}
                    onClose={() => setFollowModal(null)}
                />
            )}
        </>
    );
};

export default UserProfileHero;
