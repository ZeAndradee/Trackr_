import useApi from "../hooks/Api";
import { formatSlug } from "../utils/formatters/textFormatters";

export const fetchArtistById = async (artistId) => {
  const api = useApi();

  try {
    const { data: response } = await api.get(`/artist/${artistId}`);
    return response.data;
  } catch (error) {
    console.error("Service: Failed to fetch artist by ID:", error);
    throw error;
  }
};

export const fetchArtistBySlug = async (slug) => {
  const api = useApi();

  try {
    const { data: response } = await api.get(`/artist/${formatSlug(slug)}`);
    return response.data;
  } catch (error) {
    console.error("Service: Failed to fetch artist by slug:", error);
    throw error;
  }
};

export const fetchArtistFriendsListened = async (artistId) => {
  const api = useApi();

  try {
    const { data: response } = await api.get(`/artist/${artistId}/friends-listened`);
    return response.data;
  } catch (error) {
    console.error("Service: Failed to fetch artist friends listened:", error);
    throw error;
  }
};

export const fetchArtistLatestRelease = async (artistId) => {
  const api = useApi();

  try {
    const { data: response } = await api.get(`/artist/${artistId}/view/latest-release`);
    return response.data;
  } catch (error) {
    console.error("Service: Failed to fetch artist latest release:", error);
    throw error;
  }
};

export const fetchSimilarArtists = async (artistId) => {
  const api = useApi();

  try {
    const { data: response } = await api.get(`/artist/${artistId}/view/similar-artists`);
    return response.data;
  } catch (error) {
    console.error("Service: Failed to fetch similar artists:", error);
    throw error;
  }
};

export const fetchArtistInfo = async (artistId) => {
  const api = useApi();

  try {
    const { data: response } = await api.get(`/artist/${artistId}/info`);
    return response.data;
  } catch (error) {
    console.error("Service: Failed to fetch artist info:", error);
    throw error;
  }
};

export const fetchArtistRelationships = async (artistId) => {
  const api = useApi();

  try {
    const { data: response } = await api.get(`/artist/${artistId}/relationships`);
    return response.data;
  } catch (error) {
    console.error("Service: Failed to fetch artist relationships:", error);
    throw error;
  }
};

export const fetchArtistDiscography = async (artistId, { type, order, view }) => {
  const api = useApi();

  try {
    const params = {};
    if (type) params.type = Array.isArray(type) ? type.join(",") : type;
    if (order) params.order = order;
    if (view) params.view = view;

    const { data: response } = await api.get(`/artist/${artistId}/discography`, { params });
    return response.data;
  } catch (error) {
    console.error("Service: Failed to fetch artist discography:", error);
    throw error;
  }
};
