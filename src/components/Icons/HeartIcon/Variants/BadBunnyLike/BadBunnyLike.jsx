import React, { useState, useEffect } from 'react';
import classes from './BadBunnyLike.module.css';
import { RiHeart3Fill, RiHeart3Line } from "react-icons/ri";

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const BadBunnyLike = ({ liked, onClick, className }) => {
    const [isAnimating, setIsAnimating] = useState(false);
    const [localLiked, setLocalLiked] = useState(liked);

    const [showOutline, setShowOutline] = useState(!liked);
    const [showFlag, setShowFlag] = useState(false);
    const [showFilled, setShowFilled] = useState(liked);

    const [outlineClass, setOutlineClass] = useState("");
    const [flagClass, setFlagClass] = useState("");
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
            setShowFlag(false);
            setOutlineClass("");
            setFlagClass("");
            setFilledClass("");
        }
    }, [liked, isAnimating, localLiked]);

    const handleClick = async (e) => {
        e.stopPropagation();
        if (isAnimating) return;

        setIsAnimating(true);
        const newLiked = !localLiked;
        onClick(newLiked);

        if (newLiked) {
            setOutlineClass(classes.animPopOut);
            await wait(250);
            setShowOutline(false);
            setOutlineClass("");

            setShowFlag(true);
            setFlagClass(classes.animPopIn);
            await wait(350);

            setFlagClass(classes.animFlagReveal);
            await wait(1400);

            setFlagClass(classes.animPopOut);
            await wait(250);
            setShowFlag(false);
            setFlagClass("");

            setShowFilled(true);
            setFilledClass(classes.animPopInBounce);
            await wait(500);
            setFilledClass("");
        } else {
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
            {showFlag && (
                <svg viewBox="0 0 24 24" className={`${classes.icon} ${flagClass}`}>
                    <defs>
                        <clipPath id="bb-heart-clip">
                            <path d="M12.001 4.52853C14.35 2.42 17.98 2.49 20.2426 4.75736C22.5053 7.02472 22.5824 10.637 20.4795 12.993L11.9999 21.485L3.52138 12.993C1.41843 10.637 1.49543 7.02472 3.75736 4.75736C6.02157 2.49 9.64519 2.42 12.001 4.52853Z" />
                        </clipPath>
                    </defs>
                    <g clipPath="url(#bb-heart-clip)">
                        <rect x="0" y="0" width="24" height="24" fill="#ED2939" />
                        <rect x="0" y="4" width="24" height="4" fill="#FFFFFF" />
                        <rect x="0" y="12" width="24" height="4" fill="#FFFFFF" />
                        <polygon points="0,0 13,12 0,24" fill="#005BF0" />
                        <g transform="translate(4.5, 11) scale(0.15)">
                            <path d="M 0 -15 L 3.5 -4.5 L 14.2 -4.5 L 5.6 2 L 8.8 12.5 L 0 6.5 L -8.8 12.5 L -5.6 2 L -14.2 -4.5 L -3.5 -4.5 Z" fill="#FFFFFF" />
                        </g>
                    </g>
                </svg>
            )}
            {showFilled && (
                <RiHeart3Fill
                    className={`${classes.icon} ${classes.filled} ${filledClass}`}
                />
            )}
        </div>
    );
};

export default BadBunnyLike;
