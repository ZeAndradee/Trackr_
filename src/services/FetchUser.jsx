import useApi from "../hooks/Api";
import { validateUsername } from "../components/Utils/Validators/AuthValidator";
import { validateImageFile } from "../components/Utils/Validators/ImageValidator";

export const fetchUser = async ({ username }) => {
  const api = useApi();
  try {
    const timezoneOffset = new Date().getTimezoneOffset() * -1;
    const { data: userProfile } = await api.get(`/profile`, {
      params: { username: username, timezoneOffset: timezoneOffset },
    });

    return userProfile.data;
  } catch (e) {
    console.error(e);
    return e?.response?.data;
  }
};

export const checkFollowStatus = async (targetUserId) => {
  const api = useApi();
  try {
    const { data } = await api.get(`/follow-status/${targetUserId}`);
    return data;
  } catch (e) {
    console.error(e);
    return e?.response?.data;
  }
};

export const followUser = async (targetUserId) => {
  const api = useApi();
  try {
    const { data } = await api.post(`/follow/${targetUserId}`);
    return data;
  } catch (e) {
    console.error(e);
    return e?.response?.data;
  }
};

export const unfollowUser = async (targetUserId) => {
  const api = useApi();
  try {
    const { data } = await api.post(`/unfollow/${targetUserId}`);
    return data;
  } catch (e) {
    console.error(e);
    return e?.response?.data;
  }
};

export const fetchUserFollowers = async (userId, page = 1, limit = 20) => {
  const api = useApi();
  try {
    const { data } = await api.get(`/${userId}/followers`, {
      params: { page, limit },
    });
    return data;
  } catch (e) {
    console.error("Error fetching followers:", e);
    return {
      status: e?.response?.status || 500,
      message: e?.response?.data?.message || "Error fetching followers",
      success: false,
    };
  }
};

export const fetchUserFollowing = async (userId, page = 1, limit = 5) => {
  const api = useApi();
  try {
    const { data } = await api.get(`/${userId}/following`, {
      params: { page, limit },
    });
    return data;
  } catch (e) {
    console.error("Error fetching following:", e);
    return {
      status: e?.response?.status || 500,
      message: e?.response?.data?.message || "Error fetching following",
      success: false,
    };
  }
};

export const updateUserProfile = async (profileData) => {
  const api = useApi();
  try {
    const username = profileData.get("username");
    const usernameValidation = validateUsername(username);
    if (!usernameValidation.valid) {
      return {
        status: 400,
        message: usernameValidation.message,
        success: false,
      };
    }

    const profileImage = profileData.get("profileImage");
    if (profileImage) {
      const imageValidation = validateImageFile(profileImage);
      if (!imageValidation.valid) {
        return {
          status: 400,
          message: imageValidation.message,
          success: false,
        };
      }
    }

    const { data } = await api.post("/update-profile", profileData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return { status: 200, data, success: true };
  } catch (e) {
    console.error("Error updating profile:", e);
    return {
      status: e?.response?.status || 500,
      message: e?.response?.data?.message || "Error updating profile",
      success: false,
    };
  }
};

export const fetchJournalEntries = async (params, userId) => {
  const api = useApi();
  try {
    const response = await api.get(`/${userId}/journal`, {
      params,
    });
    return response;
  } catch (error) {
    console.error("Error fetching journal entries:", error);
    throw error;
  }
};

export const fetchSuggestedUsers = async () => {
  const api = useApi();
  try {
    const { data: response } = await api.get("/users/popular?period=month&filter=logs");
    return response.data.users;
  } catch (error) {
    return [];
  }
};

export const fetchRecentTrackLogs = async (userId, limit = 10) => {
  const api = useApi();
  try {
    const { data } = await api.get(`/user/${userId}/recent-track-logs`, {
      params: { limit },
    });
    return data?.data || data || [];
  } catch (e) {
    console.error(e);
    return [];
  }
};
