import React, { useEffect, useState, useContext } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { fetchUserLists } from "../../../services/FetchList";
import RelatedLists from "../../Track/TrackProfile/RelatedLists/RelatedLists";
import ActivityList from "../../Activity/ActivityList/ActivityList";
import SectionHeader from "../../Utils/SectionHeader/SectionHeader";
import { formatReviewActivity } from "../../../utils/formatters/textFormatters";
import EmptyState from "../../Utils/EmptyState/EmptyState";
import EmptyShelfIcon from "../../Icons/EmptyShelfIcon/EmptyShelfIcon";
import UserSidebarCard from "./UserSidebarCard/UserSidebarCard";
import { UserLoggedContext } from "../../../contexts/UserLoggedContext";
import { useLogContainerContext } from "../../../contexts/LogContainerContext";
import friendsStyles from "../../../pages/Home/FriendsActivity/FriendsActivity.module.css";
import styles from "./UserProfile.module.css";

const Overview = () => {
    const { user } = useOutletContext();
    const { userLogged } = useContext(UserLoggedContext);
    const { setShowLogContainer } = useLogContainerContext();
    const [userLists, setUserLists] = useState([]);

    useEffect(() => {
        if (!user?.username) return;
        fetchUserLists(user.username)
            .then((data) => setUserLists(Array.isArray(data) ? data : []))
            .catch(() => setUserLists([]));
    }, [user?.username]);

    const featuredLists = [...userLists]
        .sort((a, b) => (b.likeCount || 0) - (a.likeCount || 0))
        .slice(0, 3)
        .map((list) => {
            const existing = (list.owner && typeof list.owner === "object" && list.owner.username)
                ? list.owner
                : (list.user && typeof list.user === "object" && list.user.username)
                    ? list.user
                    : null;
            return {
                ...list,
                owner: existing || {
                    _id: user._id,
                    username: user.username,
                    name: user.name,
                    userimage: user.userimage,
                },
            };
        });

    const recentActivities = (user?.userLogs || [])
        .slice(0, 3)
        .map((log) =>
            formatReviewActivity({
                ...log,
                user: log.user || {
                    _id: user?._id,
                    username: user?.username,
                    name: user?.name,
                    userimage: user?.userimage,
                },
            })
        );

    const isOwnProfile = userLogged?.username === user?.username;
    const isEmpty = recentActivities.length === 0 && featuredLists.length === 0;

    return (
        <div className={styles.layout}>
            <div className={styles.main}>
                {isEmpty && (
                    <div className={friendsStyles.section}>
                        <div className={styles.emptyOverview}>
                            <EmptyState
                                customIcon={<EmptyShelfIcon className={styles.emptyOverviewIcon} />}
                                title={isOwnProfile ? "No tracks logged yet" : "Nothing here yet"}
                                message={
                                    isOwnProfile
                                        ? "Log your first track to start your music journal. Your reviews and lists will show up here."
                                        : `Once ${user?.name || user?.username} starts logging tracks, you'll see their activity here.`
                                }
                                actionLabel={isOwnProfile ? "Log a track" : undefined}
                                onAction={isOwnProfile ? () => setShowLogContainer(true) : undefined}
                            />
                        </div>
                    </div>
                )}
                {recentActivities.length > 0 && (
                    <div className={friendsStyles.section}>
                        <SectionHeader
                            title="Recent Activity"
                            className={styles.marginBottom}
                            action={
                                <Link to={`/${user.username}/reviews`} className={friendsStyles.viewAllLink}>
                                    View All
                                </Link>
                            }
                        />
                        <ActivityList activities={recentActivities} hideHeader />
                    </div>
                )}
                {featuredLists.length > 0 && (
                    <RelatedLists
                        lists={featuredLists}
                        title="Featured Lists"
                        viewAllLink={`/${user.username}/lists`}
                        coverSize={100}
                    />
                )}
            </div>

            <UserSidebarCard user={user} />
        </div>
    );
};

export default Overview;
