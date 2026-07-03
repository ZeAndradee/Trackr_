export const VOLUME_KEY = "trackr_yt_volume";
export const MUTED_KEY = "trackr_yt_muted";
export const MAX_HISTORY = 50;

export const store = (key, value) => {
  if (typeof window !== "undefined") localStorage.setItem(key, value);
};

export const resolveArtistName = (s) =>
  s.primaryArtist?.name ||
  (typeof s.artist === "object" ? s.artist?.name : s.artist) ||
  s.artists?.[0]?.name ||
  "";

export const resolveArtists = (s, fallbackName) => {
  if (s.artists?.length) return s.artists;
  if (s.primaryArtist) return [s.primaryArtist, ...(s.featuredArtists || [])].filter((a) => a?.name);
  return fallbackName ? [{ name: fallbackName }] : [];
};

export const makeItem = (s, overrides = {}) => {
  const name = s.name || s.title || "";
  const artistName = resolveArtistName(s) || "Unknown Artist";
  return {
    _queueId: crypto.randomUUID(),
    trackId: s.id || s.trackId,
    name,
    title: name,
    artist: artistName,
    artists: resolveArtists(s, artistName),
    primaryArtist: s.primaryArtist || s.artists?.[0] || null,
    album: s.album || null,
    albumId: s.album?.id || s.albumId || null,
    coverUrl: s.coverUrl || s.albumCover || "",
    videoId: s.videoId || s.youtubeId || null,
    videoDuration: s.videoDuration || null,
    youtubeStatus: "loading",
    slug: s.slug || null,
    ...overrides,
  };
};

export const buildAlbumItems = (album, albumId) => {
  const artistName = album.primaryArtist?.name || "Unknown Artist";
  const albumObj = {
    id: album.id || albumId,
    title: album.title || album.name || "",
    coverUrl: album.coverUrl || "",
    releaseYear: album.releaseYear,
  };
  return album.tracks.map((track) =>
    makeItem({
      ...track,
      name: track.name || track.title,
      coverUrl: album.coverUrl || "",
      primaryArtist: track.primaryArtist || album.primaryArtist || { name: artistName },
      album: albumObj,
      albumId: albumObj.id,
    })
  );
};

export const buildListItems = (listData) => {
  if (!listData?.tracks?.length) return [];
  return listData.tracks.map((track) =>
    makeItem({
      ...track,
      coverUrl: track.albumCover || "",
      album: { id: track.albumId || null, title: "", coverUrl: track.albumCover || "", releaseYear: null },
      albumId: track.albumId || null,
    })
  );
};

export const patchItemIn = (list, queueId, updates) => {
  const idx = list.findIndex((item) => item._queueId === queueId);
  if (idx === -1) return list;
  const next = [...list];
  next[idx] = { ...next[idx], ...updates };
  return next;
};
