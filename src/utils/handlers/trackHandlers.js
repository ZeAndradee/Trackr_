import {
  updateRating,
  updateLiked,
  updateListened,
} from "../../services/HandleLogs";

export const handleSetRating = async (
  newRating,
  setRating,
  setRatingChanged,
  track,
  userId,
) => {
  try {
    if (track?.userId && track.userId !== userId) {
      return;
    }

    setRating(newRating);
    setRatingChanged(true);

    if (!track || !userId) {
      console.warn("Missing track or userId, skipping API update for rating");
      return;
    }

    const trackId = track.trackId || track.id || track.track_id;
    const logId = track.logId;

    if (!trackId) {
      console.error("No valid track ID found");
      return;
    }

    await updateRating({
      trackId: trackId,
      logId: logId,
      userId: userId,
      rating: newRating,
    });
  } catch (error) {
    console.error("Failed to update rating:", error);
  }
};

export const handleLiked = async (
  event,
  liked,
  setLiked,
  setStatusChanged,
  track,
  userId,
) => {
  try {
    event.stopPropagation();

    const newLikedState = !liked;
    setLiked(newLikedState);
    setStatusChanged(true);

    const trackId = track.trackId || track.id || track.track_id;
    const logId = track.logId;

    await updateLiked({
      trackId: trackId,
      logId: logId,
      userId: userId,
      liked: newLikedState,
    });
  } catch (error) {
    console.error("Failed to update liked status:", error);

    setLiked(liked);
    setStatusChanged(false);

    if (error.message?.includes("Authentication required")) {
      console.warn("Authentication required for liking tracks");
    }
  }
};

export const handleListened = async (
  e,
  listened,
  setListened,
  setStatusChanged,
  track,
  userId,
) => {
  e.stopPropagation();

  try {
    if (track?.userId && track.userId !== userId) {
      console.error(
        "SECURITY BLOCKED: Cannot modify another user's listened status",
      );
      return;
    }

    const newListenedState = !listened;
    setListened(newListenedState);
    setStatusChanged(true);

    if (!track || !userId) {
      console.warn(
        "Missing track or userId, skipping API update for listened status",
      );
      return;
    }

    const trackId = track.trackId || track.id || track.track_id;
    const logId = track.logId;

    if (!trackId) {
      console.error("No valid track ID found");
      return;
    }

    await updateListened({
      trackId: trackId,
      logId: logId,
      userId: userId,
      listened: newListenedState,
    });
  } catch (error) {
    console.error("Failed to update listened status:", error);
  }
};

export const handleOptionsToggle = (e, optionsVisible, setOptionsVisible) => {
  e.stopPropagation();
  setOptionsVisible(!optionsVisible);
};

export const handleReviewOrLog = (
  e,
  track,
  setOptionsVisible,
  setActionsVisible,
  setIsHovered,
  setShowLogContainer,
  setSelectedTrack,
) => {
  e.stopPropagation();
  setOptionsVisible(false);
  setActionsVisible(false);
  setIsHovered(false);
  setShowLogContainer(true);
  setSelectedTrack(track);
};
