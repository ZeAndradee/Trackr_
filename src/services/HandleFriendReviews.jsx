import useApi from "../hooks/Api";

export const handleFriendReviews = async (params = {}) => {
  const api = useApi();
  try {
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.search) queryParams.append('search', params.search);
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    const queryString = queryParams.toString();
    const url = queryString ? `/friend-reviews?${queryString}` : '/friend-reviews';

    const { data } = await api.get(url);
    return data;
  } catch (e) {
    console.error("Error fetching friend reviews:", e);
    return {
      status: e?.response?.status || 500,
      message: e?.response?.data?.message || "Error fetching friend reviews",
      success: false,
    };
  }
};

export default handleFriendReviews;
