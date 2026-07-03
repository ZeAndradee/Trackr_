import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import styles from "./Signup.module.css";
import { verifySignupCredentials } from "../../Utils/Validators/AuthValidator";
import { handleSignupCheck } from "../../../services/Auth/HandleAuth";
import SetProfile from "../SetProfile/SetProfile";
import { Button } from "../../Utils/Buttons/Button";
import { initiateGoogleLogin } from "../../../services/Auth/GoogleAuth";
import { TextInput } from "../../Utils/Inputs/Inputs";
import { FcGoogle } from "react-icons/fc";
import { useAuthModal } from "../../../contexts/AuthModalContext";
import HandleError, {
  getErrorMessage,
} from "../../Utils/HandleError/HandleError";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);

  const location = useLocation();
  const { closeModal, switchView, modalData } = useAuthModal();
  const googleState = modalData || location.state;

  useEffect(() => {
    if (googleState?.isGoogleAuth && googleState?.googleProfile) {
      setEmail(googleState.googleProfile.email);
      setPage(1);
    }
  }, [googleState]);

  const checkSignup = async () => {
    setError("");
    setLoading(true);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    const validator = verifySignupCredentials(email, password);
    if (!validator.response) {
      setError(validator?.message);
      setLoading(false);
    } else {
      try {
        const result = await handleSignupCheck(email);

        if (result.status === 200) {
          setPage(1);
          setLoading(false);
        } else {
          setError(
            getErrorMessage(result.status, {
              409: "This email is already associated with another account.",
            })
          );
          setLoading(false);
        }
      } catch (err) {
        setError(getErrorMessage(err?.response?.status));
        setLoading(false);
      }
    }
  };

  const goBackToCredentials = () => {
    setPage(0);
  };

  if (page === 1) {
    return (
      <div className={styles.signupContent}>
        <SetProfile
          credentials={{ email, password }}
          googleProfile={googleState?.googleProfile}
          onGoBack={goBackToCredentials}
          onSuccess={() => closeModal()}
        />
      </div>
    );
  }

  return (
    <div className={styles.signupContent}>
      <div className={styles.header}>
        <h1 className={styles.title}>Create an account</h1>
        <p className={styles.subtitle}>Join Trackr to start tracking</p>
      </div>

      <form
        className={styles.form}
        onSubmit={(e) => {
          e.preventDefault();
          checkSignup();
        }}
      >
        <div className={styles.socialButtons}>
          <button
            type="button"
            className={styles.socialButton}
            onClick={initiateGoogleLogin}
          >
            <FcGoogle size={20} />
            Google
          </button>
        </div>

        <div className={styles.divider}>
          <div className={styles.line}></div>
          <span>or</span>
          <div className={styles.line}></div>
        </div>
        <TextInput
          type="email"
          name="email"
          id="email"
          autoComplete="email"
          label="Email address"
          mandatory
          placeholder="name@example.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setError("");
          }}
          required
        />

        <TextInput
          type="password"
          name="password"
          id="password"
          autoComplete="new-password"
          label="Password"
          mandatory
          placeholder="Create a password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setError("");
          }}
          required
        />

        <TextInput
          type="password"
          name="confirmPassword"
          id="confirmPassword"
          autoComplete="new-password"
          label="Confirm Password"
          mandatory
          placeholder="Confirm your password"
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value);
            setError("");
          }}
          required
        />

        <HandleError error={error} />

        <div style={{ marginTop: "24px" }}>
          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            disabled={loading}
          >
            {loading ? "Checking..." : "Continue"}
          </Button>

        </div>

        <p className={styles.disclaimer}>
          By continuing, you agree to our{" "}
          <Link
            to="/terms-of-use"
            className={styles.disclaimerLink}
            onClick={closeModal}
          >
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link
            to="/privacy-policy"
            className={styles.disclaimerLink}
            onClick={closeModal}
          >
            Privacy Policy.
          </Link>
        </p>

        <div className={styles.footer}>
          Already have an account?
          <span
            className={styles.loginLink}
            onClick={() => switchView("login")}
          >
            Sign in
          </span>
        </div>
      </form>
    </div>
  );
};

export default Signup;
