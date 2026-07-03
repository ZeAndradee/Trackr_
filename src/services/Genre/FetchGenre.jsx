import useApi from "../../hooks/Api";

export const fetchGenre = async (slug) => {
  const api = useApi();
  try {
    const { data: response } = await api.get(`/genres/${slug}`, {
      timeout: 10000,
    });
    return response.data;
  } catch (error) {
    console.error("Service: Failed to fetch genre:", error);
    throw error;
  }
};

export const fetchGenreTracks = async (slug, { page = 1, limit = 20 } = {}) => {
  const api = useApi();
  try {
    const { data: response } = await api.get(`/genres/${slug}/tracks`, {
      params: { page, limit },
      timeout: 10000,
    });
    return response.data;
  } catch (error) {
    console.error("Service: Failed to fetch genre tracks:", error);
    throw error;
  }
};

export const fetchGenrePopularTracks = async (
  slug,
  { range = "week", limit = 10 } = {}
) => {
  const api = useApi();
  try {
    const { data: response } = await api.get(`/genres/${slug}/tracks`, {
      params: { order: "popular", range, limit },
      timeout: 10000,
    });
    return response.data;
  } catch (error) {
    console.error("Service: Failed to fetch genre popular tracks:", error);
    throw error;
  }
};

export const fetchGenres = async () => {
  const api = useApi();
  try {
    const { data: response } = await api.get(`/genres`, { timeout: 10000 });
    return response.data;
  } catch (error) {
    console.error("Service: Failed to fetch genres:", error);
    throw error;
  }
};
