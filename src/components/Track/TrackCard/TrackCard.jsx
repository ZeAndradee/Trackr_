import React, { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { LogContainerContext } from "../../../contexts/LogContainerContext";
import { UserLoggedContext } from "../../../contexts/UserLoggedContext";
import Image from "../../Utils/Images/Image/Image";
import { getTrackCover } from "../../Utils/Formater/Track";
import { IoMusicalNotes, IoCaretUp, IoCaretDown } from "react-icons/io5";
import { BsFillCircleFill } from "react-icons/bs";
import { HiOutlinePencilAlt } from "react-icons/hi";
import {
  truncateText,
  createTrackSlug,
  createAlbumSlug,
} from "../../../utils/formatters/textFormatters";
import { handleReviewOrLog } from "../../../utils/handlers/trackHandlers";
import { getTrackMonthDay } from "../../../utils/formatters/dateFormatters";
import { RatingTag } from "../../Utils/Tags/Tags";
import { Tooltip, TrackDetailsTooltip } from "../../Utils/Tooltip/Tooltip";
import ArtistList from "../../Utils/ArtistList/ArtistList";
import TrackAlbumTitle from "../../Utils/TrackAlbumTitle/TrackAlbumTitle";
import styles from "./TrackCard.module.css";

const UserInfoSection = ({ track, navigate }) => {
  const handleUserClick = (e) => {
    e.stopPropagation();
    if (track?.user?.username) {
      navigate(`/${track.user.username}`);
    }
  };

  return (
    <div className={styles.userInfoSection}>
      <div className={styles.userInfoLeft} onClick={handleUserClick}>
        <Image
          src={track.user?.userimage || track.user?.image || track.user?.userImage}
          name={track.user?.username}
          userId={track.user?._id || track.user?.id}
          size={36}
          status={track.user?.status}
        />
      </div>
      <div className={styles.userInfoRight}>
        <div className={styles.userInfoTopRow}>
          <span className={styles.userInfoUsername} onClick={handleUserClick}>
            {truncateText(track.user?.username, 16) || "User"}
          </span>
          {track?.rating && <RatingTag rating={track.rating} size="0.64rem" />}
        </div>
        <span className={styles.userInfoDate}>{getTrackMonthDay(track)}</span>
      </div>
    </div>
  );
};

const TrackInfo = ({
  track,
  isHovered,
  handleTrackPage,
  userInfo,
  navigate,
  isSpotifyTrack,
}) => {
  const isAlbum = isSpotifyTrack && track?.type === "album";

  const handleTitleClick = (e) => {
    e.stopPropagation();
    if (!isAlbum) {
      handleTrackPage();
    }
  };

  if (userInfo && track?.user) {
    return <UserInfoSection track={track} navigate={navigate} />;
  }

  return (
    <div
      className={`${styles.trackInfo} ${isHovered ? styles.expandedTrackInfo : ""
        } ${isSpotifyTrack ? styles.trackInfoSpotify : ""}`}
    >
      <div className={styles.trackHeroInfo}>
        <div className={styles.trackMainRow}>
          <div className={styles.trackInfoContainer}>
            <div className={styles.titleRow}>
              <div className={styles.titleWrapper}>
                <Tooltip text={track?.name} followMouse={true}>
                  <TrackAlbumTitle
                    title={track?.name}
                    fontSize="0.9rem"
                    ellipsis
                    as="h3"
                    className={styles.trackTitle}
                    onClick={handleTitleClick}
                  />
                </Tooltip>
              </div>
              {track?.position && (
                <div className={styles.trendingInfo}>
                  <div className={styles.movementContainer}>
                    {track.movement > 0 && (
                      <Tooltip
                        text={`Up ${track.movement} positions`}
                      >
                        <IoCaretUp
                          className={styles.movementIcon}
                          style={{ color: "var(--rating-high)" }}
                        />
                      </Tooltip>
                    )}
                    {track.movement < 0 && (
                      <Tooltip
                        text={`Down ${Math.abs(track.movement)} positions`}
                      >
                        <IoCaretDown
                          className={styles.movementIcon}
                          style={{ color: "var(--rating-low)" }}
                        />
                      </Tooltip>
                    )}
                    {track.movement === 0 && (
                      <Tooltip text="Stable position">
                        <BsFillCircleFill
                          className={styles.stableIcon}
                          style={{ color: "#8d8d8d" }}
                        />
                      </Tooltip>
                    )}
                  </div>
                </div>
              )}
            </div>
            <ArtistList
              artists={track?.artists || []}
              className={styles.trackArtist}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const TrackCard = ({ track, isSpotifyTrack, userInfo, showRank, rank, disableLink }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [optionsVisible, setOptionsVisible] = useState(false);

  const { setShowLogContainer, setSelectedTrack } =
    useContext(LogContainerContext);
  const { userLogged } = useContext(UserLoggedContext);
  const navigate = useNavigate();

  const userId = userLogged?.id;
  const isLogOwner = userId && track?.userId && userId === track.userId;

  const handleTrackPage = () => {
    if (track.type === "album") {
      navigate(createAlbumSlug(track.name, track.artists, track.id));
    } else {
      navigate(createTrackSlug(track.name, track.artists, track.id), {
        state: { trackId: track.id },
      });
    }
  };

  const getCardLinkTo = () => {
    if (isSpotifyTrack && track?.type === "album") {
      return "#";
    }
    const username = track?.username || track?.user?.username;
    const logId = track?.logId || track?.userInteractions?.reviewId;

    if (logId) {
      if (username) {
        return `/${username}/log/${logId}`;
      } else {
        console.warn("Cannot navigate to log: username not found", track);
        return "#";
      }
    }

    if (track.type === "album") {
      return createAlbumSlug(track.name, track.artists, track.id);
    } else {
      return createTrackSlug(track.name, track.artists, track.id);
    }
  };

  const getCardLinkState = () => {
    const logId = track?.logId || track?.userInteractions?.reviewId;
    if (logId) return null;
    if (track.type === "album") return { albumId: track.id };
    return { trackId: track.id };
  };

  const handleAddReview = (e) => {
    handleReviewOrLog(
      e,
      track,
      setOptionsVisible,
      () => { },
      setIsHovered,
      setShowLogContainer,
      setSelectedTrack
    );
  };

  const containerClass = `${styles.cardContainer} ${userInfo ? styles.cardContainerUserInfo : ""}`;

  const Wrapper = disableLink ? 'div' : Link;
  const wrapperProps = disableLink
    ? {
      className: containerClass,
      onMouseEnter: () => setIsHovered(true),
      onMouseLeave: () => { setIsHovered(false); setOptionsVisible(false); },
    }
    : {
      to: getCardLinkTo(),
      state: getCardLinkState(),
      className: containerClass,
      onClick: (e) => {
        if (isSpotifyTrack && track?.type === "album") {
          e.preventDefault();
        }
      },
      onMouseEnter: () => setIsHovered(true),
      onMouseLeave: () => { setIsHovered(false); setOptionsVisible(false); },
    };

  const getTooltipText = () => {
    if (!userInfo) return null;
    const artistName = Array.isArray(track?.artists)
      ? track.artists.map((a) => a.name).filter(Boolean).join(", ")
      : "";
    return `${track?.name}${artistName ? ` — ${artistName}` : ""}`;
  };

  const cardContent = (
    <Wrapper {...wrapperProps}>
      {showRank && rank && (
        <div className={styles.rankOverlay}>
          {rank}
        </div>
      )}

      <Tooltip text={userInfo ? getTooltipText() : null} position="top" disableHover={!userInfo}>
        <div className={styles.trackCover}>
          <Image
            src={getTrackCover(track)}
            alt={track?.name}
            fallbackVariant="cover"
            width="100%"
            height="100%"
            className={styles.coverImage}
            borderLength={isHovered ? "3px" : undefined}
          />

          {optionsVisible && (
            <div
              className={`${styles.extraOverlay} ${styles.visible}`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={styles.overlayOptions}>
                <div className={styles.overlayHeader} />
                <div className={styles.overlayOptionsContent}>
                  <div onClick={handleAddReview} className={styles.overlayOption}>
                    <div className={styles.overlayOptionIcon}>
                      <HiOutlinePencilAlt size={16} />
                    </div>
                    <span>{isLogOwner ? "Edit Log" : "Create Log"}</span>
                  </div>

                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      setOptionsVisible(false);
                    }}
                    className={styles.overlayOption}
                  >
                    <div className={styles.overlayOptionIcon}>
                      <IoMusicalNotes size={16} />
                    </div>
                    <span>View Details</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </Tooltip>

      <TrackInfo
        track={track}
        isHovered={isHovered}
        handleTrackPage={handleTrackPage}
        userInfo={userInfo}
        navigate={navigate}
        isSpotifyTrack={isSpotifyTrack}
      />
      {
        !isSpotifyTrack && !userInfo && (
          <TrackDetailsTooltip track={track} visible={isHovered} />
        )
      }
    </Wrapper>
  );

  return cardContent;
};

export default TrackCard;
