import React, { useState, useCallback, useRef, useEffect, useContext } from "react";
import { gsap } from "gsap";
import { useIsomorphicLayoutEffect } from "../../../../hooks/useIsomorphicLayoutEffect";
import { Link, useNavigate } from "react-router-dom";
import { FiMoreHorizontal } from "react-icons/fi";
import { Send, Flag, Calendar, Pencil, UserPlus, UserMinus } from "lucide-react";
import CountryFlag from "../../../Utils/Flag/Flag";
import Image from "../../../Utils/Images/Image/Image";
import { getTrackCover } from "../../../Utils/Formater/Track";
import { createTrackSlug } from "../../../../utils/formatters/textFormatters";
import ActionMenu from "../../../Utils/Dropdown/ActionMenu";
import { Tooltip } from "../../../Utils/Tooltip/Tooltip";
import showToast from "../../../Utils/Toast/Toast";
import useStickyFollowScroll from "../../../../hooks/useStickyFollowScroll";
import { UserLoggedContext } from "../../../../contexts/UserLoggedContext";
import { useAuthModal } from "../../../../contexts/AuthModalContext";
import { checkFollowStatus, followUser, unfollowUser } from "../../../../services/FetchUser";
import styles from "./UserSidebarCard.module.css";

const UserSidebarCard = ({ user, staticPreview = false, showBio = true, showMeta = true, stats = null, sticky = true }) => {
    const navigate = useNavigate();
    const { userLogged } = useContext(UserLoggedContext);
    const { openModal } = useAuthModal();
    const [menuOpen, setMenuOpen] = useState(false);
    const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 });
    const [heroVisible, setHeroVisible] = useState(staticPreview ? false : true);
    const [isFollowing, setIsFollowing] = useState(false);
    const [followLoading, setFollowLoading] = useState(false);
    const sidebarRef = useRef(null);
    const avatarRef = useRef(null);
    const identityRef = useRef(null);
    const didMountRef = useRef(false);
    useStickyFollowScroll(staticPreview || !sticky ? { current: null } : sidebarRef);

    const isOwnProfile = userLogged && user && userLogged.username === user.username;

    useEffect(() => {
        if (staticPreview || isOwnProfile || !user?._id || !userLogged) return;
        checkFollowStatus(user._id).then((res) => {
            if (res?.data?.isFollowing !== undefined) {
                setIsFollowing(res.data.isFollowing);
            }
        });
    }, [user, userLogged, isOwnProfile, staticPreview]);

    const handleFollowToggle = useCallback(async () => {
        if (!userLogged) {
            openModal("login", { reason: `Follow ${user.username}` });
            return;
        }
        if (followLoading) return;
        const wasFollowing = isFollowing;
        setIsFollowing(!wasFollowing);
        setFollowLoading(true);
        try {
            if (wasFollowing) await unfollowUser(user._id);
            else await followUser(user._id);
        } catch {
            setIsFollowing(wasFollowing);
        } finally {
            setFollowLoading(false);
        }
    }, [userLogged, followLoading, isFollowing, user, openModal]);

    const handleEditProfile = useCallback(() => {
        navigate("/settings/profile");
    }, [navigate]);

    const hasCustomBanner = !!user.userbanner;
    const showBanner = hasCustomBanner || !heroVisible;
    const bannerBg = hasCustomBanner ? user.userbanner : user.userimage || null;
    const bannerIsFromAvatar = !hasCustomBanner;

    useIsomorphicLayoutEffect(() => {
        const avatar = avatarRef.current;
        const identity = identityRef.current;
        if (!avatar || !identity) return;

        const show = !heroVisible;
        const shownState = {
            width: 96,
            height: 96,
            marginRight: 14,
            scale: 1,
            opacity: 1,
            identityMarginTop: -64,
        };
        const hiddenState = {
            width: 0,
            height: 0,
            marginRight: 0,
            scale: 0.6,
            opacity: 0,
            identityMarginTop: 0,
        };
        const target = show ? shownState : hiddenState;

        if (!didMountRef.current) {
            didMountRef.current = true;
            gsap.set(avatar, { width: target.width, height: target.height, marginRight: target.marginRight, scale: target.scale, opacity: target.opacity });
            gsap.set(identity, { marginTop: target.identityMarginTop });
            return;
        }

        gsap.to(avatar, {
            width: target.width,
            height: target.height,
            marginRight: target.marginRight,
            scale: target.scale,
            opacity: target.opacity,
            duration: 0.45,
            ease: "power3.out",
        });
        gsap.to(identity, {
            marginTop: target.identityMarginTop,
            duration: 0.45,
            ease: "power3.out",
        });
    }, [heroVisible]);

    useEffect(() => {
        if (staticPreview) return;
        const hero = document.querySelector("[data-user-hero]");
        if (!hero) return;
        const observer = new IntersectionObserver(
            ([entry]) => setHeroVisible(entry.isIntersecting),
            { threshold: 0 }
        );
        observer.observe(hero);
        return () => observer.disconnect();
    }, [staticPreview]);

    const handleMenuClick = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        const rect = e.currentTarget.getBoundingClientRect();
        setMenuPosition({
            top: rect.bottom + 8,
            right: window.innerWidth - rect.right,
        });
        setMenuOpen((prev) => !prev);
    }, []);

    const handleShare = useCallback(() => {
        navigator.clipboard.writeText(window.location.href);
        showToast("Link copied to clipboard", "success");
    }, []);

    return (
        <aside ref={sidebarRef} className={`${styles.sidebar} ${staticPreview || !sticky ? styles.sidebarStatic : ""}`}>
            <button
                className={styles.sidebarMoreButton}
                onClick={handleMenuClick}
                aria-label="More options"
            >
                <FiMoreHorizontal size={18} />
            </button>
            {menuOpen && (
                <ActionMenu
                    items={[
                        ...(isOwnProfile
                            ? [{ label: "Edit profile", icon: <Pencil size={18} />, onClick: handleEditProfile }]
                            : [{
                                label: isFollowing ? "Unfollow" : "Follow",
                                icon: isFollowing ? <UserMinus size={18} /> : <UserPlus size={18} />,
                                onClick: handleFollowToggle,
                            }]),
                        { label: "Share profile", icon: <Send size={18} />, onClick: handleShare },
                        ...(isOwnProfile
                            ? []
                            : [{ label: "Report user", icon: <Flag size={18} />, onClick: () => showToast("User reported. Thank you.", "success"), section: "danger" }]),
                    ]}
                    onClose={() => setMenuOpen(false)}
                    position={menuPosition}
                    anchor="top-right"
                />
            )}

            {showBanner && (
                <div className={`${styles.banner} ${bannerIsFromAvatar ? styles.bannerAmbient : ""} ${!bannerBg ? styles.bannerEmpty : ""}`}>
                    {bannerBg && (
                        <div
                            className={`${styles.bannerImage} ${bannerIsFromAvatar ? styles.bannerImageBlur : ""}`}
                            style={{ backgroundImage: `url(${bannerBg})` }}
                        />
                    )}
                    {bannerBg && <div className={styles.bannerNoise} />}
                </div>
            )}

            <div ref={identityRef} className={`${styles.identity} ${heroVisible ? styles.identityCompact : ""}`}>
                <div ref={avatarRef} className={styles.sidebarAvatar}>
                    <Image
                        src={user.userimage}
                        name={user.name || user.username}
                        size={96}
                        showBadge={false}
                    />
                </div>
                <div className={styles.identityText}>
                    <Tooltip text={user.username}>
                        <span className={styles.sidebarDisplayName}>{user.name}</span>
                    </Tooltip>
                    <span className={styles.sidebarHandle}>{user.username}</span>
                </div>
            </div>

            {showBio && user.bio && <p className={styles.sidebarBio}>{user.bio}</p>}

            {showMeta && (user.location || user.joinDate) && (
                <div className={styles.sidebarMeta}>
                    {user.location && (
                        <div className={styles.sidebarMetaItem}>
                            <CountryFlag country={user.location} size={14} showTooltip={false} />
                            <span>{user.location}</span>
                        </div>
                    )}
                    {user.joinDate && (
                        <div className={styles.sidebarMetaItem}>
                            <Calendar size={14} strokeWidth={2} />
                            <span>Joined {user.joinDate}</span>
                        </div>
                    )}
                </div>
            )}

            {stats && (
                <div className={styles.statsGrid}>
                    {stats.map((stat) => (
                        <div key={stat.label} className={styles.statItem}>
                            <span className={styles.statValue}>{stat.value}</span>
                            <span className={styles.statLabel}>{stat.label}</span>
                        </div>
                    ))}
                </div>
            )}

            {user.favorite_tracks?.some((t) => t !== null) && (
                <div className={styles.favoriteTracks}>
                    <span className={styles.favoriteTracksTitle}>Favorite tracks</span>
                    <div className={styles.favoriteTracksGrid}>
                        {user.favorite_tracks.slice(0, 4).filter((t) => t !== null).map((track) => {
                            const slug = createTrackSlug(track.name, track.artists || [], track.trackId);
                            return (
                                <Tooltip key={track.trackId} text={track.name} position="bottom">
                                    <Link to={slug} className={styles.favoriteTrackCover}>
                                        <Image src={getTrackCover(track)} alt={track?.name} fallbackVariant="cover" width="100%" height="100%" borderLength="2px" />
                                    </Link>
                                </Tooltip>
                            );
                        })}
                    </div>
                </div>
            )}
        </aside>
    );
};

export default UserSidebarCard;
