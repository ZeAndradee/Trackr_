import useApi from "../../hooks/Api";
import showToast from "../../components/Utils/Toast/Toast";

const api = useApi();

export const initiateGoogleLogin = () => {
  const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
  const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  const REDIRECT_URI = `${window.location.origin}/auth/google/callback`;

  if (!CLIENT_ID) {
    console.error("Google Client ID is missing in environment variables.");
    showToast("Google Client ID is missing. Please check your configuration.", "error");
    return;
  }

  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: "code",
    scope: "email profile openid",
    access_type: "offline",
    prompt: "consent",
  });

  window.location.href = `${GOOGLE_AUTH_URL}?${params.toString()}`;
};

export const completeGoogleLogin = async (code) => {
  const redirect_uri = `${window.location.origin}/auth/google/callback`;
  try {
    const { data } = await api.post("/auth/google", { code, redirect_uri });
    return data;
  } catch (error) {
    console.error("Google login error:", error);
    throw error;
  }
};
