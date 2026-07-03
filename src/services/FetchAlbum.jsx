import useApi from "../hooks/Api";

export const fetchAlbum = async ({ artist, album, id, albumId }) => {
  const api = useApi();
  const targetId = id || albumId;

  try {
    let url;
    if (targetId) {
      url = `/album/${targetId}`;
    } else {
      url = `/album/${encodeURIComponent(
        artist.toLowerCase().replace(/ /g, "-")
      )}/${encodeURIComponent(album.toLowerCase().replace(/ /g, "-"))}`;
    }

    const { data: response } = await api.get(url);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const fetchSimilarAlbums = async (trackName, artist) => {
  const api = useApi();

  if (!trackName || !artist) return [];

  try {
    const { data: response } = await api.get(
      `/tracks/${artist}/${trackName}/similar`
    );

    let tracks = [];
    if (response.data && Array.isArray(response.data)) {
      tracks = response.data;
    } else if (Array.isArray(response)) {
      tracks = response;
    }

    const seen = new Set();
    return tracks
      .filter((track) => track.album && track.album.id)
      .filter((track) => {
        if (seen.has(track.album.id)) return false;
        seen.add(track.album.id);
        return true;
      })
      .map((track) => ({
        id: track.album.id,
        name: track.album.name,
        albumCover: track.album.images?.[0]?.url,
        artists: track.album.artists || track.artists,
        release_date: track.album.release_date,
        album_type: track.album.album_type,
      }));
  } catch (error) {
    return [];
  }
};

export const fetchAlbumReviews = async (
  albumId,
  page = 1,
  limit = 10,
  sort = "popular",
  filter = "",
  search = ""
) => {
  const api = useApi();

  if (!albumId) throw new Error("Album ID is required");

  try {
    let url = `/album/reviews?albumId=${albumId}&page=${page}&limit=${limit}&sort=${sort}`;
    if (filter) url += `&filter=${filter}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;

    const { data: response } = await api.get(url);
    return response;
  } catch (error) {
    console.error("Service: Failed to fetch album reviews:", error);
    return { data: { reviews: [], pagination: { total: 0 } } };
  }
};
export const fetchAlbumStreams = async (albumId) => {
  const api = useApi();
  try {
    const { data: response } = await api.get(`/album/${albumId}/streams`);
    return response.data;
  } catch (error) {
    console.error("Service: Failed to fetch album streams:", error);
    return [];
  }
};

export const fetchPopularAlbums = async () => {
  const api = useApi();
  try {
    const { data: response } = await api.get("/album/popular");
    return response.data;
  } catch (error) {
    return [];
  }
};

export const fetchTrendingAlbums = async () => {
  const api = useApi();
  try {
    const { data: response } = await api.get("/album/trending");
    return response.data;
  } catch (error) {
    return [];
  }
};

export const fetchAlbumYouTube = async (albumId) => {
  const api = useApi();

  if (!albumId) throw new Error("Album ID is required");

  try {
    const { data } = await api.get(`/albums/${albumId}/youtube`);
    return data;
  } catch (error) {
    return null;
  }
};

export const fetchAlbumQueue = async (albumId) => {
  const api = useApi();

  if (!albumId) return [];

  try {
    const { data: response } = await api.get(`/album/${albumId}/queue`);
    return Array.isArray(response?.data) ? response.data : [];
  } catch (error) {
    return [];
  }
};

export const fetchAlbumFriendsListened = async (
  albumId,
  page = 1,
  limit = 10
) => {
  const api = useApi();

  if (!albumId) throw new Error("Album ID is required");

  try {
    const { data: response } = await api.get(
      `/album/${albumId}/friends-listened?page=${page}&limit=${limit}`
    );
    return response;
  } catch (error) {
    return { data: { friends: [], pagination: { total: 0 } } };
  }
};

export const fetchWikipediaArticle = async (albumName, artistName) => {
  const api = useApi();
  try {
    const { data: response } = await api.get(
      `/album/${artistName}/${albumName}/wikipedia`
    );
    return response.data;
  } catch (error) {
    console.error("Service: Failed to fetch wikipedia article:", error);
    return null;
  }
};
