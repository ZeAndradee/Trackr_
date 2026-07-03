import React, {
  useEffect,
  useState,
  forwardRef,
  useRef,
} from "react";
import ReactDOM from "react-dom";
import { useIsomorphicLayoutEffect } from "../../../hooks/useIsomorphicLayoutEffect";
import {
  FaCheck,
  FaTimes,
} from "react-icons/fa";
import { FiMaximize2, FiMinimize2 } from "react-icons/fi";
import { FaRegCalendar } from "react-icons/fa6";
import { HiGif } from "react-icons/hi2"
import { HeartIcon } from "../../Icons/HeartIcon/HeartIcon";
import classes from "./TrackReviewModal.module.css";
import { createLog, updateLog, fetchLog } from "../../../services/HandleLogs";
import { fetchTrack } from "../../../services/FetchTrack";
import { useUserContext } from "../../../contexts/UserContext";
import { useLogContainerContext } from "../../../contexts/LogContainerContext";
import { useAuthModal } from "../../../contexts/AuthModalContext";
import { createTrackSlug, createAlbumSlug, parseReviewContent } from "../../../utils/formatters/textFormatters";
import GifPicker from "../GifPicker/GifPicker";
import { useNavigate, Link } from "react-router-dom";
import useScrollLock from "../../../hooks/useScrollLock";
import CompactCalendar from "../../Utils/Calendar/CompactCalendar/CompactCalendar";
import { RatingComponent } from "../../Review/RatingStar/RatingStar";
import Image from "../../Utils/Images/Image/Image";
import { getTrackCover } from "../../Utils/Formater/Track";
import ArtistList from "../../Utils/ArtistList/ArtistList";
import TrackAlbumTitle from "../../Utils/TrackAlbumTitle/TrackAlbumTitle";
import { TextArea } from "../../Utils/Inputs/Inputs";
import { Button } from "../../Utils/Buttons/Button";
import showToast, { showUnsavedChangesToast, dismissUnsavedChangesToast } from "../../Utils/Toast/Toast";

const TrackReviewModal = forwardRef(
  (
    {
      trackId,
      reviewId,
      onClose,
      rating = 0,
      liked = false,
      listened = true,
      activeAction = null,
    },
    ref
  ) => {
    const isEditMode = !!reviewId;
    const { setShowLogContainer } = useLogContainerContext();
    const { openModal } = useAuthModal();

    const [track, setTrack] = useState(null);
    const [isLoadingData, setIsLoadingData] = useState(true);

    const [todayDate, setTodayDate] = useState(new Date());
    const [showCalendar, setShowCalendar] = useState(false);
    const [localListened, setLocalListened] = useState(true);
    const [localRating, setLocalRating] = useState(0);
    const [comment, setComment] = useState("");
    const [localLiked, setLocalLiked] = useState(false);
    const [selectedGif, setSelectedGif] = useState(null);
    const [showGifPicker, setShowGifPicker] = useState(false);
    const [canShiftModal, setCanShiftModal] = useState(false);

    const [initialState, setInitialState] = useState({
      liked: false,
      rating: 0,
      comment: "",
      gifUrl: null,
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [sendSuccess, setSendSuccess] = useState(false);
    const [imageError, setImageError] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const [calendarPosition, setCalendarPosition] = useState({
      top: 0,
      left: 0,
    });

    useEffect(() => {
      let isMounted = true;
      const loadData = async () => {
        setIsLoadingData(true);
        try {
          if (reviewId) {
            const response = await fetchLog(reviewId);
            const logDetails = response?.data || response;
            if (logDetails && isMounted) {
              const fetchedLiked = logDetails.liked !== undefined ? logDetails.liked : false;
              const fetchedListened = logDetails.listened !== undefined ? logDetails.listened : true;
              const fetchedRating = logDetails.rating !== undefined ? logDetails.rating : 0;
              const rawComment = logDetails.review || logDetails.notes || "";
              const { text: fetchedComment, gifUrl: fetchedGif } = parseReviewContent(rawComment);

              setLocalLiked(fetchedLiked);
              setLocalListened(fetchedListened);
              setLocalRating(fetchedRating);
              setComment(fetchedComment);
              if (fetchedGif) setSelectedGif({ id: null, url: fetchedGif, preview: fetchedGif });
              setInitialState({ liked: fetchedLiked, rating: fetchedRating, comment: fetchedComment, gifUrl: fetchedGif || null });

              const fetchedDate = logDetails.selectedDate || logDetails.createdAt || logDetails.date;
              if (fetchedDate) {
                setTodayDate(new Date(fetchedDate));
              }
              const fetchedArtists = logDetails.artists ? logDetails.artists : [];
              setTrack({
                id: logDetails.trackId || logDetails.albumId || logDetails.track?.id || logDetails.album?.id,
                name: logDetails.type === "album" ? (logDetails.album?.name || logDetails.name) : (logDetails.track?.name || logDetails.name),
                artists: fetchedArtists,
                albumName: logDetails.albumName || logDetails.album?.name,
                album: logDetails.album,
                releaseYear: logDetails.releaseYear || logDetails.releaseDate?.split("-")[0] || logDetails.year,
                coverUrl: logDetails.coverUrl || logDetails.images?.[0]?.url,
                albumId: logDetails.albumId || logDetails.album?.id,
              });
            }
          } else if (trackId) {
            const data = await fetchTrack(trackId);
            if (data && isMounted) {
              setTrack(data);

              const pendingActive = data._activeAction || activeAction;
              const initialLikedCalc = pendingActive === "liked" ? (data._pendingLiked !== undefined ? data._pendingLiked : liked) : (data.userInteractions?.liked || liked);
              const initialListenedCalc = pendingActive === "listened" ? (data._pendingListened !== undefined ? data._pendingListened : listened) : (data.userInteractions?.listened || listened || true);
              const initialRatingCalc = pendingActive === "rating" ? (data._pendingRating !== undefined ? data._pendingRating : rating) : (data.userInteractions?.rating || rating || 0);

              setLocalLiked(initialLikedCalc);
              setLocalListened(initialListenedCalc);
              setLocalRating(initialRatingCalc);
              setInitialState({ liked: initialLikedCalc, rating: initialRatingCalc, comment: "", gifUrl: null });
            }
          }
        } catch (err) {
          console.error("Failed to load data for review modal", err);
        } finally {
          if (isMounted) setIsLoadingData(false);
        }
      };

      loadData();
      return () => { isMounted = false; };
    }, [reviewId, trackId, activeAction, liked, listened, rating]);

    const { userLogged } = useUserContext();
    const dateButtonRef = useRef(null);

    useScrollLock();

    useEffect(() => {
      const handleClickOutside = (event) => {
        if (!showCalendar) return;
        if (
          dateButtonRef.current &&
          dateButtonRef.current.contains(event.target)
        ) {
          return;
        }

        const cal = document.getElementById("compact-calendar-wrapper");
        if (cal && cal.contains(event.target)) {
          return;
        }

        setShowCalendar(false);
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [showCalendar]);

    const reviewTextareaRef = useRef(null);
    const reviewCardRef = useRef(null);
    const gifButtonRef = useRef(null);

    useEffect(() => {
      const checkWidth = () => {
        setCanShiftModal(window.innerWidth >= 1100);
      };
      checkWidth();
      window.addEventListener("resize", checkWidth);
      return () => window.removeEventListener("resize", checkWidth);
    }, []);

    useIsomorphicLayoutEffect(() => {
      const el = reviewTextareaRef.current;
      if (!el || expanded) return;
      if (selectedGif) {
        el.style.height = 'auto';
        el.style.height = `${Math.min(el.scrollHeight, 170)}px`;
      } else {
        el.style.height = '';
      }
    }, [comment, selectedGif, expanded]);



    const handleClose = (forceClose = false) => {
      const isDirty =
        comment !== initialState.comment ||
        localRating !== initialState.rating ||
        localLiked !== initialState.liked ||
        (selectedGif?.url || null) !== (initialState.gifUrl || null);
      if (!forceClose && isDirty && !sendSuccess) {
        showUnsavedChangesToast({
          onSave: () => handleReviewSubmit(),
          onDiscard: () => {
            if (typeof onClose === "function") {
              onClose();
            } else {
              setShowLogContainer(false);
            }
          },
        });
        return;
      }
      if (typeof onClose === "function") {
        onClose();
      } else {
        setShowLogContainer(false);
      }
    };

    const handleReviewSubmit = async () => {
      dismissUnsavedChangesToast();
      if (!userLogged) {
        handleClose(true);
        openModal("login-reason", { reason: "review" });
        return;
      }

      if (!track || !track.id) {
        showToast("Cannot review this track. Missing track data.", "error");
        return;
      }

      setIsSubmitting(true);

      try {
        const logData = {
          track_id: track.id,
          name: track.name,
          rating: localRating,
          comment: comment + (selectedGif ? `[gif:${selectedGif.url}]` : ""),
          selected_date: todayDate.toISOString(),
          liked: localLiked,
          listened: localListened,
          coverUrl: getCoverImageUrl(),
        };

        if (isEditMode && reviewId) {
          await updateLog(reviewId, logData);
        } else {
          await createLog(logData);
        }

        setSendSuccess(true);
        showToast(isEditMode ? "Review updated!" : "Added to your reviews!", "success");

        setTimeout(() => {
          handleClose(true);
          if (!isEditMode) {
            window.dispatchEvent(
              new CustomEvent("logCreated", { detail: logData })
            );
          }
          window.dispatchEvent(new CustomEvent("reviewUpdated"));
        }, 1000);
      } catch (error) {
        showToast("An error occurred while submitting a review", "error");
      } finally {
        setIsSubmitting(false);
      }
    };

    const handleOverlayClick = (e) => {
      if (e.target === e.currentTarget) {
        handleClose();
      }
    };

    const handleCardClick = (e) => {
      e.stopPropagation();
    };

    const handleDateChange = (date) => {
      setTodayDate(date);
      setShowCalendar(false);
    };

    const handleDateClick = (e) => {
      e.stopPropagation();
      if (!showCalendar) {
        const buttonRect = e.currentTarget.getBoundingClientRect();
        setCalendarPosition({
          top: buttonRect.bottom + 8,
          right: window.innerWidth - buttonRect.right,
        });
      }
      setShowCalendar(!showCalendar);
    };

    const getCoverImageUrl = () => {
      if (!track) return null;
      return track.coverUrl || "https://via.placeholder.com/300?text=No+Image";
    };

    const formatDate = (date) => {
      const options = { month: 'short', day: 'numeric', year: 'numeric' };
      return date.toLocaleDateString('en-US', options);
    };

    if (isLoadingData || !track) return null;

    const overlayContent = (
      <div className={classes.overlay} onClick={handleOverlayClick}>
        <div ref={reviewCardRef} className={`${classes.reviewCard} ${expanded ? classes.reviewCardExpanded : ""} ${showGifPicker && canShiftModal ? classes.reviewCardShifted : ""}`} onClick={handleCardClick}>

          {expanded ? (
            <>
              <div className={classes.reviewHeader}>
                <div className={classes.expandedHeaderLeft}>
                  <Image src={getTrackCover(track)} alt={track?.name} fallbackVariant="cover" height="44px" width="44px" className={classes.headerCover} />
                  <div className={classes.expandedHeaderInfo}>
                    <span className={classes.expandedHeaderLabel}>Track Review</span>
                    <TrackAlbumTitle
                      title={track.name}
                      maxChars={200}
                      fontSize="0.95rem"
                      className={classes.expandedHeaderTitle}
                    />
                  </div>
                </div>
                <button
                  className={classes.closeButton}
                  onClick={() => setExpanded(false)}
                  aria-label="Minimize"
                >
                  <FiMinimize2 size={18} />
                </button>
              </div>
              <div className={classes.expandedContent}>
                <div className={classes.expandedTextareaWrapper}>
                  <TextArea
                    ref={reviewTextareaRef}
                    className={classes.expandedTextarea}
                    placeholder="What did you think about this track?"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    maxLength={5000}
                  />
                  {selectedGif && (
                    <div className={classes.gifPreview}>
                      <img
                        src={selectedGif.url}
                        alt="Selected GIF"
                        className={classes.gifPreviewImage}
                        onError={(e) => { e.target.style.display = "none"; }}
                      />
                      <button
                        className={classes.removeGifButton}
                        onClick={() => setSelectedGif(null)}
                        aria-label="Remove GIF"
                        type="button"
                      >
                        x
                      </button>
                    </div>
                  )}
                </div>
                <div className={classes.expandedFooter}>
                  <span className={`${classes.charCounter} ${comment.length >= 4500 ? classes.limitReached : ""}`}>
                    {comment.length}/5000
                  </span>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className={classes.reviewHeader}>
                <h2>{isEditMode ? "Edit Review" : "Review Track"}</h2>
                <button
                  className={classes.closeButton}
                  onClick={() => handleClose()}
                  aria-label="Close review"
                >
                  <FaTimes size={20} />
                </button>
              </div>

              <div className={classes.reviewContent}>
                <div className={classes.trackInfo}>
                  <Link
                    className={classes.coverImageContainer}
                    to={createTrackSlug(track.name, track.artists, track.id)}
                    state={{ trackId: track.id }}
                    onClick={() => handleClose()}
                  >
                    <Image src={getTrackCover(track)} alt={track?.name} fallbackVariant="cover" height="100%" width="100%" borderLength="3px" />
                  </Link>

                  <div className={classes.trackDetails}>
                    <TrackAlbumTitle
                      title={track.name}
                      to={createTrackSlug(track.name, track.artists, track.id)}
                      state={{ trackId: track.id }}
                      onClick={() => handleClose()}
                      fontSize="1.5rem"
                      maxChars={200}
                      as="h3"
                      className={classes.trackName}
                    />
                    <p className={classes.artistName}>
                      <ArtistList artists={track.artists || []} />
                    </p>
                    <span className={classes.albumInfo}>
                      <TrackAlbumTitle
                        title={track.albumName}
                        to={createAlbumSlug(track.albumName, track.album?.artists || track.artists, track.albumId || track.album?.id)}
                        state={{ albumId: track.albumId || track.album?.id }}
                        onClick={() => handleClose(true)}
                        maxChars={200}
                      />
                      {track.releaseYear && (
                        <>
                          {" • "}
                          <Link to={`/year/${track.releaseYear}`} onClick={() => handleClose(true)}>
                            {track.releaseYear}
                          </Link>
                        </>
                      )}
                    </span>
                  </div>
                </div>
                <div className={classes.actionsRow}>
                  <div className={classes.leftActions}>
                    <div className={classes.ratingSection}>
                      <span className={classes.sectionLabel}>Rating</span>
                      <div className={classes.ratingStars}>
                        <RatingComponent
                          value={localRating}
                          setValue={setLocalRating}
                          size="34px"
                          changeStatus={true}
                          hover={true}
                          ecolor="var(--star-empty-fill)"
                          borderColor="var(--star-empty-border)"
                        />
                      </div>
                    </div>
                  </div>

                  <div className={classes.rightActions}>
                    <div className={classes.dateContainer}>
                      <div className={classes.dateSection}>
                        <button
                          ref={dateButtonRef}
                          className={classes.dateButton}
                          onClick={handleDateClick}
                          title="Select date"
                        >
                          <FaRegCalendar size={14} style={{ marginRight: "6px", verticalAlign: "-1px" }} />
                          {formatDate(todayDate)}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className={classes.textareaContainer}>
                  <div className={`${classes.inputContainer} ${classes.pickerAnchor}`}>
                    <button
                      className={classes.expandButton}
                      onClick={() => setExpanded(true)}
                      aria-label="Expand review"
                    >
                      <FiMaximize2 size={16} />
                    </button>
                    <div className={classes.textareaWrapper}>
                      <TextArea
                        ref={reviewTextareaRef}
                        className={`${classes.commentInput} ${selectedGif ? classes.commentInputAutoGrow : ""}`}
                        placeholder="What did you think about this track?"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        maxLength={5000}
                      />
                      {selectedGif && (
                        <div className={classes.gifPreview}>
                          <img
                            src={selectedGif.url}
                            alt="Selected GIF"
                            className={classes.gifPreviewImage}
                            onError={(e) => { e.target.style.display = "none"; }}
                          />
                          <button
                            className={classes.removeGifButton}
                            onClick={() => setSelectedGif(null)}
                            aria-label="Remove GIF"
                            type="button"
                          >
                            x
                          </button>
                        </div>
                      )}
                    </div>
                    <button
                      ref={gifButtonRef}
                      className={`${classes.gifButton} ${showGifPicker ? classes.gifButtonActive : ""}`}
                      onClick={(e) => { e.stopPropagation(); setShowGifPicker((prev) => !prev); }}
                      aria-label="Add GIF"
                      type="button"
                    >
                      <HiGif size={20} />
                    </button>
                    {showGifPicker && (
                      <GifPicker
                        onSelect={(gif) => { setSelectedGif(gif); setShowGifPicker(false); }}
                        onClose={() => setShowGifPicker(false)}
                        anchorRef={reviewCardRef}
                        buttonRef={gifButtonRef}
                      />
                    )}
                  </div>
                  <span className={`${classes.charCounter} ${comment.length >= 4500 ? classes.limitReached : ""}`}>
                    {comment.length}/5000
                  </span>
                </div>

                <div className={classes.footerRow}>
                  <div className={classes.ratingContainer}>
                    <button
                      className={classes.cancelButton}
                      onClick={() => handleClose()}
                    >
                      Cancel
                    </button>
                  </div>

                  <div className={classes.saveContainer}>
                    <HeartIcon
                      liked={localLiked}
                      onClick={(newLiked) => setLocalLiked(newLiked)}
                      track={track}
                    />
                    <Button
                      variant="primary"
                      onClick={
                        userLogged
                          ? handleReviewSubmit
                          : () => {
                            handleClose(true);
                            openModal("login-reason", {
                              reason: "review",
                            });
                          }
                      }
                      disabled={isSubmitting || localRating === 0}
                      className={`${classes.saveButton} ${isSubmitting ? classes.submitting : ''}`}
                    >
                      {isSubmitting ? (
                        <span className={classes.buttonText}>
                          {isEditMode ? "Updating" : "Saving"}
                        </span>
                      ) : sendSuccess ? (
                        <>
                          <FaCheck className={`${classes.checkIcon} ${classes.buttonIcon}`} />
                          <span className={classes.buttonText}>{isEditMode ? "Updated" : "Saved"}</span>
                        </>
                      ) : (
                        <span className={classes.buttonText}>
                          {userLogged
                            ? isEditMode
                              ? "Update Review"
                              : "Save Review"
                            : "Login to Review"}
                        </span>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}

        </div>

        {showCalendar && (
          <div id="compact-calendar-wrapper" style={{ position: "absolute", zIndex: 10001, ...calendarPosition }} onClick={e => e.stopPropagation()}>
            <CompactCalendar
              value={todayDate}
              onChange={handleDateChange}
              onClose={() => setShowCalendar(false)}
            />
          </div>
        )}
      </div>
    );

    return ReactDOM.createPortal(overlayContent, document.body);
  }
);

export default TrackReviewModal;
