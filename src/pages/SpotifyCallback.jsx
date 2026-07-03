import React, { useEffect, useState, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getAccessToken } from "../services/SpotifyIntegration";
import { FaSpotify } from "react-icons/fa";
import { UserLoggedContext } from "../contexts/UserLoggedContext";

const SpotifyCallback = () => {
  const [status, setStatus] = useState("Authenticating with Spotify");
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const { userLogged } = useContext(UserLoggedContext);

  useEffect(() => {
    const processAuth = async () => {
      try {
        const urlParams = new URLSearchParams(location.search);
        const code = urlParams.get("code");
        const error = urlParams.get("error");

        setProgress(10);

        if (error) {
          setStatus("Authorization denied");
          setError(`Error: ${error}`);
          setProgress(100);

          setTimeout(() => {
            navigate(`/${userLogged?.username || ""}`, { replace: true });
          }, 3000);
          return;
        }
        if (!code) {
          setStatus("Missing authorization parameter");
          setError("No authorization code provided");
          setProgress(100);

          setTimeout(() => {
            navigate(`/${userLogged?.username || ""}`, { replace: true });
          }, 3000);
          return;
        }

        setStatus("Retrieving access tokens");
        setProgress(30);
        await getAccessToken(code);

        setStatus("Saving connection");
        setProgress(85);

        setStatus("Spotify connected successfully");
        setProgress(100);

        setTimeout(() => {
          navigate(`/${userLogged?.username || ""}`, { replace: true });
        }, 2000);
      } catch (err) {
        console.error("Error processing Spotify authorization:", err);
        setStatus("Authorization failed");
        setError(err.message || "Error processing Spotify authorization");
        setProgress(100);

        setTimeout(() => {
          navigate(`/${userLogged?.username || ""}`, { replace: true });
        }, 3000);
      }
    };

    processAuth();
  }, [location, navigate, userLogged]);

  return (
    <div className="spotify-callback">
      <div className="spotify-callback__card">
        <div className="spotify-callback__logo-container">
          <FaSpotify className="spotify-callback__logo" />
          {error ? (
            <div className="spotify-callback__logo-error"></div>
          ) : (
            <div className="spotify-callback__logo-pulse"></div>
          )}
        </div>

        <h2 className="spotify-callback__title">{status}</h2>

        {error ? (
          <div className="spotify-callback__error">{error}</div>
        ) : (
          <div className="spotify-callback__progress-container">
            <div
              className="spotify-callback__progress-bar"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        <div className="spotify-callback__info">
          {!error &&
            progress < 100 &&
            "Please wait while we connect your account"}
          {!error &&
            progress === 100 &&
            "Redirecting you back to your profile..."}
          {error && "You'll be redirected back in a moment"}
        </div>
      </div>
    </div>
  );
};

export default SpotifyCallback;
