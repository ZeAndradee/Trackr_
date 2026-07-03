import React, { useState, useEffect } from 'react';
import classes from './DefaultLike.module.css';
import { RiHeart3Fill, RiHeart3Line } from "react-icons/ri";

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const DefaultLike = ({ liked, onClick, className }) => {
    const [isAnimating, setIsAnimating] = useState(false);
    const [localLiked, setLocalLiked] = useState(liked);

    const [showOutline, setShowOutline] = useState(!liked);
    const [showFilled, setShowFilled] = useState(liked);

    const [outlineClass, setOutlineClass] = useState("");
    const [filledClass, setFilledClass] = useState("");

    useEffect(() => {
        if (liked !== localLiked && !isAnimating) {
            setLocalLiked(liked);
            if (liked) {
                setShowFilled(true);
                setShowOutline(false);
            } else {
                setShowFilled(false);
                setShowOutline(true);
            }
            setOutlineClass("");
            setFilledClass("");
        }
    }, [liked, isAnimating, localLiked]);

    const handleClick = async (e) => {
        e.stopPropagation();
        if (isAnimating) return;

        setIsAnimating(true);
        const newLiked = !localLiked;
        onClick(newLiked);

        if (newLiked) { // LIKING
            setOutlineClass(classes.animPopOut);
            await wait(250);
            setShowOutline(false);
            setOutlineClass("");

            setShowFilled(true);
            setFilledClass(classes.animPopInBounce);
            await wait(500);
            setFilledClass("");
        } else { // UNLIKING
            setFilledClass(classes.animPopOut);
            await wait(250);
            setShowFilled(false);
            setFilledClass("");

            setShowOutline(true);
            setOutlineClass(classes.animPopInBounce);
            await wait(500);
            setOutlineClass("");
        }
        setLocalLiked(newLiked);
        setIsAnimating(false);
    };

    return (
        <div className={`${classes.heartBtn} ${className || ''}`} onClick={handleClick}>
            {showOutline && (
                <RiHeart3Line
                    className={`${classes.icon} ${classes.outline} ${outlineClass}`}
                />
            )}
            {showFilled && (
                <RiHeart3Fill
                    className={`${classes.icon} ${classes.filled} ${filledClass}`}
                />
            )}
        </div>
    );
};

export default DefaultLike;
