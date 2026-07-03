export const formatArtists = (artists) => {
  if (!Array.isArray(artists)) return [];
  return artists.filter((a) => a && a.name);
};

export const truncateText = (text, maxLength) => {
  if (!text || text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};

export const formatSlug = (str) => {
  if (!str) return "";
  return encodeURIComponent(String(str).toLowerCase().replace(/[ \/]/g, "-"));
};

const primaryArtistName = (artists) => {
  if (Array.isArray(artists) && artists.length > 0 && artists[0]?.name) {
    return artists[0].name;
  }
  return "unknown-artist";
};

export const createTrackSlug = (title, artists, id) => {
  if (!title) return "/";
  const artistName = primaryArtistName(artists);
  if (id) {
    return `/track/${id}/${formatSlug(artistName)}/${formatSlug(title)}`;
  }
  return `/track/${formatSlug(artistName)}/${formatSlug(title)}`;
};

export const createAlbumSlug = (name, artists, id) => {
  if (!name) return "/";
  const artistName = primaryArtistName(artists);
  if (id) {
    return `/album/${id}/${formatSlug(artistName)}/${formatSlug(name)}`;
  }
  return `/album/${formatSlug(artistName)}/${formatSlug(name)}`;
};

export const formatCompactNumber = (num) => {
  if (!num) return "0";
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(num);
};

export const formatTime = (seconds) => {
  if (!seconds || isNaN(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

export const formatDurationCompact = (duration) => {
  if (!duration) return "0min";

  if (typeof duration === "string" && duration.includes(":")) {
    const parts = duration.split(":").map(Number);
    if (parts.length === 3) {
      const [hours, minutes] = parts;
      if (hours > 0) {
        return `${hours}h ${minutes}min`;
      }
      return `${minutes}min`;
    } else if (parts.length === 2) {
      const [minutes] = parts;
      return `${minutes}min`;
    }
    return duration;
  }

  const ms = Number(duration);
  if (isNaN(ms)) return "0min";

  const totalMinutes = Math.floor(ms / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}min`;
  }
  return `${minutes}min`;
};

export const parseReviewContent = (text) => {
  if (!text) return { text: "", gifUrl: null };
  const match = text.match(/\[gif:(https?:\/\/[^\]]+)\]$/);
  if (!match) return { text, gifUrl: null };
  return { text: text.slice(0, match.index), gifUrl: match[1] };
};

export const createArtistSlug = (name, id) => {
  if (!name) return "/";

  if (id) {
    return `/artist/${id}/${formatSlug(name)}`;
  }
  return `/artist/${formatSlug(name)}`;
};

export const formatReviewActivity = (review) => {
  const isAlbum = review.type === "album";
  const name = isAlbum
    ? review.album?.name || review.name
    : review.track?.name || review.name;

  return {
    id: isAlbum ? review.album?.id || review.albumId : review._id,
    trackId: review.track?.id || review.trackId,
    name,
    trackTitle: name,
    trackName: review.track?.name || review.name,
    artist: review.artists,
    artists: review.artists,
    coverUrl: review.coverUrl,
    albumCover: review.coverUrl,
    rating: review.rating,
    review: review.review,
    liked: review.liked,
    listened: review.listened,
    createdAt: review.createdAt || review.selectedDate,
    selectedDate: review.selectedDate,
    logId: review._id,
    user: review.user || review.userId,
    type: review.type || "track",
    albumId: isAlbum ? review.album?.id || review.albumId : review.albumId,
    albumName: review.album?.name || review.albumName,
    isLiked:
      review.userInteractions?.isLiked ||
      review.userInteractions?.liked ||
      review.isLiked ||
      false,
    likesCount: review.likeCount || review.likesCount || 0,
    commentsCount: review.commentCount || review.commentsCount || 0,
  };
};

