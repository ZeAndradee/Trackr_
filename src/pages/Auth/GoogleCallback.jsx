import React, { useEffect, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { completeGoogleLogin } from "../../services/Auth/GoogleAuth";
import { UserLoggedContext } from "../../contexts/UserLoggedContext";
import { useAuthModal } from "../../contexts/AuthModalContext";
import styles from "./AuthScreens.module.css";
import { FcGoogle } from "react-icons/fc";

const GoogleCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUserLogged } = useContext(UserLoggedContext);
  const { openModal } = useAuthModal();

  useEffect(() => {
    const handleCallback = async () => {
      const params = new URLSearchParams(location.search);
      const code = params.get("code");

      if (!code) {
        navigate("/");
        openModal("login-reason", {
          reason: "error",
          message: "Authentication failed. Please log in to try again.",
        });
        return;
      }

      try {
        const response = await completeGoogleLogin(code);

        if (response?.isNewUser) {
          openModal("signup", {
            googleProfile: response.googleProfile,
            isGoogleAuth: true,
          });
        } else if (response?.status === 200 && response?.data) {
          setUserLogged(response.data);
          navigate("/");
        } else {
          navigate("/");
          openModal("login-reason", {
            reason: "error",
            message: "Authentication failed. Please log in to try again.",
          });
        }
      } catch (error) {
        console.error("Google Auth Error:", error);
        navigate("/");
        openModal("login-reason", {
          reason: "error",
          message:
            "An error occurred during authentication. Please log in to try again.",
        });
      }
    };

    handleCallback();
  }, [location, navigate, setUserLogged]);

  return (
    <div className={styles.googleCallback}>
      <div className={styles.callbackCard}>
        <div className={styles.logoContainer}>
          <div className={styles.logoPulse}></div>
          <FcGoogle className={styles.googleLogo} />
        </div>

        <h2 className={styles.title}>Verifying Google Account</h2>
        <p className={styles.subtitle}>
          Please wait while we connect your account...
        </p>

        <div className={styles.progressContainer}>
          <div className={styles.progressBar}></div>
        </div>
      </div>
    </div>
  );
};

export default GoogleCallback;
