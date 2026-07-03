import { useState, useEffect } from "react";
import { useAuthModal } from "../../../contexts/AuthModalContext";
import styles from "./LoginReason.module.css";
import { Button } from "../../Utils/Buttons/Button";
import { RiHeart3Fill, RiUserAddFill, RiStarFill, RiChat1Fill, RiPlayFill } from "react-icons/ri";

const LoginReason = () => {
    const { modalData, switchView } = useAuthModal();

    const [redirecting, setRedirecting] = useState(false);

    useEffect(() => {
        if ((!modalData?.reason || modalData.reason === "default") && !modalData?.message) {
            setRedirecting(true);
            switchView("signup");
        }
    }, [modalData, switchView]);

    const reason = modalData?.reason || "default";

    if (redirecting) return null;

    const contentMap = {
        like: {
            icon: <RiHeart3Fill className={styles.iconLike} />,
            title: "Like a review to share the love.",
            description: "Join Trackr to let authors know you enjoyed their takes.",
        },
        follow: {
            icon: <RiUserAddFill className={styles.iconFollow} />,
            title: "Follow users to see what they share.",
            description: "Sign up for Trackr to never miss their latest reviews.",
        },
        review: {
            icon: <RiStarFill className={styles.iconReview} />,
            title: "Rate and review tracks.",
            description: "Share your thoughts on the music you love.",
        },
        play: {
            icon: <RiPlayFill className={styles.iconReview} />,
            title: "Play and feel the music.",
            description: "Join Trackr to listen to tracks and build your perfect queue.",
        },
        comment: {
            icon: <RiChat1Fill className={styles.iconComment} />,
            title: "Reply to join the conversation.",
            description: "Log in to share your thoughts in the comments.",
        },
        error: {
            icon: <RiUserAddFill className={styles.iconError} />,
            title: "Authentication Issue",
            description: "Please log in to try again.",
        },
        default: {
            icon: <RiUserAddFill className={styles.iconFollow} />,
            title: "Account Required",
            description: "Please log in to continue.",
        },
    };

    const content = contentMap[reason] || contentMap.default;
    const displayTitle = modalData?.title || content.title;
    const displayMessage = modalData?.message || content.description;
    const DisplayIcon = modalData?.customIcon || content.icon;

    return (
        <div className={styles.container}>
            <div className={styles.iconContainer}>{DisplayIcon}</div>
            <h2 className={styles.title}>{displayTitle}</h2>
            <p className={styles.message}>{displayMessage}</p>

            <div className={styles.actions}>
                <Button
                    onClick={() => switchView("signup")}
                    variant="primary"
                    fullWidth
                    size="lg"
                >
                    Sign up
                </Button>
                <Button
                    onClick={() => switchView("login")}
                    variant="secondary"
                    fullWidth
                    size="lg"
                >
                    Log in
                </Button>
            </div>
        </div>
    );
};

export default LoginReason;
