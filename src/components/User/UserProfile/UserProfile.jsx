import React, { useEffect, useState, useContext } from "react";
import { useParams, Outlet } from "react-router-dom";
import { fetchUser } from "../../../services/FetchUser";
import { UserLoggedContext } from "../../../contexts/UserLoggedContext";
import UserProfileHero from "./UserProfileHero/UserProfileHero";
import { Tabs } from "../../Utils/Tabs/Tabs";
import ProfileSkeleton from "../../Utils/Skeletons/ProfileSkeleton";
import styles from "./UserProfile.module.css";

const TABS = [
    { key: "overview", label: "Overview", to: "", end: true },
    { key: "reviews", label: "Reviews", to: "reviews" },
    { key: "lists", label: "Lists", to: "lists" },
];

const UserProfile = ({ initialUser = null }) => {
    const { username } = useParams();
    const { userLogged } = useContext(UserLoggedContext);
    const [user, setUser] = useState(initialUser);
    const [loading, setLoading] = useState(
        !initialUser || initialUser.username !== username
    );

    useEffect(() => {
        if (!username) return;
        if (initialUser && initialUser.username === username) {
            setUser(initialUser);
            setLoading(false);
            return;
        }
        let active = true;
        setLoading(true);
        fetchUser({ username }).then((data) => {
            if (!active) return;
            setUser(data);
            setLoading(false);
        });
        return () => {
            active = false;
        };
    }, [username, initialUser]);

    if (loading || !user) return <ProfileSkeleton />;

    return (
        <div className={styles.container}>
            <UserProfileHero user={user} userLogged={userLogged} />

            <Tabs items={TABS} />

            <div className={styles.contentContainer}>
                <Outlet context={{ user }} />
            </div>
        </div>
    );
};

export default UserProfile;
