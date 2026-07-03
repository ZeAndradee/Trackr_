export const returnCoverUrl = (track, size = 1) => {
  return track?.coverUrl || track?.albumCover || null;
};

export const getTrackCover = (track, size = 1) => {
  if (!track) return null;
  return (
    track.albumCover ||
    track.coverUrl ||
    track.images?.[0]?.url ||
    returnCoverUrl(track, size) ||
    null
  );
};

export const returnArtists = (track) => {
  if (!track || !Array.isArray(track.artists)) return "";
  return track.artists
    .map((artist) => artist?.name)
    .filter(Boolean)
    .join(", ");
};
