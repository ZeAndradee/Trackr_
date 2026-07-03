import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import styles from "./ConfirmEmail.module.css";
import { SimpleHeader } from "../../Utils/Header/Header";
import { IoMdCheckmarkCircleOutline } from "react-icons/io";
import { FiAlertCircle } from "react-icons/fi";
import { RiLoader4Line } from "react-icons/ri";
import { useAuthModal } from "../../../contexts/AuthModalContext";
import { verifyEmail } from "../../../services/Auth/HandleAuth";

const ConfirmEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();
  const { switchView } = useAuthModal();

  const [status, setStatus] = useState("verifying");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verify = async () => {
      if (!token) {
        setStatus("error");
        setMessage("Invalid or missing verification token.");
        return;
      }
      try {
        await verifyEmail(token);
        setStatus("success");
        setMessage("Your email has been successfully verified!");
      } catch (err) {
        setStatus("error");
        setMessage(
          err.response?.data?.message ||
          "The verification link is invalid or has expired."
        );
      }
    };

    verify();
  }, [token]);

  const handleContinue = () => {
    switchView("login");
    navigate("/");
  };

  return (
    <div className={styles.pageContainer}>
      <SimpleHeader />
      <div className={styles.contentWrapper}>
        <div className={styles.card}>
          {status === "verifying" && (
            <>
              <RiLoader4Line className={styles.loadingIcon} />
              <h1 className={styles.title}>Checking your email</h1>
            </>
          )}

          {status === "success" && (
            <>
              <IoMdCheckmarkCircleOutline className={styles.successIcon} />
              <h1 className={styles.title}>Email Verified</h1>
              <p className={styles.description}>{message}</p>
              <button className={styles.button} onClick={handleContinue}>
                Continue to home
              </button>
            </>
          )}

          {status === "error" && (
            <>
              <FiAlertCircle className={styles.errorIcon} />
              <h1 className={styles.title}>Verification Failed</h1>
              <p className={styles.description}>{message}</p>
              <button className={styles.button} onClick={() => navigate("/")}>
                Back to Home
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConfirmEmail;
