import { useState, useEffect, useCallback } from "react";
import {
  isUserConnectedToSpotify,
  getSpotifyAuthUrl,
  disconnectSpotify,
} from "../services/SpotifyIntegration";

const useSpotifyConnection = (userId) => {
  const [isSpotifyConnected, setIsSpotifyConnected] = useState(false);
  const [spotifyLoading, setSpotifyLoading] = useState(false);
  const [spotifyError, setSpotifyError] = useState(null);
  const [spotifySuccess, setSpotifySuccess] = useState(null);

  useEffect(() => {
    const checkSpotifyConnection = async () => {
      if (userId) {
        setSpotifyLoading(true);
        try {
          const isConnected = await isUserConnectedToSpotify(userId);
          setIsSpotifyConnected(isConnected);
        } catch (error) {
          console.error("Error checking Spotify connection:", error);
          setSpotifyError("Error checking connection status.");
        } finally {
          setSpotifyLoading(false);
        }
      }
    };
    checkSpotifyConnection();
  }, [userId]);

  const handleConnectSpotify = useCallback(async () => {
    try {
      setSpotifyLoading(true);
      setSpotifyError(null);
      setSpotifySuccess(null);
      const authUrl = await getSpotifyAuthUrl();
      window.location.href = authUrl;
    } catch (err) {
      console.error("Error connecting to Spotify:", err);
      setSpotifyError("Error connecting to Spotify");
      setSpotifyLoading(false);
    }
  }, []);

  const handleDisconnectSpotify = useCallback(async () => {
    try {
      setSpotifyLoading(true);
      setSpotifyError(null);
      setSpotifySuccess(null);
      const result = await disconnectSpotify();
      if (result && result.success) {
        setSpotifySuccess("Successfully disconnected from Spotify");
        setIsSpotifyConnected(false);
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent("profileUpdated"));
        }, 1000);
      } else {
        setSpotifyError("Failed to disconnect from Spotify");
      }
    } catch (err) {
      console.error("Error disconnecting from Spotify:", err);
      setSpotifyError("Error disconnecting from Spotify");
    } finally {
      setSpotifyLoading(false);
    }
  }, []);

  return {
    isSpotifyConnected,
    spotifyLoading,
    spotifyError,
    spotifySuccess,
    handleConnectSpotify,
    handleDisconnectSpotify,
  };
};

export default useSpotifyConnection;
