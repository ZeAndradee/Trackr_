export const formatArtists = (artists) => {
  if (!artists || !Array.isArray(artists)) {
    return "";
  }

  return artists.map((artist) => artist.name).join(", ");
};
