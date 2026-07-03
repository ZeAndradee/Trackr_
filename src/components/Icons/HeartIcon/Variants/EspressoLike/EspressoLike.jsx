import React, { useState, useEffect } from 'react';
import classes from './EspressoLike.module.css';
import { RiHeart3Fill, RiHeart3Line } from "react-icons/ri";

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const EspressoLike = ({ liked, onClick, className }) => {
    const [isAnimating, setIsAnimating] = useState(false);
    const [localLiked, setLocalLiked] = useState(liked);

    const [showOutline, setShowOutline] = useState(!liked);
    const [showMug, setShowMug] = useState(false);
    const [showFilled, setShowFilled] = useState(liked);
    const [mixCoffee, setMixCoffee] = useState(false);

    const [outlineClass, setOutlineClass] = useState("");
    const [mugClass, setMugClass] = useState("");
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
            setShowMug(false);
            setOutlineClass("");
            setMugClass("");
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

            setShowMug(true);
            setMugClass(classes.animPopIn);
            await wait(350);

            setMixCoffee(true);
            await wait(1400);

            setMugClass(classes.animPopOut);
            await wait(250);
            setShowMug(false);
            setMixCoffee(false);
            setMugClass("");

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
            {showMug && (
                <svg viewBox="0 0 100 100" className={`${classes.iconMug} ${mugClass}`}>
                    <path d="M 75 38 C 96 38 96 62 75 62" fill="none" stroke="rgba(0,0,0,0.25)" strokeWidth="12" strokeLinecap="round" transform="translate(2, 4)" />
                    <path d="M 75 38 C 94 38 94 62 75 62" fill="none" stroke="#E2E8F0" strokeWidth="12" strokeLinecap="round" transform="translate(0, 2)" />
                    <path d="M 75 38 C 92 38 92 62 75 62" fill="none" stroke="#F8FAFC" strokeWidth="7" strokeLinecap="round" />
                    <circle cx="50" cy="50" r="36" fill="#F8FAFC" />
                    <circle cx="50" cy="50" r="32" fill="#E2E8F0" />
                    <clipPath id="coffeeClip">
                        <circle cx="50" cy="50" r="31" />
                    </clipPath>
                    <g clipPath="url(#coffeeClip)">
                        <circle cx="50" cy="50" r="31" fill="#914D24" className={mixCoffee ? classes.animMixCoffee : ""} />
                        <g style={{ transformOrigin: '50px 50px' }} className={mixCoffee ? classes.animSpinArt : ""}>
                            <path d="M 38 38 H 62 V 46 H 54 V 63 H 46 V 46 H 38 Z" fill="#FFFFFF" opacity="0.95" />
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

export default EspressoLike;
