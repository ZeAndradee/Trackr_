import useApi from "../hooks/Api";

const api = useApi();

export const handleStarterTracks = async () => {
  try {
    const { data: response } = await api.get(`/starterTracks`);
    return response;
  } catch (e) {
    return e?.response?.data;
  }
};

export const handleTopTracks = async () => {
  try {
    const { data: response } = await api.get(`/popularTracks`);
    return response;
  } catch (e) {
    return e?.response?.data;
  }
};

export const handleTopTracks20 = async () => {
  try {
    const { data: topTracks } = await api.get(`/errorTracks/`);

    return { result: true, response: topTracks };
  } catch (e) {
    console.error("Error fetching top tracks:", e);
    return { result: false, response: null };
  }
};
