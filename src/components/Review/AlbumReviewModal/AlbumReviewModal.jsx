import { useState, useEffect, useRef } from "react";
import { useIsomorphicLayoutEffect } from "../../../hooks/useIsomorphicLayoutEffect";
import ReactDOM from "react-dom";
import { Link } from "react-router-dom";
import { FaTimes, FaCheck, FaChevronDown } from "react-icons/fa";
import { FiMaximize2, FiMinimize2 } from "react-icons/fi";
import { FaRegCalendar } from "react-icons/fa6";
import { IoIosCheckmarkCircle } from "react-icons/io";
import { RatingComponent } from "../RatingStar/RatingStar";
import { HeartIcon } from "../../Icons/HeartIcon/HeartIcon";
import { Button } from "../../Utils/Buttons/Button";
import CompactCalendar from "../../Utils/Calendar/CompactCalendar/CompactCalendar";
import styles from "./AlbumReviewModal.module.css";
import { createAlbumLog, updateAlbumLog } from "../../../services/HandleLogs";
import { useUserContext } from "../../../contexts/UserContext";
import { useAuthModal } from "../../../contexts/AuthModalContext";
import useScrollLock from "../../../hooks/useScrollLock";
import showToast, { showUnsavedChangesToast, dismissUnsavedChangesToast } from "../../Utils/Toast/Toast";
import { createAlbumSlug, createArtistSlug, parseReviewContent } from "../../../utils/formatters/textFormatters";
import { HiGif } from "react-icons/hi2";
import GifPicker from "../GifPicker/GifPicker";
import ArtistList from "../../Utils/ArtistList/ArtistList";
import TrackAlbumTitle from "../../Utils/TrackAlbumTitle/TrackAlbumTitle";
import { TextArea } from "../../Utils/Inputs/Inputs";

const AlbumReviewModal = ({
  album,
  show,
  onClose,
  onSave,
  initialData = {},
}) => {
  const { userLogged } = useUserContext();
  const { openModal } = useAuthModal();

  const rawInitialReview = initialData.review || "";
  const { text: initialReview, gifUrl: initialGifUrl } = parseReviewContent(rawInitialReview);
  const initialRating = initialData.rating || 0;
  const initialLiked = initialData.liked || false;
  const initialDate = initialData.listenDate
    ? new Date(initialData.listenDate)
    : new Date();
  const initialTrackRatings = initialData.trackRatings || {};
  const initialTrackLikes = new Set(initialData.trackLikes || []);

  const [rating, setRating] = useState(initialRating);
  const [review, setReview] = useState(initialReview);
  const [liked, setLiked] = useState(initialLiked);
  const [listenDate, setListenDate] = useState(initialDate);
  const [trackRatings, setTrackRatings] = useState(initialTrackRatings);
  const [trackLikes, setTrackLikes] = useState(initialTrackLikes);
  const [trackReviews, setTrackReviews] = useState(initialData.trackReviews || {});
  const [logId, setLogId] = useState(initialData.logId || null);
  const [expandedTrack, setExpandedTrack] = useState(null);
  const [expandedTrackReview, setExpandedTrackReview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarPosition, setCalendarPosition] = useState({ top: 0, right: 0 });
  const [expanded, setExpanded] = useState(false);
  const [selectedGif, setSelectedGif] = useState(initialGifUrl ? { id: null, url: initialGifUrl, preview: initialGifUrl } : null);
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [trackGifs, setTrackGifs] = useState({});
  const [activeTrackGifPicker, setActiveTrackGifPicker] = useState(null);
  const trackGifButtonRefs = useRef({});

  const dateButtonRef = useRef(null);
  const reviewInputRef = useRef(null);
  const gifButtonRef = useRef(null);
  const trackListRef = useRef(null);
  const pendingScrollTrackRef = useRef(null);

  useScrollLock();

  useIsomorphicLayoutEffect(() => {
    const el = reviewInputRef.current;
    if (!el || expanded) return;
    if (selectedGif) {
      el.style.height = 'auto';
      el.style.height = `${Math.min(el.scrollHeight, 170)}px`;
    } else {
      el.style.height = '';
    }
  }, [review, selectedGif, expanded]);

  useEffect(() => {
    if (show) {
      const { text: parsedReview, gifUrl: parsedGifUrl } = parseReviewContent(initialData.review || "");
      setRating(initialData.rating || 0);
      setReview(parsedReview);
      setLiked(initialData.liked || false);
      setListenDate(
        initialData.listenDate ? new Date(initialData.listenDate) : new Date()
      );
      setTrackRatings(initialData.trackRatings || {});
      setTrackLikes(new Set(initialData.trackLikes || []));
      setTrackReviews(initialData.trackReviews || {});
      setLogId(initialData.logId || null);
      setExpandedTrack(null);
      setExpandedTrackReview(null);
      setSendSuccess(false);
      setSelectedGif(parsedGifUrl ? { id: null, url: parsedGifUrl, preview: parsedGifUrl } : null);
      setShowGifPicker(false);
      setTrackGifs({});
      setActiveTrackGifPicker(null);
    }
  }, [show, album]);


  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!showCalendar) return;
      if (
        dateButtonRef.current &&
        dateButtonRef.current.contains(event.target)
      )
        return;
      const cal = document.getElementById("album-calendar-wrapper");
      if (cal && cal.contains(event.target)) return;
      setShowCalendar(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showCalendar]);

  useEffect(() => {
    if (!expandedTrackReview && pendingScrollTrackRef.current) {
      const trackId = pendingScrollTrackRef.current;
      pendingScrollTrackRef.current = null;
      requestAnimationFrame(() => {
        const wrapper = trackListRef.current?.querySelector(`[data-track-id="${trackId}"]`);
        if (wrapper) {
          wrapper.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      });
    }
  }, [expandedTrackReview]);

  if (!show || !album) return null;

  const isEditMode = !!(logId || initialData.rating || Object.keys(initialData.trackRatings || {}).length > 0 || (initialData.trackLikes || []).length > 0);

  const hasTrackChanges = album?.tracks?.some((t) => {
    const ratingChanged = (trackRatings[t.id] || 0) !== (initialTrackRatings[t.id] || 0);
    const likeChanged = trackLikes.has(t.id) !== initialTrackLikes.has(t.id);
    const reviewChanged = (trackReviews[t.id] || "").trim() !== ((initialData.trackReviews || {})[t.id] || "").trim();
    return ratingChanged || likeChanged || reviewChanged;
  });

  const isDirty =
    review !== initialReview ||
    rating !== initialRating ||
    liked !== initialLiked ||
    hasTrackChanges;

  const handleClose = (force = false) => {
    if (!force && isDirty && !sendSuccess) {
      showUnsavedChangesToast({
        onSave: () => handleSave(),
        onDiscard: () => { if (typeof onClose === "function") onClose(); },
      });
      return;
    }
    if (typeof onClose === "function") onClose();
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) handleClose();
  };

  const handleDateClick = (e) => {
    e.stopPropagation();
    if (!showCalendar) {
      const rect = e.currentTarget.getBoundingClientRect();
      setCalendarPosition({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right,
      });
    }
    setShowCalendar(!showCalendar);
  };

  const handleDateChange = (date) => {
    setListenDate(date);
    setShowCalendar(false);
  };

  const formatDate = (date) => {
    const options = { month: "short", day: "numeric", year: "numeric" };
    return date.toLocaleDateString("en-US", options);
  };

  const handleTrackRating = (trackId, newRating) => {
    setTrackRatings((prev) => ({ ...prev, [trackId]: newRating }));
  };

  const toggleTrackExpanded = (trackId) => {
    setExpandedTrack((prev) => {
      if (prev === trackId) return null;
      requestAnimationFrame(() => {
        const wrapper = trackListRef.current?.querySelector(
          `[data-track-id="${trackId}"]`
        );
        if (wrapper) {
          wrapper.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      });
      return trackId;
    });
  };

  const handleTrackReview = (trackId, value) => {
    setTrackReviews((prev) => ({ ...prev, [trackId]: value }));
  };

  const handleTrackLike = (trackId, newLiked) => {
    setTrackLikes((prev) => {
      const next = new Set(prev);
      if (newLiked) next.add(trackId);
      else next.delete(trackId);
      return next;
    });
  };


  const handleSave = async () => {
    dismissUnsavedChangesToast();
    if (!userLogged) {
      handleClose(true);
      openModal("login-reason", { reason: "review" });
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        albumId: album.id,
        name: album.name,
        artists: album.artists.map((artist) => ({
          name: artist.name,
          id: artist.id,
        })),
        rating,
        review: review + (selectedGif ? `[gif:${selectedGif.url}]` : ""),
        selectedDate: listenDate.toISOString(),
        liked,
        listened: true,
        coverUrl: album.images?.[0]?.url || album.coverUrl,
        tracks: album.tracks.map((track) => ({
          id: track.id,
          name: track.name,
          artists: track.artists.map((artist) => ({
            name: artist.name,
            id: artist.id,
          })),
          rating: trackRatings[track.id] || 0,
          liked: trackLikes.has(track.id),
          review: (trackReviews[track.id] || "") + (trackGifs[track.id] ? `[gif:${trackGifs[track.id].url}]` : ""),
        })),
      };

      if (logId) {
        await updateAlbumLog(logId, payload);
      } else {
        const response = await createAlbumLog(payload);
        if (response?.data?._id) setLogId(response.data._id);
      }
      setSendSuccess(true);
      showToast(logId ? "Album review updated successfully!" : "Album review submitted successfully!", "success");

      setTimeout(() => {
        if (onSave) onSave(payload);
        handleClose(true);
      }, 1000);
    } catch (error) {
      showToast("An error occurred while submitting a review", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const overlayContent = (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={`${styles.modal} ${(expanded || expandedTrackReview) ? styles.modalExpanded : ""}`} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          {expanded ? (
            <>
              <div className={styles.headerLeft}>
                <img
                  src={album.images?.[0]?.url || album.coverUrl}
                  alt={album.name}
                  className={styles.headerCover}
                />
                <div className={styles.headerInfo}>
                  <h3 className={styles.headerTitle}>Reviewing</h3>
                  <span className={styles.headerSubtitle}>
                    <TrackAlbumTitle title={album.name} maxChars={200} />
                    {" · "}{new Date(album.release_date || album.releaseDate).getFullYear()}
                  </span>
                </div>
              </div>
              <button
                className={styles.closeButton}
                onClick={() => setExpanded(false)}
                aria-label="Minimize"
              >
                <FiMinimize2 size={18} />
              </button>
            </>
          ) : expandedTrackReview ? (
            <>
              <div className={styles.headerLeft}>
                <img
                  src={album.images?.[0]?.url || album.coverUrl}
                  alt={album.name}
                  className={styles.headerCover}
                />
                <div className={styles.headerInfo}>
                  <h3 className={styles.headerTitle}>Track Review</h3>
                  <span className={styles.headerSubtitle}>
                    <TrackAlbumTitle
                      title={album.tracks?.find((t) => t.id === expandedTrackReview)?.name}
                      maxChars={200}
                    />
                  </span>
                </div>
              </div>
              <button
                className={styles.closeButton}
                onClick={() => {
                  pendingScrollTrackRef.current = expandedTrackReview;
                  setExpandedTrackReview(null);
                }}
                aria-label="Minimize"
              >
                <FiMinimize2 size={18} />
              </button>
            </>
          ) : (
            <>
              <h2 className={styles.title}>{isEditMode ? "Edit Album Review" : "Album Review"}</h2>
              <button
                className={styles.closeButton}
                onClick={() => handleClose()}
                aria-label="Close review"
              >
                <FaTimes size={20} />
              </button>
            </>
          )}
        </div>

        {expanded ? (
          <div className={styles.expandedContent}>
            <div className={styles.expandedTextareaWrapper}>
              <TextArea
                ref={reviewInputRef}
                className={styles.expandedTextarea}
                placeholder="Write an album review..."
                value={review}
                onChange={(e) => setReview(e.target.value)}
                maxLength={5000}
              />
              {selectedGif && (
                <div className={styles.gifPreview}>
                  <img
                    src={selectedGif.url}
                    alt="Selected GIF"
                    className={styles.gifPreviewImage}
                    onError={(e) => { e.target.style.display = "none"; }}
                  />
                  <button
                    className={styles.removeGifButton}
                    onClick={() => setSelectedGif(null)}
                    aria-label="Remove GIF"
                    type="button"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
            <div className={styles.expandedFooter}>
              <span
                className={`${styles.charCounter} ${review.length >= 4500 ? styles.limitReached : ""}`}
              >
                {review.length}/5000
              </span>
            </div>
          </div>
        ) : expandedTrackReview ? (
          <div className={styles.expandedContent}>
            <div className={styles.expandedTextareaWrapper}>
              <TextArea
                className={styles.expandedTextarea}
                placeholder={`Review ${album.tracks?.find((t) => t.id === expandedTrackReview)?.name}...`}
                value={trackReviews[expandedTrackReview] || ""}
                onChange={(e) => handleTrackReview(expandedTrackReview, e.target.value)}
                maxLength={5000}
              />
              {trackGifs[expandedTrackReview] && (
                <div className={styles.gifPreview}>
                  <img
                    src={trackGifs[expandedTrackReview].url}
                    alt="Selected GIF"
                    className={styles.gifPreviewImage}
                    onError={(e) => { e.target.style.display = "none"; }}
                  />
                  <button
                    className={styles.removeGifButton}
                    onClick={() => setTrackGifs(prev => { const n = { ...prev }; delete n[expandedTrackReview]; return n; })}
                    aria-label="Remove GIF"
                    type="button"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
            <div className={styles.expandedFooter}>
              <span
                className={`${styles.charCounter} ${(trackReviews[expandedTrackReview]?.length || 0) >= 1800 ? styles.limitReached : ""}`}
              >
                {trackReviews[expandedTrackReview]?.length || 0}/5000
              </span>
              <button
                ref={(el) => { trackGifButtonRefs.current[expandedTrackReview] = el; }}
                className={`${styles.gifButton} ${activeTrackGifPicker === expandedTrackReview ? styles.gifButtonActive : ""}`}
                onClick={(e) => { e.stopPropagation(); setActiveTrackGifPicker((prev) => prev === expandedTrackReview ? null : expandedTrackReview); }}
                aria-label="Add GIF"
                type="button"
                style={{ position: "static", opacity: 1, backgroundColor: "var(--dark-bg-color)", border: "1px solid var(--dark-border)" }}
              >
                <HiGif size={20} />
              </button>
              {activeTrackGifPicker === expandedTrackReview && (
                <GifPicker
                  onSelect={(gif) => { setTrackGifs((prev) => ({ ...prev, [expandedTrackReview]: gif })); setActiveTrackGifPicker(null); }}
                  onClose={() => setActiveTrackGifPicker(null)}
                  buttonRef={{ current: trackGifButtonRefs.current[expandedTrackReview] }}
                  placement="above-left"
                />
              )}
            </div>
          </div>
        ) : (
          <>
            <div className={styles.content}>
              <div className={styles.albumColumn}>
                <div className={styles.albumHeader}>
                  <Link
                    to={createAlbumSlug(album.name, album.artists, album.id)}
                    state={{ albumId: album.id }}
                    className={styles.coverImageLink}
                    onClick={() => handleClose(true)}
                  >
                    <div className={styles.coverImageContainer}>
                      <img
                        src={album.images?.[0]?.url || album.coverUrl}
                        alt={album.name}
                        className={styles.coverImage}
                      />
                    </div>
                  </Link>
                  <div className={styles.albumInfo}>
                    <div className={styles.albumNameContainer}>
                      <TrackAlbumTitle
                        title={album.name}
                        to={createAlbumSlug(album.name, album.artists, album.id)}
                        state={{ albumId: album.id }}
                        onClick={() => handleClose(true)}
                        maxChars={200}
                        className={styles.albumName}
                      />
                    </div>
                    <span className={styles.artistName}>
                      {album.artists?.length ? (
                        <ArtistList artists={album.artists} maxVisible={3} />
                      ) : album.primaryArtist?.name}
                    </span>
                    {(album.release_date || album.releaseDate) && (
                      <Link
                        to={`/year/${new Date(album.release_date || album.releaseDate).getFullYear()}`}
                        className={styles.releaseDate}
                        onClick={() => handleClose(true)}
                      >
                        {new Date(album.release_date || album.releaseDate).getFullYear()}
                      </Link>
                    )}
                  </div>
                </div>

                <div className={styles.controls}>
                  <div className={styles.ratingSection}>
                    <div className={styles.ratingGroup}>
                      <span className={styles.ratingLabel}>Album Rating</span>
                      <RatingComponent
                        value={rating}
                        setValue={setRating}
                        size="36px"
                        changeStatus={true}
                        hover={true}
                        ecolor="var(--star-empty-fill)"
                        borderColor="var(--star-empty-border)"
                      />
                    </div>
                  </div>
                  <div className={styles.albumInteractions}>
                    <div className={styles.dateContainer}>
                      <button
                        ref={dateButtonRef}
                        className={styles.dateButton}
                        onClick={handleDateClick}
                        title="Select date"
                      >
                        <FaRegCalendar
                          size={14}
                          style={{ marginRight: "6px", verticalAlign: "-1px" }}
                        />
                        {formatDate(listenDate)}
                      </button>
                    </div>
                  </div>
                </div>

                <div className={`${styles.inputContainer} ${styles.pickerAnchor}`}>
                  <button
                    className={styles.expandButton}
                    onClick={() => setExpanded(true)}
                    aria-label="Expand review"
                  >
                    <FiMaximize2 size={16} />
                  </button>
                  <div className={styles.textareaWrapper}>
                    <TextArea
                      ref={reviewInputRef}
                      className={`${styles.reviewTextarea} ${selectedGif ? styles.reviewTextareaAutoGrow : ""}`}
                      placeholder="Write an album review..."
                      value={review}
                      onChange={(e) => setReview(e.target.value)}
                      maxLength={5000}
                    />
                    {selectedGif && (
                      <div className={styles.gifPreview}>
                        <img
                          src={selectedGif.url}
                          alt="Selected GIF"
                          className={styles.gifPreviewImage}
                          onError={(e) => { e.target.style.display = "none"; }}
                        />
                        <button
                          className={styles.removeGifButton}
                          onClick={() => setSelectedGif(null)}
                          aria-label="Remove GIF"
                          type="button"
                        >
                          ×
                        </button>
                      </div>
                    )}
                    <button
                      ref={gifButtonRef}
                      className={`${styles.gifButton} ${showGifPicker ? styles.gifButtonActive : ""}`}
                      onClick={(e) => { e.stopPropagation(); setShowGifPicker((prev) => !prev); }}
                      aria-label="Add GIF"
                      type="button"
                    >
                      <HiGif size={20} />
                    </button>
                  </div>
                  {showGifPicker && (
                    <GifPicker
                      onSelect={(gif) => { setSelectedGif(gif); setShowGifPicker(false); }}
                      onClose={() => setShowGifPicker(false)}
                      anchorRef={reviewInputRef}
                      buttonRef={gifButtonRef}
                      placement="above-right"
                    />
                  )}
                </div>
                <span
                  className={`${styles.charCounter} ${review.length >= 4500 ? styles.limitReached : ""}`}
                >
                  {review.length}/5000
                </span>
              </div>

              <div className={styles.tracksColumn}>
                <div className={styles.tracksHeader}>
                  <span className={styles.sectionTitle}>Album Tracks</span>
                  <div className={styles.completionSection}>
                    {(() => {
                      const totalTracks = album.tracks?.length || 0;
                      const ratedCount = album.tracks?.filter(t => trackRatings[t.id] > 0).length || 0;
                      const percent = totalTracks > 0 ? Math.round((ratedCount / totalTracks) * 100) : 0;
                      return (
                        <>
                          <div className={styles.completionRow}>
                            <div className={styles.countWrapper}>
                              <span className={styles.completionCount}>{ratedCount}/{totalTracks}</span>
                              <span className={styles.separationDot}>•</span>
                              <span className={styles.listenedLabel}>you've listened</span>
                            </div>
                            {percent === 100 ? (
                              <div className={styles.completedBadge}>
                                <IoIosCheckmarkCircle />
                                <span>Complete</span>
                              </div>
                            ) : (
                              <span className={`${styles.completionPercent} ${percent >= 66 ? styles.completionHigh : percent >= 33 ? styles.completionMedium : styles.completionLow}`}>
                                {percent}%
                              </span>
                            )}
                          </div>
                          <div className={styles.completionBarTrack}>
                            <div
                              className={`${styles.completionBarFill} ${percent === 100 ? styles.fillDone : percent >= 66 ? styles.fillHigh : percent >= 33 ? styles.fillMedium : styles.fillLow}`}
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>

                <div className={styles.trackList} ref={trackListRef}>
                  {album.tracks?.map((track, index) => (
                    <div key={track.id} data-track-id={track.id} className={styles.trackItemWrapper}>
                      <div
                        className={styles.trackItem}
                        onClick={() => toggleTrackExpanded(track.id)}
                      >
                        <span className={styles.trackNumber}>{index + 1}.</span>
                        <TrackAlbumTitle
                          title={track.name}
                          rating={trackRatings[track.id]}
                          liked={trackLikes.has(track.id)}
                          tagSize="0.7rem"
                          maxChars={200}
                          className={styles.trackTitle}
                        />
                        <FaChevronDown
                          className={`${styles.trackExpandIcon} ${expandedTrack === track.id ? styles.expanded : ""}`}
                          size={12}
                        />
                      </div>
                      {expandedTrack === track.id && (
                        <div className={styles.trackDropdown}>
                          <div className={styles.trackDropdownRow}>
                            <RatingComponent
                              value={trackRatings[track.id] || 0}
                              setValue={(val) => handleTrackRating(track.id, val)}
                              size="30px"
                              ecolor="var(--star-empty-fill)"
                              borderColor="var(--star-empty-border)"
                              clearPosition="left"
                            />
                            <HeartIcon
                              liked={trackLikes.has(track.id)}
                              onClick={(newLiked) => handleTrackLike(track.id, newLiked)}
                              track={null}
                              className={styles.trackHeartIcon}
                            />
                          </div>
                          <div className={`${styles.trackTextareaContainer} ${styles.pickerAnchor}`}>
                            <button
                              className={styles.expandButton}
                              onClick={() => setExpandedTrackReview(track.id)}
                              aria-label="Expand review"
                            >
                              <FiMaximize2 size={14} />
                            </button>
                            <div className={styles.textareaWrapper}>
                              <TextArea
                                className={`${styles.trackReviewTextarea} ${trackGifs[track.id] ? styles.reviewTextareaAutoGrow : ""}`}
                                placeholder={`Review ${track.name}...`}
                                value={trackReviews[track.id] || ""}
                                onChange={(e) => handleTrackReview(track.id, e.target.value)}
                                maxLength={5000}
                              />
                              {trackGifs[track.id] && (
                                <div className={styles.gifPreview}>
                                  <img
                                    src={trackGifs[track.id].url}
                                    alt="Selected GIF"
                                    className={styles.gifPreviewImage}
                                    onError={(e) => { e.target.style.display = "none"; }}
                                  />
                                  <button
                                    className={styles.removeGifButton}
                                    onClick={() => setTrackGifs(prev => { const n = { ...prev }; delete n[track.id]; return n; })}
                                    aria-label="Remove GIF"
                                    type="button"
                                  >
                                    ×
                                  </button>
                                </div>
                              )}
                            </div>
                            <button
                              ref={(el) => { trackGifButtonRefs.current[track.id] = el; }}
                              className={`${styles.gifButton} ${activeTrackGifPicker === track.id ? styles.gifButtonActive : ""}`}
                              onClick={(e) => { e.stopPropagation(); setActiveTrackGifPicker((prev) => prev === track.id ? null : track.id); }}
                              aria-label="Add GIF"
                              type="button"
                            >
                              <HiGif size={20} />
                            </button>
                            {activeTrackGifPicker === track.id && (
                              <GifPicker
                                onSelect={(gif) => { setTrackGifs((prev) => ({ ...prev, [track.id]: gif })); setActiveTrackGifPicker(null); }}
                                onClose={() => setActiveTrackGifPicker(null)}
                                anchorRef={{ current: trackGifButtonRefs.current[track.id]?.parentElement }}
                                buttonRef={{ current: trackGifButtonRefs.current[track.id] }}
                                placement="above-left"
                              />
                            )}
                          </div>
                          <span className={`${styles.charCounter} ${(trackReviews[track.id]?.length || 0) >= 4500 ? styles.limitReached : ""}`} style={{ textAlign: "right", display: "block", marginTop: "6px" }}>
                            {trackReviews[track.id]?.length || 0}/5000
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className={styles.footer}>
              <button
                className={styles.cancelButton}
                onClick={() => handleClose()}
              >
                Cancel
              </button>
              <div className={styles.saveContainer}>
                <HeartIcon
                  liked={liked}
                  onClick={(newLiked) => setLiked(newLiked)}
                  track={null}
                />
                <Button
                  variant="primary"
                  size="md"
                  onClick={userLogged ? handleSave : () => {
                    handleClose(true);
                    openModal("login-reason", { reason: "review" });
                  }}
                  disabled={isSubmitting}
                  className={`${styles.saveButton} ${isSubmitting ? styles.submitting : ""}`}
                >
                  {isSubmitting ? (
                    <span className={styles.buttonText}>Saving</span>
                  ) : sendSuccess ? (
                    <>
                      <FaCheck className={styles.buttonIcon} />
                      <span className={styles.buttonText}>Saved</span>
                    </>
                  ) : (
                    <span className={styles.buttonText}>
                      {userLogged ? (isEditMode ? "Update Review" : "Review") : "Login to Review"}
                    </span>
                  )}
                </Button>
              </div>
            </div>
          </>
        )}

      </div>

      {showCalendar && (
        <div
          id="album-calendar-wrapper"
          style={{
            position: "fixed",
            zIndex: 10001,
            ...calendarPosition,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <CompactCalendar
            value={listenDate}
            onChange={handleDateChange}
            onClose={() => setShowCalendar(false)}
          />
        </div>
      )}
    </div>
  );

  return ReactDOM.createPortal(overlayContent, document.body);
};

export default AlbumReviewModal;
