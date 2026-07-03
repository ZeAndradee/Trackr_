import useApi from "../hooks/Api";

export const searchAll = async (query, options = {}) => {
  const api = useApi();
  const { type, page = 1, limit = 20 } = options;

  try {
    const { data: searchResponse } = await api.get("/search", {
      params: {
        q: query,
        type,
        page,
        limit,
      },
    });
    return {
      tracks: searchResponse?.data?.tracks || [],
      albums: searchResponse?.data?.albums || [],
      artists: searchResponse?.data?.artists || [],
      playlists: searchResponse?.data?.playlists || [],
      users: searchResponse?.data?.users || [],
    };
  } catch (e) {
    console.error("Search error:", e);
    return { tracks: [], albums: [], artists: [], playlists: [], users: [] };
  }
};

export const searchTracks = async (query, limit = 5) => {
  const api = useApi();

  try {
    const { data: response } = await api.get("/search", {
      params: { q: query, type: "track", limit },
    });
    return response?.tracks || response?.data?.tracks || [];
  } catch (e) {
    console.error("Search tracks error:", e);
    return [];
  }
};

export const HandleSearch = async (trackQuery) => {
  return searchTracks(trackQuery);
};
