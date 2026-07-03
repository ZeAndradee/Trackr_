import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import styles from "./HeroItem.module.css";
import Image from "../Images/Image/Image";
import { RatingTag } from "../Tags/Tags";
import { Tooltip } from "../Tooltip/Tooltip";
import TrackAlbumTitle from "../TrackAlbumTitle/TrackAlbumTitle";
import ImageModal from "./ImageModal/ImageModal";
import { getAverageColor } from "../../../utils/color/getAverageColor";
import { useRelativeColor } from "../../../contexts/RelativeColorContext";
import { setImageResolution } from "../../../utils/handlers/image";

const HeroItem = ({
    coverUrl,
    title,
    subtitle,
    type,
    releaseYear,
    stats,
    actions,
    onImageClick,
    onTitleClick,
    imageTo,
    imageState,
    titleTo,
    titleState,
    children,
    textWrapperStyle,
    coverWrapperClassName,
    headerContentStyle,
    textWrapperClassName,
    headerContentClassName,
    infoClassName,
    stackedCovers,
    showCoverCard,
    totalTracks,
    userRating,
    userLogUrl,
    ratingTooltip,
    typeBadge,
    coverClassName,
    dataAttribute,
    bgResolution = 2000,
}) => {

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [bgLoaded, setBgLoaded] = useState(false);
    const { setBgLight, setBgUrl, registerBgRef } = useRelativeColor();
    const bgElRef = useRef(null);

    const bgUrl = setImageResolution(coverUrl, bgResolution) || coverUrl;

    useEffect(() => {
        setBgLoaded(false);
        setBgUrl(bgUrl || null);
        registerBgRef(bgElRef.current);
        if (!bgUrl) {
            setBgLight(false);
            return;
        }
        let cancelled = false;
        const preload = new window.Image();
        preload.onload = () => {
            if (!cancelled) setBgLoaded(true);
        };
        preload.onerror = () => {
            if (!cancelled) setBgLoaded(true);
        };
        preload.src = bgUrl;
        if (preload.complete && preload.naturalWidth > 0) {
            setBgLoaded(true);
        }
        getAverageColor(bgUrl).then((c) => {
            if (cancelled || !c) return;
            const lum = (0.299 * c.r + 0.587 * c.g + 0.114 * c.b) / 255;
            setBgLight(lum > 0.62);
        });
        return () => {
            cancelled = true;
            preload.onload = null;
            preload.onerror = null;
            setBgLight(false);
            setBgUrl(null);
            registerBgRef(null);
        };
    }, [bgUrl, setBgLight, setBgUrl, registerBgRef]);

    return (
        <div className={styles.header} {...dataAttribute}>
            <div
                ref={bgElRef}
                className={`${styles.headerBg} ${bgLoaded ? styles.headerBgLoaded : ""}`}
                style={bgUrl ? { backgroundImage: `url(${bgUrl})` } : {}}
            />
            {bgUrl && !bgLoaded && <div className={styles.headerBgPulse} />}
            <div className={styles.noiseLayer} />

            <div className={styles.headerOverlay}>
                <div
                    className={`${styles.headerContent} ${headerContentClassName || ""}`}
                    style={headerContentStyle}
                >
                    <div
                        className={`${stackedCovers?.length > 0 ? styles.coverStack : styles.coverWrapper} ${coverWrapperClassName || ""}`}
                        onClick={() => {
                            if (showCoverCard) {
                                setIsModalOpen(true);
                            } else if (onImageClick) {
                                onImageClick();
                            }
                        }}
                        style={(onImageClick || imageTo || showCoverCard) ? { cursor: "pointer" } : {}}
                    >
                        {stackedCovers?.length > 0 && stackedCovers.slice(0, 3).map((url, index) => (
                            <Image
                                key={`stack-${index}`}
                                src={url}
                                fallbackVariant="cover"
                                className={`${styles.stackedCover} ${styles[`stackItem${index + 1}`]}`}
                            />
                        ))}
                        {stackedCovers?.length > 0 ? (
                            imageTo ? (
                                <Link to={imageTo} state={imageState} className={styles.mainCover}>
                                    <Image
                                        src={coverUrl}
                                        alt={title}
                                        fallbackVariant="cover"
                                        className={styles.coverImage}
                                        height="100%"
                                        width="100%"
                                    />
                                </Link>
                            ) : (
                                <div className={styles.mainCover}>
                                    <Image
                                        src={coverUrl}
                                        alt={title}
                                        fallbackVariant="cover"
                                        className={styles.coverImage}
                                        height="100%"
                                        width="100%"
                                    />
                                </div>
                            )
                        ) : imageTo ? (
                            <Link to={imageTo} state={imageState}>
                                <Image
                                    src={coverUrl}
                                    alt={title}
                                    fallbackVariant="cover"
                                    className={`${styles.coverImage} ${coverClassName || ""}`}
                                    height="100%"
                                    width="100%"
                                />
                            </Link>
                        ) : (
                            <Image
                                src={coverUrl}
                                alt={title}
                                fallbackVariant="cover"
                                className={`${styles.coverImage} ${coverClassName || ""}`}
                                height="100%"
                                width="100%"
                            />
                        )}
                    </div>

                    <div className={`${styles.info} ${infoClassName || ""}`}>
                        <div className={styles.infoLeft}>
                            <div
                                className={`${styles.textWrapper} ${textWrapperClassName || ""}`}
                                style={textWrapperStyle}
                            >
                                {((type && (type.toLowerCase() !== "album" || totalTracks > 1)) || typeBadge) && (
                                    <div className={styles.typeRow}>
                                        {type && (type.toLowerCase() !== "album" || totalTracks > 1) && (
                                            <span className={styles.type}>{type}</span>
                                        )}
                                        {typeBadge}
                                    </div>
                                )}

                                <div className={styles.titleContainer}>
                                    <TrackAlbumTitle
                                        title={title}
                                        to={titleTo}
                                        state={titleState}
                                        onClick={!titleTo ? onTitleClick : undefined}
                                        hero
                                        minFontSize="1.375rem"
                                        maxChars={700}
                                        className={styles.title}
                                        trailing={userRating > 0 ? (
                                            <Tooltip text={ratingTooltip || "View review"} className={styles.inlineTooltip}>
                                                <RatingTag rating={userRating} size="1rem" to={ratingTooltip ? undefined : userLogUrl} />
                                            </Tooltip>
                                        ) : null}
                                    />
                                </div>

                                {subtitle && <div className={styles.subtitle}>{subtitle}</div>}
                            </div>

                            {children}
                            {actions && (
                                <div className={styles.interactionBar}>
                                    <div className={styles.actions}>{actions}</div>
                                </div>
                            )}
                        </div>

                        {stats && (
                            <div className={styles.infoRight}>
                                <div className={styles.stats}>{stats}</div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {showCoverCard && (
                <ImageModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    imageUrl={coverUrl}
                    altText={title}
                />
            )}
        </div>
    );
};

export default HeroItem;
