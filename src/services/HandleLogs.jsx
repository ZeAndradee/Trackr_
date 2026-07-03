import useApi from "../hooks/Api";

export const createLog = async (logData) => {
  const api = useApi();

  if (!logData.track_id && !logData.album_id) {
    throw new Error("Track ID or Album ID is required");
  }

  try {
    const { data: response } = await api.post("/logs", logData);
    return response;
  } catch (error) {
    console.error("Service: Failed to create log:", error);
    const errorMessage =
      error.response?.data?.message || error.message || "Failed to create log";
    throw new Error(errorMessage);
  }
};

export const updateLog = async (logId, logData) => {
  const api = useApi();

  if (!logId) {
    throw new Error("Log ID is required");
  }

  if (!logData.track_id && !logData.album_id) {
    throw new Error("Track ID or Album ID is required");
  }

  try {
    const { data: response } = await api.put(`/log/${logId}`, logData);
    return { status: 200, data: response, success: true };
  } catch (e) {
    throw e;
  }
};

export const _deleteLog = async (logId) => {
  const api = useApi();

  if (!logId) {
    throw new Error("Log ID is required");
  }

  try {
    const { data: response } = await api.delete(`/log/${logId}`);
    return { status: 200, data: response, success: true };
  } catch (e) {
    console.error("Error deleting log:", e);
    throw e;
  }
};

export const _updateRating = async (data) => {
  const api = useApi();

  if (!data.trackId && !data.albumId) {
    throw new Error("Track ID or Album ID is required");
  }

  if (
    data.rating === undefined ||
    data.rating === null ||
    data.rating < 0 ||
    data.rating > 5
  ) {
    throw new Error("Valid rating (0-5) is required");
  }

  try {
    const { data: response } = await api.patch("/update-rating", data);
    return response;
  } catch (error) {
    console.error("Service: Failed to update rating:", error);
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Failed to update rating";
    throw new Error(errorMessage);
  }
};

export const updateRating = _updateRating;

export const _updateLiked = async (data) => {
  const api = useApi();

  try {
    const { data: response } = await api.patch("/update-like", data);
    return response;
  } catch (error) {
    console.error("Service: Failed to update liked status:", error);
    throw error;
  }
};

export const updateLiked = _updateLiked;

export const _updateListened = async (data) => {
  const api = useApi();

  try {
    const { data: response } = await api.patch("/update-listened", data);
    return response;
  } catch (error) {
    console.error("Service: Failed to update listened status:", error);
    throw error;
  }
};

export const updateListened = _updateListened;

export const deleteLog = async (logId) => {
  const api = useApi();

  if (!logId) {
    throw new Error("Log ID is required");
  }

  try {
    const { data: response } = await api.delete(`/logs/${logId}`);
    return response;
  } catch (error) {
    console.error("Service: Failed to delete log:", error);
    const errorMessage =
      error.response?.data?.message || error.message || "Failed to delete log";
    throw new Error(errorMessage);
  }
};

export const safeDeleteLog = _deleteLog;

export const getUserLogs = async (username) => {
  const api = useApi();

  if (!username) {
    throw new Error("Username is required");
  }

  try {
    const { data: response } = await api.get(`/journal/${username}`);
    return response;
  } catch (error) {
    console.error("Service: Failed to fetch user logs:", error);
    const errorMessage =
      error.response?.data?.message || "Failed to fetch user logs";
    throw new Error(errorMessage);
  }
};

export const getUserPopularLogs = async (userId) => {
  const api = useApi();

  if (!userId) {
    throw new Error("User ID is required");
  }

  try {
    const { data: response } = await api.get(`/user/${userId}/popular-logs`);
    return response;
  } catch (error) {
    console.error("Service: Failed to fetch user popular logs:", error);
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Failed to fetch user popular logs";
    throw new Error(errorMessage);
  }
};

export const fetchPopularLogs = async (params = {}) => {
  const api = useApi();
  try {
    const queryParams = new URLSearchParams();
    if (params.sort) queryParams.append("sort", params.sort);
    else queryParams.append("sort", "popular");
    if (params.period) queryParams.append("period", params.period);
    if (params.type) queryParams.append("type", JSON.stringify(params.type));
    if (params.limit) queryParams.append("limit", params.limit);
    if (params.page) queryParams.append("page", params.page);

    const queryString = queryParams.toString();
    const url = `/log?${queryString}`;

    const { data } = await api.get(url);
    return data;
  } catch (error) {
    console.error("Error fetching popular logs:", error);
    return {
      status: error?.response?.status || 500,
      message: error?.response?.data?.message || "Error fetching popular logs",
      success: false,
    };
  }
};

export const fetchLog = async (logId) => {
  const api = useApi();

  if (!logId) {
    throw new Error("Log ID is required");
  }

  try {
    const { data: response } = await api.get(`/log/${logId}`);
    return response;
  } catch (error) {
    console.error("Service: Failed to fetch log:", error);
    const errorMessage =
      error.response?.data?.message || error.message || "Failed to fetch log";
    throw new Error(errorMessage);
  }
};

export const shareLog = async (logId) => {
  const api = useApi();

  if (!logId) {
    throw new Error("Log ID is required");
  }

  try {
    const { data: response } = await api.get(`/log/${logId}/share`, {
      responseType: "blob",
    });
    return response;
  } catch (error) {
    console.error("Service: Failed to share log:", error);
    const errorMessage =
      error.response?.data?.message || error.message || "Failed to share log";
    throw new Error(errorMessage);
  }
};

export const createAlbumLog = async (data) => {
  const api = useApi();

  try {
    const { data: response } = await api.post("/logs/album", data);
    return response;
  } catch (error) {
    console.error("Service: Failed to create album log:", error);
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Failed to create album log";
    throw new Error(errorMessage);
  }
};

export const updateAlbumLog = async (logId, data) => {
  const api = useApi();

  try {
    const { data: response } = await api.post(`/logs/album`, data);
    return response;
  } catch (error) {
    console.error("Service: Failed to update album log:", error);
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Failed to update album log";
    throw new Error(errorMessage);
  }
};

export const getActivityCount = async () => {
  const api = useApi();
  try {
    const { data: response } = await api.get("/logs/activity-count?period=week");
    return response.data;
  } catch (error) {
    return null;
  }
};

export const getRecentTrackLogs = async (userId, limit = 10) => {
  const api = useApi();

  if (!userId) {
    throw new Error("User ID is required");
  }

  try {
    const { data: response } = await api.get(`/user/${userId}/recent-track-logs`, {
      params: { limit },
    });
    const logs = response?.data || response || [];
    return logs.filter((log) => log.type !== "album").slice(0, limit);
  } catch (error) {
    console.error("Service: Failed to fetch recent track logs:", error);
    return [];
  }
};
