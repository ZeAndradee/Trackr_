import useApi from "../hooks/Api";

export const searchGifs = async (query, perPage = 24, page = 1) => {
  if (!query || !query.trim()) return { gifs: [], hasNext: false };

  const api = useApi();
  try {
    const { data } = await api.get("/gifs/search", {
      params: { q: query.trim(), per_page: perPage, page },
    });
    return data?.data || { gifs: [], hasNext: false };
  } catch (error) {
    console.error("gifService: Failed to search GIFs:", error);
    throw new Error("Failed to fetch GIFs");
  }
};

export const fetchTrendingGifs = async (perPage = 24, page = 1) => {
  const api = useApi();
  try {
    const { data } = await api.get("/gifs/trending", {
      params: { per_page: perPage, page },
    });
    return data?.data || { gifs: [], hasNext: false };
  } catch (error) {
    console.error("gifService: Failed to fetch trending GIFs:", error);
    return { gifs: [], hasNext: false };
  }
};
