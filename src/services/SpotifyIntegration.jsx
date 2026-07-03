import useApi from "../hooks/Api";

const api = useApi();
let pendingRequests = {};

export async function getAccessToken(code) {
  try {
    const { data: accessToken } = await api.get("/spotify/access-token", {
      params: {
        code,
      },
    });

    return accessToken.data;
  } catch (error) {
    console.error("Error exchanging code for token:", error);
    throw error;
  }
}

export async function getSpotifyAuthUrl() {
  try {
    const { data: response } = await api.get("/spotify/user/auth-url");

    if (response.data && response.data.authUrl) {
      return response.data.authUrl;
    }
  } catch (error) {
    console.error("Error getting auth URL:", error);
    return null;
  }
}

export const disconnectSpotify = async () => {
  pendingRequests = {};

  try {
    const { data: response } = await api.post("/spotify/disconnect");

    return (
      response.data || {
        success: true,
        message: "Successfully disconnected from Spotify",
      }
    );
  } catch (error) {
    console.error("Error disconnecting Spotify:", error);
    throw error;
  }
};

export const getSpotifyProfile = async (userId) => {
  try {
    if (pendingRequests[userId]) {
      return pendingRequests[userId];
    }

    pendingRequests[userId] = new Promise(async (resolve) => {
      try {
        const { data: response } = await api.get("/spotify/user/profile", {
          params: { userId },
        });
        resolve(response.data.userData);
      } catch (error) {
        console.error("Error getting Spotify profile:", error);
        resolve(null);
      } finally {
        setTimeout(() => {
          delete pendingRequests[userId];
        }, 1000);
      }
    });

    return pendingRequests[userId];
  } catch (error) {
    console.error("Error in getSpotifyProfile:", error);
    return null;
  }
};

export const isUserConnectedToSpotify = async (userId) => {
  try {
    if (!userId) return false;

    const userData = await getSpotifyProfile(userId);
    return !!(userData?.topTracks?.items || userData?.recentTracks?.items);
  } catch (error) {
    console.error("Error checking Spotify connection status:", error);
    return false;
  }
};
