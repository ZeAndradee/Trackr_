import useApi from "../hooks/Api";
import { formatSlug } from "../utils/formatters/textFormatters";

export const fetchTrack = async (trackId) => {
  const api = useApi();

  try {
    let url = `/track/${trackId}`;

    const { data: response } = await api.get(url, {
      timeout: 10000,
    });

    return response.data;
  } catch (error) {
    console.error("Service: Failed to fetch track:", error);

    throw error;
  }
};

export const fetchTrackBySlug = async ({ title, artist, year, trackId }) => {
  const api = useApi();

  try {
    let url;
    if (trackId) {
      url = `/track/${trackId}`;
    } else {
      url = `/track/${formatSlug(artist)}/${formatSlug(title)}`;
      if (year) {
        url += `/${encodeURIComponent(year)}`;
      }
    }

    const { data: response } = await api.get(url);

    return response.data;
  } catch (error) {
    console.error("Service: Failed to fetch track by slug:", error);
    throw error;
  }
};

export const updateTrackRating = async ({ trackId, rating }) => {
  const api = useApi();

  if (!trackId) throw new Error("Track ID is required");
  if (rating === undefined || rating < 0 || rating > 5) {
    throw new Error("Valid rating (0-5) is required");
  }

  try {
    const { data } = await api.post(`/logs/rate`, {
      trackId,
      rating,
    });
    return data;
  } catch (error) {
    console.error("Service: Failed to update track rating:", error);
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Failed to update track rating";
    throw new Error(errorMessage);
  }
};

export const updateTrackLiked = async ({ trackId, liked }) => {
  const api = useApi();

  if (!trackId) throw new Error("Track ID is required");
  if (liked === undefined) throw new Error("Liked status is required");

  try {
    const { data } = await api.post(`/logs/like`, {
      trackId,
      liked,
    });
    return data;
  } catch (error) {
    console.error("Service: Failed to update track liked status:", error);
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Failed to update track liked status";
    throw new Error(errorMessage);
  }
};

export const updateTrackListened = async ({ trackId, listened }) => {
  const api = useApi();

  if (!trackId) throw new Error("Track ID is required");
  if (listened === undefined) throw new Error("Listened status is required");

  try {
    const { data } = await api.post(`/logs/listen`, {
      trackId,
      listened,
    });
    return data;
  } catch (error) {
    console.error("Service: Failed to update track listened status:", error);
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Failed to update track listened status";
    throw new Error(errorMessage);
  }
};

export const fetchTrackListeners = async (trackId, page = 1) => {
  const api = useApi();

  if (!trackId) throw new Error("Track ID is required");

  try {
    const { data: response } = await api.get(
      `/track/listeners?trackId=${trackId}`
    );
    return response;
  } catch (e) {
    return e.response.data;
  }
};

export const fetchTrackLikes = async (trackId, page = 1) => {
  const api = useApi();

  if (!trackId) throw new Error("Track ID is required");

  try {
    const { data: response } = await api.get(`/track/likes?trackId=${trackId}`);
    return response;
  } catch (e) {
    console.error("Service: Failed to fetch track likes:", e);
    return e.response.data;
  }
};

export const fetchTrackReviews = async (
  trackId,
  page = 1,
  limit = 10,
  sort = "popular",
  filter = "",
  search = ""
) => {
  const api = useApi();

  if (!trackId) throw new Error("Track ID is required");

  try {
    let url = `/track/reviews?trackId=${trackId}&page=${page}&limit=${limit}&sort=${sort}`;
    if (filter) url += `&filter=${filter}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;

    const { data: response } = await api.get(url);
    return response;
  } catch (error) {
    console.error("Service: Failed to fetch track reviews:", error);
    return { data: { reviews: [], pagination: { total: 0 } } };
  }
};

export const fetchFriendsListened = async (trackId, page = 1, limit = 10) => {
  const api = useApi();

  if (!trackId) throw new Error("Track ID is required");

  try {
    const { data: response } = await api.get(
      `/tracks/${trackId}/friends-listened?page=${page}&limit=${limit}`
    );
    return response;
  } catch (error) {
    console.error("Service: Failed to fetch friends listened:", error);
    return { data: { friends: [], pagination: { total: 0 } } };
  }
};

export const fetchTrackTrending = async (trackId) => {
  const api = useApi();
  if (!trackId) throw new Error("Track ID is required");
  try {
    const { data: response } = await api.get(`/tracks/${trackId}/trending`);
    return response.data;
  } catch (error) {
    console.error("Service: Failed to fetch track trending:", error);
    return null;
  }
};

export const fetchTrackYouTubeLyrics = async (artist, trackname, id, lang) => {
  const api = useApi();

  if (!artist || !trackname || !id) return null;

  try {
    const cleanTrackname = encodeURIComponent(
      decodeURIComponent(trackname)
        .replace(/\s*\(.*?\)/g, '')
        .replace(/\s*\[.*?\]/g, '')
        .replace(/\.+/g, '')
        .replace(/^-+|-+$/g, '')
    );
    let url = `/tracks/${artist}/${cleanTrackname}/${id}/youtube-lyrics`;
    if (lang) url += `?lang=${lang}`;
    const { data } = await api.get(url);
    return data.data;
  } catch (error) {
    console.error("Service: Failed to fetch YouTube/lyrics:", error);
    return null;
  }
};

export const fetchSimilarTracks = async (trackname, artist) => {
  const api = useApi();

  if (!trackname || !artist) return [];

  try {
    const { data: response } = await api.get(
      `/tracks/${artist}/${trackname}/similar`
    );

    if (response.data && Array.isArray(response.data.items)) {
      return response.data.items;
    } else if (response.items && Array.isArray(response.items)) {
      return response.items;
    } else if (Array.isArray(response.data)) {
      return response.data;
    } else if (Array.isArray(response)) {
      return response;
    }

    return [];
  } catch (error) {
    console.error("Service: Failed to fetch similar tracks:", error);
    return [];
  }
};

export const fetchSimilarTrackYouTube = async (trackId) => {
  const api = useApi();

  if (!trackId) return [];

  try {
    const { data: response } = await api.get(`/tracks/${trackId}/similar-youtube`);
    return Array.isArray(response?.data) ? response.data : [];
  } catch (error) {
    console.error("Service: Failed to fetch similar tracks (youtube):", error);
    return [];
  }
};

export const fetchTrackVersions = async (trackId) => {
  const api = useApi();

  if (!trackId) return [];

  try {
    const { data: response } = await api.get(`/tracks/${trackId}/versions`);

    if (response.data && Array.isArray(response.data)) {
      return response.data;
    } else if (Array.isArray(response)) {
      return response;
    }

    return [];
  } catch (error) {
    console.error("Service: Failed to fetch track versions:", error);
    return [];
  }
};

export const fetchTrackLists = async (trackId) => {
  const api = useApi();

  if (!trackId) return [];

  try {
    const { data: response } = await api.get(`/tracks/${trackId}/lists`);
    
    if (response.data) {
      return response.data;
    } else if (Array.isArray(response)) {
      return response;
    }
    
    return [];
  } catch (error) {
    console.error("Service: Failed to fetch track lists:", error);
    return [];
  }
};
