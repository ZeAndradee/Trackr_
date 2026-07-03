import React, { useState } from "react";
import styles from "./ForgotPassword.module.css";
import { MdKeyboardArrowLeft } from "react-icons/md";
import { useAuthModal } from "../../../contexts/AuthModalContext";
import useApi from "../../../hooks/Api";
import HandleError from "../../Utils/HandleError/HandleError";
import { IoMdCheckmarkCircleOutline } from "react-icons/io";
import { TextInput } from "../../Utils/Inputs/Inputs";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const { switchView } = useAuthModal();
  const api = useApi();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage("");

    try {
      const response = await api.post("/auth/forgot-password", { email });
      setSuccessMessage(response.data.message);
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

  if (successMessage) {
    return (
      <div className={styles.forgotPasswordContent}>
        <div className={styles.successContainer}>
          <IoMdCheckmarkCircleOutline
            className={styles.successIcon}
            size={50}
            color="#4ade80"
          />
          <h1 className={styles.title}>Check your email</h1>
          <p className={styles.description}>{successMessage}</p>
          <button
            className={styles.submitButton}
            onClick={() => switchView("login")}
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.forgotPasswordContent}>
      <button className={styles.backButton} onClick={() => switchView("login")}>
        <MdKeyboardArrowLeft className={styles.backIcon} />
        Back
      </button>

      <h1 className={styles.title}>Reset Your Password</h1>

      <p className={styles.description}>
        Enter the email address of your Trackr account and we will send you a
        security code.
      </p>

      <form onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <TextInput
            type="email"
            id="email"
            label="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            required
            disabled={isLoading}
          />
        </div>

        <HandleError error={error} />

        <button
          type="submit"
          className={styles.submitButton}
          disabled={isLoading}
        >
          {isLoading ? "Sending..." : "Continue"}
        </button>
      </form>
    </div>
  );
};

export default ForgotPassword;
