import React, { useState, useEffect } from "react";
import styles from "./ResetPassword.module.css";
import { MdKeyboardArrowLeft } from "react-icons/md";
import { IoMdCheckmarkCircleOutline } from "react-icons/io";
import { useNavigate, useSearchParams } from "react-router-dom";
import { SimpleHeader } from "../../Utils/Header/Header";
import { FiAlertCircle } from "react-icons/fi";
import {
  verifyResetToken,
  resetPassword,
} from "../../../services/Auth/HandleAuth";
import HandleError from "../../Utils/HandleError/HandleError";
import ResetPasswordSkeleton from "../../Utils/Skeletons/ResetPasswordSkeleton";
import { TextInput } from "../../Utils/Inputs/Inputs";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isVerifying, setIsVerifying] = useState(true);
  const [tokenError, setTokenError] = useState(null);

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setTokenError("Invalid or missing reset token.");
        setIsVerifying(false);
        return;
      }

      try {
        await verifyResetToken(token);
      } catch (err) {
        setTokenError(
          "The link you followed is invalid or has expired. Please request a new password reset link."
        );
      } finally {
        setIsVerifying(false);
      }
    };

    verifyToken();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!token) {
      setError("Invalid or missing reset token.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await resetPassword(token, password);
      setSuccess(true);
    } catch (err) {
      if (err.response) {
        setError(
          err.response.data.message || "An error occurred. Please try again."
        );
      } else {
        setError("Network error. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isVerifying) {
    return <ResetPasswordSkeleton />;
  }

  if (tokenError) {
    return (
      <div className={styles.pageContainer}>
        <SimpleHeader />
        <div className={styles.contentWrapper}>
          <div className={styles.resetPasswordContent}>
            <div className={styles.successContainer}>
              <FiAlertCircle className={styles.errorIcon} />
              <h1 className={styles.title}>Invalid Link</h1>
              <p className={styles.description}>{tokenError}</p>
              <button
                className={styles.submitButton}
                onClick={() => navigate("/")}
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <SimpleHeader />
      <div className={styles.contentWrapper}>
        <div className={styles.resetPasswordContent}>
          {success ? (
            <div className={styles.successContainer}>
              <IoMdCheckmarkCircleOutline className={styles.successIcon} />
              <h1 className={styles.title}>Password Changed!</h1>
              <p className={styles.description}>
                Your password has been changed successfully.
              </p>
              <button
                className={styles.submitButton}
                onClick={() => navigate("/")}
              >
                Back to Home
              </button>
            </div>
          ) : (
            <>
              <button
                className={styles.backButton}
                onClick={() => navigate("/")}
              >
                <MdKeyboardArrowLeft className={styles.backIcon} />
                Back to Home
              </button>

              <h1 className={styles.title}>Reset Password</h1>

              <p className={styles.description}>
                Enter your new password below.
              </p>

              <form onSubmit={handleSubmit}>
                <div className={styles.formGroup}>
                  <TextInput
                    type="password"
                    id="password"
                    label="New Password"
                    mandatory
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    disabled={isLoading}
                  />
                </div>

                <div className={styles.formGroup}>
                  <TextInput
                    type="password"
                    id="confirmPassword"
                    label="Confirm Password"
                    mandatory
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    disabled={isLoading}
                  />
                </div>

                <HandleError error={error} />

                <button
                  type="submit"
                  className={styles.submitButton}
                  disabled={isLoading}
                >
                  {isLoading ? "Resetting..." : "Reset Password"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
