import React, { useEffect, useState } from "react";
import { RiHeart3Fill, RiHeart3Line } from "react-icons/ri";
import { FaHeadphones, FaList } from "react-icons/fa";
import styles from "./ReviewButtons.module.css";

const ReviewButtons = ({
    track,
    onLikedChange,
    onListenedChange,
    listenedProp,
    liked: likedProp,
}) => {
    const [liked, setLiked] = useState(false);
    const [listened, setListened] = useState(false);

    useEffect(() => {
        if (track) {
            setLiked(likedProp !== undefined ? likedProp : track.liked || false);
            setListened(listenedProp);
        }
    }, [track, listenedProp, likedProp]);

    useEffect(() => {
        setListened(listenedProp);
    }, [listenedProp]);

    useEffect(() => {
        if (likedProp !== undefined) {
            setLiked(likedProp);
        }
    }, [likedProp]);

    const handleLikeClick = () => {
        const newLikedState = !liked;
        setLiked(newLikedState);
        if (onLikedChange) {
            onLikedChange(newLikedState);
        }
    };

    const handleListenClick = () => {
        const newListenedState = !listened;
        setListened(newListenedState);
        if (onListenedChange) {
            onListenedChange(newListenedState);
        }
    };

    return (
        <div className={styles.buttonContainer}>
            <button
                className={`${styles.actionButton} ${liked ? styles.active : ""}`}
                onClick={handleLikeClick}
                aria-label={liked ? "Unlike track" : "Like track"}
                title={liked ? "Unlike track" : "Like track"}
            >
                {liked ? (
                    <RiHeart3Fill className={styles.icon} />
                ) : (
                    <RiHeart3Line className={styles.icon} />
                )}
                <span className={styles.buttonLabel}>{liked ? "Liked" : "Like"}</span>
            </button>

            <button
                className={`${styles.actionButton} ${listened ? styles.active : ""}`}
                onClick={handleListenClick}
                aria-label={listened ? "Mark as not listened" : "Mark as listened"}
                title={listened ? "Mark as not listened" : "Mark as listened"}
            >
                <FaHeadphones className={styles.icon} />
                <span className={styles.buttonLabel}>
                    {listened ? "Listened" : "Listen"}
                </span>
            </button>

            <button
                className={styles.actionButton}
                aria-label="Add to playlist"
                title="Add to playlist"
                disabled
            >
                <FaList className={styles.icon} />
                <span className={styles.buttonLabel}>Playlist</span>
            </button>
        </div>
    );
};

export default ReviewButtons;
